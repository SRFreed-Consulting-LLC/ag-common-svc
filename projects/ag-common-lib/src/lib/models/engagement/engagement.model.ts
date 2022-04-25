import { BaseModel } from "../base.model";
import { Agent } from "../domain/agent.model";
import { Activity } from "./activity/activity.model";
import { ENGAGEMENT_STATUS } from "./status/status-engagement.enum";
import { CONTACT_TYPE } from "./types/contact-types.enum";

export class Engagement extends BaseModel {
    owner: Agent;
    activities: Activity[] = [];
    contact_type: CONTACT_TYPE;
    contact: any;
    status: ENGAGEMENT_STATUS;
}