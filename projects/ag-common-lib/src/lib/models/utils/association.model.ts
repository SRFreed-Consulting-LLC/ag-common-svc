import { Address } from './address.model';
import { ASSOCIATION_TYPE } from '../../lists/association-type.enum';

export class Association {
    id?: string;
    first_name?: string;
    last_name?: string;
    address?: Address;
    email_address?: string;
    contact_number: string;
    association_type?: ASSOCIATION_TYPE;
    is_emergency_contact: boolean;
}