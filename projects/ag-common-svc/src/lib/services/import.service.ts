import { Injectable } from '@angular/core';
import { Address, AgentKeys, EmailAddress, PhoneNumber } from 'ag-common-lib/public-api';
import { AgentService } from './agent.service';
import { DomainAddressService } from './domain-address.service';
import { DomainEmailService } from './domain-email.service';
import { DomainPhoneNumberService } from './domain-phone-number.service';
import { DomainUtilService } from './domain-util.service';

@Injectable({
  providedIn: 'root'
})
export class ImportService {
  PRIMARY_EMAIL_IDENTIFIER = 'email_addresses.1.address';
  ASSOCIATE_EMAIL_IDENTIFIER = 'association.1.email_address';

  constructor(public agentService: AgentService, 
    private domainEmailService: DomainEmailService,
    private domainPhoneNumberService: DomainPhoneNumberService,
    private domainAddressService: DomainAddressService,
    private domainUtilService: DomainUtilService
  ) {}

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

  validateInvitee(invitee: Map<string, any>, messages: String[]) {
    let isValid = true;

    let agent_name = invitee.get('p_agent_first_name') + ' ' + invitee.get('p_agent_last_name') + '(' + invitee.get(this.PRIMARY_EMAIL_IDENTIFIER) + ')'

    if(invitee.has(AgentKeys.campaigns_user_name) && !this.isDate(invitee.get(AgentKeys.campaigns_user_since))){
      messages.push('ERROR: ' + agent_name + " has an invalid date in " + AgentKeys.campaigns_user_name);
      isValid = false;
    }

    if(invitee.has('invitee_email')){
      if(invitee.get('invitee_email').trim() == ''){
        messages.push('ERROR: ' + agent_name + " does not have an email address in 'invitee_email'");
        isValid = false;      
      }
      
      if(invitee.has('email_addresses.1.address')){
        if(invitee.get('email_addresses.1.address').trim() != invitee.get('invitee_email').trim()){
          messages.push('ERROR: ' + agent_name + " The Email Associated with this Registration and the Primary Login Email must be the same");
          isValid = false;
        }

        if(!this.domainUtilService.getBoolean(invitee.get('email_addresses.1.is_login'))){
          messages.push('ERROR: ' + agent_name + " The Login Email with this Registration must be associated with the first Address w/n the spreadsheet");
          isValid = false;
        }
      } else {
        messages.push('ERROR: ' + agent_name + " does not have an email address in 'address.1.address'");
        isValid = false;   
      }
    } else {
      messages.push('ERROR: ' + agent_name + " does not have an email address in 'invitee_email'");
      isValid = false;   
    }

    if(invitee.has(AgentKeys.dob) && !this.isDate(invitee.get(AgentKeys.dob))){
      messages.push('ERROR: ' + agent_name + " has an invalid date in " + AgentKeys.dob);
      isValid = false;
    }

    if(invitee.has(AgentKeys.prospect_referred_to_date) && !this.isDate(invitee.get(AgentKeys.prospect_referred_to_date))){
      messages.push('ERROR: ' + agent_name + " has an invalid date in " + AgentKeys.prospect_referred_to_date);
      isValid = false;
    }

    let addresses: Address[] = this.domainAddressService.extractAddresses(invitee);

    if(addresses.filter(addresses => addresses.is_primary_billing == true).length > 1){
      messages.push('ERROR: ' + agent_name + ' has more than 1 Primary Billing Address listed');
      isValid = false;
    }

    if(addresses.filter(addresses => addresses.is_primary_shipping == true).length > 1){
      messages.push('ERROR: ' + agent_name + ' has more than 1 Primary Shipping Address listed');
      isValid = false;
    }

    let phoneNumbers: PhoneNumber[] = this.domainPhoneNumberService.extractPhoneNumbers(invitee);

    if(phoneNumbers.filter(phone => phone.is_primary == true).length > 1){
      messages.push('ERROR: ' + agent_name + ' has more than 1 Primary Phone Number listed');
      isValid = false;
    }

    let emailAddresses: EmailAddress[] = this.domainEmailService.extractEmailAddresses(invitee);

    if(emailAddresses.filter(email => email.is_primary == true).length > 1){
      messages.push('ERROR: ' + agent_name + ' has more than 1 Primary Email listed');
      isValid = false;
    }

    return isValid;
  }

  validateGuest(guest: Map<string, any>, invitee_list: Map<string, any>[], messages: String[]) {
    let isValid = true;

    let guest_name = guest.get('association.1.first_name') + ' ' + guest.get('association.1.last_name') + '(' + guest.get(this.ASSOCIATE_EMAIL_IDENTIFIER) + ')'

    if(guest.has('invitee_email')){
      if(guest.get('invitee_email').trim() == ''){
        messages.push('ERROR: ' + guest_name + " does not have an email address in 'invitee_email'");
        isValid = false;
      }

      if(invitee_list.filter(invitee => invitee.get('invitee_email') == guest.get('invitee_email')).length == 0){
        messages.push('ERROR: ' + guest_name + " does not have an email address in 'invitee_email' that matches an invitee in the list.");
        isValid = false;
      }
    } else {
      messages.push('ERROR: ' + guest_name + " does not have an email address in 'invitee_email'");
      isValid = false;
    }

    return isValid;
  }
  
  private isDate(date: string): boolean {
    return new Date(date).toString() != "Invalid Date";
  }
}
