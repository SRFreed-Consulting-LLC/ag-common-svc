import { BaseModel } from "../base.model";
import { Address } from "../utils/address.model";
import { RegistrantField } from "./registrant-field.model";

export class Conference extends BaseModel{
    start_date: string;
    end_date: string;
    facility_name: string;
    event_id: string;
    event_name: string;
    event_address: Address;
    event_coordinator_first_name: string;
    event_coordinator_last_name: string;
    event_coordinator_phone: string;
    hotel_name: string;
    hotel_address: Address;
    hotel_coordinator_first_name: string;
    hotel_coordinator_last_name: string;
    hotel_primary_phone: string;
    hotel_room_rate: number;
    hotel_num_rooms_blocked: number
    print_marketing_budget: number;
    food_budget: number;

    registrantFields: RegistrantField[] = [];
}