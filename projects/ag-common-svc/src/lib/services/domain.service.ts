import { Injectable } from '@angular/core';
import {
  Address,
  Agent,
  AGENT_STATUS,
  AGENT_TYPE,
  Association,
  ASSOCIATION_TYPE,
  BUSINESS_PERSONAL_TYPE,
  EmailAddress,
  Goal,
  PhoneNumber,
  PROSPECT_DISPOSITION,
  PROSPECT_PRIORITY,
  PROSPECT_STATUS,
  Role,
  Social,
  SOCIAL_MEDIA,
  Website
} from 'ag-common-lib/public-api';

@Injectable({
  providedIn: 'root'
})
export class DomainService {
  constructor() {}

  createAgent(line_data: Map<string, string>, messages: string[], createdBy: string): Agent {
    var agent = { ...new Agent() };

    let splitVals: Map<string, string> = new Map<string, string>();

    line_data.forEach((data, field) => {
      let splitfields = field.split('.');

      if (splitfields.length == 1) {
        if (line_data.has('p_agent_id')) {
          agent.p_agent_id = line_data.get('p_agent_id');
        }
        if (line_data.has('p_external_agent_id')) {
          agent.p_external_agent_id = line_data.get('p_external_agent_id');
        }
        if (line_data.has('p_agent_first_name')) {
          agent.p_agent_first_name = line_data.get('p_agent_first_name');
        }
        if (line_data.has('p_agent_middle_name')) {
          agent.p_agent_middle_name = line_data.get('p_agent_middle_name');
        }
        if (line_data.has('p_agent_last_name')) {
          agent.p_agent_last_name = line_data.get('p_agent_last_name');
        }
        if (line_data.has('p_nick_name')) {
          agent.p_nick_name = line_data.get('p_nick_name');
        }
        if (line_data.has('p_nick_last_name')) {
          agent.p_nick_last_name = line_data.get('p_nick_last_name');
        }
        if (line_data.has('p_agency_id')) {
          agent.p_agency_id = line_data.get('p_agency_id');
        }
        if (line_data.has('p_mga_id')) {
          agent.p_mga_id = line_data.get('p_mga_id');
        }
        if (line_data.has('title')) {
          agent.title = line_data.get('title');
        }
        if (line_data.has('p_prefix')) {
          agent.p_prefix = line_data.get('p_prefix');
        }
        if (line_data.has('p_suffix')) {
          agent.p_suffix = line_data.get('p_suffix');
        }
        if (line_data.has('npn')) {
          agent.npn = line_data.get('npn');
        }
        if (line_data.has('dietary_or_personal_considerations')) {
          agent.dietary_or_personal_considerations = this.getYesNoValue(
            line_data.get('dietary_or_personal_considerations')
          );
        }
        if (line_data.has('dietary_consideration')) {
          agent.dietary_consideration = line_data.get('dietary_consideration');
        }
        if (line_data.has('dietary_consideration_type')) {
          agent.dietary_consideration_type = line_data.get('dietary_consideration_type');
        }
        if (line_data.has('upline')) {
          agent.upline = line_data.get('upline');
        }
        if (line_data.has('agencyName')) {
          agent.approvedBy = line_data.get('agencyName');
        }
        if (line_data.has('registration_source')) {
          agent.registration_source = line_data.get('registration_source');
        }
        if (line_data.has('manager_id')) {
          agent.manager_id = line_data.get('manager_id');
        }
        if (line_data.has('agency_approve_deny_reason')) {
          agent.agency_approve_deny_reason = line_data.get('agency_approve_deny_reason');
        }
        if (line_data.has('approve_deny_reason')) {
          agent.approve_deny_reason = line_data.get('approve_deny_reason');
        }
        if (line_data.has('awb_site_id')) {
          agent.awb_site_id = line_data.get('awb_site_id');
        }
        if (line_data.has('certifications')) {
          agent.certifications = line_data.get('certifications');
        }
        if (line_data.has('prospect_referred_to')) {
          agent.prospect_referred_to = line_data.get('prospect_referred_to');
        }
        if (line_data.has('prospect_wrap_up_notes')) {
          agent.prospect_wrap_up_notes = line_data.get('prospect_wrap_up_notes');
        }
        if (line_data.has('campaigns_user_name')) {
          agent.campaigns_user_name = line_data.get('campaigns_user_name');
        }
        if (line_data.has('campaigns_address')) {
          agent.campaigns_address = line_data.get('campaigns_address');
        }
        if (line_data.has('race')) {
          agent.race = line_data.get('race');
        }
        if (line_data.has('ethnicity')) {
          agent.ethnicity = line_data.get('ethnicity');
        }
        if (line_data.has('gender')) {
          agent.gender = line_data.get('gender');
        }
        if (line_data.has('primary_language')) {
          agent.primary_language = line_data.get('primary_language');
        }
        if (line_data.has('secondary_language')) {
          agent.secondary_language = line_data.get('secondary_language');
        }
        if (line_data.has('hobbies')) {
          agent.hobbies = line_data.get('hobbies');
        }
        if (line_data.has('p_tshirt_size')) {
          agent.p_tshirt_size = line_data.get('p_tshirt_size');
        }
        if (line_data.has('unisex_tshirt_size')) {
          agent.unisex_tshirt_size = line_data.get('unisex_tshirt_size');
        }
        if (line_data.has('favorite_destination')) {
          agent.favorite_destination = line_data.get('favorite_destination');
        }
        if (line_data.has('shoe_size')) {
          agent.shoe_size = line_data.get('shoe_size');
        }

        if (line_data.has('p_strategic_agent')) {
          agent.p_strategic_agent = this.getBoolean(line_data.get('p_strategic_agent'));
        }
        if (line_data.has('alliance_group_employee')) {
          agent.alliance_group_employee = this.getBoolean(line_data.get('alliance_group_employee'));
        }
        if (line_data.has('is_manager')) {
          agent.is_manager = this.getBoolean(line_data.get('is_manager'));
        }
        if (line_data.has('is_rmd')) {
          agent.is_rmd = this.getBoolean(line_data.get('is_rmd'));
        }
        if (line_data.has('is_credited')) {
          agent.is_credited = this.getBoolean(line_data.get('is_credited'));
        }
        if (line_data.has('is_acb_user')) {
          agent.is_acb_user = this.getBoolean(line_data.get('is_acb_user'));
        }
        if (line_data.has('is_awb_user')) {
          agent.is_awb_user = this.getBoolean(line_data.get('is_awb_user'));
        }

        if (line_data.has('christmasCard')) {
          agent.christmasCard = this.getBoolean(line_data.get('is_awb_user'));
        }

        if (line_data.has('prospect_referred_to_date')) {
          agent.prospect_referred_to_date = new Date(line_data.get('prospect_referred_to_date'));
        }
        if (line_data.has('campaigns_user_since')) {
          agent.campaigns_user_since = new Date(line_data.get('campaigns_user_since'));
        }
        if (line_data.has('dob')) {
          agent.dob = new Date(line_data.get('dob'));
        }

        //calculate p_agent_name
        if (agent.p_agent_first_name) {
          agent.p_agent_name = agent.p_agent_first_name;
        }

        if (agent.p_agent_middle_name) {
          agent.p_agent_name = agent.p_agent_name + ' ' + agent.p_agent_middle_name;
        }

        if (agent.p_agent_last_name) {
          agent.p_agent_name = agent.p_agent_name + ' ' + agent.p_agent_last_name;
        }

        if (line_data.has('agent_status')) {
          agent.agent_status = AGENT_STATUS[line_data.get('agent_status').trim()];
        }

        if (line_data.has('prospect_status')) {
          agent.prospect_status = PROSPECT_STATUS[line_data.get('prospect_status').trim()];
        }

        if (line_data.has('prospect_priority')) {
          agent.prospect_priority = PROSPECT_PRIORITY[line_data.get('prospect_priority').trim()];
        }

        if (line_data.has('prospect_disposition')) {
          agent.prospect_disposition = PROSPECT_DISPOSITION[line_data.get('prospect_disposition').trim()];
        }
      } else {
        splitVals.set(field, data);
      }
    });

    agent.personal_goals = [];
    let goal1: Goal = { ...new Goal() };
    goal1.year = new Date().getFullYear();
    goal1.amount = 90000;
    agent.personal_goals.push(goal1);

    agent.conference_goals = [];
    let goal2: Goal = { ...new Goal() };
    goal2.year = new Date().getFullYear();
    goal2.amount = 90000;
    agent.conference_goals.push(goal2);

    if (agent.is_manager) {
      agent.manager_goals = [];
      let goal3: Goal = { ...new Goal() };
      goal3.year = new Date().getFullYear();
      goal3.amount = 90000;
      agent.manager_goals.push(goal3);
    }

    agent.role = [Role.AGENT];

    agent.addresses = this.extractAddresses(splitVals);
    agent.email_addresses = this.extractEmailAddresses(splitVals);
    agent.phone_numbers = this.extractPhoneNumbers(splitVals);
    agent.associations = this.extractAssociations(splitVals);
    agent.websites = this.extractWebsites(splitVals);
    agent.socials = this.extractSocials(splitVals);

    agent.login_count = 0;
    agent.logged_in = false;
    agent.emailVerified = false;
    agent.showSplashScreen = false;
    agent.registration_source = 'File';
    agent.created_date = new Date();
    agent.approvalDate = new Date();
    agent.registrationDate = new Date();
    agent.created_by = createdBy;
    agent.approvedBy = createdBy;
    agent.agent_type = AGENT_TYPE.GENERAL_AGENT;
    agent.is_rmd = false;
    agent.is_credited = false;

    if (agent.email_addresses?.length == 0) {
      messages.push('No Email Addresses were set for this agent. Not Importing ' + agent.p_agent_name);

      return null;
    } else if (agent.email_addresses?.length > 0) {
      let login_address: EmailAddress[] = agent.email_addresses.filter((email) => email.is_login == true);

      if (login_address.length == 0) {
        agent.email_addresses[0].is_login = true;
        agent.p_email = agent.email_addresses[0].address;

        return agent;
      } else {
        agent.p_email = login_address[0].address;

        return agent;
      }
    } else {
      return null;
    }

    return undefined;
  }

