import { BaseModel } from "../base.model";

export class Prospect extends BaseModel {
    assignee: string; //dbid of agent handling prospect
    
    //agency prospect
    agency_name: string;
    num_of_agents: number;
    agency_production: string;

    tags: string;    
    description: string;
    reaching_out_reason: string;
    hear_about_us: string;
    needs_help_with: string;
    bulletin_result: string;	
    search_results: string;
    doi_results: string;
    fluent_in: string;
    states_licensed_in: string[];
    currently_licensed: string;
    prospect_agency_name: string;
    prospect_current_imo: string;
    carriers_contracted_with: string;
    years_in_industry: string;
    agent_production: string;
    product_specialty: string;
    inquiry_received_by: string;
    inquiry_received_date: string;
    inquiry_received_how: string;
    city: string;
    state: string;
}