import { Injectable, OnInit } from '@angular/core';
import { ImportMapping } from 'ag-common-lib/lib/models/import-rules/import-mapping.model';
import { ImportRuleSet, ImportRuleSetKeys } from 'ag-common-lib/lib/models/import-rules/import-ruleset-model';
import {
  ActiveLookup,
  Address,
  Agency,
  Agent,
  AgentKeys,
  AGENT_STATUS,
  AGENT_TYPE,
  ApproveDenyReason,
  ApproveDenyReasonVisibilityLevel,
  Association,
  AssociationKeys,
  BaseModelKeys,
  Conference,
  EmailAddress,
  Goal,
  LegacyAgent,
  PhoneNumber,
  PhoneNumberType,
  PROSPECT_DISPOSITION,
  PROSPECT_PRIORITY,
  PROSPECT_STATUS,
  Registrant,
  Role
} from 'ag-common-lib/public-api';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { QueryParam, WhereFilterOperandKeys } from '../dao/CommonFireStoreDao.dao';
import { AgentApproveDenyReasonsService } from './agent-approve-deny-reason.service';
import { AgentAssociationsService } from './agent-associations.service';
import { AgentService } from './agent.service';
import { DomainAddressService } from './domain-address.service';
import { DomainAssociationsService } from './domain-associations.service';
import { DomainEmailService } from './domain-email.service';
import { DomainPhoneNumberService } from './domain-phone-number.service';
import { DomainSocialsService } from './domain-socials.service';
import { DomainUtilService } from './domain-util.service';
import { DomainWebsiteService } from './domain-website.service';
import { LookupsService } from './lookups.service';
import { RegistrantsService } from './registrants.service';

@Injectable({
  providedIn: 'root'
})
export class DomainService implements OnInit {
  PRIMARY_EMAIL_IDENTIFIER = 'email_addresses.1.address';

  messages: string[];

  REGISTRATION_POLICY_REPLACE: string = 'Replace Existing Registrations';
  REGISTRATION_POLICY_UPDATE: string = 'Update Existing Registrations';

  lookupsMap: Map<string, ActiveLookup[]>;

  constructor(
    private agentService: AgentService,
    private registrantsService: RegistrantsService,
    private agentAssociationsService: AgentAssociationsService,
    private approveDenyReasonService: AgentApproveDenyReasonsService,
    private domainAddressService: DomainAddressService,
    private domainEmailService: DomainEmailService,
    private domainPhoneNumberService: DomainPhoneNumberService,
    private domainWebsiteService: DomainWebsiteService,
    private domainSocialsService: DomainSocialsService,
    private domainAssociationsService: DomainAssociationsService,
    private domainUtilService: DomainUtilService,
    private lookupsService: LookupsService
  ) {}
  ngOnInit(): void {}