  updateAgent(line_data: Map<string, string>, messages: string[], agent: Agent): Agent {
    //update these if value is provided
    if (line_data.has('p_agent_id')) {
      agent.p_agent_id = line_data.get('p_agent_id');
    }
    if (line_data.has('p_external_agent_id')) {
      agent.p_prefix = line_data.get('p_external_agent_id');
    }
    if (line_data.has('p_agent_first_name')) {
      agent.p_agent_first_name = line_data.get('p_agent_first_name');
    }
    if (line_data.has('p_agent_middle_name')) {
      agent.p_agent_middle_name = line_data.get('p_agent_middle_name');
    }
    if (line_data.has('p_agent_last_name')) {
      agent.p_agent_last_name = line_data.get('p_agent_last_name');
    }
    if (line_data.has('p_nick_name')) {
      agent.p_nick_name = line_data.get('p_nick_name');
    }
    if (line_data.has('p_nick_last_name')) {
      agent.p_nick_last_name = line_data.get('p_nick_last_name');
    }
    if (line_data.has('title')) {
      agent.title = line_data.get('title');
    }
    if (line_data.has('p_prefix')) {
      agent.p_prefix = line_data.get('p_prefix');
    }
    if (line_data.has('p_suffix')) {
      agent.p_suffix = line_data.get('p_suffix');
    }
    if (line_data.has('npn')) {
      agent.npn = line_data.get('npn');
    }
    if (line_data.has('dietary_or_personal_considerations')) {
      agent.dietary_or_personal_considerations = this.getYesNoValue(
        line_data.get('dietary_or_personal_considerations')
      );
    }
    if (line_data.has('dietary_consideration')) {
      agent.dietary_consideration = line_data.get('dietary_consideration');
    }
    if (line_data.has('dietary_consideration_type')) {
      agent.dietary_consideration_type = line_data.get('dietary_consideration_type');
    }
    if (line_data.has('upline')) {
      agent.upline = line_data.get('upline');
    }
    if (line_data.has('agencyName')) {
      agent.agencyName = line_data.get('agencyName');
    }
    if (line_data.has('manager_id')) {
      agent.manager_id = line_data.get('manager_id');
    }
    if (line_data.has('awb_site_id')) {
      agent.awb_site_id = line_data.get('awb_site_id');
    }

    if (line_data.has('prospect_referred_to')) {
      agent.prospect_referred_to = line_data.get('prospect_referred_to');
    }
    if (line_data.has('campaigns_user_name')) {
      agent.campaigns_user_name = line_data.get('campaigns_user_name');
    }
    if (line_data.has('campaigns_address')) {
      agent.campaigns_address = line_data.get('campaigns_address');
    }
    if (line_data.has('race')) {
      agent.race = line_data.get('race');
    }
    if (line_data.has('ethnicity')) {
      agent.ethnicity = line_data.get('ethnicity');
    }
    if (line_data.has('gender')) {
      agent.gender = line_data.get('gender');
    }
    if (line_data.has('primary_language')) {
      agent.primary_language = line_data.get('primary_language');
    }
    if (line_data.has('secondary_language')) {
      agent.secondary_language = line_data.get('secondary_language');
    }
    if (line_data.has('hobbies')) {
      agent.hobbies = line_data.get('hobbies');
    }
    if (line_data.has('p_tshirt_size')) {
      agent.p_tshirt_size = line_data.get('p_tshirt_size');
    }
    if (line_data.has('unisex_tshirt_size')) {
      agent.unisex_tshirt_size = line_data.get('unisex_tshirt_size');
    }
    if (line_data.has('favorite_destination')) {
      agent.favorite_destination = line_data.get('favorite_destination');
    }
    if (line_data.has('shoe_size')) {
      agent.shoe_size = line_data.get('shoe_size');
    }

    if (line_data.has('p_strategic_agent')) {
      agent.p_strategic_agent = this.getBoolean(line_data.get('p_strategic_agent'));
    }
    if (line_data.has('alliance_group_employee')) {
      agent.alliance_group_employee = this.getBoolean(line_data.get('alliance_group_employee'));
    }
    if (line_data.has('is_manager')) {
      agent.is_manager = this.getBoolean(line_data.get('is_manager'));
    }
    if (line_data.has('is_acb_user')) {
      agent.is_acb_user = this.getBoolean(line_data.get('is_acb_user'));
    }
    if (line_data.has('is_awb_user')) {
      agent.is_awb_user = this.getBoolean(line_data.get('is_awb_user'));
    }
    if (line_data.has('christmasCard')) {
      agent.christmasCard = this.getBoolean(line_data.get('is_awb_user'));
    }

    if (line_data.has('prospect_referred_to_date')) {
      agent.prospect_referred_to_date = new Date(line_data.get('prospect_referred_to_date'));
    }
    if (line_data.has('campaigns_user_since')) {
      agent.campaigns_user_since = new Date(line_data.get('campaigns_user_since'));
    }
    if (line_data.has('dob')) {
      agent.dob = new Date(line_data.get('dob'));
    }

    //calculate p_agent_name
    if (agent.p_agent_first_name) {
      agent.p_agent_name = agent.p_agent_first_name;
    }

    if (agent.p_agent_middle_name) {
      agent.p_agent_name = agent.p_agent_name + ' ' + agent.p_agent_middle_name;
    }

    if (agent.p_agent_last_name) {
      agent.p_agent_name = agent.p_agent_name + ' ' + agent.p_agent_last_name;
    }

    if (line_data.has('agent_status')) {
      agent.agent_status = AGENT_STATUS[line_data.get('agent_status').trim()];
    }

    if (line_data.has('prospect_status')) {
      agent.prospect_status = PROSPECT_STATUS[line_data.get('prospect_status').trim()];
    }

    if (line_data.has('prospect_priority')) {
      agent.prospect_priority = PROSPECT_PRIORITY[line_data.get('prospect_priority').trim()];
    }

    if (line_data.has('prospect_disposition')) {
      agent.prospect_disposition = PROSPECT_DISPOSITION[line_data.get('prospect_disposition').trim()];
    }

    if (line_data.has('approve_deny_reason')) {
      agent.approve_deny_reason = agent.approve_deny_reason
        ? agent.approve_deny_reason + ' ' + line_data.get('approve_deny_reason')
        : line_data.get('approve_deny_reason');
    }

    if (line_data.has('agency_approve_deny_reason')) {
      agent.agency_approve_deny_reason += agent.agency_approve_deny_reason
        ? agent.agency_approve_deny_reason + ' ' + line_data.get('agency_approve_deny_reason')
        : line_data.get('agency_approve_deny_reason');
    }

    if (line_data.has('certifications')) {
      agent.certifications = agent.certifications
        ? agent.certifications + ' ' + line_data.get('certifications')
        : line_data.get('certifications');
    }

    if (line_data.has('prospect_wrap_up_notes')) {
      agent.prospect_wrap_up_notes = agent.prospect_wrap_up_notes
        ? agent.prospect_wrap_up_notes + ' ' + line_data.get('prospect_wrap_up_notes')
        : agent.prospect_wrap_up_notes;
    }

    this.updateAddresses(line_data, agent);
    this.updateEmailAddresses(line_data, agent);
    this.updatePhoneNumbers(line_data, agent);
    this.updateAssociations(line_data, agent);

    return agent;
  }

