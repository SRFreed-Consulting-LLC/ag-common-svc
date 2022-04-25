import { BaseModel } from "../base.model";
import { Agency } from "./agency.model";

export class Carrier extends BaseModel {
  carrier_color: string;
  carrier_name: string;
  carrier_image: string;
  agencyList?: Agency[] = [];
  contact_first_name: string;
  contact_last_name: string;
  contact_email: string;
  contact_phone: string;
}