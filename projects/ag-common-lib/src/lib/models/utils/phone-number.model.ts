import { BUSINESS_PERSONAL_TYPE } from "../../lists/business_personal_type.enum";

export class PhoneNumber{
    id?: string;
    number?: string;
    phone_type?: BUSINESS_PERSONAL_TYPE;
    is_primary?: boolean = false;
}