  extractAddresses(invals: Map<string, string>): Address[] {
    let retval: Address[] = [];

    let i: Map<string, string> = this.getCount(invals, 'addresses');

    i.forEach((value, key) => {
      let a: Address = this.createAddress(invals, value, key);
      if (a.address1 || a.address2 || a.city || a.state || a.zip || a.county || a.country) retval.push(a);
    });

    return retval;
  }

  createAddress(invals: Map<string, string>, value: string, key: string): Address {
    let a: Address = { ...new Address() };
    a.id = this.generateId();

    if (invals.has('addresses.' + key + '.address1')) a.address1 = invals.get('addresses.' + key + '.address1');
    if (invals.has('addresses.' + key + '.address2')) a.address2 = invals.get('addresses.' + key + '.address2');
    if (invals.has('addresses.' + key + '.city')) a.city = invals.get('addresses.' + key + '.city');
    if (invals.has('addresses.' + key + '.state')) a.state = invals.get('addresses.' + key + '.state');
    if (invals.has('addresses.' + key + '.zip')) a.zip = invals.get('addresses.' + key + '.zip');
    if (invals.has('addresses.' + key + '.county')) a.county = invals.get('addresses.' + key + '.county');
    if (invals.has('addresses.' + key + '.country')) a.country = invals.get('addresses.' + key + '.country');
    if (invals.has('addresses.' + key + '.address_type'))
      a.address_type = BUSINESS_PERSONAL_TYPE[invals.get('addresses.' + key + '.address_type').toUpperCase()];

    if (
      invals.has('addresses.' + key + '.is_primary_billing') &&
      invals.get('addresses.' + key + '.is_primary_billing').toLowerCase() == 'true'
    ) {
      a.is_primary_billing = true;
    } else {
      a.is_primary_billing = false;
    }

    if (
      invals.has('addresses.' + key + '.is_primary_shipping') &&
      invals.get('addresses.' + key + '.is_primary_shipping').toLowerCase() == 'true'
    ) {
      a.is_primary_shipping = true;
    } else {
      a.is_primary_shipping = false;
    }

    return a;
  }

