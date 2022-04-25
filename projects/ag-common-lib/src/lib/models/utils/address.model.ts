import { BUSINESS_PERSONAL_TYPE } from "../../lists/business_personal_type.enum";

export class Address {
    id?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    county?: string;
    address_type?: BUSINESS_PERSONAL_TYPE;
    is_primary_shipping?: boolean = false;
    is_primary_billing?: boolean = false;
}