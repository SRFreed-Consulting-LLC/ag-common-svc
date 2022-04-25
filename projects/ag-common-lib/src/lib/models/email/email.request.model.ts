import { BaseModel } from "../base.model";
import { EMAIL_STATUS } from "../engagement/status/status-email.enum";
import { ACTIVITY_TYPE } from "../engagement/types/activity-types.enum";
import { TARGET_TYPE } from "../engagement/types/target-types.enum";
import { EmailConnection } from "./email-connection.model";
import { EmailPerson } from "./email-person.model";
import { EmailTemplate } from "./email-template.model";

export class EmailRequest extends BaseModel{
    activity_type: ACTIVITY_TYPE;
    cc: EmailPerson[] = [];
    bcc?: EmailPerson[] = [];
    from?: EmailConnection;
    sender_id: string;
    sent_date?: string;
    status: EMAIL_STATUS;
    template: EmailTemplate;
    target_type: TARGET_TYPE;
    target: string;
    to: EmailPerson[] = [];    
}