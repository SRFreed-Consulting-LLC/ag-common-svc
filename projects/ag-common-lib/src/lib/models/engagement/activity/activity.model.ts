import { Timestamp } from "@firebase/firestore";
import { EmailRequest } from "../../email/email.request.model";
import { ACTIVITY_TYPE } from "../types/activity-types.enum";

export class Activity {
    constructor(activity_type: ACTIVITY_TYPE ){
        this.activity_type = activity_type
        this.created_date = Timestamp.now()
    }
    public created_date: Timestamp;
    public created_by: string;
    public activity_type: ACTIVITY_TYPE;
    public title: string;
    public description: string;
    public notes: string;
    public email: EmailRequest;
    public type_identifier: string;
}