  updateAddresses(data: Map<string, string>, agent: Agent) {
    let incoming_addresses: Address[] = this.extractAddresses(data);

    if (incoming_addresses.length > 0) {
      if (!agent.addresses) {
        agent.addresses = [];
      }

      //if primary shipping currently set, set any incoming is_primary_shipping flags to false
      let primary_shipping_already_exists = agent.addresses.filter((a) => a.is_primary_shipping)?.length > 0;

      if (primary_shipping_already_exists) {
        incoming_addresses.forEach((a) => (a.is_primary_shipping = false));
      }

      //if primary billing currently set, set any incoming is_primary_billing flags to false
      let primary_billing_already_exists = agent.addresses.filter((a) => a.is_primary_billing)?.length > 0;

      if (primary_billing_already_exists) {
        incoming_addresses.forEach((a) => (a.is_primary_billing = false));
      }

      //look at each incoming and update if matching or add to list
      incoming_addresses.forEach((incoming_address) => {
        let matching_address: Address = agent.addresses.find(
          (address) => address.address1 == incoming_address.address1
        );

        if (matching_address) {
          if (incoming_address.address2 && !matching_address.address2) {
            matching_address.address2 = incoming_address.address2;
          }

          if (incoming_address.city && !matching_address.city) {
            matching_address.city = incoming_address.city;
          }

          if (incoming_address.state && !matching_address.state) {
            matching_address.state = incoming_address.state;
          }

          if (incoming_address.zip && !matching_address.zip) {
            matching_address.zip = incoming_address.zip;
          }

          if (incoming_address.county && !matching_address.county) {
            matching_address.county = incoming_address.county;
          }

          if (incoming_address.country && !matching_address.country) {
            matching_address.country = incoming_address.country;
          }
        } else {
          agent.addresses.push(incoming_address);
        }
      });

      //after creating new list, check for a primary shipping
      let is_primary_shipping_set = agent.addresses.filter((a) => a.is_primary_shipping)?.length > 0;

      //if no primary shipping set, set first address to primary shipping
      if (!is_primary_shipping_set && agent.addresses.length > 0) {
        agent.addresses[0].is_primary_shipping = true;
      }

      //after creating new list, check for a primary billing
      let is_primary_billing_set = agent.addresses.filter((a) => a.is_primary_billing)?.length > 0;

      //if no primary billing set, set first email to primary billing
      if (!is_primary_billing_set && agent.addresses.length > 0) {
        agent.addresses[0].is_primary_billing = true;
      }
    }
  }

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

