import { Injectable } from '@angular/core';
import { ImportRuleSet, ImportRuleSetKeys } from 'ag-common-lib/lib/models/import-rules/import-ruleset-model';
import { QueryParam, WhereFilterOperandKeys } from '../dao/CommonFireStoreDao.dao';
import { AgentService } from './agent.service';

@Injectable({
  providedIn: 'root'
})
export class ImportService {
  constructor(public agentService: AgentService) {}

  convertFileToDataMapArray(file: File): Promise<Map<string, string>[]>{
    return this.importFileToString(file).then(csvText => {
      return this.createDataMap(csvText);
    })
  }

  public importFileToString(file: File): Promise<string | ArrayBuffer> {
    return new Promise((resolve) => {
      try {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
          let text = reader.result;
          resolve(text);
        };
      } catch (err) {
        console.error(err);
      }
    });
  }

  private createDataMap(csvText): Map<string, string>[]{
    let retval: Map<string, string>[] = [];
    let lines: string[] = csvText.split('\n');
    let headers: string[] = lines[0].split(',');

    for (var i = 1; i < lines.length - 1; i++) {
      let data: Map<string, string> = new Map<string, string>();

      for (var j = 0; j < headers.length; j++) {
        let val = lines[i].split(',')[j];
        if(val && val !=''){
          data.set(headers[j], val);
        }
      }

      retval.push(data);
    }

    return retval;
  }

  validateFile(csvText, messages: String[], importRuleSet: ImportRuleSet, import_type: string): Promise<boolean>{
    let lines: string[] = csvText.split('\n');
    let headers: string[] = lines[0].split(',');
    
    let numOfFields = headers.length;

    for (var i = 1; i < lines.length - 1; i++) {
      let count = lines[i].split(',').length;

      if(count != numOfFields){
        messages.push("The number of Fields on line " + i + " does not match the number of headers.")
      }
    }

    let email_address = headers.filter(h => h == 'email_addresses.1.address').length > 0;

    if(!email_address){
      messages.push("The import must contain a field called 'email_addresses.1.address'")
    }

    if(import_type == "registration"){
      let invitee_email_exist = headers.filter(h => h == 'invitee_email').length > 0;
      
      if(!invitee_email_exist){
        messages.push("The 'Registration' import must contain a field called 'invitee_email'")
      }
      
      let invitee_guest_exist = headers.filter(h => h == 'invitee_guest').length > 0;

      if(!invitee_guest_exist){
        messages.push("The 'Registration' import must contain a field called 'invitee_guest'")
      }
    }
    

    if(messages.length == 0){
      messages.push("The file appears to be valid!.")
      return Promise.resolve(true);
    } else {
      messages.push("Please fix the file and reimport it!.")
      return Promise.resolve(false);
    }
  }

  validateData(data: Map<string, string>, messages: String[]){
    let promises: Promise<boolean>[] = [];
    
    if(data.has('email_addresses.1.address')){
      let p = this.agentService.getAllByValue([new QueryParam('p_email', WhereFilterOperandKeys.equal, data.get('email_addresses.1.address').toLowerCase().trim())]).then(agents => {
        if(agents.length == 0){
          messages.push(data.get('p_agent_first_name') + ' ' + data.get('p_agent_last_name') + '('+data.get('email_addresses.1.address')+')' + ' does not currently exist and will be created.');
        } else if(agents.length == 1){
          messages.push(data.get('p_agent_first_name') + ' ' + data.get('p_agent_last_name') + '('+data.get('email_addresses.1.address')+')' + ' does exist and will be updated.');
        } else {
          messages.push(data.get('p_agent_first_name') + ' ' + data.get('p_agent_last_name') + '('+data.get('email_addresses.1.address')+')' + ' has more than 1 record.');
        }

        return true;
      })
      promises.push(p);
    } else {
      messages.push(data.get('p_agent_first_name') + ' ' + data.get('p_agent_last_name') + " does not have an 'email_addresses.1.address' field.");
    }
  }
}