import { Injectable, OnInit } from '@angular/core';
import { PolicyTransaction } from 'ag-common-lib/lib/models/domain/policy-transaction.model';
import { Agency } from 'ag-common-lib/public-api';
import { AgencyService } from './agency.service';

@Injectable({
  providedIn: 'root'
})
export class ImportFileValidatorService implements OnInit {
  agencyToAgencyIdMappingTable: Map<string, Agency> = new Map<string, Agency>();

  constructor(public agencyService: AgencyService) {}

  ngOnInit(): void {}

  importPaidFiles(files: File[]): Promise<PolicyTransaction[]>{
    let promises: Promise<PolicyTransaction[]>[] = []

    for(const file of files){
      promises.push(this.convertFileToPaidArray(file).then(t => Promise.resolve(t)))
    }

    return Promise.all(promises).then(transactions => {      
      return transactions.reduce((accumulator, value) => accumulator.concat(value), []);
    })
  }

  convertFileToPaidArray(file: File): Promise<PolicyTransaction[]>{
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => {
        let text = reader.result;
        let transactions = this.createTransactionArray(text);
        resolve(transactions);
      };
    });
  }

  createTransactionArray(csvText): PolicyTransaction[]{
    let lines: string[] = csvText.split("\n");
    let headers: string[] = lines[0].split(",");
    let headersTransformed: string[] = [];
  
    headers.forEach(h => {
      headersTransformed.push(h.replace(/ /g,"_"));
    })

    let transactions: PolicyTransaction[] = [];

    for (var i = 1; i < lines.length-1; i++) {
      try{
        var obj = {... new PolicyTransaction()};
        let currentline: string[] = lines[i].split(",");
        
        for (var j = 0; j < headers.length; j++) {
            obj[headersTransformed[j]] = currentline[j].trim();
        }
      
        transactions.push(obj);
      } catch (err){
        console.error(err)
      } 
    }

    return transactions;
  }

  evaluateImport(transactions: PolicyTransaction[], messages: string[]): Promise<boolean> {
    let carrierMissingIDCount: number = 0;
    let mgaMissingIDCount: number = 0;
    let agentMissingIDCount: number = 0;
    let incorrectDateFormatCount: number = 0;

    return this.agencyService.getMGAAgencies('name').then(
      (agencies) => {
        this.agencyToAgencyIdMappingTable = new Map(
          agencies.map(agency => {
            return [agency.agency_id, agency];
          }),
        );

        let missingMGAList: Map<string, string> = new Map<string, string>();

        transactions.forEach((t) => {
          if (t.mga_id == '' || t.mga_id == null || t.mga_name == '' || t.mga_name == null) {
            mgaMissingIDCount++;
          } else {
            if (!this.agencyToAgencyIdMappingTable.has(t.mga_id)) {
              missingMGAList.set(t.mga_id, t.mga_name);
            }
          }

          if (t.carrier_name == '' || t.carrier_name == null || t.recruiter == '' || t.recruiter == null) {
            carrierMissingIDCount++;
          }

          if (t.agent_id == '' || t.agent_id == null) {
            agentMissingIDCount++;
          }

          if (t.transdate) {
            try {
              new Date(t.transdate);
            } catch (err) {
              incorrectDateFormatCount++;
            }
          }
        });

        if (incorrectDateFormatCount > 0) {
          messages.unshift('========================================================');
          messages.unshift(
            "FATAL ERROR: Can't Import: Transdate is incorrectly formatted in " + incorrectDateFormatCount + ' records'
          );
          messages.unshift('========================================================');
          return false;
        }

        if (carrierMissingIDCount > 0) {
          messages.unshift('========================================================');
          messages.unshift(
            "FATAL ERROR: Can't Import: Import File is missing either a Carrier Name or a Carrier ID in " +
              carrierMissingIDCount +
              ' records'
          );
          messages.unshift('========================================================');
          return false;
        }

        if (mgaMissingIDCount > 0) {
          messages.unshift('========================================================');
          messages.unshift(
            "FATAL ERROR: Can't Import: Import File is missing either a MGA Name or a MGA ID in " +
              mgaMissingIDCount +
              ' records.'
          );
          messages.unshift('========================================================');
          return false;
        }

        if (missingMGAList.size > 0) {
          missingMGAList.forEach((value, key) => {
            messages.unshift('Import File contains unknown MGA Id: ' + value + '(' + key + ').');
          });
          messages.unshift('========================================================');
          messages.unshift('FATAL ERROR: Import File contains ' + missingMGAList.size + ' unknown MGA.');
          messages.unshift('========================================================');
          return false;
        }

        if (agentMissingIDCount > 0) {
          messages.unshift(
            'Import File is missing an Agent ID for ' +
              agentMissingIDCount +
              " records. Establishing Temp Id's for them."
          );
        }

        messages.unshift('========================================================');
        messages.unshift('Validation Success.');
        messages.unshift('========================================================');

        return true;
      },
      (err) => {
        console.error('Error in Report Admin', err);
        return false;
      }
    );
  }
}
