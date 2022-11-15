import { Injectable } from '@angular/core';
import {
  ImportFieldRule,
  ImportRuleSet,
  ImportRuleSetKeys,
  PrimaryFieldRule
} from 'ag-common-lib/lib/models/import-rules/import-ruleset-model';
import {
  ActiveLookup,
  Address,
  Agency,
  Agent,
  AgentKeys,
  AGENT_STATUS,
  AGENT_TYPE,
  Association,
  AssociationKeys,
  BaseModelKeys,
  BUSINESS_PERSONAL_TYPE,
  EmailAddress,
  Goal,
  LookupKeys,
  PhoneNumber,
  PROSPECT_DISPOSITION,
  PROSPECT_PRIORITY,
  PROSPECT_STATUS,
  Registrant,
  Role,
  Social,
  SOCIAL_MEDIA,
  Website
} from 'ag-common-lib/public-api';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { AgentAssociationsService } from './agent-associations.service';
import { AgentService } from './agent.service';
import { LookupsService } from './lookups.service';

@Injectable({
  providedIn: 'root'
})
export class DomainService {
  private associationTypeLookup$: Observable<ActiveLookup[]>;
  constructor(
    private agentService: AgentService,
    private lookupsService: LookupsService,
    private agentAssociationsService: AgentAssociationsService
  ) {
    this.associationTypeLookup$ = this.lookupsService.associationTypeLookup$;
  }

  PRIMARY_EMAIL_IDENTIFIER = 'email_addresses.1.address';

  //************************************************************* */
  //  Method to import Agents from import file
  //
  //  agents: Map<string, string>[]: Map of key value
  //          pairs for AGent Record
  //  agencies: Agency[]: List of all Agencies for
  //          validating incoming Agency ID's are correct
  //  selectedRuleSet: ImportRuleSet: Rulset to apply
  //          to import
  //  createdBy: string: EMail address of person
  //          performing import to be added to "created_by"
  //          and "approved_by"
  //  messages: string[]: Array of messges to be displayed
  //          in import process. Used to return messages
  //          back to user
  //************************************************************* */
  createAgentsArray(
    agents: Map<string, string>[],
    agencies: Agency[],
    selectedRuleSet: ImportRuleSet,
    createdBy: string,
    messages: string[]
  ): Promise<Agent[]> {
    const promises: Promise<Agent>[] = [];

    agents.forEach((data) => {
      const promise: Promise<Agent> = this.agentService.getAgentByEmail(data.get(this.PRIMARY_EMAIL_IDENTIFIER))
        .then((response) => {
          if (!response) {
            return this.createAgent(data, messages, createdBy, agencies);
          } else {
            return this.updateAgent(data, messages, response, selectedRuleSet, agencies);
          }
        });

      promises.push(promise);
    });

    return Promise.all(promises).then((response) => (Array.isArray(response) ? response.filter(Boolean) : []));
  }

  createGuestsArray(agents: Agent[], data: Map<string, string>[], selectedRuleSet: ImportRuleSet, messages: string[]) {
    data.forEach((registrant_data) => {
      let invitees = agents.filter((a) => a.p_email == registrant_data.get('invitee_email'));

      if (invitees.length == 1) {
        // TODO
        // this.updateAssociations(registrant_data, invitees[0], selectedRuleSet, messages);
      }
    });
  }

  createRegistrantArray(
    registrant_data: Map<string, string>[],
    selectedConference: string,
    createdBy: string,
    messages: string[]
  ): Registrant[] {
    let retval: Registrant[] = [];

    registrant_data.forEach((data) => {
      let registrant: Registrant = { ...new Registrant() };

      registrant.registration_source = 'Conference Import';
      registrant.event_id = selectedConference;
      registrant.created_date = new Date();
      registrant.created_by = createdBy;

      registrant.approved_by = createdBy;
      registrant.approved_date = new Date();
      registrant.registered_date = new Date();
      registrant.invitee_guest = data.get('invitee_guest');

      if (data.has('invitee_status') && data.get('invitee_status').toLowerCase() == 'approved') {
        registrant.approved = true;
      } else {
        registrant.approved = false;
      }

      registrant.registration_type = data.get('registration_type');

      if (registrant.invitee_guest?.toLowerCase() == 'guest') {
        registrant.invitee_email = data.get('invitee_email');

        // TODO
        // let guests: Association[] = this.extractAssociations(data);

        // if (guests.length == 1) {
        //   let guest: Association = guests[0];

        //   if (guest.email_address) {
        //     registrant.email_address = guest.email_address;
        //   }

        //   if (guest.first_name) {
        //     registrant.first_name = guest.first_name;
        //   }

        //   if (guest.last_name) {
        //     registrant.last_name = guest.last_name;
        //   }

        //   if (guest.email_address) {
        //     registrant.email_address = guest.email_address;
        //   }

        //   if (guest.association_type) {
        //     registrant.relationship = guest.association_type;
        //   }

        //   if (guest.p_nick_first_name) {
        //     registrant.p_nick_name = guest.p_nick_first_name;
        //   }

        //   if (guest.p_nick_last_name) {
        //     registrant.p_nick_last_name = guest.p_nick_last_name;
        //   }

        //   if (guest.dietary_or_personal_considerations) {
        //     registrant.dietary_or_personal_considerations = this.getYesNoValue(
        //       guest.dietary_or_personal_considerations.trim()
        //     );
        //   }

        //   if (guest.dietary_consideration_type) {
        //     registrant.dietary_consideration_type = guest.dietary_consideration_type;
        //   }

        //   if (guest.dietary_consideration) {
        //     registrant.dietary_consideration = guest.dietary_consideration;
        //   }

        //   if (guest.p_tshirt_size) {
        //     registrant.tshirt_size = guest.p_tshirt_size;
        //   }

        //   if (guest.address) {
        //     registrant.address = guest.address;
        //   }

        //   if (guest.contact_number) {
        //     let pn: PhoneNumber = { ...new PhoneNumber() };
        //     pn.number = guest.contact_number;
        //     registrant.phone_number1 = pn;
        //   }
        // }
      } else {
        if (data.has('p_email')) {
          registrant.email_address = data.get('p_email');
        }

        if (data.has('p_agent_first_name')) {
          registrant.first_name = data.get('p_agent_first_name');
        }

        if (data.has('p_agent_last_name')) {
          registrant.last_name = data.get('p_agent_last_name');
        }

        if (data.has('p_prefix')) {
          registrant.p_prefix = data.get('p_prefix');
        }

        if (data.has('p_nick_name')) {
          registrant.p_nick_name = data.get('p_nick_name');
        }

        if (data.has('p_nick_last_name')) {
          registrant.p_nick_last_name = data.get('p_nick_last_name');
        }

        if (data.has('dietary_or_personal_considerations')) {
          registrant.dietary_or_personal_considerations = this.getYesNoValue(
            data.get('dietary_or_personal_considerations').trim()
          );
        }

        if (data.has('dietary_consideration_type')) {
          registrant.dietary_consideration_type = data.get('dietary_consideration_type');
        }

        if (data.has('dietary_consideration')) {
          registrant.dietary_consideration = data.get('dietary_consideration');
        }

        if (data.has('p_tshirt_size')) {
          registrant.tshirt_size = data.get('p_tshirt_size');
        }

        let addresses: Address[] = this.extractAddresses(data);

        if (addresses[0]) {
          registrant.address = addresses[0];
        }

        let phone_numbers: PhoneNumber[] = this.extractPhoneNumbers(data);

        if (phone_numbers[0]) {
          registrant.phone_number1 = phone_numbers[0];
        }

        if (phone_numbers[1]) {
          registrant.phone_number2 = phone_numbers[1];
        }

        // TODO
        // let emergency_contacts: Association[] = this.extractAssociations(data);

        // if (emergency_contacts[0]) {
        //   registrant.emergency_contact = emergency_contacts[0];
        // }
      }

      data.forEach((value, key) => {
        if (key.startsWith('custom.')) {
          registrant[key.split('.')[1]] = value;
        }
      });

      messages.push('Registration Created for ' + registrant.first_name + ' ' + registrant.last_name);

      retval.push(registrant);
    });

    return retval;
  }

