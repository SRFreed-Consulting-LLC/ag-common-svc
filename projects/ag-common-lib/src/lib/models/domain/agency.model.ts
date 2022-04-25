import { AGENCY_TYPE } from "../../lists/agency-type.enum";
import { Agent } from "./agent.model";
import { BaseModel } from "../base.model";

export class Agency extends BaseModel {
  agency_id: string;
  agency_number: string;
  name: string;
  agentList?: Agent[] = [];
  rmds: string[];
  level_divisor: number;
  starting_multiplier: number;
  agency_type: AGENCY_TYPE;
  mga: Agency;
  contact_first_name: string;
  contact_last_name: string;
  contact_email: string;
  contact_phone: string;
}

