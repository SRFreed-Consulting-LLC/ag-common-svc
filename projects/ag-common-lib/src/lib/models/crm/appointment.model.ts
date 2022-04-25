import { BaseModel } from "../base.model";
import { ACTIVITY_TYPE } from "../engagement/types/activity-types.enum";
import { TARGET_TYPE } from "../engagement/types/target-types.enum";

export class Appointment extends BaseModel {
    text: string;
    startDate: Date;
    endDate: Date;
    allDay?: boolean;
    owner: string;
    target: string;
    target_type: TARGET_TYPE;
    activity_type: ACTIVITY_TYPE
  }