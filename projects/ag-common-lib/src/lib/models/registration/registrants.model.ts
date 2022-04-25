import { BaseModel } from "../base.model";
import { Agent } from "../domain/agent.model";

export class Registrant extends BaseModel {
    event_id: string;
    agent: Agent;
    registered_date: string;
    approved: boolean = false;
    approved_by: string;
    approved_date: string;
    revoked_by: string;
    revoked_date: string;
}