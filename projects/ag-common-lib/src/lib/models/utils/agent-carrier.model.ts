import { Carrier } from "../domain/carrier.model";

export class AgentCarrier {
    carrier?: Carrier;
    name?: string;
    email_address?: string;
    writing_number?: string;
    individualOrCorp?: string;
    lineOfBusiness?: string;
    is_active?: boolean;
}