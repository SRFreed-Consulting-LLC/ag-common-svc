import { Injectable } from '@angular/core';
import {
  ImportFieldRule,
  ImportListRule,
  ImportRuleSet,
  ImportRuleSetKeys,
  PrimaryFieldRule
} from 'ag-common-lib/lib/models/import-rules/import-ruleset-model';
import {
  Address,
  Agency,
  Agent,
  AgentKeys,
  AGENT_STATUS,
  AGENT_TYPE,
  ApproveDenyReason,
  ApproveDenyReasonVisibilityLevel,
  BaseModelKeys,
  Goal,
  PhoneNumber,
  PROSPECT_DISPOSITION,
  PROSPECT_PRIORITY,
  PROSPECT_STATUS,
  Registrant,
  Role,
} from 'ag-common-lib/public-api';
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

@Injectable({
  providedIn: 'root'
})
export class DomainService {
  PRIMARY_EMAIL_IDENTIFIER = 'email_addresses.1.address';

  messages: string[];

  constructor(
    private agentService: AgentService,
    private agentAssociationsService: AgentAssociationsService,
    private approveDenyReasonService: AgentApproveDenyReasonsService,
    private domainAddressService: DomainAddressService,
    private domainEmailService: DomainEmailService,
    private domainPhoneNumberService: DomainPhoneNumberService,
    private domainWebsiteService: DomainWebsiteService,
    private domainSocialsService: DomainSocialsService,
    private domainAssociationsService: DomainAssociationsService,
    private domainUtilService: DomainUtilService
  ) {}


