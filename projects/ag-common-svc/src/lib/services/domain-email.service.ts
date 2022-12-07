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
  EmailAddress
} from 'ag-common-lib/public-api';
import { AgentApproveDenyReasonsService } from './agent-approve-deny-reason.service';
import { AgentAssociationsService } from './agent-associations.service';
import { AgentService } from './agent.service';
import { DomainAddressService } from './domain-address.service';

@Injectable({
  providedIn: 'root'
})
export class DomainEmailService {
  constructor() {}

  extractEmailAddresses(invals: Map<string, string>): EmailAddress[] {
    let retval: EmailAddress[] = [];

    let i: Map<string, string> = this.getCount(invals, 'email_addresses');

    i.forEach((value, key) => {
      let a: EmailAddress = this.createEmailAddress(invals, key);
      if (a.address) retval.push(a);
    });

    return retval;
  }

  createEmailAddress(invals: Map<string, string>, key: string): EmailAddress {
    let a: EmailAddress = { ...new EmailAddress() };
    a.id = this.generateId();

    if (invals.has('email_addresses.' + key + '.address'))
      a.address = invals.get('email_addresses.' + key + '.address');
    if (invals.has('email_addresses.' + key + '.email_type'))
      a.email_type = BUSINESS_PERSONAL_TYPE[invals.get('email_addresses.' + key + '.email_type').toUpperCase()];

    if (
      invals.has('email_addresses.' + key + '.is_login') &&
      invals.get('email_addresses.' + key + '.is_login').toLowerCase() == 'true'
    ) {
      a.is_login = true;
    } else {
      a.is_login = false;
    }

    if (
      invals.has('email_addresses.' + key + '.is_primary') &&
      invals.get('email_addresses.' + key + '.is_primary').toLowerCase() == 'true'
    ) {
      a.is_primary = true;
    } else {
      a.is_primary = false;
    }

    return a;
  }

  updateEmailAddresses(data: Map<string, string>, agent: Agent, selectedRuleSet: ImportRuleSet, messages: string[]) {
    let incoming_emails: EmailAddress[] = this.extractEmailAddresses(data);

    //security measure to make sure is_login is NEVER updated
    incoming_emails.forEach((email) => (email.is_login = false));

    if (incoming_emails.length > 0 && this.validateEmail(incoming_emails, selectedRuleSet, agent, messages)) {
      if (!agent[AgentKeys.email_addresses]) {
        agent[AgentKeys.email_addresses] = [];
      }

      let email_rule = selectedRuleSet[ImportRuleSetKeys.primary_email_address];

      let required_to_update_primary = PrimaryFieldRule[email_rule] == PrimaryFieldRule.UPDATE_PRIMARY_VALUE;

      //look at each incoming and update if matching or add to list
      incoming_emails.forEach((incoming_email) => {
        let matching_email: EmailAddress = agent[AgentKeys.email_addresses].find(
          (email) => email.address == incoming_email.address
        );

        if (matching_email) {
          if (incoming_email.email_type) {
            this.updateField(
              selectedRuleSet[ImportRuleSetKeys.email_address_email_type],
              matching_email,
              'email_type',
              incoming_email.email_type
            );
          }
          if (incoming_email.is_primary && required_to_update_primary) {
            this.updateField(
              selectedRuleSet[ImportRuleSetKeys.email_address_is_primary],
              matching_email,
              'is_primary',
              incoming_email.is_primary
            );
          }
        } else {
          if (!required_to_update_primary) {
            incoming_email.is_primary = false;
          }
          agent[AgentKeys.email_addresses].push(incoming_email);
        }
      });

      //after creating new list, check for a primary
      let is_primary_set = agent[AgentKeys.email_addresses].filter((a) => a.is_primary)?.length > 0;

      //if no primary set, set first email to primary
      if (!is_primary_set && agent[AgentKeys.email_addresses].length > 0) {
        agent[AgentKeys.email_addresses][0].is_primary = true;
      }

      return true;
    } else {
      return false;
    }
  }

  validateEmail(incoming_emails: EmailAddress[], selectedRuleSet: ImportRuleSet, agent: Agent, messages: string[]) {
    let email_rule = selectedRuleSet[ImportRuleSetKeys.primary_email_address];

    let required_to_update_primary = PrimaryFieldRule[email_rule] == PrimaryFieldRule.UPDATE_PRIMARY_VALUE;

    if (required_to_update_primary) {
      let incoming_has_primary: EmailAddress[] = incoming_emails.filter((add) => add.is_primary == true);

      if (incoming_has_primary.length == 0) {
        messages.push(
          'Selected Rule Set requires Primary Email to be updated, but no Primary is set. Please set primary for ' +
            agent.p_email
        ) + ' or change the import rule.';
        return false;
      } else if (incoming_has_primary.length == 1) {
        agent.email_addresses.forEach((add) => (add.is_primary = false));
        return true;
      } else if (incoming_has_primary.length == 2) {
        messages.push(
          'Selected Rule Set requires Primary Email to be updated, but 2 Primararies are set. Please set set only 1 primary for ' +
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