  updateEmailAddresses(data: Map<string, string>, agent: Agent) {
    let incoming_emails: EmailAddress[] = this.extractEmailAddresses(data);

    if (incoming_emails.length > 0) {
      if (!agent.email_addresses) {
        agent.email_addresses = [];
      }

      //if primary currently set, set any incoming is_primary flags to false
      let primary_already_exists = agent.email_addresses.filter((a) => a.is_primary)?.length > 0;

      if (primary_already_exists) {
        incoming_emails.forEach((a) => (a.is_primary = false));
      }

      //if login currently set, set any incoming is_login flags to false
      let login_already_exists: boolean = agent.email_addresses.filter((a) => a.is_login)?.length > 0;

      if (login_already_exists) {
        incoming_emails.forEach((a) => (a.is_login = false));
      }

      //look at each incoming and update if matching or add to list
      incoming_emails.forEach((incoming_email) => {
        let matching_email: EmailAddress = agent.email_addresses.find(
          (email) => email.address == incoming_email.address
        );

        if (matching_email) {
          if (incoming_email.email_type && !matching_email.email_type) {
            matching_email.email_type = incoming_email.email_type;
          }
        } else {
          agent.email_addresses.push(incoming_email);
        }
      });

      //after creating new list, check for a primary
      let is_primary_set = agent.email_addresses.filter((a) => a.is_primary)?.length > 0;

      //if no primary set, set first email to primary
      if (!is_primary_set && agent.email_addresses.length > 0) {
        agent.email_addresses[0].is_primary = true;
      }

      //after creating new list, check for a login
      let is_login_set = agent.email_addresses.filter((a) => a.is_login)?.length > 0;

      //if no primary set, set first email to login
      if (!is_login_set && agent.email_addresses.length > 0) {
        agent.email_addresses[0].is_login = true;
        agent.p_email = agent.email_addresses[0].address;
      }
    }
  }

