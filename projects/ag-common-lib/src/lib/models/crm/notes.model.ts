import { BaseModel } from "../base.model";
import { ACTIVITY_TYPE } from "../engagement/types/activity-types.enum";
import { TARGET_TYPE } from "../engagement/types/target-types.enum";

export class Note extends BaseModel {
    note: string;
    author: string;
    owner: string;
    target: string;
    target_type: TARGET_TYPE;
    activity_type: ACTIVITY_TYPE;
    comments: Comment[] = [];
}

export class Comment extends BaseModel{
    author: string;
    note: string;
}
