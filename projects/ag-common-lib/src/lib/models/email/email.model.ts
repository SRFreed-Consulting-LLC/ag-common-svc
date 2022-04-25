import { Timestamp } from "@firebase/firestore";
import { BaseModel } from "../base.model";
import { Comment } from '../crm/comment.model';
import { TARGET_TYPE } from "../engagement/types/target-types.enum";
import { ACTIVITY_TYPE } from "../engagement/types/activity-types.enum";


export class Email extends BaseModel {
    from: string;
    to: string
    cc: string;
    bcc: string;
    subject: string;
    body: string;
    sender_id: string;
    sent_date: Timestamp;
    target: string;
    target_type: TARGET_TYPE;
    activity_type: ACTIVITY_TYPE;
    error: string;
    accepted: number;
    rejected: number;
    viewed: number;
    comments: Comment[] = [];
}
