import { Injectable } from '@angular/core';
import {
  ImportRuleSet,
  ImportRuleSetKeys,
  PrimaryFieldRule
} from 'ag-common-lib/lib/models/import-rules/import-ruleset-model';
import { ActiveLookup, Agent, AgentKeys, BUSINESS_PERSONAL_TYPE, EmailAddress } from 'ag-common-lib/public-api';
import { DomainUtilService } from './domain-util.service';

@Injectable({
  providedIn: 'root'
})
export class DomainEmailService {
  constructor(private domainUtilService: DomainUtilService) {}

  extractEmailAddresses(invals: Map<string, string>): EmailAddress[] {
    let retval: EmailAddress[] = [];

    let i: Map<string, string> = this.domainUtilService.getCount(invals, 'email_addresses');

    i.forEach((value, key) => {
      let a: EmailAddress = this.createEmailAddress(invals, key);
      if (a.address) retval.push(a);
    });

    return retval;
  }

  private createEmailAddress(invals: Map<string, string>, key: string): EmailAddress {
    let a: EmailAddress = { ...new EmailAddress() };
    a.id = this.domainUtilService.generateId();

    if (invals.has('email_addresses.' + key + '.address'))
      a.address = invals
        .get('email_addresses.' + key + '.address')
        .toLowerCase()
        .trim();
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

  createEmailAddresses(invals: Map<string, string>): EmailAddress[] {
    let addresses = this.extractEmailAddresses(invals);

    let primary_addresses = addresses.filter((email) => email.is_primary == true);

    if (addresses.length > 0 && primary_addresses.length == 0) {
      addresses[0].is_primary = true;
    }

    let login_addresses = addresses.filter((email) => email.is_login == true);

    if (addresses.length > 0 && login_addresses.length == 0) {
      addresses[0].is_login = true;
    }

    return addresses;
  }

  updateEmailAddresses(
    data: Map<string, string>,
    agent: Agent,
    selectedRuleSet: ImportRuleSet,
    messages: string[],
    lookup: ActiveLookup[]
  ) {
    let incoming_emails: EmailAddress[] = this.extractEmailAddresses(data);

    //security measure to make sure is_login is NEVER updated
    incoming_emails.forEach((email) => (email.is_login = false));

    if (incoming_emails.length > 0 && this.validateEmail(incoming_emails, selectedRuleSet, agent, messages)) {
      let email_rule = selectedRuleSet[ImportRuleSetKeys.primary_email_address];

      let required_to_update_primary = PrimaryFieldRule[email_rule] == PrimaryFieldRule.UPDATE_PRIMARY_VALUE;

      //look at each incoming and update if matching or add to list
      incoming_emails.forEach((incoming_email) => {
        let matching_email: EmailAddress = null; /* agent[AgentKeys.email_addresses].find(
          (email) => email.address.toLowerCase().trim() == incoming_email.address.toLowerCase().trim()
        ); */

        if (matching_email) {
          if (incoming_email.email_type) {
            let val = lookup.find((val) => val.value.toLowerCase() == incoming_email.email_type.toLowerCase());
            this.domainUtilService.updateField(
              selectedRuleSet[ImportRuleSetKeys.email_address_email_type],
              matching_email,
              'email_type',
              val.dbId
            );
          }
          if (incoming_email.is_primary && required_to_update_primary) {
            this.domainUtilService.updateField(
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
          // agent[AgentKeys.email_addresses].push(incoming_email);
        }
      });

      //after creating new list, check for a primary
      // let is_primary_set = agent[AgentKeys.email_addresses].filter((a) => a.is_primary)?.length > 0;

      //if no primary set, set first email to primary
      // if (!is_primary_set && agent[AgentKeys.email_addresses].length > 0) {
      //   agent[AgentKeys.email_addresses][0].is_primary = true;
      // }
    }

    return true;
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
        // agent.email_addresses.forEach((add) => (add.is_primary = false));
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
}