  extractPhoneNumbers(invals: Map<string, string>): PhoneNumber[] {
    let retval: PhoneNumber[] = [];

    let i: Map<string, string> = this.getCount(invals, 'phone_numbers');

    let tempMap: Map<string, PhoneNumber> = new Map<string, PhoneNumber>();

    i.forEach((value, key) => {
      let a: PhoneNumber = this.createPhoneNumber(invals, key);
      if (a.number) tempMap.set(a.number, a);
    });

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

  updatePhoneNumbers(data: Map<string, string>, agent: Agent) {
    let incoming_phone_numbers: PhoneNumber[] = this.extractPhoneNumbers(data);

    if (incoming_phone_numbers.length > 0) {
      if (!agent.phone_numbers) {
        agent.phone_numbers = [];
      }

      //if primary currently set, set any incoming is_primary flags to false
      let primary_already_exists = agent.phone_numbers.filter((a) => a.is_primary)?.length > 0;

      if (primary_already_exists) {
        incoming_phone_numbers.forEach((a) => (a.is_primary = false));
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

        let matching_phone: PhoneNumber = agent.phone_numbers.find((phone) => {
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
          if (incoming_phone.phone_type && !matching_phone.phone_type) {
            matching_phone.phone_type = incoming_phone.phone_type;
          }
        } else {
          agent.phone_numbers.push(incoming_phone);
        }
      });

      //after creating new list, check for a primary
      let is_primary_set = agent.phone_numbers.filter((a) => a.is_primary)?.length > 0;

      //if no primary set, set first email to primary
      if (!is_primary_set && agent.phone_numbers.length > 0) {
        agent.phone_numbers[0].is_primary = true;
      }
    }
  }

  extractWebsites(invals: Map<string, string>): Website[] {
    let retval: Website[] = [];

    let i: Map<string, string> = this.getCount(invals, 'websites');

    i.forEach((value, key) => {
      let a: Website = this.createWebsite(invals, key);
      if (a.url) retval.push(a);
    });

    return retval;
  }

  createWebsite(invals: Map<string, string>, key: string): Website {
    let a: Website = { ...new Website() };
    a.id = this.generateId();

    if (invals.has('websites.' + key + '.url')) {
      a.url = invals.get('websites.' + key + '.url');
    }

    if (invals.has('websites.' + key + '.website_type')) {
      a.website_type = BUSINESS_PERSONAL_TYPE[invals.get('websites.' + key + '.website_type').toUpperCase()];
    }

    return a;
  }

  updateWebsites(data: Map<string, string>, agent: Agent) {
    let incoming_websites: Website[] = this.extractWebsites(data);

    if (incoming_websites.length > 0) {
      if (!agent.websites) {
        agent.websites = [];
      }

      //look at each incoming and update if matching or add to list
      incoming_websites.forEach((incoming_website) => {
        let matching_website: Website = agent.websites.find((email) => email.url == incoming_website.url);

        if (matching_website) {
          if (incoming_website.website_type && !matching_website.website_type) {
            matching_website.website_type = incoming_website.website_type;
          }
        } else {
          agent.websites.push(incoming_website);
        }
      });
    }
  }

  extractSocials(invals: Map<string, string>): Social[] {
    let retval: Social[] = [];

    let i: Map<string, string> = this.getCount(invals, 'socials');

    i.forEach((value, key) => {
      let a: Social = this.createSocial(invals, key);
      if (a.url) retval.push(a);
    });

    return retval;
  }

  createSocial(invals: Map<string, string>, key: string): Social {
    let a: Social = { ...new Social() };
    a.id = this.generateId();

    if (invals.has('socials.' + key + '.url')) {
      a.url = invals.get('socials.' + key + '.url');
    }

    if (invals.has('socials.' + key + '.social_type')) {
      a.social_type = BUSINESS_PERSONAL_TYPE[invals.get('socials.' + key + '.social_type').toUpperCase()];
    }

    if (invals.has('socials.' + key + '.social_media')) {
      a.social_media = SOCIAL_MEDIA[invals.get('socials.' + key + '.social_media').toUpperCase()];
    }

    return a;
  }

  updateSocials(data: Map<string, string>, agent: Agent) {
    let incoming_socials: Social[] = this.extractSocials(data);

    if (incoming_socials.length > 0) {
      if (!agent.socials) {
        agent.socials = [];
      }

      //look at each incoming and update if matching or add to list
      incoming_socials.forEach((incoming_social) => {
        let matching_social: Social = agent.socials.find((email) => email.url == incoming_social.url);

        if (matching_social) {
          if (incoming_social.social_type && !matching_social.social_type) {
            matching_social.social_type = incoming_social.social_type;
          }

          if (incoming_social.social_media && !matching_social.social_media) {
            matching_social.social_media = incoming_social.social_media;
          }
        } else {
          agent.socials.push(incoming_social);
        }
      });
    }
  }

  extractAssociations(invals: Map<string, string>): Association[] {
    let retval: Association[] = [];

    let i: Map<string, string> = this.getCount(invals, 'association');

    i.forEach((value, key) => {
      let a: Association = this.createAssociation(invals, key);
      if (a.first_name) retval.push(a);
    });

    return retval;
  }

  createAssociation(invals: Map<string, string>, key: string): Association {
    let a: Association = { ...new Association() };
    a.id = this.generateId();

    if (invals.has('association.' + key + '.first_name')) {
      a.first_name = invals.get('association.' + key + '.first_name');
    }

    if (invals.has('association.' + key + '.last_name')) {
      a.last_name = invals.get('association.' + key + '.last_name');
    }

    if (invals.has('association.' + key + '.email_address')) {
      a.email_address = invals.get('association.' + key + '.email_address');
    }

    if (invals.has('association.' + key + '.contact_number')) {
      a.contact_number = invals
        .get('association.' + key + '.contact_number')
        .replace('(', '')
        .replace(')', '')
        .replace(' ', '')
        .replace(' ', '')
        .replace('-', '')
        .replace('-', '');
    }

    if (invals.has('association.' + key + '.association_type')) {
      let t = invals.get('association.' + key + '.association_type').toUpperCase();

      a.association_type = ASSOCIATION_TYPE[invals.get('association.' + key + '.association_type').toUpperCase()];
    }

    if (invals.has('association.' + key + '.is_emergency_contact')) {
      if (invals.get('association.' + key + '.is_emergency_contact').toUpperCase() == 'TRUE') {
        a.is_emergency_contact = true;
      } else {
        a.is_emergency_contact = false;
      }
    }

    a.address = { ...new Address() };

    if (invals.has('association.' + key + '.address.address1')) {
      a.address.address1 = invals.get('association.' + key + '.address.address1');
    }

    if (invals.has('association.' + key + '.address.address2')) {
      a.address.address2 = invals.get('association.' + key + '.address.address2');
    }

    if (invals.has('association.' + key + '.address.city')) {
      a.address.city = invals.get('association.' + key + '.address.city');
    }

    if (invals.has('association.' + key + '.address.state')) {
      a.address.state = invals.get('association.' + key + '.address.state');
    }

    if (invals.has('association.' + key + '.address.zip')) {
      a.address.zip = invals.get('association.' + key + '.address.zip');
    }

    if (invals.has('association.' + key + '.address.county')) {
      a.address.county = invals.get('association.' + key + '.address.county');
    }

    if (invals.has('association.' + key + '.address.country')) {
      a.address.country = invals.get('association.' + key + '.address.country');
    }

    if (invals.has('association.' + key + '.dietary_or_personal_considerations')) {
      a.dietary_or_personal_considerations = invals.get('association.' + key + '.dietary_or_personal_considerations');
    }

    if (invals.has('association.' + key + '.dietary_consideration')) {
      a.dietary_consideration = invals.get('association.' + key + '.dietary_consideration');
    }

    if (invals.has('association.' + key + '.dietary_consideration_type')) {
      a.dietary_consideration_type = invals.get('association.' + key + '.dietary_consideration_type');
    }

    if (invals.has('association.' + key + '.p_nick_name')) {
      a.p_nick_first_name = invals.get('association.' + key + '.p_nick_name');
    }

    if (invals.has('association.' + key + '.p_nick_last_name')) {
      a.p_nick_last_name = invals.get('association.' + key + '.p_nick_last_name');
    }

    if (invals.has('association.' + key + '.p_tshirt_size')) {
      a.p_tshirt_size = invals.get('association.' + key + '.p_tshirt_size');
    }
    return a;
  }

  updateAssociations(data: Map<string, string>, agent: Agent) {
    let incoming_associations: Association[] = this.extractAssociations(data);

    if (incoming_associations.length > 0) {
      if (!agent.associations) {
        agent.associations = [];
      }

      incoming_associations.forEach((incoming_associations) => {
        let matching_association: Association = agent.associations.find(
          (a) => a.first_name == incoming_associations.first_name && a.last_name == incoming_associations.last_name
        );

        if (matching_association) {
          if (incoming_associations.email_address && !matching_association.email_address) {
            matching_association.email_address = incoming_associations.email_address;
          }

          if (incoming_associations.contact_number && !matching_association.contact_number) {
            matching_association.contact_number = incoming_associations.contact_number;
          }

          if (incoming_associations.is_emergency_contact && !matching_association.is_emergency_contact) {
            matching_association.is_emergency_contact = incoming_associations.is_emergency_contact;
          }

          if (incoming_associations.association_type && !matching_association.association_type) {
            matching_association.association_type = incoming_associations.association_type;
          }

          if (incoming_associations.dietary_consideration) {
            matching_association.dietary_consideration = incoming_associations.dietary_consideration;
          }

          if (incoming_associations.dietary_consideration && matching_association.dietary_consideration) {
            matching_association.dietary_consideration =
              matching_association.dietary_consideration + ' ' + incoming_associations.dietary_consideration;
          } else if (matching_association.dietary_consideration) {
            matching_association.dietary_consideration = incoming_associations.dietary_consideration;
          }

          if (incoming_associations.dietary_consideration_type && matching_association.dietary_consideration_type) {
            matching_association.dietary_consideration_type =
              matching_association.dietary_consideration_type + ' ' + incoming_associations.dietary_consideration_type;
          } else if (matching_association.dietary_consideration_type) {
            matching_association.dietary_consideration_type = incoming_associations.dietary_consideration_type;
          }

          if (!matching_association.address) {
            matching_association.address = { ...new Address() };
          }

          if (incoming_associations.address.address1 && !matching_association.address.address1) {
            matching_association.address.address1 = incoming_associations.address.address1;
          }

          if (incoming_associations.address.address2 && !matching_association.address.address2) {
            matching_association.address.address2 = incoming_associations.address.address2;
          }

          if (incoming_associations.address.city && !matching_association.address.city) {
            matching_association.address.city = incoming_associations.address.city;
          }

          if (incoming_associations.address.state && !matching_association.address.state) {
            matching_association.address.state = incoming_associations.address.state;
          }

          if (incoming_associations.address.zip && !matching_association.address.zip) {
            matching_association.address.zip = incoming_associations.address.zip;
          }

          if (incoming_associations.address.county && !matching_association.address.county) {
            matching_association.address.county = incoming_associations.address.county;
          }

          if (incoming_associations.address.country && !matching_association.address.country) {
            matching_association.address.country = incoming_associations.address.country;
          }
        } else {
          agent.associations.push(incoming_associations);
        }
      });
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

  getBoolean(value) {
    switch (value) {
      case true:
      case 'true':
      case 'True':
      case 'TRUE':
      case 1:
      case '1':
      case 'on':
      case 'On':
      case 'ON':
      case 'yes':
      case 'Yes':
      case 'YES':
        return true;
      default:
        return false;
    }
  }

  getYesNoValue(value) {
    switch (value) {
      case true:
      case 'true':
      case 'TRUE':
      case 'T':
      case 't':
      case 'YES':
      case 'yes':
      case 'Y':
      case 'y':
        return 'Yes';
      default:
        return 'No';
    }
  }
}