  async createAgent(
    line_data: Map<string, string>,
    messages: string[],
    createdBy: string,
    agencies: Agency[]
  ): Promise<Agent> {
    const agent = { ...new Agent() };

    if (line_data.has(AgentKeys.p_agent_id)) {
      agent[AgentKeys.p_agent_id] = line_data.get(AgentKeys.p_agent_id);
    }
    if (line_data.has(AgentKeys.p_external_agent_id)) {
      agent[AgentKeys.p_external_agent_id] = line_data.get(AgentKeys.p_external_agent_id);
    }
    if (line_data.has(AgentKeys.p_agent_first_name)) {
      agent[AgentKeys.p_agent_first_name] = line_data.get(AgentKeys.p_agent_first_name);
    }
    if (line_data.has(AgentKeys.p_agent_middle_name)) {
      agent[AgentKeys.p_agent_middle_name] = line_data.get(AgentKeys.p_agent_middle_name);
    }
    if (line_data.has(AgentKeys.p_agent_last_name)) {
      agent[AgentKeys.p_agent_last_name] = line_data.get(AgentKeys.p_agent_last_name);
    }
    if (line_data.has(AgentKeys.p_nick_name)) {
      agent[AgentKeys.p_nick_name] = line_data.get(AgentKeys.p_nick_name);
    }
    if (line_data.has(AgentKeys.p_nick_last_name)) {
      agent[AgentKeys.p_nick_last_name] = line_data.get(AgentKeys.p_nick_last_name);
    }
    if (line_data.has(AgentKeys.p_agency_id)) {
      agent[AgentKeys.p_agency_id] = line_data.get(AgentKeys.p_agency_id);
    }
    if (line_data.has(AgentKeys.p_mga_id)) {
      agent[AgentKeys.p_mga_id] = line_data.get(AgentKeys.p_mga_id);
    }
    if (line_data.has(AgentKeys.title)) {
      agent[AgentKeys.title] = line_data.get(AgentKeys.title);
    }
    if (line_data.has(AgentKeys.p_prefix)) {
      agent[AgentKeys.p_prefix] = line_data.get(AgentKeys.p_prefix);
    }
    if (line_data.has(AgentKeys.p_suffix)) {
      agent[AgentKeys.p_suffix] = line_data.get(AgentKeys.p_suffix);
    }
    if (line_data.has(AgentKeys.npn)) {
      agent[AgentKeys.npn] = line_data.get(AgentKeys.npn);
    }
    if (line_data.has(AgentKeys.dietary_or_personal_considerations)) {
      agent[AgentKeys.dietary_or_personal_considerations] = this.getYesNoValue(
        line_data.get(AgentKeys.dietary_or_personal_considerations).trim()
      );
    }
    if (line_data.has(AgentKeys.dietary_consideration)) {
      agent[AgentKeys.dietary_consideration] = line_data.get(AgentKeys.dietary_consideration);
    }
    if (line_data.has(AgentKeys.dietary_consideration_type)) {
      agent[AgentKeys.dietary_consideration_type] = line_data.get(AgentKeys.dietary_consideration_type);
    }
    if (line_data.has(AgentKeys.upline)) {
      agent[AgentKeys.upline] = line_data.get(AgentKeys.upline);
    }
    if (line_data.has(AgentKeys.agencyName)) {
      agent[AgentKeys.agencyName] = line_data.get(AgentKeys.agencyName);
    }
    if (line_data.has(AgentKeys.registration_source)) {
      agent[AgentKeys.registration_source] = line_data.get(AgentKeys.registration_source);
    }
    if (line_data.has(AgentKeys.manager_id)) {
      agent[AgentKeys.manager_id] = line_data.get(AgentKeys.manager_id);
    }
    if (line_data.has(AgentKeys.agency_approve_deny_reason)) {
      agent[AgentKeys.agency_approve_deny_reason] = line_data.get(AgentKeys.agency_approve_deny_reason);
    }
    if (line_data.has(AgentKeys.approve_deny_reason)) {
      agent[AgentKeys.approve_deny_reason] = line_data.get(AgentKeys.approve_deny_reason);
    }
    if (line_data.has(AgentKeys.awb_site_id)) {
      agent[AgentKeys.awb_site_id] = line_data.get(AgentKeys.awb_site_id);
    }
    if (line_data.has(AgentKeys.certifications)) {
      agent[AgentKeys.certifications] = line_data.get(AgentKeys.certifications);
    }
    if (line_data.has(AgentKeys.prospect_referred_to)) {
      agent[AgentKeys.prospect_referred_to] = line_data.get(AgentKeys.prospect_referred_to);
    }
    if (line_data.has(AgentKeys.prospect_wrap_up_notes)) {
      agent[AgentKeys.prospect_wrap_up_notes] = line_data.get(AgentKeys.prospect_wrap_up_notes);
    }
    if (line_data.has(AgentKeys.campaigns_user_name)) {
      agent[AgentKeys.campaigns_user_name] = line_data.get(AgentKeys.campaigns_user_name);
    }
    if (line_data.has(AgentKeys.campaigns_address)) {
      agent[AgentKeys.campaigns_address] = line_data.get(AgentKeys.campaigns_address);
    }
    if (line_data.has(AgentKeys.race)) {
      agent[AgentKeys.race] = line_data.get(AgentKeys.race);
    }
    if (line_data.has(AgentKeys.ethnicity)) {
      agent[AgentKeys.ethnicity] = line_data.get(AgentKeys.ethnicity);
    }
    if (line_data.has(AgentKeys.gender)) {
      agent[AgentKeys.gender] = line_data.get(AgentKeys.gender);
    }
    if (line_data.has(AgentKeys.primary_language)) {
      agent[AgentKeys.primary_language] = line_data.get(AgentKeys.primary_language);
    }
    if (line_data.has(AgentKeys.secondary_language)) {
      agent[AgentKeys.secondary_language] = line_data.get(AgentKeys.secondary_language);
    }
    if (line_data.has(AgentKeys.hobbies)) {
      agent[AgentKeys.hobbies] = line_data.get(AgentKeys.hobbies);
    }
    if (line_data.has(AgentKeys.p_tshirt_size)) {
      agent[AgentKeys.p_tshirt_size] = line_data.get(AgentKeys.p_tshirt_size);
    }
    if (line_data.has(AgentKeys.unisex_tshirt_size)) {
      agent[AgentKeys.unisex_tshirt_size] = line_data.get(AgentKeys.unisex_tshirt_size);
    }
    if (line_data.has(AgentKeys.favorite_destination)) {
      agent[AgentKeys.favorite_destination] = line_data.get(AgentKeys.favorite_destination);
    }
    if (line_data.has(AgentKeys.shoe_size)) {
      agent[AgentKeys.shoe_size] = line_data.get(AgentKeys.shoe_size);
    }
    if (line_data.has(AgentKeys.christmasCard)) {
      agent[AgentKeys.christmasCard] = this.getBoolean(line_data.get(AgentKeys.christmasCard));
    }

    if (line_data.has(AgentKeys.p_strategic_agent)) {
      agent[AgentKeys.p_strategic_agent] = this.getBoolean(line_data.get(AgentKeys.p_strategic_agent));
    }
    if (line_data.has(AgentKeys.alliance_group_employee)) {
      agent[AgentKeys.alliance_group_employee] = this.getBoolean(line_data.get(AgentKeys.alliance_group_employee));
    }
    if (line_data.has(AgentKeys.is_manager)) {
      agent[AgentKeys.is_manager] = this.getBoolean(line_data.get(AgentKeys.is_manager));
    }
    if (line_data.has(AgentKeys.is_acb_user)) {
      agent[AgentKeys.is_acb_user] = this.getBoolean(line_data.get(AgentKeys.is_acb_user));
    }
    if (line_data.has(AgentKeys.is_awb_user)) {
      agent[AgentKeys.is_awb_user] = this.getBoolean(line_data.get(AgentKeys.is_awb_user));
    }

    if (line_data.has(AgentKeys.prospect_referred_to_date)) {
      agent[AgentKeys.prospect_referred_to_date] = new Date(line_data.get(AgentKeys.prospect_referred_to_date));
    }
    if (line_data.has(AgentKeys.campaigns_user_since)) {
      agent[AgentKeys.campaigns_user_since] = new Date(line_data.get(AgentKeys.campaigns_user_since));
    }
    if (line_data.has(AgentKeys.dob)) {
      agent[AgentKeys.dob] = new Date(line_data.get(AgentKeys.dob));
    }

    if (line_data.has(AgentKeys.agent_status)) {
      agent[AgentKeys.agent_status] = AGENT_STATUS[line_data.get(AgentKeys.agent_status).trim()];
    }
    if (line_data.has(AgentKeys.prospect_status)) {
      agent[AgentKeys.prospect_status] = PROSPECT_STATUS[line_data.get(AgentKeys.prospect_status).trim()];
    }
    if (line_data.has(AgentKeys.prospect_priority)) {
      agent[AgentKeys.prospect_priority] = PROSPECT_PRIORITY[line_data.get(AgentKeys.prospect_priority).trim()];
    }
    if (line_data.has(AgentKeys.prospect_disposition)) {
      agent[AgentKeys.prospect_disposition] =
        PROSPECT_DISPOSITION[line_data.get(AgentKeys.prospect_disposition).trim()];
    }

    let splitVals: Map<string, string> = new Map<string, string>();

    line_data.forEach((data, field) => {
      let splitfields = field.split('.');

      if (splitfields.length > 1) {
        splitVals.set(field, data);
      }
    });

    agent[AgentKeys.addresses] = this.extractAddresses(splitVals);
    agent[AgentKeys.email_addresses] = this.extractEmailAddresses(splitVals);
    agent[AgentKeys.phone_numbers] = this.extractPhoneNumbers(splitVals);
    agent[AgentKeys.websites] = this.extractWebsites(splitVals);
    agent[AgentKeys.socials] = this.extractSocials(splitVals);

    //calculate p_agent_name
    if (agent[AgentKeys.p_agent_first_name]) {
      agent[AgentKeys.p_agent_name] = agent[AgentKeys.p_agent_first_name];
    }

    if (agent[AgentKeys.p_agent_middle_name]) {
      agent[AgentKeys.p_agent_name] = agent[AgentKeys.p_agent_name] + ' ' + agent[AgentKeys.p_agent_middle_name];
    }

    if (agent[AgentKeys.p_agent_last_name]) {
      agent[AgentKeys.p_agent_name] = agent[AgentKeys.p_agent_name] + ' ' + agent[AgentKeys.p_agent_last_name];
    }

    agent[AgentKeys.personal_goals] = [];
    let goal1: Goal = { ...new Goal() };
    goal1.year = new Date().getFullYear();
    goal1.amount = 90000;
    agent[AgentKeys.personal_goals].push(goal1);

    agent[AgentKeys.conference_goals] = [];
    let goal2: Goal = { ...new Goal() };
    goal2.year = new Date().getFullYear();
    goal2.amount = 90000;
    agent[AgentKeys.conference_goals].push(goal2);

    if (agent[AgentKeys.is_manager]) {
      agent[AgentKeys.manager_goals] = [];
      let goal3: Goal = { ...new Goal() };
      goal3.year = new Date().getFullYear();
      goal3.amount = 90000;
      agent[AgentKeys.manager_goals].push(goal3);
    }

    agent[AgentKeys.role] = [Role.AGENT];

    agent[AgentKeys.login_count] = 0;
    agent[AgentKeys.logged_in] = false;
    agent[AgentKeys.emailVerified] = false;
    agent[AgentKeys.showSplashScreen] = false;
    agent[AgentKeys.registration_source] = 'File';
    agent[BaseModelKeys.createdDate] = new Date();
    agent[AgentKeys.approvalDate] = new Date();
    agent[AgentKeys.registrationDate] = new Date();
    agent[BaseModelKeys.createdBy] = createdBy;
    agent[AgentKeys.approvedBy] = createdBy;
    agent[AgentKeys.agent_type] = AGENT_TYPE.GENERAL_AGENT;
    agent[AgentKeys.is_rmd] = false;
    agent[AgentKeys.is_credited] = false;

    const agentAssociations = await this.extractAssociations(splitVals);
    const isAgencyValid = this.validateAgency(agent, agencies, messages);

    if (!isAgencyValid) {
      return null;
    }

    const agentEmailAddresses = agent[AgentKeys.email_addresses];

    if (!Array.isArray(agentEmailAddresses) || agentEmailAddresses?.length == 0) {
      messages.push('No Email Addresses were set for this agent. Not Importing ' + agent[AgentKeys.p_agent_name]);

      return null;
    }

    let loginAddress = agentEmailAddresses.find((email) => email.is_login);

    if (!loginAddress) {
      agentEmailAddresses[0].is_login = true;
      loginAddress = agentEmailAddresses[0];
    }

    agent[AgentKeys.p_email] = loginAddress.address;

    return this.agentService.create(agent).then((agent) => {
      const promises = agentAssociations.map((association) => {
        return this.agentAssociationsService.create(agent[BaseModelKeys.dbId], association);
      });
      messages.push(`Agent ${agent.p_email} was created`);

      return Promise.all(promises).then(() => agent);
    });
  }

