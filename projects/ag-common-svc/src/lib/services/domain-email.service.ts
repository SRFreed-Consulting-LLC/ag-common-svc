import { Injectable } from '@angular/core';
import {
  ImportRuleSet,
  ImportRuleSetKeys,
  PrimaryFieldRule
} from 'ag-common-lib/lib/models/import-rules/import-ruleset-model';
import {
  ActiveLookup,
  Agent,
  AgentKeys,
  BaseModel,
  BaseModelKeys,
  EmailAddress,
  EmailAddressKeys,
  RawEmailAddress
} from 'ag-common-lib/public-api';
import { firstValueFrom, Observable, tap } from 'rxjs';
import { QueryParam, WhereFilterOperandKeys } from '../dao/CommonFireStoreDao.dao';
import { AgentEmailAddressesService } from './agent-email-addresses.service';
import { DomainUtilService } from './domain-util.service';
import { LookupsService } from './lookups.service';

@Injectable({
  providedIn: 'root'
})
export class DomainEmailService {
  private emailTypeLookup$: Observable<ActiveLookup[]>;
  private defaultEmailTypeLookup: ActiveLookup;

  constructor(
    lookupsService: LookupsService,
    private domainUtilService: DomainUtilService,
    private agentEmailAddressesService: AgentEmailAddressesService
  ) {
    this.emailTypeLookup$ = lookupsService.emailTypeLookup$.pipe(
      tap((items) => {
        this.defaultEmailTypeLookup = items?.find((item) => item?.isDefault);
      })
    );
  }

  public extractRawEmailAddressesData(dataMap: Map<string, string>): RawEmailAddress[] {
    const emailsMap: Map<string, string> = this.domainUtilService.getCount(dataMap, 'email_addresses');
    const rawEmailAddresses = [];

    emailsMap.forEach((_value, key) => {
      rawEmailAddresses.push(this.extractRawEmailData(dataMap, key));
    });

    return rawEmailAddresses.filter((emailAddress) => !!emailAddress?.address);
  }

  private extractRawEmailData(dataMap: Map<string, string>, key: string): RawEmailAddress {
    const emailAddress: RawEmailAddress = Object.assign({}, new RawEmailAddress());
    const getFullFieldName = (fieldName) => ['email_addresses', key, fieldName].join('.');

    const addressFullName = getFullFieldName('address');
    const address = dataMap.get(addressFullName);
    if (address) {
      Object.assign(emailAddress, { [EmailAddressKeys.address]: address?.toLocaleLowerCase().trim() });
    }

    const emailTypeFullName = getFullFieldName('email_type');
    const emailType = dataMap.get(emailTypeFullName);
    if (emailType) {
      Object.assign(emailAddress, { [EmailAddressKeys.rawEmailType]: emailType?.toLocaleLowerCase().trim() });
    }

    const isLoginFullName = getFullFieldName('is_login');
    const isLogin = dataMap.get(isLoginFullName);

    Object.assign(emailAddress, { [EmailAddressKeys.isLogin]: isLogin?.toLocaleLowerCase().trim() === 'true' });

    return emailAddress;
  }

  private extractEmailType = async (rawEmailType: string, messages: string[]) => {
    const emailTypes = await firstValueFrom(this.emailTypeLookup$);
    const lookup = emailTypes.find((emailType) => {
      return `${rawEmailType}`?.toLocaleLowerCase().includes(`${emailType?.description}`?.toLocaleLowerCase());
    });

    if (!lookup && this.defaultEmailTypeLookup) {
      messages.push(
        `Can't find lookup value for '${rawEmailType}' Email Type. We'll set default ${this.defaultEmailTypeLookup?.description} Email Type value.`
      );
      return this.defaultEmailTypeLookup?.dbId ?? '';
    }

    return lookup?.dbId ?? '';
  };

