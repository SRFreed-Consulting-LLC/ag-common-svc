import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  getExportMetaData(): ImportExportConfig[]{
    return [
      { title: 'Created At', mapped_to: 'created_date', required: false},
      { title: 'Updated At', mapped_to: 'updated_date', required: false},
      { title: 'Registration Status', mapped_to: 'registration_status', required: false}, //<--- NEW - in model
      { title: 'Registered At', mapped_to: 'registration_source', required: false},
      { title: 'Email Address', mapped_to: 'invitee_email', required: false},
      { title: 'Email Address', mapped_to: 'email_addresses.1.address', required: true},
      { title: 'email_address_type', mapped_to: 'email_addresses.1.email_type', required: false},
      { title: 'cc_email', mapped_to: 'cc_email', required: false},//<--- NEW - in model
      { title: 'registration_type', mapped_to: 'qualified_as', required: false},
      { title: 'agent_occupancy', mapped_to: 'agent_occupancy', required: false},//<--- NEW - in model
      { title: 'mga_id_1', mapped_to: 'mga_id', required: false},
      { title: 'mga_id_2', mapped_to: 'mga_id', required: false},
      { title: 'prefix', mapped_to: 'p_prefix', required: false},
      { title: 'first_name', mapped_to: 'p_agent_first_name', required: false},
      { title: 'last_name', mapped_to: 'p_agent_last_name', required: false},
      { title: 'middle_name', mapped_to: 'p_agent_middle_name', required: false},//<--- NEW - in model - in import
      { title: 'nick_name', mapped_to: 'p_nick_name', required: false},
      { title: 'nick_last_name', mapped_to: 'p_nick_last_name', required: false},
      { title: 'award_name', mapped_to: 'award_name', required: false},//<--- NEW - in model
      { title: 'suffix', mapped_to: 'p_suffix', required: false},//<--- NEW - in model
      { title: 'shipping_address1', mapped_to: 'address.address1', required: false},
      { title: 'shipping_address2', mapped_to: 'address.address2', required: false},
      { title: 'shipping_city', mapped_to: 'address.city', required: false},
      { title: 'shipping_state', mapped_to: 'address.state', required: false},
      { title: 'shipping_zip', mapped_to: 'address.zip', required: false},
      { title: 'shipping_address_type', mapped_to: 'address', required: false},
      { title: 'billing_address1', mapped_to: 'address.address2', required: false},
      { title: 'billing_address2', mapped_to: 'address.address2', required: false},
      { title: 'billing_city', mapped_to: 'address.city', required: false},
      { title: 'billing_state', mapped_to: 'address.state', required: false},
      { title: 'billing_zip', mapped_to: 'address.zip', required: false},
      { title: 'billing_address_type', mapped_to: 'address', required: false},
      { title: 'mobile_phone', mapped_to: '', required: false},//<--- NEW
      { title: 'secondary_phone', mapped_to: '', required: false},//<--- NEW
      { title: 'secondary_phone_extension', mapped_to: '', required: false},//<--- NEW
      { title: 'secondary_phone_type', mapped_to: '', required: false},//<--- NEW
      { title: 'child_or_adult', mapped_to: '', required: false},//<--- NEW
      { title: 'unisex_tshirt_size', mapped_to: 'tshirt_size', required: false},
      { title: 'unisex_tshirt_size_other', mapped_to: '', required: false},//<--- NEW - in model
      { title: 'dietary_or_personal_considerations', mapped_to: 'dietary_or_personal_considerations', required: false},
      { title: 'dietary_consideration_type', mapped_to: 'dietary_consideration_type', required: false},
      { title: 'dietary_consideration', mapped_to: 'dietary_consideration', required: false},
      { title: 'headshot_link', mapped_to: '', required: false},//<--- NEW - in model
      { title: 'first_time_attendee', mapped_to: '', required: false},//<--- NEW - in model
      { title: 'emergency_contact_first_name', mapped_to: 'emergency_contact.first_name', required: false},
      { title: 'emergency_contact_last_name', mapped_to: 'emergency_contact.last_name', required: false},
      { title: 'emergency_contact_association_type', mapped_to: 'emergency_contact.associationTypeRef', required: false},
      { title: 'emergency_contact_phone', mapped_to: 'emergency_contact.contact_number', required: false},
      { title: 'emergency_contact_email', mapped_to: 'emergency_contact.email_address', required: false},
      { title: 'gender', mapped_to: '', required: false},//<--- NEW - in model
      { title: 'dob', mapped_to: '', required: false},

      { title: 'guest2_first_name', mapped_to: 'association.1.first_name', required: false},
      { title: 'guest2_last_name', mapped_to: 'association.1.last_name', required: false},
      { title: 'guest2_nick_name_first', mapped_to: 'association.1.p_nick_name', required: false},
      { title: 'guest2_nick_name_last', mapped_to: 'association.1.p_nick_last_name', required: false},
      { title: 'guest2_gender', mapped_to: 'association.1.gender', required: false},
      { title: 'guest2_date_birth', mapped_to: 'association.1.dob', required: false},
      { title: 'guest2_relationship_agent', mapped_to: 'association.1.association_type', required: false},
      { title: 'guest2_relationship_other', mapped_to: 'association.1.association_type_other', required: false},

      { title: 'guest3_first_name', mapped_to: 'association.2.first_name', required: false},
      { title: 'guest3_last_name', mapped_to: 'association.2.last_name', required: false},
      { title: 'guest3_nick_name_first', mapped_to: 'association.2.p_nick_name', required: false},
      { title: 'guest3_nick_name_last', mapped_to: 'association.2.p_nick_last_name', required: false},
      { title: 'guest3_gender', mapped_to: 'association.2.gender', required: false},
      { title: 'guest3_date_birth', mapped_to: 'association.2.dob', required: false},
      { title: 'guest3_relationship_agent', mapped_to: 'association.2.association_type', required: false},
      { title: 'guest3_relationship_other', mapped_to: 'association.2.association_type_other', required: false},

      { title: 'guest4_first_name', mapped_to: 'association.3.first_name', required: false},
      { title: 'guest4_last_name', mapped_to: 'association.3.last_name', required: false},
      { title: 'guest4_nick_name_first', mapped_to: 'association.3.p_nick_name', required: false},
      { title: 'guest4_nick_name_last', mapped_to: 'association.3.p_nick_last_name', required: false},
      { title: 'guest4_gender', mapped_to: 'association.3.gender', required: false},
      { title: 'guest4_date_birth', mapped_to: 'association.3.dob', required: false},
      { title: 'guest4_relationship_agent', mapped_to: 'association.3.association_type', required: false},
      { title: 'guest4_relationship_other', mapped_to: 'association.3.association_type_other', required: false},

      { title: 'guest5_first_name', mapped_to: 'association.4.first_name', required: false},
      { title: 'guest5_last_name', mapped_to: 'association.4.last_name', required: false},
      { title: 'guest5_nick_name_first', mapped_to: 'association.4.p_nick_name', required: false},
      { title: 'guest5_nick_name_last', mapped_to: 'association.4.p_nick_last_name', required: false},
      { title: 'guest5_gender', mapped_to: 'association.4.gender', required: false},
      { title: 'guest5_date_birth', mapped_to: 'association.4.dob', required: false},
      { title: 'guest5_relationship_agent', mapped_to: 'association.4.association_type', required: false},
      { title: 'guest5_relationship_other', mapped_to: 'association.4.association_type_other', required: false}
    ]//<--- NEW - in model
  }
}

export class ImportExportConfig{
  title: string;
  mapped_to: string;
  required: boolean;
  default_value?: any;
}
