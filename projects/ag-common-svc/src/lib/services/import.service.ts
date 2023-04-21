import { Injectable } from '@angular/core';
import { ImportMapping, ImportMappingKeys } from 'ag-common-lib/lib/models/import-rules/import-mapping.model';
import { ImportRuleSet } from 'ag-common-lib/lib/models/import-rules/import-ruleset-model';
import {
  Address,
  AgentKeys,
  EmailAddress,
  EmailAddressKeys,
  PhoneNumber,
  RawEmailAddress
} from 'ag-common-lib/public-api';
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

  constructor(
    public agentService: AgentService,
    private domainEmailService: DomainEmailService,
    private domainPhoneNumberService: DomainPhoneNumberService,
    private domainAddressService: DomainAddressService,
    private domainUtilService: DomainUtilService
  ) {}

  public importFileToString(file: File): Promise<string> {
    return new Promise((resolve) => {
      try {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
          let text = reader.result;
          resolve(text as string);
        };
      } catch (err) {
        console.error(err);
      }
    });
  }

  //iterate through each incoming data map
  //  iterate through each mapped field
  //    check to see if incoming data map has field that matches the mapped_to field
  //    if there is a match
  //      set the k -> v pair to be the 'field_value' -> incoming data value
  //    if no match
  //      check to see 'mapped_to' field == 'Set Default Value' and default value exists
  //      if exists
  //        set 'field_value' to 'default value'
  public createInviteeMap(csvText, importMappings: ImportMapping[]): Map<string, string>[] {
    const normalizeRowData = (incomingDataMap: Map<string, string>) => {
      const data: Map<string, string> = new Map<string, string>();

      for (const importMapping of importMappings) {
        const {
          [ImportMappingKeys.mappedTo]: mappedTo,
          [ImportMappingKeys.fieldNameRegistrant]: fieldNameRegistrant,
          [ImportMappingKeys.fieldNameAgent]: fieldNameAgent,
          [ImportMappingKeys.customValue]: defaultValue
        } = importMapping;

        const hasMappedTo = incomingDataMap.has(mappedTo);
        const value = hasMappedTo ? incomingDataMap.get(mappedTo) : null;

        if (hasMappedTo && fieldNameRegistrant) {
          data.set(fieldNameRegistrant, value);
        }
        if (hasMappedTo && fieldNameAgent) {
          data.set(fieldNameAgent, value);
        }
        if (!hasMappedTo && mappedTo === 'Set Default Value' && defaultValue) {
          if (fieldNameRegistrant) {
            data.set(fieldNameRegistrant, defaultValue);
          }
          if (fieldNameAgent) {
            data.set(fieldNameAgent, defaultValue);
          }
        }
      }

      data.set('invitee_guest', 'Invitee');

      return data;
    };

    const columnsNamesMap = new Map<number, string>();
    const rows: string[] = csvText.split('\n');
    const rowsMaps: Map<string, string>[] = [];
    const headersRow = rows[0].split(',');

    headersRow.forEach((columnName, index) => {
      columnsNamesMap.set(index, columnName);
    });

    for (var i = 1; i < rows.length; i++) {
      const rowCells = rows[i].split(',');

      if (rowCells?.filter(Boolean)?.length) {
        const incomingDataMap: Map<string, string> = new Map<string, string>();

        rowCells.forEach((cellData, index) => {
          const cellKey = columnsNamesMap.get(index);

          if (cellData && cellData !== '') {
            incomingDataMap.set(cellKey, cellData);
          }
        });

        rowsMaps.push(normalizeRowData(incomingDataMap));
      }
    }

    return rowsMaps;
  }

  validateFile(csvText, messages: String[], import_type: string, importMappings: ImportMapping[]): Promise<boolean> {
    let lines: string[] = csvText.split('\n');
    let headers: string[] = lines[0].split(',');

    let numOfFields = headers.length;

    for (var i = 1; i < lines.length; i++) {
      let count = lines[i].split(',').length;

      if (count != numOfFields) {
        messages.push('The number of Fields on line ' + i + ' does not match the number of headers.');
      }
    }

    if (import_type == 'registration') {
      let email_mapping: ImportMapping = importMappings.find(
        (mapping) => mapping.field_name_registrant == 'invitee_email'
      );

      if (email_mapping) {
        let invitee_email_exist = headers.filter((h) => h == email_mapping.mapped_to).length > 0;

        if (!invitee_email_exist) {
          messages.unshift("The 'Registration' import must contain a field mapped to 'invitee_email'");
        }
      }

      // let is_login_mapping: ImportMapping = importMappings.find(mapping => mapping.field_name_registrant == 'invitee_email_is_login');

      // if(is_login_mapping){
      //   let invitee_is_login_exist = headers.filter(h => h == is_login_mapping.mapped_to).length > 0;

      //   if(!invitee_is_login_exist){
      //     messages.unshift("The 'Registration' import must contain a field mapped to 'invitee_email_is_login'")
      //   }
      // }
    } else {
      let email_mapping: ImportMapping = importMappings.find(
        (mapping) => mapping.field_name_agent == this.PRIMARY_EMAIL_IDENTIFIER
      );

      if (email_mapping) {
        let email_address = headers.filter((h) => h == email_mapping.mapped_to).length > 0;

        if (!email_address) {
          messages.unshift("The import must contain a field called '" + this.PRIMARY_EMAIL_IDENTIFIER + "'");
        }
      }

      let is_login_mapping: ImportMapping = importMappings.find(
        (mapping) => mapping.field_name_agent == 'email_addresses.1.is_login'
      );

      // if(is_login_mapping){
      //   let invitee_is_login_exist = headers.filter(h => h == is_login_mapping.mapped_to).length > 0;

      //   if(!invitee_is_login_exist){
      //     messages.unshift("The 'Agent' import must contain a field mapped to 'email_addresses.1.is_login'")
      //   }
      // }
    }

    if (messages.length == 0) {
      messages.unshift('The file format appears to be valid!.');
      return Promise.resolve(true);
    } else {
      messages.unshift('Please fix the file format and reimport it!.');
      return Promise.resolve(false);
    }
  }

  validateInvitee(invitee: Map<string, any>, messages: String[]) {
    let isValid = true;

    let agent_name =
      invitee.get('p_agent_first_name') +
      ' ' +
      invitee.get('p_agent_last_name') +
      '(' +
      invitee.get(this.PRIMARY_EMAIL_IDENTIFIER) +
      ')';

    if (invitee.has('email_addresses.1.address')) {
      if (invitee.get('email_addresses.1.address').trim() != invitee.get('invitee_email').trim()) {
        messages.push(
          'ERROR: Invitee ' +
            agent_name +
            ' The Email Associated with this Registration and the Primary Login Email must be the same'
        );
        isValid = false;
      }

      if (!this.domainUtilService.getBoolean(invitee.get('email_addresses.1.is_login'))) {
        messages.push(
          'ERROR: Invitee ' +
            agent_name +
            ' The Login Email with this Registration must be associated with the first Address w/n the spreadsheet'
        );
        isValid = false;
      }
    }

    if (invitee.has('invitee_email')) {
      if (invitee.get('invitee_email').trim() == '') {
        messages.push('ERROR: Invitee ' + agent_name + " 'invitee_email' is blank");
        isValid = false;
      }
    } else {
      messages.push('ERROR: Invitee ' + agent_name + " does not have an email address in 'invitee_email'");
      isValid = false;
    }

    if (invitee.has(AgentKeys.dob) && !this.isDate(invitee.get(AgentKeys.dob))) {
      messages.push('ERROR: Invitee ' + agent_name + ' has an invalid date in ' + AgentKeys.dob);
      isValid = false;
    }

    if (
      invitee.has(AgentKeys.prospect_referred_to_date) &&
      !this.isDate(invitee.get(AgentKeys.prospect_referred_to_date))
    ) {
      messages.push('ERROR: Invitee ' + agent_name + ' has an invalid date in ' + AgentKeys.prospect_referred_to_date);
      isValid = false;
    }

    let addresses: Address[] = this.domainAddressService.extractAddresses(invitee);

    if (addresses.filter((addresses) => addresses.is_primary_billing == true).length > 1) {
      messages.push('ERROR: Invitee ' + agent_name + ' has more than 1 Primary Billing Address listed');
      isValid = false;
    }

    if (addresses.filter((addresses) => addresses.is_primary_shipping == true).length > 1) {
      messages.push('ERROR: Invitee ' + agent_name + ' has more than 1 Primary Shipping Address listed');
      isValid = false;
    }

    let phoneNumbers: PhoneNumber[] = this.domainPhoneNumberService.extractPhoneNumbers(invitee);

    if (phoneNumbers.filter((phone) => phone.is_primary == true).length > 1) {
      messages.push('ERROR: Invitee ' + agent_name + ' has more than 1 Primary Phone Number listed');
      isValid = false;
    }

    const emailAddresses: RawEmailAddress[] = this.domainEmailService.extractRawEmailAddressesData(invitee);
    const toManyLoginAddresses = emailAddresses.filter((email) => email[EmailAddressKeys.isLogin]).length > 1;
    if (toManyLoginAddresses) {
      messages.push('ERROR: Invitee ' + agent_name + ' has more than 1 Login Email listed');
      isValid = false;
    }

    return isValid;
  }

  validateGuest(guest: Map<string, any>, invitee_list: Map<string, any>[], messages: String[]) {
    let isValid = true;

    let guest_name =
      guest.get('association.1.first_name') +
      ' ' +
      guest.get('association.1.last_name') +
      '(' +
      guest.get(this.ASSOCIATE_EMAIL_IDENTIFIER) +
      ')';

    if (guest.has('invitee_email')) {
      if (guest.get('invitee_email').trim() == '') {
        messages.push('ERROR: Guest ' + guest_name + " 'invitee_email' is blank");
        isValid = false;
      }

      if (invitee_list.filter((invitee) => invitee.get('invitee_email') == guest.get('invitee_email')).length == 0) {
        messages.push(
          'ERROR: Guest ' +
            guest_name +
            " does not have an email address in 'invitee_email' that matches an invitee in the list."
        );
        isValid = false;
      }
    } else {
      messages.push('ERROR: Guest ' + guest_name + " does not have an email address in 'invitee_email'");
      isValid = false;
    }

    return isValid;
  }

  private isDate(date: string): boolean {
    return new Date(date).toString() != 'Invalid Date';
  }
}
