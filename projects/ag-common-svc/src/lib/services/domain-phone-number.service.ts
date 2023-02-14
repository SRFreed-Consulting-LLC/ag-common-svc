import { Injectable } from '@angular/core';
import {
  ImportRuleSet,
  ImportRuleSetKeys,
  PrimaryFieldRule
} from 'ag-common-lib/lib/models/import-rules/import-ruleset-model';
import { Agent, AgentKeys, BUSINESS_PERSONAL_TYPE, PhoneNumber, PhoneNumberType } from 'ag-common-lib/public-api';
import { DomainUtilService } from './domain-util.service';

@Injectable({
  providedIn: 'root'
})
export class DomainPhoneNumberService {
  constructor(private domainUtilService: DomainUtilService) {}

  //create phone number objects from datamap
  //Ensures they are unique (In case 2 numbers come in with identical digits)
  extractPhoneNumbers(invals: Map<string, string>): PhoneNumber[] {
    let retval: PhoneNumber[] = [];

    let i: Map<string, string> = this.domainUtilService.getCount(invals, 'phone_numbers');

    let tempMap: Map<string, PhoneNumber> = new Map<string, PhoneNumber>();

    let primary: PhoneNumber;

    i.forEach((value, key) => {
      let a: PhoneNumber = this.createPhoneNumber(invals, key);

      if (a.is_primary) primary = a;

      if (a.number) tempMap.set(a.number, a);
    });

    if (primary) {
      tempMap.set(primary.number, primary);
    }

    tempMap.forEach((val, key) => {
      retval.push(val);
    });

    return retval;
  }

  createPhoneNumbers(invals: Map<string, string>): PhoneNumber[] {
    let phone_numbers = this.extractPhoneNumbers(invals);

    let is_primary = phone_numbers.filter((phone) => phone.is_primary == true);

    if (phone_numbers.length > 0 && is_primary.length == 0) {
      phone_numbers[0].is_primary = true;
    }

    return this.extractPhoneNumbers(invals);
  }

  private createPhoneNumber(invals: Map<string, string>, key: string): PhoneNumber {
    let a: PhoneNumber = { ...new PhoneNumber() };

    if (invals.has('phone_numbers.' + key + '.number')) {
      a.number = invals
        .get('phone_numbers.' + key + '.number')
        .replace('.', '')
        .replace('.', '')
        .replace('-', '')
        .replace('-', '')
        .replace(' ', '')
        .replace(' ', '')
        .replace('(', '')
        .replace(')', '');
    }

    if (invals.has('phone_numbers.' + key + '.phone_type')) {
      a.phone_type = PhoneNumberType[invals.get('phone_numbers.' + key + '.phone_type')];
    }

    if (
      invals.has('phone_numbers.' + key + '.is_primary') &&
      invals.get('phone_numbers.' + key + '.is_primary').toLowerCase() == 'true'
    ) {
      a.is_primary = true;
    } else {
      a.is_primary = false;
    }

    return a;
  }

  //If a match is found for incoming phone number, phone number will be updated with incoming data from datamap
  //If a match is not found, Phone number will be added to agents phone numbers list
  //If the ruleset requires updating primary (and a primary is provided), primary phone number will be set
  //After all is done, a final check will ensure that at least 1 primary is set (1st in list)
  updatePhoneNumbers(data: Map<string, string>, agent: Agent, selectedRuleSet: ImportRuleSet, messages: string[]) {
    let incoming_phone_numbers: PhoneNumber[] = this.extractPhoneNumbers(data);

    if (incoming_phone_numbers.length > 0) {
      if (!agent[AgentKeys.phone_numbers]) {
        agent[AgentKeys.phone_numbers] = [];
      }

      //checks to see if ruleset allows for updating primary
      //will return false if no incoming primary is set (or more than 1 is set)
      let required_to_update_primary = this.updatePrimaryPhoneNumberRequired(
        incoming_phone_numbers,
        selectedRuleSet,
        agent,
        messages
      );

      //if update of primary is required (and primary is provided)
      //set all existing primary numbers to false
      if (required_to_update_primary) {
        agent.phone_numbers.forEach((a) => (a.is_primary = false));
      }

      //look at each incoming and update if matching or add to list
      incoming_phone_numbers.forEach((incoming_phone) => {
        let matching_phone: PhoneNumber = agent[AgentKeys.phone_numbers].find(
          (phone) => this.stripPhonNumber(phone.number) == this.stripPhonNumber(incoming_phone.number)
        );

        if (matching_phone) {
          if (incoming_phone.phone_type) {
            this.domainUtilService.updateField(
              selectedRuleSet[ImportRuleSetKeys.phone_phone_type],
              matching_phone,
              'phone_type',
              incoming_phone.phone_type
            );
          }
          if (incoming_phone.is_primary && required_to_update_primary) {
            this.domainUtilService.updateField(
              selectedRuleSet[ImportRuleSetKeys.phone_is_primary],
              matching_phone,
              'is_primary',
              incoming_phone.is_primary
            );
          }
        } else {
          agent[AgentKeys.phone_numbers].push(incoming_phone);
        }
      });

      //after creating new list, check for a primary
      let is_primary_set = agent[AgentKeys.phone_numbers].filter((a) => a.is_primary)?.length > 0;

      //if no primary set, set first email to primary
      if (!is_primary_set && agent[AgentKeys.phone_numbers].length > 0) {
        agent[AgentKeys.phone_numbers][0].is_primary = true;
      }
    }

    return true;
  }

  //checks to see if update of Primary is required and incoming primary exists
  private updatePrimaryPhoneNumberRequired(
    incoming_phone_numbers: PhoneNumber[],
    selectedRuleSet: ImportRuleSet,
    agent: Agent,
    messages: string[]
  ): boolean {
    let phone_number_rule = selectedRuleSet[ImportRuleSetKeys.primary_phone_number];

    let required_to_update_primary = PrimaryFieldRule[phone_number_rule] == PrimaryFieldRule.UPDATE_PRIMARY_VALUE;

    if (required_to_update_primary) {
      let incoming_has_primary: PhoneNumber[] = incoming_phone_numbers.filter((add) => add.is_primary == true);

      if (incoming_has_primary.length == 0) {
        // <---if 0 found in file, then do not update any primaries
        return false;
      } else if (incoming_has_primary.length == 1) {
        // <---if 1 found in file, then update the primary
        return true;
      } else if (incoming_has_primary.length >= 2) {
        // <---if more than 1 found, this is an error -- should not occur from Data Validation check
        return false;
      }
    }

    return true;
  }

  private stripPhonNumber(incoming_phone_number: string) {
    return incoming_phone_number
      .replace('(', '')
      .replace(')', '')
      .replace(' ', '')
      .replace(' ', '')
      .replace('-', '')
      .replace('-', '');
  }
}