  async updateAgent(
    line_data: Map<string, string>,
    messages: string[],
    agent: Agent,
    selectedRuleSet: ImportRuleSet,
    agencies: Agency[]
  ): Promise<Agent> {
    if (line_data.has(AgentKeys.p_agent_id)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.p_agent_id],
        agent,
        AgentKeys.p_agent_id,
        line_data.get(AgentKeys.p_agent_id)
      );
    }
    if (line_data.has(AgentKeys.p_external_agent_id)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.p_external_agent_id],
        agent,
        AgentKeys.p_external_agent_id,
        line_data.get(AgentKeys.p_external_agent_id).trim()
      );
    }
    if (line_data.has(AgentKeys.p_agent_first_name)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.p_agent_first_name],
        agent,
        AgentKeys.p_agent_first_name,
        line_data.get(AgentKeys.p_agent_first_name).trim()
      );
    }
    if (line_data.has(AgentKeys.p_agent_middle_name)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.p_agent_middle_name],
        agent,
        AgentKeys.p_agent_middle_name,
        line_data.get(AgentKeys.p_agent_middle_name).trim()
      );
    }
    if (line_data.has(AgentKeys.p_agent_last_name)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.p_agent_last_name],
        agent,
        AgentKeys.p_agent_last_name,
        line_data.get(AgentKeys.p_agent_last_name).trim()
      );
    }
    if (line_data.has(AgentKeys.p_nick_name)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.p_nick_name],
        agent,
        AgentKeys.p_nick_name,
        line_data.get(AgentKeys.p_nick_name).trim()
      );
    }
    if (line_data.has(AgentKeys.p_nick_last_name)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.p_nick_last_name],
        agent,
        AgentKeys.p_nick_last_name,
        line_data.get(AgentKeys.p_nick_last_name).trim()
      );
    }
    if (line_data.has(AgentKeys.title)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.title],
        agent,
        AgentKeys.title,
        line_data.get(AgentKeys.title).trim()
      );
    }
    if (line_data.has(AgentKeys.p_prefix)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.p_prefix],
        agent,
        AgentKeys.p_prefix,
        line_data.get(AgentKeys.p_prefix).trim()
      );
    }
    if (line_data.has(AgentKeys.p_suffix)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.p_prefix],
        agent,
        AgentKeys.p_suffix,
        line_data.get(AgentKeys.p_suffix).trim()
      );
    }
    if (line_data.has(AgentKeys.p_external_agent_id)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.p_external_agent_id],
        agent,
        AgentKeys.p_external_agent_id,
        line_data.get(AgentKeys.p_external_agent_id).trim()
      );
    }
    if (line_data.has(AgentKeys.npn)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.p_suffix],
        agent,
        AgentKeys.npn,
        line_data.get(AgentKeys.npn).trim()
      );
    }
    if (line_data.has(AgentKeys.dietary_or_personal_considerations)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.dietary_or_personal_considerations],
        agent,
        AgentKeys.dietary_or_personal_considerations,
        this.getYesNoValue(line_data.get(AgentKeys.dietary_or_personal_considerations).trim())
      );
    }
    if (line_data.has(AgentKeys.dietary_consideration)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.dietary_consideration],
        agent,
        AgentKeys.dietary_consideration,
        line_data.get(AgentKeys.dietary_consideration).trim()
      );
    }
    if (line_data.has(AgentKeys.dietary_consideration_type)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.dietary_consideration_type],
        agent,
        AgentKeys.dietary_consideration_type,
        line_data.get(AgentKeys.dietary_consideration_type).trim()
      );
    }
    if (line_data.has(AgentKeys.upline)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.upline],
        agent,
        AgentKeys.upline,
        line_data.get(AgentKeys.upline).trim()
      );
    }
    if (line_data.has(AgentKeys.agencyName)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.agencyName],
        agent,
        AgentKeys.agencyName,
        line_data.get(AgentKeys.agencyName).trim()
      );
    }
    if (line_data.has(AgentKeys.manager_id)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.manager_id],
        agent,
        AgentKeys.manager_id,
        line_data.get(AgentKeys.manager_id).trim()
      );
    }
    if (line_data.has(AgentKeys.awb_site_id)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.awb_site_id],
        agent,
        AgentKeys.awb_site_id,
        line_data.get(AgentKeys.awb_site_id).trim()
      );
    }
    if (line_data.has(AgentKeys.prospect_referred_to)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.prospect_referred_to],
        agent,
        AgentKeys.prospect_referred_to,
        line_data.get(AgentKeys.prospect_referred_to).trim()
      );
    }
    if (line_data.has(AgentKeys.campaigns_user_name)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.campaigns_user_name],
        agent,
        AgentKeys.campaigns_user_name,
        line_data.get(AgentKeys.campaigns_user_name).trim()
      );
    }
    if (line_data.has(AgentKeys.campaigns_address)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.campaigns_address],
        agent,
        AgentKeys.campaigns_address,
        line_data.get(AgentKeys.campaigns_address).trim()
      );
    }
    if (line_data.has(AgentKeys.race)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.race],
        agent,
        AgentKeys.race,
        line_data.get(AgentKeys.race).trim()
      );
    }
    if (line_data.has(AgentKeys.ethnicity)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.ethnicity],
        agent,
        AgentKeys.ethnicity,
        line_data.get(AgentKeys.ethnicity).trim()
      );
    }
    if (line_data.has(AgentKeys.gender)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.gender],
        agent,
        AgentKeys.gender,
        line_data.get(AgentKeys.gender).trim()
      );
    }
    if (line_data.has(AgentKeys.primary_language)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.primary_language],
        agent,
        AgentKeys.primary_language,
        line_data.get(AgentKeys.primary_language).trim()
      );
    }
    if (line_data.has(AgentKeys.secondary_language)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.secondary_language],
        agent,
        AgentKeys.secondary_language,
        line_data.get(AgentKeys.secondary_language).trim()
      );
    }
    if (line_data.has(AgentKeys.hobbies)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.hobbies],
        agent,
        AgentKeys.hobbies,
        line_data.get(AgentKeys.hobbies).trim()
      );
    }
    if (line_data.has(AgentKeys.p_tshirt_size)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.p_tshirt_size],
        agent,
        AgentKeys.p_tshirt_size,
        line_data.get(AgentKeys.p_tshirt_size).trim()
      );
    }
    if (line_data.has(AgentKeys.unisex_tshirt_size)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.unisex_tshirt_size],
        agent,
        AgentKeys.unisex_tshirt_size,
        line_data.get(AgentKeys.unisex_tshirt_size).trim()
      );
    }
    if (line_data.has(AgentKeys.favorite_destination)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.favorite_destination],
        agent,
        AgentKeys.favorite_destination,
        line_data.get(AgentKeys.favorite_destination).trim()
      );
    }
    if (line_data.has(AgentKeys.shoe_size)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.shoe_size],
        agent,
        AgentKeys.shoe_size,
        line_data.get(AgentKeys.shoe_size).trim()
      );
    }
    if (line_data.has(AgentKeys.approve_deny_reason)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.approve_deny_reason],
        agent,
        AgentKeys.approve_deny_reason,
        line_data.get(AgentKeys.approve_deny_reason).trim()
      );
    }
    if (line_data.has(AgentKeys.agency_approve_deny_reason)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.agency_approve_deny_reason],
        agent,
        AgentKeys.agency_approve_deny_reason,
        line_data.get(AgentKeys.agency_approve_deny_reason).trim()
      );
    }
    if (line_data.has(AgentKeys.certifications)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.certifications],
        agent,
        AgentKeys.certifications,
        line_data.get(AgentKeys.certifications).trim()
      );
    }
    if (line_data.has(AgentKeys.prospect_wrap_up_notes)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.prospect_wrap_up_notes],
        agent,
        AgentKeys.prospect_wrap_up_notes,
        line_data.get(AgentKeys.prospect_wrap_up_notes).trim()
      );
    }

    if (line_data.has(AgentKeys.p_strategic_agent)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.p_strategic_agent],
        agent,
        AgentKeys.p_strategic_agent,
        this.getBoolean(line_data.get(AgentKeys.p_strategic_agent).trim())
      );
    }
    if (line_data.has(AgentKeys.alliance_group_employee)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.alliance_group_employee],
        agent,
        AgentKeys.alliance_group_employee,
        this.getBoolean(line_data.get(AgentKeys.alliance_group_employee).trim())
      );
    }
    if (line_data.has(AgentKeys.is_manager)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.is_manager],
        agent,
        AgentKeys.is_manager,
        this.getBoolean(line_data.get(AgentKeys.is_manager).trim())
      );
    }
    if (line_data.has(AgentKeys.is_acb_user)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.is_acb_user],
        agent,
        AgentKeys.is_acb_user,
        this.getBoolean(line_data.get(AgentKeys.is_acb_user).trim())
      );
    }
    if (line_data.has(AgentKeys.is_awb_user)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.is_awb_user],
        agent,
        AgentKeys.is_awb_user,
        this.getBoolean(line_data.get(AgentKeys.is_awb_user).trim())
      );
    }
    if (line_data.has(AgentKeys.christmasCard)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.christmasCard],
        agent,
        AgentKeys.christmasCard,
        this.getBoolean(line_data.get(AgentKeys.christmasCard).trim())
      );
    }

    if (line_data.has(AgentKeys.prospect_referred_to_date)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.prospect_referred_to_date],
        agent,
        AgentKeys.prospect_referred_to_date,
        new Date(line_data.get(AgentKeys.prospect_referred_to_date).trim())
      );
    }
    if (line_data.has(AgentKeys.campaigns_user_since)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.campaigns_user_since],
        agent,
        AgentKeys.campaigns_user_since,
        new Date(line_data.get(AgentKeys.campaigns_user_since).trim())
      );
    }
    if (line_data.has(AgentKeys.dob)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.dob],
        agent,
        AgentKeys.dob,
        new Date(line_data.get(AgentKeys.dob).trim())
      );
    }

    if (line_data.has(AgentKeys.agent_status)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.agent_status],
        agent,
        AgentKeys.agent_status,
        AGENT_STATUS[line_data.get(AgentKeys.agent_status).trim()]
      );
    }

    if (line_data.has(AgentKeys.prospect_status)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.prospect_status],
        agent,
        AgentKeys.prospect_status,
        PROSPECT_STATUS[line_data.get(AgentKeys.prospect_status).trim()]
      );
    }

    if (line_data.has(AgentKeys.prospect_priority)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.prospect_priority],
        agent,
        AgentKeys.prospect_priority,
        PROSPECT_PRIORITY[line_data.get(AgentKeys.prospect_priority).trim()]
      );
    }

    if (line_data.has(AgentKeys.prospect_disposition)) {
      this.updateField(
        selectedRuleSet[ImportRuleSetKeys.prospect_disposition],
        agent,
        AgentKeys.prospect_disposition,
        PROSPECT_DISPOSITION[line_data.get(AgentKeys.prospect_disposition).trim()]
      );
    }

    //calculate p_agent_name
    if (agent[AgentKeys.p_agent_first_name]) {
      agent[AgentKeys.p_agent_name] = agent[AgentKeys.p_agent_first_name];
    }

    if (agent[AgentKeys.p_agent_middle_name]) {
      agent[AgentKeys.p_agent_name] = agent[AgentKeys.p_agent_name] + ' ' + agent[AgentKeys.p_agent_middle_name];
    }

    if (agent[AgentKeys.p_agent_last_name]) {
      agent[AgentKeys.p_agent_name] = agent[AgentKeys.p_agent_name] + ' ' + agent[AgentKeys.p_agent_last_name];
    }

    const shouldContinue = [
      this.validateAgency(agent, agencies, messages),
      this.updateAddresses(line_data, agent, selectedRuleSet, messages),
      this.updateEmailAddresses(line_data, agent, selectedRuleSet, messages),
      this.updatePhoneNumbers(line_data, agent, selectedRuleSet, messages),
      this.updateSocials(line_data, agent, selectedRuleSet, messages),
      this.updateWebsites(line_data, agent, selectedRuleSet, messages)
    ].every(Boolean);

    if (!shouldContinue) {
      return null;
    }

    await this.updateAssociations(line_data, agent, selectedRuleSet, messages);

    return this.agentService.updateFields(agent[BaseModelKeys.dbId], agent).then((updatedAgent) => {
      messages.push(`Agent ${agent.p_email} was updated`);
      return updatedAgent;
    });
  }

  validateAgency(agent: Agent, agencies: Agency[], messages: string[]): boolean {
    let retval: boolean = true;

    if (agent.p_agency_id) {
      let a: Agency[] = agencies.filter((agency) => agency.agency_id == agent.p_agency_id);

      if (a.length != 1) {
        retval = false;

        messages.push(
          agent.email_addresses[0].address + ' has an value set for Agency Id that does not match an existing Agency!'
        );
      }
    }

    if (agent.p_mga_id) {
      let a: Agency[] = agencies.filter((agency) => agency.agency_id == agent.p_mga_id);

      if (a.length != 1) {
        retval = false;

        messages.push(
          agent.email_addresses[0].address + ' has an value set for MGA Id that does not match an existing Agency!'
        );
      }
    }

    return retval;
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

  updateAddresses(
    data: Map<string, string>,
    agent: Agent,
    selectedRuleSet: ImportRuleSet,
    messages: string[]
  ): boolean {
    let incoming_addresses: Address[] = this.extractAddresses(data);

    if (incoming_addresses.length > 0 && this.validateAddresses(incoming_addresses, selectedRuleSet, agent, messages)) {
      if (!agent[AgentKeys.addresses]) {
        agent[AgentKeys.addresses] = [];
      }

      let required_to_update_shipping =
        PrimaryFieldRule[selectedRuleSet[ImportRuleSetKeys.primary_shipping_address]] ==
        PrimaryFieldRule.UPDATE_PRIMARY_VALUE;

      let required_to_update_billing =
        PrimaryFieldRule[selectedRuleSet[ImportRuleSetKeys.primary_billing_address]] ==
        PrimaryFieldRule.UPDATE_PRIMARY_VALUE;

      //look at each incoming and update if matching or add to list
      incoming_addresses.forEach((incoming_address) => {
        let matching_address: Address = agent[AgentKeys.addresses].find(
          (address) => address.address1 == incoming_address.address1
        );

        if (matching_address) {
          if (incoming_address.address2) {
            this.updateField(
              selectedRuleSet[ImportRuleSetKeys.address_address2],
              matching_address,
              'address2',
              incoming_address.address2
            );
          }
          if (incoming_address.city) {
            this.updateField(
              selectedRuleSet[ImportRuleSetKeys.address_city],
              matching_address,
              'city',
              incoming_address.city
            );
          }
          if (incoming_address.state) {
            this.updateField(
              selectedRuleSet[ImportRuleSetKeys.address_state],
              matching_address,
              'state',
              incoming_address.state
            );
          }
          if (incoming_address.zip) {
            this.updateField(
              selectedRuleSet[ImportRuleSetKeys.address_zip],
              matching_address,
              'zip',
              incoming_address.zip
            );
          }
          if (incoming_address.county) {
            this.updateField(
              selectedRuleSet[ImportRuleSetKeys.address_county],
              matching_address,
              'county',
              incoming_address.county
            );
          }
          if (incoming_address.country) {
            this.updateField(
              selectedRuleSet[ImportRuleSetKeys.address_country],
              matching_address,
              'country',
              incoming_address.country
            );
          }
          if (incoming_address.is_primary_billing && required_to_update_billing) {
            this.updateField(
              selectedRuleSet[ImportRuleSetKeys.address_is_primary_billing],
              matching_address,
              'is_primary_billing',
              incoming_address.is_primary_billing
            );
          }
          if (incoming_address.is_primary_shipping && required_to_update_shipping) {
            this.updateField(
              selectedRuleSet[ImportRuleSetKeys.address_is_primary_shipping],
              matching_address,
              'is_primary_shipping',
              incoming_address.is_primary_shipping
            );
          }
        } else {
          if (!required_to_update_shipping) {
            incoming_address.is_primary_shipping = false;
          }

          if (!required_to_update_billing) {
            incoming_address.is_primary_billing = false;
          }

          agent[AgentKeys.addresses].push(incoming_address);
        }
      });

      //after creating new list, check for a primary shipping
      let is_primary_shipping_set = agent[AgentKeys.addresses].filter((a) => a.is_primary_shipping)?.length > 0;

      //if no primary shipping set, set first address to primary shipping
      if (!is_primary_shipping_set && agent[AgentKeys.addresses].length > 0) {
        agent[AgentKeys.addresses][0].is_primary_shipping = true;
      }

      //after creating new list, check for a primary billing
      let is_primary_billing_set = agent[AgentKeys.addresses].filter((a) => a.is_primary_billing)?.length > 0;

      //if no primary billing set, set first email to primary billing
      if (!is_primary_billing_set && agent[AgentKeys.addresses].length > 0) {
        agent[AgentKeys.addresses][0].is_primary_billing = true;
      }
      return true;
    } else {
      return false;
    }
  }

  validateAddresses(incoming_addresses: Address[], selectedRuleSet: ImportRuleSet, agent: Agent, messages: string[]) {
    let returnVal: boolean = false;

    let shipping_rule = selectedRuleSet[ImportRuleSetKeys.primary_shipping_address];

    let required_to_update_shipping = PrimaryFieldRule[shipping_rule] == PrimaryFieldRule.UPDATE_PRIMARY_VALUE;

    if (required_to_update_shipping) {
      let incoming_has_primary_shipping = incoming_addresses.filter((add) => add.is_primary_shipping == true);

      if (incoming_has_primary_shipping.length == 0) {
        messages.push(
          'Selected Rule Set requires Primary Shipping Address to be updated, but no Primary is set. Please set primary for ' +
            agent.p_email +
            ' or change the import rule.'
        );
        returnVal = false;
      } else if (incoming_has_primary_shipping.length == 1) {
        agent.addresses.forEach((add) => (add.is_primary_shipping = false));
        returnVal = true;
      } else if (incoming_has_primary_shipping.length == 2) {
        messages.push(
          'Selected Rule Set requires Primary Shipping Address to be updated, but 2 Primararies are set. Please set set only 1 primary for ' +
            agent.p_email +
            ' or change the import rule.'
        );
        returnVal = false;
      } else {
        returnVal = true;
      }
    }

    let billing_rule = selectedRuleSet[ImportRuleSetKeys.primary_billing_address];

    let required_to_update_billinging = PrimaryFieldRule[billing_rule] == PrimaryFieldRule.UPDATE_PRIMARY_VALUE;

    if (required_to_update_billinging) {
      let incoming_has_primary_billing = incoming_addresses.filter((add) => add.is_primary_billing == true);

      if (incoming_has_primary_billing.length == 0) {
        messages.push(
          'Selected Rule Set requires Primary Billing Address to be updated, but no Primary is set. Please set primary for ' +
            agent.p_email +
            ' or change the import rule.'
        );
        returnVal = returnVal && false;
      } else if (incoming_has_primary_billing.length == 1) {
        agent.addresses.forEach((add) => (add.is_primary_billing = false));
        returnVal = returnVal && true;
      } else if (incoming_has_primary_billing.length == 2) {
        messages.push(
          'Selected Rule Set requires Primary Billing Address to be updated, but 2 Primararies are set. Please set set only 1 primary for ' +
            agent.p_email +
            ' or change the import rule.'
        );
        returnVal = returnVal && false;
      } else {
        returnVal = returnVal && false;
      }
    }

    return returnVal;
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

    if (
      incoming_phone_numbers.length > 0 &&
      this.validatePhoneNumbers(incoming_phone_numbers, selectedRuleSet, agent, messages)
    ) {
      if (!agent[AgentKeys.phone_numbers]) {
        agent[AgentKeys.phone_numbers] = [];
      }

      let required_to_update_primary =
        selectedRuleSet[ImportRuleSetKeys.primary_phone_number] == PrimaryFieldRule.UPDATE_PRIMARY_VALUE;

      //if primary currently set, set any incoming is_primary flags to false
      let primary_already_exists = agent[AgentKeys.phone_numbers].filter((a) => a.is_primary)?.length > 0;

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
            this.updateField(
              selectedRuleSet[ImportRuleSetKeys.phone_phone_type],
              matching_phone,
              'phone_type',
              incoming_phone.phone_type
            );
          }
          if (incoming_phone.is_primary && required_to_update_primary) {
            this.updateField(
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

      return true;
    } else {
      return false;
    }
  }

  validatePhoneNumbers(
    incoming_phone_numbers: PhoneNumber[],
    selectedRuleSet: ImportRuleSet,
    agent: Agent,
    messages: string[]
  ) {
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
        agent.phone_numbers.forEach((add) => (add.is_primary = false));
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

  updateWebsites(data: Map<string, string>, agent: Agent, selectedRuleSet: ImportRuleSet, messages: string[]) {
    let incoming_websites: Website[] = this.extractWebsites(data);

    if (incoming_websites.length > 0) {
      if (!agent[AgentKeys.websites]) {
        agent[AgentKeys.websites] = [];
      }

      //look at each incoming and update if matching or add to list
      incoming_websites.forEach((incoming_website) => {
        let matching_website: Website = agent[AgentKeys.websites].find((email) => email.url == incoming_website.url);

        if (matching_website) {
          if (incoming_website.website_type) {
            this.updateField(
              selectedRuleSet[ImportRuleSetKeys.website_website_type],
              matching_website,
              'website_type',
              incoming_website.website_type
            );
            matching_website.website_type = incoming_website.website_type;
          }
        } else {
          agent[AgentKeys.websites].push(incoming_website);
        }
      });
    }

    return true;
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

  updateSocials(data: Map<string, string>, agent: Agent, selectedRuleSet: ImportRuleSet, messages: string[]) {
    let incoming_socials: Social[] = this.extractSocials(data);

    if (incoming_socials.length > 0) {
      if (!agent[AgentKeys.socials]) {
        agent[AgentKeys.socials] = [];
      }

      //look at each incoming and update if matching or add to list
      incoming_socials.forEach((incoming_social) => {
        let matching_social: Social = agent[AgentKeys.socials].find((email) => email.url == incoming_social.url);

        if (matching_social) {
          if (incoming_social.social_type) {
            this.updateField(
              selectedRuleSet[ImportRuleSetKeys.social_social_type],
              matching_social,
              'social_type',
              incoming_social.social_type
            );
          }

          if (incoming_social.social_media) {
            this.updateField(
              selectedRuleSet[ImportRuleSetKeys.social_social_media],
              matching_social,
              'social_media',
              incoming_social.social_media
            );
          }
        } else {
          agent[AgentKeys.socials].push(incoming_social);
        }
      });
    }

    return true;
  }

  async extractAssociations(invals: Map<string, string>): Promise<Association[]> {
    const associations: Association[] = [];
    const incomingAssociationsMap: Map<string, string> = this.getCount(invals, 'association');

    for (const iterator of incomingAssociationsMap) {
      const association: Association = await this.createAssociation(invals, iterator[1]);
      if (association.first_name) {
        associations.push(association);
      }
    }

    return associations;
  }

  async createAssociation(invals: Map<string, string>, key: string): Promise<Association> {
    const association: Association = { ...new Association() };

    if (invals.has('association.' + key + '.first_name')) {
      association.first_name = invals.get('association.' + key + '.first_name');
    }

    if (invals.has('association.' + key + '.last_name')) {
      association.last_name = invals.get('association.' + key + '.last_name');
    }

    if (invals.has('association.' + key + '.email_address')) {
      association.email_address = invals.get('association.' + key + '.email_address');
    }

    if (invals.has('association.' + key + '.contact_number')) {
      association.contact_number = invals
        .get('association.' + key + '.contact_number')
        .replace('(', '')
        .replace(')', '')
        .replace(' ', '')
        .replace(' ', '')
        .replace('-', '')
        .replace('-', '');
    }

    if (invals.has('association.' + key + '.association_type')) {
      const associations = await this.associationTypeLookup$.pipe(take(1)).toPromise();
      const associationType = invals.get('association.' + key + '.association_type');
      const lookupValue = associations.find((lookup) => {
        return `${associationType}`
          .replace(/\W|_/g, '')
          .toLocaleLowerCase()
          .match(lookup[LookupKeys.value].replace(/\W|_/g, '').toLocaleLowerCase());
      });

      association[AssociationKeys.associationTypeRef] = lookupValue[LookupKeys.reference];
    }

    if (invals.has('association.' + key + '.is_emergency_contact')) {
      if (invals.get('association.' + key + '.is_emergency_contact').toUpperCase() == 'TRUE') {
        association.is_emergency_contact = true;
      } else {
        association.is_emergency_contact = false;
      }
    }

    association.address = { ...new Address() };

    if (invals.has('association.' + key + '.address.address1')) {
      association.address.address1 = invals.get('association.' + key + '.address.address1');
    }

    if (invals.has('association.' + key + '.address.address2')) {
      association.address.address2 = invals.get('association.' + key + '.address.address2');
    }

    if (invals.has('association.' + key + '.address.city')) {
      association.address.city = invals.get('association.' + key + '.address.city');
    }

    if (invals.has('association.' + key + '.address.state')) {
      association.address.state = invals.get('association.' + key + '.address.state');
    }

    if (invals.has('association.' + key + '.address.zip')) {
      association.address.zip = invals.get('association.' + key + '.address.zip');
    }

    if (invals.has('association.' + key + '.address.county')) {
      association.address.county = invals.get('association.' + key + '.address.county');
    }

    if (invals.has('association.' + key + '.address.country')) {
      association.address.country = invals.get('association.' + key + '.address.country');
    }

    if (invals.has('association.' + key + '.dietary_or_personal_considerations')) {
      association.dietary_or_personal_considerations = this.getYesNoValue(
        invals.get('association.' + key + '.dietary_or_personal_considerations').trim()
      );
    }

    if (invals.has('association.' + key + '.dietary_consideration')) {
      association.dietary_consideration = invals.get('association.' + key + '.dietary_consideration');
    }

    if (invals.has('association.' + key + '.dietary_consideration_type')) {
      association.dietary_consideration_type = invals.get('association.' + key + '.dietary_consideration_type');
    }

    if (invals.has('association.' + key + '.p_nick_name')) {
      association.p_nick_first_name = invals.get('association.' + key + '.p_nick_name');
    }

    if (invals.has('association.' + key + '.p_nick_last_name')) {
      association.p_nick_last_name = invals.get('association.' + key + '.p_nick_last_name');
    }

    if (invals.has('association.' + key + '.p_tshirt_size')) {
      association.p_tshirt_size = invals.get('association.' + key + '.p_tshirt_size');
    }
    return association;
  }

  async updateAssociations(
    data: Map<string, string>,
    agent: Agent,
    selectedRuleSet: ImportRuleSet,
    messages: string[]
  ) {
    const promises: Promise<any>[] = [];
    const existingAssociations: Association[] = await this.agentAssociationsService.getAll(agent[BaseModelKeys.dbId]);
    const incomingAssociations: Association[] = await this.extractAssociations(data);

    for (const incomingAssociation of incomingAssociations) {
      const matchingAssociation: Association = existingAssociations.find(
        (association) =>
          association.first_name == incomingAssociation.first_name &&
          association.last_name == incomingAssociation.last_name
      );

      if (!matchingAssociation) {
        promises.push(
          this.agentAssociationsService.create(agent[BaseModelKeys.dbId], incomingAssociation).then((association) => {
            if (association) {
              messages.push(
                'Associate created (' + association.first_name + ' ' + association.last_name + ') to ' + agent.p_email
              );
            }
          })
        );
      }

      if (matchingAssociation) {
        if (incomingAssociation.email_address) {
          this.updateField(
            selectedRuleSet[ImportRuleSetKeys.email_address_address],
            matchingAssociation,
            'email_address',
            incomingAssociation.email_address
          );
        }
        if (incomingAssociation.contact_number) {
          this.updateField(
            selectedRuleSet[ImportRuleSetKeys.association_contact_number],
            matchingAssociation,
            'contact_number',
            incomingAssociation.contact_number
          );
        }
        if (incomingAssociation.is_emergency_contact) {
          this.updateField(
            selectedRuleSet[ImportRuleSetKeys.association_is_emergency_contact],
            matchingAssociation,
            'is_emergency_contact',
            incomingAssociation.is_emergency_contact
          );
        }

        if (incomingAssociation.dietary_or_personal_considerations) {
          this.updateField(
            selectedRuleSet[ImportRuleSetKeys.association_dietary_or_personal_considerations],
            matchingAssociation,
            'dietary_or_personal_considerations',
            this.getYesNoValue(incomingAssociation.dietary_or_personal_considerations.trim())
          );
        }
        if (incomingAssociation.dietary_consideration) {
          this.updateField(
            selectedRuleSet[ImportRuleSetKeys.association_dietary_consideration],
            matchingAssociation,
            'dietary_consideration',
            incomingAssociation.dietary_consideration
          );
        }
        if (incomingAssociation.dietary_consideration_type) {
          this.updateField(
            selectedRuleSet[ImportRuleSetKeys.association_dietary_consideration_type],
            matchingAssociation,
            'dietary_consideration_type',
            incomingAssociation.dietary_consideration_type
          );
        }
        if (!matchingAssociation.address) {
          matchingAssociation.address = { ...new Address() };
        }
        if (incomingAssociation.address.address1) {
          this.updateField(
            selectedRuleSet[ImportRuleSetKeys.association_address_address1],
            matchingAssociation.address,
            'address1',
            incomingAssociation.address.address1
          );
        }
        if (incomingAssociation.address.address2) {
          this.updateField(
            selectedRuleSet[ImportRuleSetKeys.association_address_address2],
            matchingAssociation.address,
            'address2',
            incomingAssociation.address.address2
          );
        }
        if (incomingAssociation.address.city) {
          this.updateField(
            selectedRuleSet[ImportRuleSetKeys.association_address_city],
            matchingAssociation.address,
            'city',
            incomingAssociation.address.city
          );
        }
        if (incomingAssociation.address.state) {
          this.updateField(
            selectedRuleSet[ImportRuleSetKeys.association_address_state],
            matchingAssociation.address,
            'state',
            incomingAssociation.address.state
          );
        }
        if (incomingAssociation.address.zip) {
          this.updateField(
            selectedRuleSet[ImportRuleSetKeys.association_address_zip],
            matchingAssociation.address,
            'zip',
            incomingAssociation.address.zip
          );
        }
        if (incomingAssociation.address.county) {
          this.updateField(
            selectedRuleSet[ImportRuleSetKeys.association_address_county],
            matchingAssociation.address,
            'county',
            incomingAssociation.address.county
          );
        }
        if (incomingAssociation.address.country) {
          this.updateField(
            selectedRuleSet[ImportRuleSetKeys.association_address_country],
            matchingAssociation.address,
            'country',
            incomingAssociation.address.country
          );
        }

        if (incomingAssociation[AssociationKeys.associationTypeRef]) {
          this.updateField(
            selectedRuleSet[ImportRuleSetKeys.association_association_type],
            matchingAssociation,
            AssociationKeys.associationTypeRef,
            incomingAssociation[AssociationKeys.associationTypeRef]
          );
        }

        promises.push(
          this.agentAssociationsService
            .update(agent[BaseModelKeys.dbId], matchingAssociation[BaseModelKeys.dbId], matchingAssociation)
            .then((association) => {
              if (association) {
                messages.push(
                  'Associate updated (' + association.first_name + ' ' + association.last_name + ') to ' + agent.p_email
                );
              }
            })
        );
      }
    }

    Promise.all(promises);

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