  public createEmailAddresses(agentId: string, rawEmailAddress: RawEmailAddress[], messages: string[]): Promise<any>[] {
    return rawEmailAddress.map(async (rawEmailAddress) => {
      const emailType = await this.extractEmailType(rawEmailAddress[EmailAddressKeys.rawEmailType], messages);
      const emailAddress: EmailAddress = Object.assign({}, new EmailAddress(), {
        [EmailAddressKeys.address]: rawEmailAddress?.[EmailAddressKeys.address],
        [EmailAddressKeys.isLogin]: rawEmailAddress?.[EmailAddressKeys.isLogin],
        [EmailAddressKeys.emailType]: emailType
      });
      debugger;
      return this.agentEmailAddressesService
        .create(agentId, emailAddress)
        .then((e) => {
          debugger;
          return e;
        })
        .catch((e) => {
          debugger;
        });
    });
  }

  public async updateEmailAddresses(
    dataMap: Map<string, string>,
    agent: Agent,
    selectedRuleSet: ImportRuleSet,
    messages: string[],
    lookup: ActiveLookup[]
  ) {
    const incomingEmails: EmailAddress[] = this.extractRawEmailAddressesData(dataMap);

    if (!incomingEmails?.length) {
      return true;
    }

    const incomingEmailsQp = new QueryParam(
      EmailAddressKeys.address,
      WhereFilterOperandKeys.in,
      incomingEmails.map((rawEmailAddress) => rawEmailAddress.address)
    );

    const existingEmailAddresses = await firstValueFrom(
      this.agentEmailAddressesService.getList(agent[BaseModelKeys.dbId], [incomingEmailsQp])
    );
    debugger;
    return false;
    // //security measure to make sure is_login is NEVER updated
    // incoming_emails.forEach((email) => (email.is_login = false));

    // if (incoming_emails.length > 0 && this.validateEmail(incoming_emails, selectedRuleSet, agent, messages)) {
    //   let email_rule = selectedRuleSet[ImportRuleSetKeys.primary_email_address];

    //   let required_to_update_primary = PrimaryFieldRule[email_rule] == PrimaryFieldRule.UPDATE_PRIMARY_VALUE;

    //   //look at each incoming and update if matching or add to list
    //   incoming_emails.forEach((incoming_email) => {
    //     let matching_email: EmailAddress = null; /* agent[AgentKeys.email_addresses].find(
    //       (email) => email.address.toLowerCase().trim() == incoming_email.address.toLowerCase().trim()
    //     ); */

    //     if (matching_email) {
    //       if (incoming_email.email_type) {
    //         let val = lookup.find((val) => val.value.toLowerCase() == incoming_email.email_type.toLowerCase());
    //         this.domainUtilService.updateField(
    //           selectedRuleSet[ImportRuleSetKeys.email_address_email_type],
    //           matching_email,
    //           'email_type',
    //           val.dbId
    //         );
    //       }
    //       if (incoming_email.is_primary && required_to_update_primary) {
    //         this.domainUtilService.updateField(
    //           selectedRuleSet[ImportRuleSetKeys.email_address_is_primary],
    //           matching_email,
    //           'is_primary',
    //           incoming_email.is_primary
    //         );
    //       }
    //     } else {
    //       if (!required_to_update_primary) {
    //         incoming_email.is_primary = false;
    //       }
    //       // agent[AgentKeys.email_addresses].push(incoming_email);
    //     }
    //   });

    //   //after creating new list, check for a primary
    //   // let is_primary_set = agent[AgentKeys.email_addresses].filter((a) => a.is_primary)?.length > 0;

    //   //if no primary set, set first email to primary
    //   // if (!is_primary_set && agent[AgentKeys.email_addresses].length > 0) {
    //   //   agent[AgentKeys.email_addresses][0].is_primary = true;
    //   // }
    // }

    return true;
  }

  validateEmail(incomingEmails: EmailAddress[], selectedRuleSet: ImportRuleSet, agent: Agent, messages: string[]) {
    const emailRule = selectedRuleSet[ImportRuleSetKeys.primary_email_address];
    const isRequiredToUpdatePrimary = PrimaryFieldRule[emailRule] == PrimaryFieldRule.UPDATE_PRIMARY_VALUE;

    if (!isRequiredToUpdatePrimary) {
      return true;
    }
    const incomingHasLogin: EmailAddress[] = incomingEmails.filter((add) => add.is_login == true);

    return false;
    /*  if (incoming_has_primary.length == 0) {
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
    } */
  }
}
