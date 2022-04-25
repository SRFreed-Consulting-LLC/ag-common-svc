import { Activity } from "../engagement/activity/activity.model";
import { BaseModel } from "../base.model";

export class CrmRecord extends BaseModel {
    owner_id: string;
    activities: Activity[] = [];
}