  //************************************************************* */
  //  Method to import Agents from import file
  //
  //  agents: Map<string, string>[]: Map of key value
  //          pairs for Agent Record
  //  agencies: Agency[]: List of all Agencies for
  //          validating incoming Agency ID's are correct
  //  selectedRuleSet: ImportRuleSet: Rulset to apply
  //          to import
  //  createdBy: string: Email address of person
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
    messages: string[],
    lookupsMap: Map<string, ActiveLookup[]>
  ): Promise<Agent[]> {
    this.lookupsMap = lookupsMap;
    this.messages = messages;

    const promises: Promise<Agent>[] = [];

    agents.forEach((data) => {
      let email_address: string;

      if (data.has(this.PRIMARY_EMAIL_IDENTIFIER)) {
        email_address = data.get(this.PRIMARY_EMAIL_IDENTIFIER);
      } else {
        email_address = data.get('invitee_email');
      }

      let agent_name = data.get('p_agent_first_name') + ' ' + data.get('p_agent_last_name') + '(' + email_address + ')';

      const promise: Promise<Agent> = this.agentService
        .getAgentByEmail(email_address.toLowerCase().trim())
        .then((agent) => {
          if (!agent) {
            messages.unshift(agent_name + ' does not currently exist and will be created.');
            return this.createAgent(data, createdBy, agencies, selectedRuleSet.import_mappings);
          } else {
            messages.unshift(agent_name + ' exists and will be updated.');
            return this.updateAgent(data, agent, selectedRuleSet, agencies, createdBy);
          }
        });

      promises.push(promise);
    });

    return Promise.all(promises).then((response) => {
      return Array.isArray(response) ? response.filter(Boolean) : [];
    });
  }

  async createAgent(
    line_data: Map<string, string>,
    createdBy: string,
    agencies: Agency[],
    importMappings: ImportMapping[]
  ): Promise<Agent> {
    const agent = { ...new Agent() };

    importMappings.forEach((mapping) => {
      if (line_data.has(mapping.field_name_agent)) {
        if (mapping.data_type == 'string' || mapping.data_type == 'select') {
          agent[mapping.field_name_agent] = line_data.get(mapping.field_name_agent);
        }

        if (mapping.data_type == 'yes-no') {
          agent[mapping.field_name_agent] = this.domainUtilService.getYesNoValue(
            line_data.get(mapping.field_name_agent).trim()
          );
        }

        if (mapping.data_type == 'date') {
          agent[mapping.field_name_agent] = new Date(line_data.get(mapping.field_name_agent));
        }

        if (mapping.data_type == 'lookup') {
          agent[mapping.field_name_agent] = this.getLookupValue(
            mapping.values,
            line_data.get(mapping.field_name_agent)
          );
        }

        if (mapping.data_type == 'boolean') {
          agent[mapping.field_name_agent] = this.domainUtilService.getBoolean(line_data.get(mapping.field_name_agent));
        }
      }
    });

    if (line_data.has(AgentKeys.agent_status)) {
      agent[AgentKeys.agent_status] = AGENT_STATUS[line_data.get(AgentKeys.agent_status).trim().toUpperCase()];
    } else {
      agent[AgentKeys.agent_status] = AGENT_STATUS.APPROVED;
    }

    if (line_data.has(AgentKeys.prospect_status)) {
      agent[AgentKeys.prospect_status] = PROSPECT_STATUS[line_data.get(AgentKeys.prospect_status).trim().toUpperCase()];
    }

    if (line_data.has(AgentKeys.prospect_priority)) {
      agent[AgentKeys.prospect_priority] =
        PROSPECT_PRIORITY[line_data.get(AgentKeys.prospect_priority).trim().toUpperCase()];
    }
    if (line_data.has(AgentKeys.prospect_disposition)) {
      agent[AgentKeys.prospect_disposition] =
        PROSPECT_DISPOSITION[line_data.get(AgentKeys.prospect_disposition).trim().toUpperCase()];
    }

    if (line_data.has(AgentKeys.agent_type)) {
      agent[AgentKeys.agent_type] = AGENT_TYPE[line_data.get(AgentKeys.agent_type).trim().toUpperCase()];
    } else {
      agent[AgentKeys.agent_type] = AGENT_TYPE.GENERAL_AGENT;
    }

    agent[AgentKeys.addresses] = this.domainAddressService.createAddresses(line_data);
    agent[AgentKeys.email_addresses] = this.domainEmailService.createEmailAddresses(line_data);
    agent[AgentKeys.phone_numbers] = this.domainPhoneNumberService.createPhoneNumbers(line_data);
    agent[AgentKeys.websites] = this.domainWebsiteService.createWebsites(line_data);
    agent[AgentKeys.socials] = this.domainSocialsService.createSocials(line_data);

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
    agent[AgentKeys.is_rmd] = false;
    agent[AgentKeys.is_credited] = false;

    if (!this.validateAgency(agent, agencies)) {
      return null;
    }

    const agentEmailAddresses = agent[AgentKeys.email_addresses];

    if (!Array.isArray(agentEmailAddresses) || agentEmailAddresses?.length == 0) {
      this.messages.unshift(
        'No Email Addresses were set for this agent. Not Importing ' + agent[AgentKeys.p_agent_name]
      );
      return null;
    }

    let loginAddress = agentEmailAddresses.find((email) => email.is_login);

    if (!loginAddress) {
      agentEmailAddresses[0].is_login = true;
      loginAddress = agentEmailAddresses[0];
    }

    agent[AgentKeys.p_email] = loginAddress.address;

    return this.agentService.create(agent).then((new_agent) => {
      if (line_data.has(AgentKeys.approve_deny_reason)) {
        let approve_deny_reason: ApproveDenyReason = { ...new ApproveDenyReason() };
        approve_deny_reason.created_by = createdBy;
        approve_deny_reason.created_date = new Date();
        approve_deny_reason.visibilityLevel = ApproveDenyReasonVisibilityLevel.AllianceGroupLevel;
        approve_deny_reason.isDeleted = false;
        approve_deny_reason.activity = line_data.get(AgentKeys.approve_deny_reason);

        this.approveDenyReasonService.create(new_agent[BaseModelKeys.dbId], approve_deny_reason, true);
      }

      this.messages.unshift(`Agent ${new_agent.p_email} was created`);

      return new_agent;
    });
  }

  async updateAgent(
    line_data: Map<string, string>,
    agent: Agent,
    selectedRuleSet: ImportRuleSet,
    agencies: Agency[],
    updatedBy: string
  ): Promise<Agent> {
    selectedRuleSet.import_mappings.forEach(async (mapping) => {
      if (line_data.has(mapping.field_name_agent)) {
        if (mapping.data_type == 'string' || mapping.data_type == 'select') {
          this.domainUtilService.updateField(
            selectedRuleSet[mapping.field_name_agent],
            agent,
            mapping.field_name_agent,
            line_data.get(mapping.field_name_agent)
          );
        }

        if (mapping.data_type == 'yes-no') {
          this.domainUtilService.updateField(
            selectedRuleSet[mapping.field_name_agent],
            agent,
            mapping.field_name_agent,
            this.domainUtilService.getYesNoValue(line_data.get(mapping.field_name_agent).trim())
          );
        }

        if (mapping.data_type == 'date') {
          this.domainUtilService.updateField(
            selectedRuleSet[mapping.field_name_agent],
            agent,
            mapping.field_name_agent,
            new Date(line_data.get(mapping.field_name_agent).trim())
          );
        }

        if (mapping.data_type == 'lookup') {          
          let lookupval: string = this.getLookupValue(mapping.values, line_data.get(mapping.field_name_agent));

          this.domainUtilService.updateField(
            selectedRuleSet[mapping.field_name_agent],
            agent,
            mapping.field_name_agent,
            lookupval.trim()
          );
        }

        if (mapping.data_type == 'boolean') {
          this.domainUtilService.updateField(
            selectedRuleSet[mapping.field_name_agent],
            agent,
            mapping.field_name_agent,
            this.domainUtilService.getBoolean(line_data.get(mapping.field_name_agent).trim())
          );
        }
      }
    });

    if (line_data.has(AgentKeys.approve_deny_reason) && selectedRuleSet[ImportRuleSetKeys.approve_deny_reason].valueOf() == 'ADD_TO_LIST') {
      let approve_deny_reason: ApproveDenyReason = {... new ApproveDenyReason()};
      approve_deny_reason.created_by = updatedBy;
      approve_deny_reason.created_date = new Date();
      approve_deny_reason.visibilityLevel = ApproveDenyReasonVisibilityLevel.AllianceGroupLevel;
      approve_deny_reason.isDeleted = false;
      approve_deny_reason.activity = line_data.get(AgentKeys.approve_deny_reason).trim();

      this.approveDenyReasonService.create(agent[BaseModelKeys.dbId], approve_deny_reason, true)
    }
    if (line_data.has(AgentKeys.agency_approve_deny_reason) && selectedRuleSet[ImportRuleSetKeys.agency_approve_deny_reason].valueOf() == 'ADD_TO_LIST') {
      let approve_deny_reason: ApproveDenyReason = {... new ApproveDenyReason()};
      approve_deny_reason.created_by = updatedBy;
      approve_deny_reason.created_date = new Date();
      approve_deny_reason.visibilityLevel = ApproveDenyReasonVisibilityLevel.AgencyLevel;
      approve_deny_reason.isDeleted = false;
      approve_deny_reason.activity = line_data.get(AgentKeys.agency_approve_deny_reason).trim();

      this.approveDenyReasonService.create(agent[BaseModelKeys.dbId], approve_deny_reason, true)
    }

    if (line_data.has(AgentKeys.agent_type)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.agent_type],
        agent,
        AgentKeys.agent_type,
        AGENT_TYPE[line_data.get(AgentKeys.agent_type).trim().toUpperCase()]
      );
    } else {
      agent.agent_type = AGENT_TYPE.GENERAL_AGENT;
    }

    if (line_data.has(AgentKeys.agent_status)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.agent_status],
        agent,
        AgentKeys.agent_status,
        AGENT_STATUS[line_data.get(AgentKeys.agent_status).trim().toUpperCase()]
      );
    }

    if (line_data.has(AgentKeys.prospect_status)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.prospect_status],
        agent,
        AgentKeys.prospect_status,
        PROSPECT_STATUS[line_data.get(AgentKeys.prospect_status).trim().toUpperCase()]
      );
    }

    if (line_data.has(AgentKeys.prospect_priority)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.prospect_priority],
        agent,
        AgentKeys.prospect_priority,
        PROSPECT_PRIORITY[line_data.get(AgentKeys.prospect_priority).trim().toUpperCase()]
      );
    }

    if (line_data.has(AgentKeys.prospect_disposition)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.prospect_disposition],
        agent,
        AgentKeys.prospect_disposition,
        PROSPECT_DISPOSITION[line_data.get(AgentKeys.prospect_disposition).trim().toUpperCase()]
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
      this.validateAgency(agent, agencies),
      this.domainAddressService.updateAddresses(line_data, agent, selectedRuleSet, this.messages),
      this.domainEmailService.updateEmailAddresses(line_data, agent, selectedRuleSet, this.messages),
      this.domainPhoneNumberService.updatePhoneNumbers(line_data, agent, selectedRuleSet, this.messages),
      this.domainSocialsService.updateSocials(line_data, agent, selectedRuleSet, this.messages),
      this.domainWebsiteService.updateWebsites(line_data, agent, selectedRuleSet, this.messages)
    ].every(Boolean);

    if (!shouldContinue) {
      return null;
    }

    return this.agentService.updateFields(agent[BaseModelKeys.dbId], agent).then((updatedAgent) => {
      this.messages.unshift(`Agent ${agent.p_email} was updated`);
      return updatedAgent;
    });
  }

  createOrUpdateAssociations(
    agents: Agent[],
    guest_data: Map<string, string>[],
    selectedRuleSet: ImportRuleSet,
    messages: string[],
    id_key: string
  ) {
    guest_data.forEach((guest) => {
      let invitees = agents.filter((a) => a.p_email == guest.get('invitee_email'));

      if (invitees.length == 1) {
        this.domainAssociationsService.updateAssociations(guest, invitees[0], selectedRuleSet, messages, id_key);
      }
    });
  }

  createRegistrantArrayForInvitees(
    agents: Agent[],
    invitee_maps: Map<string, string>[],
    selectedConference: Conference,
    createdBy: string,
    conferenceRegistrationPolicy: string,
    importMappings: ImportMapping[],
    lookupsMap: Map<string, ActiveLookup[]>
  ): Promise<Registrant>[] {
    this.lookupsMap = lookupsMap;

    let promises: Promise<Registrant>[] = [];

    // if (conferenceRegistrationPolicy == this.REGISTRATION_POLICY_REPLACE) {
    //   let qp: QueryParam[] = [];
    //   qp.push(new QueryParam('event_id', WhereFilterOperandKeys.equal, selectedConference));

    //   this.registrantsService.getAllByValue(qp).then(async (registrants) => {
    //     registrants.forEach(registrant => {
    //       this.registrantsService.delete(registrant);
    //     })
    //   })
    // }

    invitee_maps.forEach(async (invitee_map) => {
      let invitee_email = invitee_map.get('invitee_email').toLowerCase();
      let invitee_guest = invitee_map.get('invitee_guest');

      let unique_id = selectedConference.event_id.toLowerCase() + '_' + invitee_guest.toLowerCase() + '-' + invitee_email.toLowerCase();

      let invitee: Registrant;

      //get all records with this unique id
      let qp: QueryParam[] = [];
      qp.push(new QueryParam('unique_id', WhereFilterOperandKeys.equal, unique_id));

      let p = this.registrantsService.getAllByValue(qp).then(async (invitees) => {
        //check for existing agent record
        let agent: LegacyAgent = agents.find((agent) => agent.p_email == invitee_map.get('invitee_email').toLowerCase().trim());

        if (!agent) {
          console.log("Can't create Registration. No agent found for " + invitee_map.get('invitee_email').toLowerCase().trim());
          return null;
        }

        //check for existing registrant record
        if (invitees.length == 0) {
          invitee = { ...new Registrant() };

          invitee.unique_id = unique_id;

          //get any data from agent record and copy to registrant record
          importMappings.forEach(async (mapping) => {
            if (agent[mapping.field_name_agent] && agent[mapping.field_name_agent] != '') {              
              invitee[mapping.field_name_registrant] = agent[mapping.field_name_agent];
            }
          })
        } else if (invitees.length == 1) {
          invitee = invitees[0];

          //if policy is to replace registration delete registration and guest registrations
          if (conferenceRegistrationPolicy == this.REGISTRATION_POLICY_REPLACE) {
            invitee = { ...new Registrant() };
            this.registrantsService.delete(invitees[0][BaseModelKeys.dbId]);

            await this.registrantsService
              .getAllByValue([new QueryParam('invitee_email', WhereFilterOperandKeys.equal, invitee_email)])
              .then((guests) => {
                guests.forEach(async (guest) => {
                  await this.registrantsService.delete(guest[BaseModelKeys.dbId]);
                });
              });
          }
        } else {
          console.log('Found too many registrants matching', qp);

          return null;
        }

        invitee.invitee_guest = invitee_guest;
        invitee.invitee_email = invitee_email;
        invitee.last_eval_date = new Date();
        invitee.event_id = selectedConference.event_id;

        //if invitess status exists evaluate approval
        if (invitee_map.has('invitee_status')) {
          if (invitee_map.get('invitee_status') == 'Approved') {
            invitee.approved = true;
          } else {
            invitee.approved = false;
          }

          invitee.approved_by = createdBy;
          invitee.approved_date = new Date();
        }

        //iterate through mappings - set data in registration from file
        importMappings.forEach(async (mapping) => {
          //if mapping has fiel_name_registrant, it is not blank, and doesnt start with "guest"
          if (invitee_map.has(mapping.field_name_registrant) 
              && invitee_map.get(mapping.field_name_registrant) != ''
              && !mapping.field_name_registrant.startsWith("guest")) {
            let incoming_value: string = invitee_map.get(mapping.field_name_registrant);

            if (mapping.data_type == 'string' || mapping.data_type == 'select') {
              invitee[mapping.field_name_registrant] = incoming_value;
            }

            if (mapping.data_type == 'yes-no') {
              invitee[mapping.field_name_registrant] = this.domainUtilService.getYesNoValue(incoming_value.trim());
            }

            if (mapping.data_type == 'date') {
              invitee[mapping.field_name_registrant] = new Date(incoming_value.trim());
            }

            if (mapping.data_type == 'lookup') {
              invitee[mapping.field_name_registrant] = await this.getLookupValue(mapping.values, incoming_value.trim());
            }

            if (mapping.data_type == 'boolean') {
              invitee[mapping.field_name_registrant] = this.domainUtilService.getBoolean(incoming_value.trim());
            }

            if (mapping.data_type == 'currency') {
              invitee[mapping.field_name_registrant] = incoming_value.trim();
            }

            if (!invitee[mapping.field_name_registrant] && agent[mapping.field_name_agent]) {
              invitee[mapping.field_name_registrant] = agent[mapping.field_name_agent];
            }
          }
        });

        //if agent has addresses
        let incoming_addresses: Address[] = this.domainAddressService.extractAddresses(invitee_map);

        if(incoming_addresses?.length > 0){
          let primary_billing_address: Address = incoming_addresses.find((address) => address.is_primary_billing == true);

          if (primary_billing_address) {
            invitee.primary_billing_address = { ...primary_billing_address };
          } else {
            let agent_billing_address: Address = agent.addresses.find((address) => address.is_primary_billing == true);

            if (agent_billing_address) {
              invitee.primary_billing_address = { ...agent_billing_address };
            } else {
              invitee.primary_billing_address = { ...incoming_addresses[0] };
            }
          }

          let primary_shipping_address: Address = incoming_addresses.find((address) => address.is_primary_shipping == true);

          if (primary_shipping_address) {
            invitee.primary_shipping_address = { ...primary_shipping_address };
          } else {
            let agent_shippinging_address: Address = agent.addresses.find((address) => address.is_primary_shipping == true);

            if (agent_shippinging_address) {
              invitee.primary_shipping_address = { ...agent_shippinging_address };
            } else if(incoming_addresses.length > 1){
              invitee.primary_shipping_address = { ...incoming_addresses[1] };
            }
          }
        }

        let incoming_emails: EmailAddress[] = this.domainEmailService.extractEmailAddresses(invitee_map);

        if(incoming_emails?.length > 0){
          let incoming_login_email: EmailAddress = incoming_emails.find((email) => email.is_login == true);

          if (incoming_login_email) {
            invitee.primary_email_address = {...incoming_login_email };
          } else {
            let agent_primary_email: EmailAddress = agent.email_addresses.find((email) => email.is_login == true);

            if (agent_primary_email) {
              invitee.primary_email_address = { ...agent_primary_email };
            } else {
              invitee.primary_email_address = { ...incoming_emails[0] };
            }
          }

          let incoming_secondary_email: EmailAddress[] = incoming_emails.filter((email) => email.is_login == false);

          if (incoming_secondary_email.length > 0 ) {
            invitee.secondary_email_address = {...incoming_secondary_email[0]};
          } else {
            let agent_secondary_email: EmailAddress[] = agent.email_addresses.filter((email) => email.is_login == false);

            if (agent_secondary_email.length > 0) {
              invitee.secondary_email_address = agent_secondary_email[0];
            } else if(incoming_emails.length > 1){
              invitee.secondary_email_address = incoming_emails[0];
            }
          }
        }

        let incoming_phone_numbers: PhoneNumber[] = this.domainPhoneNumberService.extractPhoneNumbers(invitee_map);
        
        //if agent has phone numbers - Get from file, not agent record
        if(incoming_phone_numbers?.length > 0){
          let incoming_mobile_number: PhoneNumber = incoming_phone_numbers.find((phone) => phone.phone_type == PhoneNumberType.Mobile);

          if (incoming_mobile_number) {
            invitee.mobile_phone = {...incoming_mobile_number };
          } else {
            let agent_mobile_number: PhoneNumber = agent.phone_numbers.find((phone) => phone.phone_type == PhoneNumberType.Mobile);

            if (agent_mobile_number) {
              invitee.mobile_phone = { ...agent_mobile_number };
            } else {
              invitee.mobile_phone = { ...incoming_phone_numbers[0] };
            }
          }

          let incoming_secondary_number: PhoneNumber[] = incoming_phone_numbers.filter((phone) => phone.number != incoming_mobile_number.number);

          if (incoming_secondary_number.length > 0 ) {
            invitee.secondary_phone = {...incoming_secondary_number[0]};
          } else {
            let agent_secondary_phone_number: PhoneNumber[] = agent.phone_numbers.filter((phone) => phone.phone_type != PhoneNumberType.Mobile);

            if (agent_secondary_phone_number.length > 0) {
              invitee.secondary_phone = agent_secondary_phone_number[0];
            } else if(incoming_emails.length > 1){
              invitee.secondary_phone = incoming_phone_numbers[0];
            }
          }
        }

        //get custom fields
        selectedConference.registrantFields.forEach((field) => {
          if (invitee_map.has(field.name)) {
            invitee[field.name] = invitee_map.get(field.name);
          }
        });

        //get emergency contact from agent
        let contacts = await this.agentAssociationsService.getAll(agent[BaseModelKeys.dbId]);

        if (contacts.length > 0) {
          let emergency_contacts: Association[] = contacts.filter((contact) => contact.is_emergency_contact == true);

          let selected_emergency_contact: Association = emergency_contacts.find(
            (contact) =>
              contact[AssociationKeys.firsName] == invitee_map.get('association.1.first_name') &&
              contact[AssociationKeys.lastName] == invitee_map.get('association.1.las_name')
          );

          if (selected_emergency_contact) {
            invitee.emergency_contact = selected_emergency_contact;
          } else {
            if (emergency_contacts.length > 0) {
              invitee.emergency_contact = emergency_contacts[0];
            } else {
              invitee.emergency_contact = contacts[0];
            }
          }
        }

        //save registrant
        if (invitee[BaseModelKeys.dbId]) {
          this.messages.unshift('Registration Updated for ' + invitee.first_name + ' ' + invitee.last_name);
          this.registrantsService.update(invitee);
        } else {
          this.messages.unshift('Registration Created for ' + invitee.first_name + ' ' + invitee.last_name);
          this.registrantsService.create(invitee);
        }

        return invitee;
      });

      promises.push(p);
    });

    return promises;
  }

  createRegistrantArrayForGuests(
    invitees_map: Map<string, string>[],
    selectedConference: Conference,
    createdBy: string,
    conferenceRegistrationPolicy: string,
    importMappings: ImportMapping[],
    parents: Registrant[],
    lookupsMap: Map<string, ActiveLookup[]>
  ): Promise<Registrant>[] {
    this.lookupsMap = lookupsMap;

    let promises: Promise<Registrant>[] = [];

    invitees_map.forEach((invitee_map) => {
      let guest_map: Map<string, string> = new Map<string, string>();

      let invitee_email = invitee_map.get('invitee_email').toLowerCase();
      let invitee_guest = 'Guest';

      //filter invitee map to create map with only guest fields
      invitee_map.forEach((value, key) => {
        if (key.startsWith('guest')) {
          guest_map.set(key, value);
        }
      });

      //split up into different guests
      let guests: Map<string, Map<string, string>> = new Map<string, Map<string, string>>();

      guest_map.forEach((v, k) => {
        let key_split: string[] = k.split('.');

        let guest_vals: Map<string, string>;

        if (guests.has(key_split[0] + '.' + key_split[1])) {
          guest_vals = guests.get(key_split[0] + '.' + key_split[1]);
        } else {
          guest_vals = new Map<string, string>();
        }

        if (k.startsWith(key_split[0] + '.' + key_split[1])) {
          if (key_split.length == 4) {
            guest_vals.set(key_split[key_split.length - 2] + '.' + key_split[key_split.length - 1], v);
          } else {
            guest_vals.set(key_split[key_split.length - 1], v);
          }

          guests.set(key_split[0] + '.' + key_split[1], guest_vals);
        }
      });

      //create registrant for each guest
      guests.forEach((guest_map) => {
        if (guest_map.has('first_name') && guest_map.has('last_name')) {
          //create unique id for quest for future searches
          let unique_id =
            selectedConference.event_id.toLowerCase() +
            '_' +
            invitee_guest.toLowerCase() +
            '-' +
            invitee_email.toLowerCase() +
            guest_map.get('first_name').toLowerCase() +
            '_' +
            guest_map.get('last_name').toLowerCase();

          let qp: QueryParam[] = [];
          qp.push(new QueryParam('unique_id', WhereFilterOperandKeys.equal, unique_id));

          let promise = this.registrantsService.getAllByValue(qp).then(async (registrants) => {
            let guest: Registrant;

            if (registrants.length == 0) {
              // if not found -> create new Registrant
              guest = { ...new Registrant() };

              //create unique id for quest for future searches
              guest.unique_id = unique_id;
            } else if (registrants.length == 1) {
              // if found -> set found registrant to be edited
              guest = registrants[0];

              if (conferenceRegistrationPolicy == this.REGISTRATION_POLICY_REPLACE) {
                // if this is a full replace, create new registrant record and delete old one
                guest = { ...new Registrant() };
                this.registrantsService.delete(registrants[0][BaseModelKeys.dbId]);
              }
            } else {
              console.log('Found too many registrants matching guest', qp);

              return null;
            }

            guest.invitee_guest = invitee_guest;
            guest.invitee_email = invitee_email;

            guest.event_id = selectedConference.event_id;

            let parentInvitee: Registrant = parents.find((registrant) => registrant.invitee_email == invitee_email);

            //data from parent record
            if (parentInvitee) {
              if (parentInvitee.invitee_status == 'Approved') {
                guest.approved = true;
              } else {
                guest.approved = false;
              }

              guest.approved_by = createdBy;
              guest.approved_date = new Date();

              if (parentInvitee.created_at) {
                guest.created_at = parentInvitee.created_at;
              }
      
              if (parentInvitee.updated_at) {
                guest.updated_at = parentInvitee.updated_at;
              }
      
              if (parentInvitee.registered_at) {
                guest.registered_at = parentInvitee.registered_at;
              }
  
              guest.last_eval_date = new Date();
  
              if (parentInvitee.group_id) {
                guest.group_id = parentInvitee.group_id;
              }
  
              if (parentInvitee.registration_status) {
                guest.registration_status = parentInvitee.registration_status;
              }
  
              if (parentInvitee.invitee_status) {
                guest.invitee_status = parentInvitee.invitee_status;
              }
  
              if (parentInvitee.emergency_contact) {
                guest.emergency_contact = parentInvitee.emergency_contact;
              }
  
              if (parentInvitee.arrival_date) {
                guest.arrival_date = parentInvitee.arrival_date;
              }
  
              if (parentInvitee.departure_date) {
                guest.departure_date = parentInvitee.departure_date;
              }
  
              if (parentInvitee.requested_arrival) {
                guest.requested_arrival = parentInvitee.requested_arrival;
              }
  
              if (parentInvitee.requested_departure) {
                guest.requested_departure = parentInvitee.requested_departure;
              }
  
              if (parentInvitee.alternate_date_request) {
                guest.alternate_date_request = parentInvitee.alternate_date_request;
              }
  
              if (parentInvitee.rsvp) {
                guest.rsvp = parentInvitee.rsvp;
              }
  
              if (parentInvitee.hotel) {
                guest.hotel = parentInvitee.hotel;
              }
  
              if (parentInvitee.bed_preference) {
                guest.bed_preference = parentInvitee.bed_preference;
              }
  
              if (parentInvitee.room_type) {
                guest.room_type = parentInvitee.room_type;
              }
  
              if (parentInvitee.registration_type) {
                guest.registration_type = parentInvitee.registration_type;
              }
            }

            importMappings.forEach(async (mapping) => {
              if (
                (guest_map.has(mapping.field_name_registrant) &&
                guest_map.get(mapping.field_name_registrant) != '')
              ) {
                if (mapping.data_type == 'string' || mapping.data_type == 'select') {
                  guest[mapping.field_name_registrant] = guest_map.get(mapping.field_name_registrant);
                }

                if (mapping.data_type == 'yes-no') {
                  guest[mapping.field_name_registrant] = this.domainUtilService.getYesNoValue(
                    guest_map.get(mapping.field_name_registrant).trim()
                  );
                }

                if (mapping.data_type == 'date') {
                  guest[mapping.field_name_registrant] = new Date(guest_map.get(mapping.field_name_registrant));
                }

                if (mapping.data_type == 'lookup') {
                  guest[mapping.field_name_registrant] = await this.getLookupValue(
                    mapping.values,
                    guest_map.get(mapping.field_name_registrant)
                  );
                }

                if (mapping.data_type == 'boolean') {
                  guest[mapping.field_name_registrant] = this.domainUtilService.getBoolean(
                    guest_map.get(mapping.field_name_registrant)
                  );
                }

                if (mapping.data_type == 'currency') {
                  guest[mapping.field_name_registrant] = guest_map.get(mapping.field_name_registrant);
                }

                if (!guest[mapping.field_name_registrant] && parentInvitee[mapping.field_name_agent]) {
                  guest[mapping.field_name_registrant] = parentInvitee[mapping.field_name_agent];
                }
              }
            });

            if (guest_map.has('relationship')) {
              let value = guest_map.get('relationship');
              guest.relationship = await this.getLookupValue('associationTypeLookup', value);
            }

            selectedConference.registrantFields.forEach((field) => {
              if (guest_map.has(field.name)) {
                guest[field.name] = guest_map.get(field.name);
              }
            });

            if (guest[BaseModelKeys.dbId]) {
              this.messages.unshift('Registration Updated for ' + guest.first_name + ' ' + guest.last_name);
              this.registrantsService.update(guest);
            } else {
              this.messages.unshift('Registration Created for ' + guest.first_name + ' ' + guest.last_name);
              this.registrantsService.create(guest);
            }

            return guest;
          });
          promises.push(promise);
        }
      });
    });

    return promises;
  }

  validateAgency(agent: Agent, agencies: Agency[]): boolean {
    let retval: boolean = true;

    if (agent.p_agency_id) {
      let a: Agency[] = agencies.filter((agency) => agency.agency_id == agent.p_agency_id);

      if (a.length != 1) {
        retval = false;

        this.messages.push(
          agent.email_addresses[0].address + ' has an value set for Agency Id that does not match an existing Agency!'
        );
      }
    }

    if (agent.p_mga_id) {
      let a: Agency[] = agencies.filter((agency) => agency.agency_id == agent.p_mga_id);

      if (a.length != 1) {
        retval = false;

        this.messages.push(
          agent.email_addresses[0].address + ' has an value set for MGA Id that does not match an existing Agency!'
        );
      }
    }

    return retval;
  }

  getLookupValue(lookupName: string, matchVal: string):string {
    if (!this.lookupsMap.has(lookupName)) {
      console.log("Couldn't find lookups for ", lookupName);
      return '';
    }

    let lookup: ActiveLookup = this.lookupsMap.get(lookupName).find((val) => val.value.toLowerCase() == matchVal.toLowerCase());

    if (lookup) {
      return lookup.dbId;
    } else {
      console.log("Couldn't find lookup value for ", lookupName, matchVal);
      return '';
    }
  };
}
