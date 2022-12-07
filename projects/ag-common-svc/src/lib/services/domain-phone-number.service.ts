import { Injectable } from '@angular/core';
import {
  ImportFieldRule,
  ImportRuleSet,
  ImportRuleSetKeys,
  PrimaryFieldRule
} from 'ag-common-lib/lib/models/import-rules/import-ruleset-model';
import {
  Agent,
  AgentKeys,
  BUSINESS_PERSONAL_TYPE,
  PhoneNumber,
} from 'ag-common-lib/public-api';

@Injectable({
  providedIn: 'root'
})
export class DomainPhoneNumberService {
  constructor() {}

  extractPhoneNumbers(invals: Map<string, string>): PhoneNumber[] {
    let retval: PhoneNumber[] = [];

    let i: Map<string, string> = this.getCount(invals, 'phone_numbers');

    let tempMap: Map<string, PhoneNumber> = new Map<string, PhoneNumber>();

    let primary: PhoneNumber;

    i.forEach((value, key) => {
      let a: PhoneNumber = this.createPhoneNumber(invals, key);

      if (a.is_primary) primary = a;

      if (a.number) tempMap.set(a.number, a);
    });

    tempMap.set(primary.number, primary);

    tempMap.forEach((val, key) => {
      retval.push(val);
    });

    return retval;
  }

  createPhoneNumber(invals: Map<string, string>, key: string): PhoneNumber {
    let a: PhoneNumber = { ...new PhoneNumber() };
    a.id = this.generateId();

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
      a.phone_type = BUSINESS_PERSONAL_TYPE[invals.get('phone_numbers.' + key + '.phone_type').toUpperCase()];
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

  updatePhoneNumbers(data: Map<string, string>, agent: Agent, selectedRuleSet: ImportRuleSet, messages: string[]) {
    let incoming_phone_numbers: PhoneNumber[] = this.extractPhoneNumbers(data);

    if (incoming_phone_numbers.length > 0) {
      if (!agent[AgentKeys.phone_numbers]) {
        agent[AgentKeys.phone_numbers] = [];
      }

      //checks to see if ruleset allows for updating primary
      //will return false if no incoming primary is set (or more than 1 is set)
      let required_to_update_primary = this.updatePrimaryPhoneNumberRequired(incoming_phone_numbers, selectedRuleSet, agent, messages);

      //if update of primary is required (and priimary is provided)
      //set all existing primary numbers to false
      if (required_to_update_primary) {
        agent.phone_numbers.forEach((a) => (a.is_primary = false));
      }

      //look at each incoming and update if matching or add to list
      incoming_phone_numbers.forEach((incoming_phone) => {
        let stripped = incoming_phone.number
          .replace('(', '')
          .replace(')', '')
          .replace(' ', '')
          .replace(' ', '')
          .replace('-', '')
          .replace('-', '');

        let matching_phone: PhoneNumber = agent[AgentKeys.phone_numbers].find((phone) => {
          let matched_strip = phone.number
            .replace('(', '')
            .replace(')', '')
            .replace(' ', '')
            .replace(' ', '')
            .replace('-', '')
            .replace('-', '');
          return matched_strip == stripped;
        });

        if (matching_phone) {
          if (incoming_phone.phone_type) {
            this.updateField(selectedRuleSet[ImportRuleSetKeys.phone_phone_type],matching_phone,'phone_type',incoming_phone.phone_type);
          }
          if (incoming_phone.is_primary && required_to_update_primary) {
            this.updateField(selectedRuleSet[ImportRuleSetKeys.phone_is_primary],matching_phone,'is_primary',incoming_phone.is_primary);
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

      return true;
    } else {
      return false;
    }
  }

  //checks to see if update of Primary is required and incoming primary exists
  updatePrimaryPhoneNumberRequired(incoming_phone_numbers: PhoneNumber[],selectedRuleSet: ImportRuleSet,agent: Agent,messages: string[]): boolean {
    let phone_number_rule = selectedRuleSet[ImportRuleSetKeys.primary_phone_number];

    let required_to_update_primary = PrimaryFieldRule[phone_number_rule] == PrimaryFieldRule.UPDATE_PRIMARY_VALUE;

    if (required_to_update_primary) {
      let incoming_has_primary: PhoneNumber[] = incoming_phone_numbers.filter((add) => add.is_primary == true);

      if (incoming_has_primary.length == 0) {
        messages.push(
          'Selected Rule Set requires Primary Phone Number to be updated, but no Primary is set. Please set primary for ' +
            agent.p_email +
            ' or change the import rule.'
        );
        return false;
      } else if (incoming_has_primary.length == 1) {
        return true;
      } else if (incoming_has_primary.length == 2) {
        messages.push(
          'Selected Rule Set requires Primary Phone Number to be updated, but 2 Primararies are set. Please set set only 1 primary for ' +
            agent.p_email +
            ' or change the import rule.'
        );
        return false;
      } else {
        return false;
      }
    }

    return true;
  }

  updateField(rule, itemToUpdate, field_name: string, value) {
    if (ImportFieldRule[rule] == ImportFieldRule.APPEND_TO_EXISTING) {
      itemToUpdate[field_name] = itemToUpdate[field_name] + ' ' + value;
    } else if (ImportFieldRule[rule] == ImportFieldRule.DO_NOT_UPDATE) {
      itemToUpdate[field_name] = itemToUpdate[field_name];
    } else if (ImportFieldRule[rule] == ImportFieldRule.UPDATE_EXISTING_VALUE) {
      itemToUpdate[field_name] = value;
    } else if (ImportFieldRule[rule] == ImportFieldRule.UPDATE_IF_BLANK) {
      if (!itemToUpdate[field_name] || itemToUpdate[field_name] == '') {
        itemToUpdate[field_name] = value;
      }
    } else if (PrimaryFieldRule[rule] == PrimaryFieldRule.UPDATE_PRIMARY_VALUE) {
      itemToUpdate[field_name] = value;
    } else if (PrimaryFieldRule[rule] == PrimaryFieldRule.DO_NOT_UPDATE) {
      itemToUpdate[field_name] = itemToUpdate[field_name];
    }
  }

  getCount(invals: Map<string, string>, type: string) {
    let values: Map<string, string> = new Map<string, string>();

    invals.forEach((value, key) => {
      if (key.startsWith(type)) {
        values.set(key.split('.')[1], key.split('.')[1]);
      }
    });

    return values;
  }

  generateId() {
    return 'xxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
