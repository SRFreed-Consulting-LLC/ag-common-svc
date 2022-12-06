import { Injectable } from '@angular/core';
import { Address, AgentKeys, EmailAddress } from 'ag-common-lib/public-api';
import { AgentService } from './agent.service';
import { DomainService } from './domain.service';

@Injectable({
  providedIn: 'root'
})
export class ImportService {
  PRIMARY_EMAIL_IDENTIFIER = 'email_addresses.1.address';

  constructor(public agentService: AgentService, private domainService: DomainService) {}

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

  public createDataMap(csvText): Map<string, string>[] {
    let retval: Map<string, string>[] = [];
    let lines: string[] = csvText.split('\n');
    let headers: string[] = lines[0].split(',');

    for (var i = 1; i < lines.length - 1; i++) {
      let data: Map<string, string> = new Map<string, string>();

      for (var j = 0; j < headers.length; j++) {
        let val = lines[i].split(',')[j];
        if (val && val != '') {
          data.set(headers[j], val);
        }
      }

      retval.push(data);
    }

    return retval;
  }

  validateFile(csvText, messages: String[], import_type: string): Promise<boolean>{
    let lines: string[] = csvText.split('\n');
    let headers: string[] = lines[0].split(',');

    let numOfFields = headers.length;

    for (var i = 1; i < lines.length - 1; i++) {
      let count = lines[i].split(',').length;

      if (count != numOfFields) {
        messages.push('The number of Fields on line ' + i + ' does not match the number of headers.');
      }
    }

    let email_address = headers.filter((h) => h == this.PRIMARY_EMAIL_IDENTIFIER).length > 0;

    if (!email_address) {
      messages.push("The import must contain a field called '" + this.PRIMARY_EMAIL_IDENTIFIER + "'");
    }

    if(import_type == "registration"){
      let invitee_email_exist = headers.filter(h => h == 'invitee_email').length > 0;
      
      if(!invitee_email_exist){
        messages.push("The 'Registration' import must contain a field called 'invitee_email'")
      }

      let invitee_guest_exist = headers.filter((h) => h == 'invitee_guest').length > 0;

      if (!invitee_guest_exist) {
        messages.push("The 'Registration' import must contain a field called 'invitee_guest'");
      }
    }

    if (messages.length == 0) {
      messages.push('The file format appears to be valid!.');
      return Promise.resolve(true);
    } else {
      messages.push('Please fix the file format and reimport it!.');
      return Promise.resolve(false);
    }
  }

  async validateData(data: Map<string, any>, messages: String[]) {
    let isValid = true;

    let agent_name = data.get('p_agent_first_name') + ' ' + data.get('p_agent_last_name') + '(' + this.PRIMARY_EMAIL_IDENTIFIER + ')'

    if(data.has(AgentKeys.campaigns_user_name) && !this.isDate(data.get(AgentKeys.campaigns_user_since))){
      messages.push('ERROR: ' + agent_name + " has an invalid date in " + AgentKeys.campaigns_user_name);
      isValid = false;
    }

    if(data.has(AgentKeys.dob) && !this.isDate(data.get(AgentKeys.dob))){
      messages.push('ERROR: ' + agent_name + " has an invalid date in " + AgentKeys.dob);
      isValid = false;
    }

    if(data.has(AgentKeys.prospect_referred_to_date) && !this.isDate(data.get(AgentKeys.prospect_referred_to_date))){
      messages.push('ERROR: ' + agent_name + " has an invalid date in " + AgentKeys.prospect_referred_to_date);
      isValid = false;
    }

    let addresses: Address[] = this.domainService.extractAddresses(data);

    if(addresses.filter(addresses => addresses.is_primary_billing == true).length > 1){
      messages.push('ERROR: ' + agent_name + ' has more than 1 Primary Billing Address listed');
      isValid = false;
    }

    if(addresses.filter(addresses => addresses.is_primary_shipping == true).length > 1){
      messages.push('ERROR: ' + agent_name + ' has more than 1 Primary Shipping Address listed');
      isValid = false;
    }

    if(this.domainService.extractPhoneNumbers(data).filter(phone => phone.is_primary == true).length > 1){
      messages.push('ERROR: ' + agent_name + ' has more than 1 Primary Phone Number listed');
      isValid = false;
    }

    let emailAddresses: EmailAddress[] = this.domainService.extractEmailAddresses(data);

    if(emailAddresses.filter(email => email.is_primary == true).length > 1){
      messages.push('ERROR: ' + agent_name + ' has more than 1 Primary Email listed');
      isValid = false;
    }

    let allEmails: string[] = [];

    emailAddresses.forEach(email => {
      allEmails.push(email.address)
    })

    //replace with this to check if exists?
    //this.agentService.getAgentByAnyEmailIn(allEmails).then(agent => console.log(agent))

    if(isValid){
      await this.agentService.getAgentByEmail(data.get(this.PRIMARY_EMAIL_IDENTIFIER).toLowerCase().trim()).then((agents) => {
        if (!agents) {
          messages.push(agent_name + ' does not currently exist and will be created.');
        } else if (agents) {
          messages.push(agent_name + ' does exist and will be updated.');
        }
      });
    }

    return isValid;
  }
  
  isDate(date: string): boolean {
    return new Date(date).toString() != "Invalid Date";
  }
}
