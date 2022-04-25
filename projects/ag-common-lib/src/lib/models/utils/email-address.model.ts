import { BUSINESS_PERSONAL_TYPE } from "../../lists/business_personal_type.enum";

export class EmailAddress {
    id?: string;
    address?: String;
    email_type?: BUSINESS_PERSONAL_TYPE;
    is_primary?: boolean = false;
}