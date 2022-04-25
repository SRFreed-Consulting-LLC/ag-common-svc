import { SCOPE } from "../../lists/scope.enum";
import { BaseModel } from "../base.model";
import { EmailConnection } from "../email/email-connection.model";

export class CRMUser extends BaseModel {
    email_address: string;
    emailConnections: EmailConnection[] = [];
    agency_id: string;
    scope: SCOPE;
}