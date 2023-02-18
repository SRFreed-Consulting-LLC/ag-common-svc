import { Injectable } from '@angular/core';
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
export class DomainService {
  PRIMARY_EMAIL_IDENTIFIER = 'email_addresses.1.address';

  messages: string[];

  REGISTRATION_POLICY_REPLACE: string = 'Replace Existing Registrations';
  REGISTRATION_POLICY_UPDATE: string = 'Update Existing Registrations';

  dietaryConsiderationTypesLookups: ActiveLookup[];
  gendersLookups: ActiveLookup[];
  prefixesLookups: ActiveLookup[];
  suffixesLookup: ActiveLookup[];
  tshirtSizesLookup: ActiveLookup[];
  relationshipsLookup: ActiveLookup[];

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
  ) {
    this.lookupsService.dietaryConsiderationTypesLookup$.subscribe(lookups => this.dietaryConsiderationTypesLookups = lookups);
    this.lookupsService.gendersLookup$.subscribe(lookups => this.gendersLookups = lookups);
    this.lookupsService.prefixesLookup$.subscribe(lookups => this.prefixesLookups = lookups);
    this.lookupsService.suffixesLookup$.subscribe(lookups => this.suffixesLookup = lookups);
    this.lookupsService.tShortSizesLookup$.subscribe(lookups => this.tshirtSizesLookup = lookups);
    this.lookupsService.associationTypeLookup$.subscribe(lookups => this.relationshipsLookup = lookups);
  }

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
    messages: string[]
  ): Promise<Agent[]> {
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
            return this.createAgent(data, createdBy, agencies);
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

  async createAgent(line_data: Map<string, string>, createdBy: string, agencies: Agency[]): Promise<Agent> {
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
      agent[AgentKeys.p_prefix] = this.getLookupValue(this.prefixesLookups, line_data.get(AgentKeys.p_prefix))
    }
    if (line_data.has(AgentKeys.p_suffix)) {
      agent[AgentKeys.p_suffix] = this.getLookupValue(this.suffixesLookup, line_data.get(AgentKeys.p_suffix))
    }
    if (line_data.has(AgentKeys.npn)) {
      agent[AgentKeys.npn] = line_data.get(AgentKeys.npn);
    }
    if (line_data.has(AgentKeys.dietary_or_personal_considerations)) {
      agent[AgentKeys.dietary_or_personal_considerations] = this.domainUtilService.getYesNoValue(
        line_data.get(AgentKeys.dietary_or_personal_considerations).trim()
      );
    }
    if (line_data.has(AgentKeys.dietary_consideration)) {
      agent[AgentKeys.dietary_consideration] = line_data.get(AgentKeys.dietary_consideration);
    }
    if (line_data.has(AgentKeys.dietary_consideration_type)) {
        agent[AgentKeys.dietary_consideration_type] = this.getLookupValue(this.dietaryConsiderationTypesLookups, line_data.get(AgentKeys.dietary_consideration_type));
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
      agent[AgentKeys.gender] = this.getLookupValue(this.gendersLookups, line_data.get(AgentKeys.gender));
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
      agent[AgentKeys.p_tshirt_size] = this.getLookupValue(this.tshirtSizesLookup, line_data.get(AgentKeys.p_tshirt_size));
    }
    if (line_data.has(AgentKeys.p_tshirt_size_other)) {
      agent[AgentKeys.p_tshirt_size_other] = line_data.get(AgentKeys.p_tshirt_size_other);
    }
    if (line_data.has(AgentKeys.unisex_tshirt_size)) {
      agent[AgentKeys.unisex_tshirt_size] = this.getLookupValue(this.tshirtSizesLookup, line_data.get(AgentKeys.unisex_tshirt_size));
    }
    if (line_data.has(AgentKeys.unisex_tshirt_size_other)) {
      agent[AgentKeys.unisex_tshirt_size_other] = line_data.get(AgentKeys.unisex_tshirt_size_other);
    }
    if (line_data.has(AgentKeys.favorite_destination)) {
      agent[AgentKeys.favorite_destination] = line_data.get(AgentKeys.favorite_destination);
    }
    if (line_data.has(AgentKeys.shoe_size)) {
      agent[AgentKeys.shoe_size] = line_data.get(AgentKeys.shoe_size);
    }
    
    if (line_data.has(AgentKeys.christmas_card)) {
      agent[AgentKeys.christmas_card] = this.domainUtilService.getBoolean(line_data.get(AgentKeys.christmas_card));
    }
    if (line_data.has(AgentKeys.p_strategic_agent)) {
      agent[AgentKeys.p_strategic_agent] = this.domainUtilService.getBoolean(
        line_data.get(AgentKeys.p_strategic_agent)
      );
    }
    if (line_data.has(AgentKeys.alliance_group_employee)) {
      agent[AgentKeys.alliance_group_employee] = this.domainUtilService.getBoolean(
        line_data.get(AgentKeys.alliance_group_employee)
      );
    }
    if (line_data.has(AgentKeys.is_manager)) {
      agent[AgentKeys.is_manager] = this.domainUtilService.getBoolean(line_data.get(AgentKeys.is_manager));
    }
    if (line_data.has(AgentKeys.is_acb_user)) {
      agent[AgentKeys.is_acb_user] = this.domainUtilService.getBoolean(line_data.get(AgentKeys.is_acb_user));
    }
    if (line_data.has(AgentKeys.is_awb_user)) {
      agent[AgentKeys.is_awb_user] = this.domainUtilService.getBoolean(line_data.get(AgentKeys.is_awb_user));
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
      agent[AgentKeys.agent_status] = AGENT_STATUS[line_data.get(AgentKeys.agent_status).trim().toUpperCase()];
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

    let splitVals: Map<string, string> = new Map<string, string>();

    line_data.forEach((data, field) => {
      let splitfields = field.split('.');

      if (splitfields.length > 1) {
        splitVals.set(field, data);
      }
    });

    agent[AgentKeys.addresses] = this.domainAddressService.createAddresses(splitVals);
    agent[AgentKeys.email_addresses] = this.domainEmailService.createEmailAddresses(splitVals);
    agent[AgentKeys.phone_numbers] = this.domainPhoneNumberService.createPhoneNumbers(splitVals);
    agent[AgentKeys.websites] = this.domainWebsiteService.createWebsites(splitVals);
    agent[AgentKeys.socials] = this.domainSocialsService.createSocials(splitVals);

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
      this.messages.unshift('No Email Addresses were set for this agent. Not Importing ' + agent[AgentKeys.p_agent_name]);
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
    if (line_data.has(AgentKeys.p_agent_id)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.p_agent_id],
        agent,
        AgentKeys.p_agent_id,
        line_data.get(AgentKeys.p_agent_id)
      );
    }
    if (line_data.has(AgentKeys.p_external_agent_id)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.p_external_agent_id],
        agent,
        AgentKeys.p_external_agent_id,
        line_data.get(AgentKeys.p_external_agent_id).trim()
      );
    }
    if (line_data.has(AgentKeys.p_agent_first_name)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.p_agent_first_name],
        agent,
        AgentKeys.p_agent_first_name,
        line_data.get(AgentKeys.p_agent_first_name).trim()
      );
    }
    if (line_data.has(AgentKeys.p_agent_middle_name)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.p_agent_middle_name],
        agent,
        AgentKeys.p_agent_middle_name,
        line_data.get(AgentKeys.p_agent_middle_name).trim()
      );
    }
    if (line_data.has(AgentKeys.p_agent_last_name)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.p_agent_last_name],
        agent,
        AgentKeys.p_agent_last_name,
        line_data.get(AgentKeys.p_agent_last_name).trim()
      );
    }
    if (line_data.has(AgentKeys.p_nick_name)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.p_nick_name],
        agent,
        AgentKeys.p_nick_name,
        line_data.get(AgentKeys.p_nick_name).trim()
      );
    }
    if (line_data.has(AgentKeys.p_nick_last_name)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.p_nick_last_name],
        agent,
        AgentKeys.p_nick_last_name,
        line_data.get(AgentKeys.p_nick_last_name).trim()
      );
    }
    if (line_data.has(AgentKeys.title)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.title],
        agent,
        AgentKeys.title,
        line_data.get(AgentKeys.title).trim()
      );
    }
    if (line_data.has(AgentKeys.p_prefix)) {
      let lookupval: string = this.getLookupValue(this.prefixesLookups, line_data.get(AgentKeys.p_prefix));

      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.p_prefix],
        agent,
        AgentKeys.p_prefix,
        lookupval.trim()
      );
    }
    if (line_data.has(AgentKeys.p_suffix)) {
      let lookupval: string = this.getLookupValue(this.suffixesLookup, line_data.get(AgentKeys.p_suffix));

      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.p_prefix],
        agent,
        AgentKeys.p_suffix,
        lookupval.trim()
      );
    }

    if (line_data.has(AgentKeys.npn)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.p_suffix],
        agent,
        AgentKeys.npn,
        line_data.get(AgentKeys.npn).trim()
      );
    }
    if (line_data.has(AgentKeys.dietary_or_personal_considerations)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.dietary_or_personal_considerations],
        agent,
        AgentKeys.dietary_or_personal_considerations,
        this.domainUtilService.getYesNoValue(line_data.get(AgentKeys.dietary_or_personal_considerations).trim())
      );
    }
    if (line_data.has(AgentKeys.dietary_consideration)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.dietary_consideration],
        agent,
        AgentKeys.dietary_consideration,
        line_data.get(AgentKeys.dietary_consideration).trim()
      );
    }
    if (line_data.has(AgentKeys.dietary_consideration_type)) {
      let lookupval: string = this.getLookupValue(this.dietaryConsiderationTypesLookups, line_data.get(AgentKeys.dietary_consideration_type));

      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.dietary_consideration_type],
        agent,
        AgentKeys.dietary_consideration_type,
        lookupval.trim()
      );
    }
    if (line_data.has(AgentKeys.upline)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.upline],
        agent,
        AgentKeys.upline,
        line_data.get(AgentKeys.upline).trim()
      );
    }
    if (line_data.has(AgentKeys.agencyName)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.agencyName],
        agent,
        AgentKeys.agencyName,
        line_data.get(AgentKeys.agencyName).trim()
      );
    }
    if (line_data.has(AgentKeys.manager_id)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.manager_id],
        agent,
        AgentKeys.manager_id,
        line_data.get(AgentKeys.manager_id).trim()
      );
    }
    if (line_data.has(AgentKeys.awb_site_id)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.awb_site_id],
        agent,
        AgentKeys.awb_site_id,
        line_data.get(AgentKeys.awb_site_id).trim()
      );
    }
    if (line_data.has(AgentKeys.prospect_referred_to)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.prospect_referred_to],
        agent,
        AgentKeys.prospect_referred_to,
        line_data.get(AgentKeys.prospect_referred_to).trim()
      );
    }
    if (line_data.has(AgentKeys.campaigns_user_name)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.campaigns_user_name],
        agent,
        AgentKeys.campaigns_user_name,
        line_data.get(AgentKeys.campaigns_user_name).trim()
      );
    }
    if (line_data.has(AgentKeys.campaigns_address)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.campaigns_address],
        agent,
        AgentKeys.campaigns_address,
        line_data.get(AgentKeys.campaigns_address).trim()
      );
    }
    if (line_data.has(AgentKeys.race)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.race],
        agent,
        AgentKeys.race,
        line_data.get(AgentKeys.race).trim()
      );
    }
    if (line_data.has(AgentKeys.ethnicity)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.ethnicity],
        agent,
        AgentKeys.ethnicity,
        line_data.get(AgentKeys.ethnicity).trim()
      );
    }
    if (line_data.has(AgentKeys.gender)) {
      let lookupval: string = this.getLookupValue(this.gendersLookups, line_data.get(AgentKeys.gender));

      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.gender],
        agent,
        AgentKeys.gender,
        lookupval.trim()
      );
    }
    if (line_data.has(AgentKeys.primary_language)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.primary_language],
        agent,
        AgentKeys.primary_language,
        line_data.get(AgentKeys.primary_language).trim()
      );
    }
    if (line_data.has(AgentKeys.secondary_language)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.secondary_language],
        agent,
        AgentKeys.secondary_language,
        line_data.get(AgentKeys.secondary_language).trim()
      );
    }
    if (line_data.has(AgentKeys.hobbies)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.hobbies],
        agent,
        AgentKeys.hobbies,
        line_data.get(AgentKeys.hobbies).trim()
      );
    }
    if (line_data.has(AgentKeys.p_tshirt_size)) {
      let lookupval: string = this.getLookupValue(this.tshirtSizesLookup, line_data.get(AgentKeys.p_tshirt_size));
      
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.p_tshirt_size],
        agent,
        AgentKeys.p_tshirt_size,
        lookupval.trim()
      );
    }
    if (line_data.has(AgentKeys.p_tshirt_size_other)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.p_tshirt_size_other],
        agent,
        AgentKeys.p_tshirt_size_other,
        line_data.get(AgentKeys.p_tshirt_size_other).trim()
      );
    }
    if (line_data.has(AgentKeys.unisex_tshirt_size)) {
      let lookupval: string = this.getLookupValue(this.tshirtSizesLookup, line_data.get(AgentKeys.unisex_tshirt_size));

      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.unisex_tshirt_size],
        agent,
        AgentKeys.unisex_tshirt_size,
        lookupval.trim()
      );
    }
    if (line_data.has(AgentKeys.unisex_tshirt_size_other)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.unisex_tshirt_size_other],
        agent,
        AgentKeys.unisex_tshirt_size_other,
        line_data.get(AgentKeys.unisex_tshirt_size_other).trim()
      );
    }
    if (line_data.has(AgentKeys.favorite_destination)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.favorite_destination],
        agent,
        AgentKeys.favorite_destination,
        line_data.get(AgentKeys.favorite_destination).trim()
      );
    }
    if (line_data.has(AgentKeys.shoe_size)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.shoe_size],
        agent,
        AgentKeys.shoe_size,
        line_data.get(AgentKeys.shoe_size).trim()
      );
    }

    if (
      line_data.has(AgentKeys.approve_deny_reason) &&
      selectedRuleSet[ImportRuleSetKeys.approve_deny_reason].valueOf() == 'ADD_TO_LIST'
    ) {
      let approve_deny_reason: ApproveDenyReason = { ...new ApproveDenyReason() };
      approve_deny_reason.created_by = updatedBy;
      approve_deny_reason.created_date = new Date();
      approve_deny_reason.visibilityLevel = ApproveDenyReasonVisibilityLevel.AllianceGroupLevel;
      approve_deny_reason.isDeleted = false;
      approve_deny_reason.activity = line_data.get(AgentKeys.approve_deny_reason).trim();

      this.approveDenyReasonService.create(agent[BaseModelKeys.dbId], approve_deny_reason, true);
    }
    if (
      line_data.has(AgentKeys.agency_approve_deny_reason) &&
      selectedRuleSet[ImportRuleSetKeys.agency_approve_deny_reason].valueOf() == 'ADD_TO_LIST'
    ) {
      let approve_deny_reason: ApproveDenyReason = { ...new ApproveDenyReason() };
      approve_deny_reason.created_by = updatedBy;
      approve_deny_reason.created_date = new Date();
      approve_deny_reason.visibilityLevel = ApproveDenyReasonVisibilityLevel.AgencyLevel;
      approve_deny_reason.isDeleted = false;
      approve_deny_reason.activity = line_data.get(AgentKeys.agency_approve_deny_reason).trim();

      this.approveDenyReasonService.create(agent[BaseModelKeys.dbId], approve_deny_reason, true);
    }

    if (line_data.has(AgentKeys.certifications)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.certifications],
        agent,
        AgentKeys.certifications,
        line_data.get(AgentKeys.certifications).trim()
      );
    }
    if (line_data.has(AgentKeys.prospect_wrap_up_notes)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.prospect_wrap_up_notes],
        agent,
        AgentKeys.prospect_wrap_up_notes,
        line_data.get(AgentKeys.prospect_wrap_up_notes).trim()
      );
    }

    if (line_data.has(AgentKeys.p_strategic_agent)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.p_strategic_agent],
        agent,
        AgentKeys.p_strategic_agent,
        this.domainUtilService.getBoolean(line_data.get(AgentKeys.p_strategic_agent).trim())
      );
    }
    if (line_data.has(AgentKeys.alliance_group_employee)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.alliance_group_employee],
        agent,
        AgentKeys.alliance_group_employee,
        this.domainUtilService.getBoolean(line_data.get(AgentKeys.alliance_group_employee).trim())
      );
    }
    if (line_data.has(AgentKeys.is_manager)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.is_manager],
        agent,
        AgentKeys.is_manager,
        this.domainUtilService.getBoolean(line_data.get(AgentKeys.is_manager).trim())
      );
    }
    if (line_data.has(AgentKeys.is_acb_user)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.is_acb_user],
        agent,
        AgentKeys.is_acb_user,
        this.domainUtilService.getBoolean(line_data.get(AgentKeys.is_acb_user).trim())
      );
    }
    if (line_data.has(AgentKeys.is_awb_user)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.is_awb_user],
        agent,
        AgentKeys.is_awb_user,
        this.domainUtilService.getBoolean(line_data.get(AgentKeys.is_awb_user).trim())
      );
    }
    if (line_data.has(AgentKeys.christmas_card)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.christmas_card],
        agent,
        AgentKeys.christmas_card,
        this.domainUtilService.getBoolean(line_data.get(AgentKeys.christmas_card).trim())
      );
    }

    if (line_data.has(AgentKeys.prospect_referred_to_date)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.prospect_referred_to_date],
        agent,
        AgentKeys.prospect_referred_to_date,
        new Date(line_data.get(AgentKeys.prospect_referred_to_date).trim())
      );
    }
    if (line_data.has(AgentKeys.campaigns_user_since)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.campaigns_user_since],
        agent,
        AgentKeys.campaigns_user_since,
        new Date(line_data.get(AgentKeys.campaigns_user_since).trim())
      );
    }
    if (line_data.has(AgentKeys.dob)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.dob],
        agent,
        AgentKeys.dob,
        new Date(line_data.get(AgentKeys.dob).trim())
      );
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

  createOrUpdateAssociations(agents: Agent[], 
    guest_data: Map<string, string>[], 
    selectedRuleSet: ImportRuleSet, 
    messages: string[], 
    id_key: string) {
    
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
    conferenceRegistrationPolicy: string
  ): Promise<Registrant>[] {

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

      let unique_id = selectedConference.event_id.toLowerCase()+"_"+invitee_guest.toLowerCase()+"-"+invitee_email.toLowerCase();
      
      let invitee: Registrant;

      let qp: QueryParam[] = [];
      qp.push(new QueryParam('unique_id', WhereFilterOperandKeys.equal, unique_id));

      let p = this.registrantsService.getAllByValue(qp).then(async (invitees) => {
        if (invitees.length == 0) {
          invitee = { ...new Registrant() };

          invitee.unique_id = unique_id;
        } else if (invitees.length == 1) {
          invitee = invitees[0];

          if (conferenceRegistrationPolicy == this.REGISTRATION_POLICY_REPLACE) {
            invitee = { ...new Registrant() };
            this.registrantsService.delete(invitees[0][BaseModelKeys.dbId]);

            await this.registrantsService.getAllByValue([new QueryParam('invitee_email', WhereFilterOperandKeys.equal, invitee_email)]).then(guests => {
              guests.forEach(async guest => {
                await this.registrantsService.delete(guest[BaseModelKeys.dbId]);  
              })              
            })
          }
        } else {
          console.log('Found too many registrants matching', qp);

          return null;
        }

        invitee.invitee_guest = invitee_guest;
        invitee.invitee_email = invitee_email;

        invitee.registration_source = 'Conference Import';
        invitee.event_id = selectedConference.event_id;

        if(invitee_map.has('invitee_status')){
            if(invitee_map.get('invitee_status') == 'Approved'){
              invitee.approved = true;
            } else {
              invitee.approved = false;
            }
          
            invitee.approved_by = createdBy;
            invitee.approved_date = new Date();
        }

        if (invitee_map.has('invitee_email_type')) {
          invitee.invitee_email_type = invitee_map.get('invitee_email_type');
        }

        if (invitee_map.has('created_at')) {
          invitee.created_at = new Date(invitee_map.get('created_at'));
        }

        if (invitee_map.has('updated_at')) {
          invitee.updated_at = new Date(invitee_map.get('updated_at'));
        }

        if (invitee_map.has('registered_at')) {
          invitee.registered_at = new Date(invitee_map.get('registered_at'));
        }

        invitee.last_eval_date = new Date();

        if (invitee_map.has('invitee_status')) {
          invitee.invitee_status = invitee_map.get('invitee_status');
        }

        if (invitee_map.has('registration_status')) {
          invitee.registration_status = invitee_map.get('registration_status');
        }

        if (invitee_map.has('registration_type')) {
          invitee.registration_type = invitee_map.get('registration_type');
        }

        if (invitee_map.has('qualified_as')) {
          invitee.qualified_as = invitee_map.get('qualified_as');
        }

        if (invitee_map.has('award_name')) {
          invitee.award_name = invitee_map.get('award_name');
        }

        if (invitee_map.has('first_time_attendee')) {
          invitee.first_time_attendee = invitee_map.get('first_time_attendee');
        }

        if (invitee_map.has('guest_type')) {
          invitee.guest_type = invitee_map.get('guest_type');
        }

        if (invitee_map.has('child_or_adult')) {
          invitee.child_or_adult = invitee_map.get('child_or_adult');
        }

        if (invitee_map.has('group_id')) {
          invitee.group_id = invitee_map.get('group_id');
        }

        if (invitee_map.has('cc_email')) {
          invitee.cc_email = invitee_map.get('cc_email');
        }

        if (invitee_map.has('rsvp')) {
          invitee.rsvp = invitee_map.get('rsvp');
        }

        if (invitee_map.has('hotel')) {
          invitee.hotel = invitee_map.get('hotel');
        }

        if (invitee_map.has('room_type')) {
          invitee.room_type = invitee_map.get('room_type');
        }

        if (invitee_map.has('alternate_date_request')) {
          invitee.alternate_date_request = invitee_map.get('alternate_date_request');
        }

        if (invitee_map.has('requested_arrival')) {
          invitee.requested_arrival = new Date(invitee_map.get('requested_arrival'));
        }

        if (invitee_map.has('requested_departure')) {
          invitee.requested_departure = new Date(invitee_map.get('requested_departure'));
        }

        if (invitee_map.has('bed_preference')) {
          invitee.bed_preference = invitee_map.get('bed_preference');
        }

        if (invitee_map.has('arrival_date')) {
          invitee.arrival_date = new Date(invitee_map.get('arrival_date'));
        }

        if (invitee_map.has('departure_date')) {
          invitee.departure_date = new Date(invitee_map.get('departure_date'));
        }

        if (invitee_map.has('total_charge')) {
          invitee.total_charge = Number(invitee_map.get('total_charge'));
        }

        if (invitee_map.has('balance_due')) {
          invitee.balance_due = Number(invitee_map.get('balance_due'));
        }

        if (invitee_map.has('payment_method')) {
          invitee.payment_method = invitee_map.get('payment_method');
        }

        if (invitee_map.has('relationship')) {
          let value = invitee_map.get("relationship").trim();
          invitee.relationship = this.getLookupValue(this.relationshipsLookup, value);
        }

        let agent: LegacyAgent = agents.find((agent) => agent.p_email == invitee_map.get('invitee_email').toLowerCase().trim());

        if (!agent) {
          console.log("Can't create Registration. No agent found for " + invitee_map.get('invitee_email').toLowerCase().trim());
          return null;
        }

        //if agent has addresses
        if(agent.addresses?.length > 0){
          let primary_billing_address: Address = agent.addresses.find(address => address.is_primary_billing == true);
          
          if(primary_billing_address){
            invitee.primary_billing_address = {... primary_billing_address};
          }
          
          let primary_shipping_address: Address = agent.addresses.find(address => address.is_primary_shipping== true);

          if(primary_shipping_address){
            invitee.primary_shipping_address = {... primary_shipping_address};
          }          
        }

        //if agent has email addresses
        if(agent.email_addresses.length > 0){
          let primary_email: EmailAddress = agent.email_addresses.find(email => email.is_login == true);
        
          if (primary_email) {
            invitee.primary_email_address = primary_email;
          }

          let secondary_email: EmailAddress[] = agent.email_addresses.filter(email => email.is_login == false);
        
          if (secondary_email?.length > 0) {
            invitee.secondary_email_address = secondary_email[0];
          }
        }

        //if agent has phone numbers
        if(agent.phone_numbers?.length > 0){
          let mobile_phone_numbers: PhoneNumber = agent.phone_numbers.find(number => number.phone_type == PhoneNumberType.Mobile);

          if (mobile_phone_numbers) {
            invitee.mobile_phone = mobile_phone_numbers;
          }
          
          let secondary_phone: PhoneNumber[] = agent.phone_numbers.filter(number =>  number.number != mobile_phone_numbers.number)

          if(secondary_phone?.length){
            invitee.secondary_phone = secondary_phone[0];
          }
        }        

        if (invitee_map.has('prefix')) {
          let value = invitee_map.get("prefix").trim();
          invitee.prefix = this.getLookupValue(this.prefixesLookups, value);
        } else if (agent.p_prefix){
          invitee.prefix = agent.p_prefix;
        }
        
        if (invitee_map.has('first_name')) {
          invitee.first_name = invitee_map.get('first_name');
        } else if (agent.p_agent_first_name){
          invitee.first_name = agent.p_agent_first_name;
        }

        if (invitee_map.has('middle_name')) {
          invitee.middle_name = invitee_map.get('middle_name');
        } else if (agent.p_agent_middle_name){
          invitee.middle_name = agent.p_agent_middle_name;
        }

        if (invitee_map.has('last_name')) {
          invitee.last_name = invitee_map.get('last_name');
        } else if (agent.p_agent_last_name){
          invitee.last_name = agent.p_agent_last_name;
        }

        if (invitee_map.has('suffix')) {
          let value = invitee_map.get("suffix").trim();
          invitee.suffix = this.getLookupValue(this.suffixesLookup, value);
        } else if (agent.p_suffix){
          invitee.suffix = agent.p_suffix;
        }

        if (invitee_map.has('nick_name')) {
          invitee.nick_name = invitee_map.get('nick_name');
        } else if (agent.p_nick_name){
          invitee.nick_name = agent.p_nick_name;
        }

        if (invitee_map.has('nick_last_name')) {
          invitee.nick_last_name = invitee_map.get('nick_last_name');
        } else if (agent.p_nick_last_name){
          invitee.nick_last_name = agent.p_nick_last_name;
        }

        if (invitee_map.has('mga_id')) {
          invitee.mga_id = invitee_map.get('mga_id');
        } else if (agent.p_mga_id){
          invitee.mga_id = agent.p_mga_id;
        }

        if (invitee_map.has('agency_id')) {
          invitee.agency_id = invitee_map.get('agency_id');
        } else if (agent.p_agency_id){
          invitee.agency_id = agent.p_agency_id;
        }
        
        if (invitee_map.has('agent_id')) {
          invitee.agent_id = invitee_map.get('agent_id');
        } else if (agent.p_agent_id){
          invitee.agent_id = agent.p_agent_id;
        }

        if (invitee_map.has('upline')) {
          invitee.upline = invitee_map.get('upline');
        } else if (agent.upline){
          invitee.upline = agent.upline;
        }

        if (invitee_map.has('dietary_or_personal_considerations')) {
          invitee.dietary_or_personal_considerations = invitee_map.get('dietary_or_personal_considerations');
        } else if (agent.dietary_or_personal_considerations){
          invitee.dietary_or_personal_considerations = this.domainUtilService.getYesNoValue(agent.dietary_or_personal_considerations.trim());
        }

        if (invitee_map.has('dietary_consideration_type')) {
          let value = invitee_map.get("dietary_consideration_type").trim();
          invitee.dietary_consideration_type = this.getLookupValue(this.dietaryConsiderationTypesLookups, value);
        } else if (agent.dietary_consideration_type){
          invitee.dietary_consideration_type = agent.dietary_consideration_type
        }

        if (invitee_map.has('dietary_consideration')) {
          invitee.dietary_consideration = invitee_map.get('dietary_consideration');
        } else if (agent.dietary_consideration){
          invitee.dietary_consideration = agent.dietary_consideration
        }

        if (invitee_map.has('favorite_destination')) {
          invitee.favorite_destination = invitee_map.get('favorite_destination');
        } else if (agent.favorite_destination){
          invitee.favorite_destination = agent.favorite_destination;
        }

        if (invitee_map.has('unisex_tshirt_size')) {
          let value = invitee_map.get("unisex_tshirt_size").trim();
          invitee.unisex_tshirt_size = this.getLookupValue(this.tshirtSizesLookup, value);
        } else if (agent.unisex_tshirt_size){
          invitee.unisex_tshirt_size = agent.unisex_tshirt_size;
        }

        if (invitee_map.has('unisex_tshirt_size_other')) {
          invitee.unisex_tshirt_size_other = invitee_map.get('unisex_tshirt_size_other');
        } else if (agent.unisex_tshirt_size_other){
          invitee.unisex_tshirt_size_other = agent.unisex_tshirt_size_other;
        }

        if (invitee_map.has('tshirt_size')) {
          let value = invitee_map.get("tshirt_size").trim();
          invitee.tshirt_size = this.getLookupValue(this.tshirtSizesLookup, value);
        } else if (agent.p_tshirt_size){
          invitee.tshirt_size = agent.p_tshirt_size;
        }

        if (invitee_map.has('tshirt_size_other')) {
          invitee.tshirt_size_other = invitee_map.get('tshirt_size_other');
        } else if (agent.p_tshirt_size_other){
          invitee.tshirt_size_other = agent.p_tshirt_size_other;
        }

        if (invitee_map.has('shoe_size')) {
          invitee.shoe_size = invitee_map.get("shoe_size")
        } else if (agent.shoe_size){
          invitee.shoe_size = agent.shoe_size;
        }

        if (invitee_map.has('gender')) {
          let value = invitee_map.get("gender").trim();
          invitee.gender = this.getLookupValue(this.gendersLookups, value);
        } else if (agent.gender){
          invitee.gender = agent.gender;
        }

        if (invitee_map.has('dob')) {
          invitee.dob = invitee_map.get('dob').trim();
        } else if (agent.dob){
          invitee.dob = agent.dob;
        }

        if (invitee_map.has('headshot_link')) {
          invitee.headshot_link = invitee_map.get('headshot_link');
        } else if (agent.p_headshot_link){
          invitee.headshot_link = agent.p_headshot_link;
        }

        //custom fields
        selectedConference.registrantFields.forEach(field => {
          if(invitee_map.has(field.name)){
            invitee[field.name] = invitee_map.get(field.name);
          }
        })

        //get emergency contact
        let contacts = await this.agentAssociationsService.getAll(agent[BaseModelKeys.dbId]);
        
        if (contacts.length > 0) {
          let emergency_contacts: Association[] = contacts.filter(contact => contact.is_emergency_contact == true);

          let selected_emergency_contact: Association = emergency_contacts.find(contact => 
            contact[AssociationKeys.firsName] == invitee_map.get('association.1.first_name') 
            && contact[AssociationKeys.lastName] == invitee_map.get('association.1.las_name')
          )

          if(selected_emergency_contact){
            invitee.emergency_contact = selected_emergency_contact
          } else {
            if(emergency_contacts.length > 0){
              invitee.emergency_contact = emergency_contacts[0]  
            } else {
              invitee.emergency_contact = contacts[0];
            }
          }
        }
            
        //save registrant
        if(invitee[BaseModelKeys.dbId]){
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
    importMapping: ImportMapping[],
    parents: Registrant[]
  ): Promise<Registrant>[] {

    let promises: Promise<Registrant>[] = [];

    invitees_map.forEach((invitee_map) => {
      let guest_map: Map<string, string> = new Map<string, string>();

      let invitee_email = invitee_map.get('invitee_email').toLowerCase();
      let invitee_guest = 'Guest';

      //filter invitee map to create map with only guest fields
      invitee_map.forEach((value , key) => {
        if(key.startsWith("guest")){
          guest_map.set(key, value);
        }
      })

      //split up into different guests
      let guests: Map<string, Map<string, string>> = new Map<string, Map<string, string>>();

      guest_map.forEach((v,k) => {
        let key_split: string[] = k.split(".");

        let guest_vals: Map<string, string>

        if(guests.has(key_split[0] + "." + key_split[1])){
          guest_vals = guests.get(key_split[0] + "." + key_split[1]);
        } else {
          guest_vals = new Map<string, string>();
        }

        if(k.startsWith(key_split[0] + "." + key_split[1])){
          if(key_split.length == 4){
            guest_vals.set(key_split[key_split.length - 2] + "." + key_split[key_split.length - 1], v);
          } else {
            guest_vals.set(key_split[key_split.length - 1], v);
          }

          guests.set(key_split[0] + "." + key_split[1], guest_vals)
        }

      })

      //create registrant for each guest
      guests.forEach(guest_map => {
        if(guest_map.has('first_name') && guest_map.has('last_name')){
          //create unique id for quest for future searches
          let unique_id = selectedConference.event_id.toLowerCase()+"_"+invitee_guest.toLowerCase()+"-"+
          invitee_email.toLowerCase()+guest_map.get('first_name').toLowerCase()+"_"+guest_map.get('last_name').toLowerCase();

          let qp: QueryParam[] = [];
          qp.push(new QueryParam('unique_id', WhereFilterOperandKeys.equal, unique_id));
    
          let promise = this.registrantsService.getAllByValue(qp).then((registrants) => {
            if(invitee_email == 'jeff.synergyfinancialpartners@gmail.com'){
              console.log('found')
            }

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
              console.log('Found too many registrants matching guest', qp)
    
              return null;
            }

            guest.invitee_guest = invitee_guest;
            guest.invitee_email = invitee_email;

            guest.registration_source = 'Conference Import';
            guest.event_id = selectedConference.event_id;
    
            let parentInvitee: Registrant = parents.find(registrant => registrant.invitee_email == invitee_email);

            //data from parent record
            if(parentInvitee){
              if(parentInvitee.invitee_status == 'Approved'){
                guest.approved = true;
              } else {
                guest.approved = false;
              }
      
              guest.approved_by = createdBy;
              guest.approved_date = new Date();
            }
            
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
    
            if (guest_map.has("first_name")) {
              guest.first_name = guest_map.get("first_name");
            }
    
            if (guest_map.has('last_name')) {
              guest.last_name = guest_map.get("last_name");
            }
    
            if (guest_map.has('primary_email_address.address')) {
              let address: EmailAddress = { ...new EmailAddress() };
              address.address = guest_map.get("primary_email_address.address");
              guest.primary_email_address = address;
            }
    
            if (guest_map.has('relationship')) {
              let value = guest_map.get("relationship")
              guest.relationship = this.getLookupValue(this.relationshipsLookup, value)
            }
    
            if (guest_map.has('nick_name')) {
              guest.nick_name = guest_map.get("nick_name");
            }
    
            if (guest_map.has('nick_last_name')) {
              guest.nick_last_name = guest_map.get("nick_last_name");
            }
    
            if (guest_map.has('dietary_or_personal_considerations')) {
              guest.dietary_or_personal_considerations = this.domainUtilService.getYesNoValue(
                guest_map.get("dietary_or_personal_considerations").trim()
              );
            }
    
            if (guest_map.has('dietary_consideration_type')) {
              let value = guest_map.get("dietary_consideration_type");
              guest.dietary_consideration_type = this.getLookupValue(this.dietaryConsiderationTypesLookups, value);
            }
    
            if (guest_map.has('dietary_consideration')) {
              guest.dietary_consideration = guest_map.get("dietary_consideration");
            }
    
            if (guest_map.has('tshirt_size')) {
              let value = guest_map.get("tshirt_size");
              guest.tshirt_size = this.getLookupValue(this.tshirtSizesLookup, value);
            }
    
            if (guest_map.has('tshirt_size_other')) {
              guest.tshirt_size_other = guest_map.get("tshirt_size_other");
            }

            if (guest_map.has('unisex_tshirt_size')) {
              let value = guest_map.get("unisex_tshirt_size");
              guest.unisex_tshirt_size = this.getLookupValue(this.tshirtSizesLookup, value);
            }
    
            if (guest_map.has('unisex_tshirt_size_other')) {
              guest.unisex_tshirt_size_other = guest_map.get("unisex_tshirt_size_other");
            }

            if (guest_map.has('child_or_adult')) {
              guest.child_or_adult = guest_map.get("child_or_adult");
            }

            if (guest_map.has('gender')) {
              let value = guest_map.get("gender");
              guest.gender = this.getLookupValue(this.gendersLookups, value);
            }

            if (guest_map.has('dob')) {
              guest.dob = guest_map.get("dob");
            }
    
            selectedConference.registrantFields.forEach(field => {
              if(guest_map.has(field.name)){
                guest[field.name] = guest_map.has(field.name);
              }
            })
    
            if (guest[BaseModelKeys.dbId]) {
              this.messages.unshift('Registration Updated for ' + guest.first_name + ' ' + guest.last_name);
              this.registrantsService.update(guest);
            } else {
              this.messages.unshift('Registration Created for ' + guest.first_name + ' ' + guest.last_name);
              this.registrantsService.create(guest);
            }
    
            return guest;
        
          })
          promises.push(promise);        
        }


      })

      
    })

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

  getLookupValue(lookups: ActiveLookup[],  matchVal: string): string{
    let lookup: ActiveLookup  = lookups.find(val => val.description == matchVal);

    if(lookup){
      return lookup.dbId
    } else {
      console.log("Couldn't find lookup value for ", matchVal)
      return matchVal
    }
  }
}
