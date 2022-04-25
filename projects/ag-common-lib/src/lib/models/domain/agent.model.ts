import { Timestamp } from "firebase/firestore";
import { BaseModel } from "../base.model";
import { AGENT_STATUS } from "../../lists/agent-status.enum";
import { AGENT_TYPE } from "../../lists/agent-type.enum";
import { PROSPECT_DISPOSITION } from "../../lists/prospect-disposition.enum";
import { PROSPECT_PRIORITY } from "../../lists/prospect-priority.enum";
import { PROSPECT_STATUS } from "../../lists/prospect-status.enum";
import { Role } from "../../lists/roles.enum";
import { EmailAddress } from "../utils/email-address.model";
import { Address } from "../utils/address.model";
import { Favorite } from "../utils/favorite.model";
import { Goal } from "../utils/goal.model";
import { Social } from "../utils/social.model";
import { Website } from "../utils/website.model";
import { PhoneNumber } from "../utils/phone-number.model";
import { Association } from "../utils/association.model";
import { AgentCarrier } from "../utils/agent-carrier.model";
import { StateLicense } from "../utils/state-license.model";

export class Agent extends BaseModel{
  p_agent_name?: string;
  p_agent_id?: string;
  p_agency_name?: string;
  p_agency_id?: string;
  p_mga_id?: string;
  title?: string;
  p_prefix?: string;
  p_agent_first_name?: string;
  p_agent_middle_name?: string;
  p_agent_last_name?: string;
  p_email?: string;
  conference_email?: string;
  lsw_email?: string;
  p_mobile_phone?: string;
  p_work_phone?: string;
  rmd_1?: string;
  rmd_2?: string;
  npn?: string;
  p_nlg_agent_number?: string;
  p_gpm_agent_number?: string;
  p_ameritas_agent_number?: string;
  p_anico_agent_number?: string;
  p_address_1?: string;
  p_address_2?: string;
  p_city?: string;
  p_state?: string;
  p_zip?: string;
  p_country?: string;
  p_county?: string;
  p_suffix?: string;
  p_nick_name?: string;
  p_nick_last_name?: string;
  p_emergency_contact?: string;
  p_emergency_contact_relationship?: string;
  p_emergency_contact_phone?: string;
  p_emergency_contact_email?: string;
  p_dietary_consideration?: string;
  p_dietary_consideration_other?: string;
  p_dietary_or_personal_considerations?: string;
  p_tshirt_size?: string;
  p_headshot_link?: string;
  p_dob?: string;
  p_gender?: string;
  p_green_light_reg?: boolean = false;	
  p_no_communication?: boolean = false;
  agency_restricted?: boolean = false;
  p_strategic_agent?: boolean = false;
  p_registered_user?: boolean = false;
  alliance_group_employee?: boolean = false;
  upline?: string;

  uid?: string;
  emailVerified?: boolean = false;
  registrationDate?: number;
  approvalDate?: number;
  approvedBy?: string;
  role?: Role[] = [Role.AGENT];
  agent_type?: AGENT_TYPE = AGENT_TYPE.GENERAL_AGENT;
  billing_shipping_same?: boolean = false; 
  shipping_address?: Address = {...new Address()};
  billing_address?: Address = {...new Address()};
  agencyName?: string;
  personal_goals?: Goal[] = [];
  conference_goals?: Goal[] = [];
  manager_goals?: Goal[] = [];

  registration_source?: string;
  first_login_date?: Date;
  last_login_date?: Date;
  login_count?: number = 0;
  logged_in?: boolean = false;
  is_manager?: boolean = false;
  is_rmd?: boolean = false;
  is_credited?: boolean = false;
  manager_id?: string;
  approve_deny_reason?: string;

  showSplashScreen?: boolean = false;

  favorites?: Favorite[] = [];

  is_acb_user?: boolean = false;
  is_awb_user?: boolean = false;
  awb_site_id?: string;

  certifications?: string;

  agent_status?: AGENT_STATUS;
  prospect_status?: PROSPECT_STATUS;

  prospect_priority?: PROSPECT_PRIORITY;
  prospect_disposition?: PROSPECT_DISPOSITION;
  prospect_referred_to?: string;
  prospect_referred_to_date?: Timestamp;
  prospect_wrap_up_notes? : string;

  addresses?: Address[] = [];
  socials?: Social[] = [];
  websites?: Website[] = [];
  email_addresses?: EmailAddress[] = [];

  phone_numbers?: PhoneNumber[] = [];

  campaigns_user_name?: string;
  campaigns_user_since?: any;
  campaigns_address?: string;

  race?: string;
  ethnicity?: string;
  gender?: string;
  primary_language?: string;
  secondary_language?: string;
  hobbies?: string;
  unisex_tshirt_size?: string;
  favorite_destination?: string;
  shoe_size?: string;
  associations?: Association[] = [];
  agent_carriers?: AgentCarrier[] = [];
  state_licenses?: StateLicense[] = [];
}