  //************************************************************* */
  //  Method to import Agents from import file
  //
  //  agents: Map<string, string>[]: Map of key value
  //          pairs for AGent Record
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
  createAgentsArray(agents: Map<string, string>[], agencies: Agency[], selectedRuleSet: ImportRuleSet, createdBy: string, messages: string[]): Promise<Agent[]> {
    this.messages = messages;

    const promises: Promise<Agent>[] = [];

    agents.forEach((data) => {
      let agent_name = data.get('p_agent_first_name') + ' ' + data.get('p_agent_last_name') + '(' + this.PRIMARY_EMAIL_IDENTIFIER + ')'

      
      const promise: Promise<Agent> = this.agentService.getAgentByEmail(data.get(this.PRIMARY_EMAIL_IDENTIFIER).toLowerCase().trim())
        .then((response) => {
          if (!response) {
            messages.push(agent_name + ' does not currently exist and will be created.');
            return this.createAgent(data, createdBy, agencies);
          } else {
            messages.push(agent_name + ' exists and will be updated.');
            return this.updateAgent(data, response, selectedRuleSet, agencies, createdBy);
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
      agent[AgentKeys.p_prefix] = line_data.get(AgentKeys.p_prefix);
    }
    if (line_data.has(AgentKeys.p_suffix)) {
      agent[AgentKeys.p_suffix] = line_data.get(AgentKeys.p_suffix);
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
    if (line_data.has(AgentKeys.christmas_card)) {
      agent[AgentKeys.christmas_card] = this.domainUtilService.getBoolean(line_data.get(AgentKeys.christmas_card));
    }

    if (line_data.has(AgentKeys.p_strategic_agent)) {
      agent[AgentKeys.p_strategic_agent] = this.domainUtilService.getBoolean(line_data.get(AgentKeys.p_strategic_agent));
    }
    if (line_data.has(AgentKeys.alliance_group_employee)) {
      agent[AgentKeys.alliance_group_employee] = this.domainUtilService.getBoolean(line_data.get(AgentKeys.alliance_group_employee));
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
    agent[AgentKeys.agent_type] = AGENT_TYPE.GENERAL_AGENT;
    agent[AgentKeys.is_rmd] = false;
    agent[AgentKeys.is_credited] = false;

    const agentAssociations = await this.domainAssociationsService.extractAssociations(splitVals);

    if (!this.validateAgency(agent, agencies)) {
      return null;
    }

    const agentEmailAddresses = agent[AgentKeys.email_addresses];

    if (!Array.isArray(agentEmailAddresses) || agentEmailAddresses?.length == 0) {
      this.messages.push('No Email Addresses were set for this agent. Not Importing ' + agent[AgentKeys.p_agent_name]);

      return null;
    }

    let loginAddress = agentEmailAddresses.find((email) => email.is_login);

    if (!loginAddress) {
      agentEmailAddresses[0].is_login = true;
      loginAddress = agentEmailAddresses[0];
    }

    agent[AgentKeys.p_email] = loginAddress.address;    

    return this.agentService.create(agent).then((agent) => {
      if (line_data.has(AgentKeys.approve_deny_reason)) {
        let approve_deny_reason: ApproveDenyReason = {... new ApproveDenyReason()};
        approve_deny_reason.created_by = createdBy;
        approve_deny_reason.created_date = new Date();
        approve_deny_reason.visibilityLevel = ApproveDenyReasonVisibilityLevel.AllianceGroupLevel;
        approve_deny_reason.isDeleted = false;
        approve_deny_reason.activity = line_data.get(AgentKeys.approve_deny_reason);
  
        this.approveDenyReasonService.create(agent[BaseModelKeys.dbId], approve_deny_reason, true)
      }

      const promises = agentAssociations.map((association) => {
        return this.agentAssociationsService.create(agent[BaseModelKeys.dbId], association);
      });

      this.messages.push(`Agent ${agent.p_email} was created`);

      return Promise.all(promises).then(() => agent);
    });
  }

  async updateAgent(line_data: Map<string, string>, agent: Agent, selectedRuleSet: ImportRuleSet, agencies: Agency[], updatedBy: string): Promise<Agent> {
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
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.p_prefix],
        agent,
        AgentKeys.p_prefix,
        line_data.get(AgentKeys.p_prefix).trim()
      );
    }
    if (line_data.has(AgentKeys.p_suffix)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.p_prefix],
        agent,
        AgentKeys.p_suffix,
        line_data.get(AgentKeys.p_suffix).trim()
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
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.dietary_consideration_type],
        agent,
        AgentKeys.dietary_consideration_type,
        line_data.get(AgentKeys.dietary_consideration_type).trim()
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
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.gender],
        agent,
        AgentKeys.gender,
        line_data.get(AgentKeys.gender).trim()
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
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.p_tshirt_size],
        agent,
        AgentKeys.p_tshirt_size,
        line_data.get(AgentKeys.p_tshirt_size).trim()
      );
    }
    if (line_data.has(AgentKeys.unisex_tshirt_size)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.unisex_tshirt_size],
        agent,
        AgentKeys.unisex_tshirt_size,
        line_data.get(AgentKeys.unisex_tshirt_size).trim()
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

    if (line_data.has(AgentKeys.agent_status)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.agent_status],
        agent,
        AgentKeys.agent_status,
        AGENT_STATUS[line_data.get(AgentKeys.agent_status).trim()]
      );
    }

    if (line_data.has(AgentKeys.prospect_status)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.prospect_status],
        agent,
        AgentKeys.prospect_status,
        PROSPECT_STATUS[line_data.get(AgentKeys.prospect_status).trim()]
      );
    }

    if (line_data.has(AgentKeys.prospect_priority)) {
      this.domainUtilService.updateField(
        selectedRuleSet[ImportRuleSetKeys.prospect_priority],
        agent,
        AgentKeys.prospect_priority,
        PROSPECT_PRIORITY[line_data.get(AgentKeys.prospect_priority).trim()]
      );
    }

    if (line_data.has(AgentKeys.prospect_disposition)) {
      this.domainUtilService.updateField(
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

    await this.domainAssociationsService.updateAssociations(line_data, agent, selectedRuleSet, this.messages);

    return this.agentService.updateFields(agent[BaseModelKeys.dbId], agent).then((updatedAgent) => {
      this.messages.push(`Agent ${agent.p_email} was updated`);
      return updatedAgent;
    });
  }

  createGuestsArray(agents: Agent[], data: Map<string, string>[]) {
    data.forEach((registrant_data) => {
      let invitees = agents.filter((a) => a.p_email == registrant_data.get('invitee_email'));

      if (invitees.length == 1) {
        // TODO
        // this.updateAssociations(registrant_data, invitees[0], selectedRuleSet, messages);
      }
    });
  }

  createRegistrantArray(registrant_data: Map<string, string>[], selectedConference: string, createdBy: string): Registrant[] {
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
          registrant.dietary_or_personal_considerations = this.domainUtilService.getYesNoValue(
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

        let addresses: Address[] = this.domainAddressService.extractAddresses(data);

        if (addresses[0]) {
          registrant.address = addresses[0];
        }

        let phone_numbers: PhoneNumber[] = this.domainPhoneNumberService.extractPhoneNumbers(data);

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

      this.messages.push('Registration Created for ' + registrant.first_name + ' ' + registrant.last_name);

      retval.push(registrant);
    });

    return retval;
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
}
