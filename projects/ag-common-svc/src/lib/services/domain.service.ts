import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import {
  Address,
  Agent,
  AGENT_STATUS,
  Association,
  ASSOCIATION_TYPE,
  BUSINESS_PERSONAL_TYPE,
  EmailAddress,
  PhoneNumber,
  Registrant,
  Role
} from 'ag-common-lib/public-api';

@Injectable({
  providedIn: 'root'
})
export class DomainService {
  constructor(public toster: ToastrService) {}

  importAgentsFile(file: File, messages: string[], createdBy: string): Promise<Agent[]> {
    return new Promise((resolve) => {
      try {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
          let text = reader.result;
          let agents = this.createAgentArray(text, messages, createdBy);
          resolve(agents);
        };
      } catch (err) {
        console.error(err);
      }
    });
  }

  createAgentArray(csvText, messages: string[], createdBy: string): Agent[] {
    let lines: string[] = csvText.split('\n');
    let headers: string[] = lines[0].split(',');

    let agents: Agent[] = [];

    for (var i = 1; i < lines.length - 1; i++) {
      let data: Map<string, string> = new Map<string, string>();

      for (var j = 0; j < headers.length; j++) {
        data.set(headers[j], lines[i].split(',')[j]);
      }

      let agent: Agent = this.createAgent(data, messages, createdBy);
      agents.push(agent);
    }

    return agents;
  }

  createAgent(line_data: Map<string, string>, messages: string[], createdBy: string): Agent {
    var agent = { ...new Agent() };

    let splitVals: Map<string, string> = new Map<string, string>();

    line_data.forEach((data, field) => {
      let splitfields = field.split('.');

      if (splitfields.length == 1) {
        let k: string[] = Object.getOwnPropertyNames(agent);
        let s: string[] = k.filter((key) => key == field);

        if (s.length == 1) {
          if(field == 'approve_deny_reason'){
            console.log(data);
          }
          if (typeof agent[field] == 'boolean') {
            agent[field] = data.toLowerCase() == 'true';
          } else if (data && (field == 'dob' || field == 'approval_date')) {
            agent[field] = new Date(data);
          } else if (field == 'role') {
            agent.role = [];

            if (field['role']) {
              agent.role.push(Role[data]);
            } else {
              agent.role.push(Role.AGENT);
            }
          } else if (data && (field == 'agent_status')) {
            agent.agent_status = AGENT_STATUS[data.trim()]
          } else {
            agent[field] = data.trim();
          }
        }
      } else {
        splitVals.set(field, data);
      }
    });

    agent.addresses = this.extractAddresses(splitVals);
    agent.email_addresses = this.extractEmailAddresses(splitVals);
    agent.phone_numbers = this.extractPhoneNumbers(splitVals);
    agent.associations = this.extractAssociations(splitVals);

    agent.registration_source = 'File';
    agent.created_date = new Date();
    agent.created_by = createdBy;

    if (!agent.email_addresses || agent.email_addresses.length == 0) {
      messages.push('No Email Addresses were set for this agent. Not Importing ' + agent.p_email);
      return null;
    } else {
      let login_address: EmailAddress[] = agent.email_addresses.filter((email) => email.is_login == true);

      if (login_address.length == 0) {
        console.log('No Login Email Addresses were set for this agent. Not Importing ' + agent.p_email);
        return null;
      } else {
        agent.p_email = login_address[0].address;

        return agent;
      }
    }
  }

  updateAgent(data: Map<string, string>, messages: string[], agent: Agent): Agent {    
    //update these if value is provided
    if(data.has('p_prefix')){
      agent.p_prefix = data.get('p_prefix');
    }
    if(data.has('p_nick_name')){
      agent.p_nick_name = data.get('p_nick_name');
    }
    if(data.has('p_nick_last_name')){
      agent.p_nick_last_name = data.get('p_nick_last_name');
    }
    if(data.has('p_tshirt_size')){
      agent.p_tshirt_size = data.get('p_tshirt_size');
    }
    if(data.has('agent_status')){
      agent.agent_status = AGENT_STATUS[data.get('agent_status')];
    }

    //only overwrite if blank
    if(!agent.p_dietary_or_personal_considerations && data.has('p_dietary_or_personal_considerations')){
      agent.p_dietary_or_personal_considerations = data.get('p_dietary_or_personal_considerations');
    }

    //append if value exists
    if(agent.p_dietary_consideration && data.has('p_dietary_consideration')){
      agent.p_dietary_consideration = agent.p_dietary_consideration + ' ' + data.get('p_dietary_consideration');
    } else if(data.has('p_dietary_consideration')){
      agent.p_dietary_consideration = data.get('p_dietary_consideration');
    }

    if(agent.p_dietary_consideration_other && data.has('p_dietary_consideration_other')){
      agent.p_dietary_consideration_other = agent.p_dietary_consideration_other + ' '  + data.get('p_dietary_consideration_other');
    } else if (data.has('p_dietary_consideration_other')){
      agent.p_dietary_consideration_other = data.get('p_dietary_consideration_other');
    }

    if(agent.approve_deny_reason && data.has('approve_deny_reason')){
      agent.approve_deny_reason = agent.approve_deny_reason + ' ' + data.get('approve_deny_reason');
    } else {
      agent.approve_deny_reason = data.get('approve_deny_reason');
    }
    
    let addresses: Address[] = this.extractAddresses(data);

    if(!agent.addresses){
      agent.addresses = [];
    }

    let is_p_billing_set: boolean = addresses.filter(a => a.is_primary_billing).length > 0;

    if(is_p_billing_set){
      agent.addresses.forEach(a => a.is_primary_billing = false);
    }

    let is_p_shipping_set: boolean = addresses.filter(a => a.is_primary_shipping).length > 0;

    if(is_p_shipping_set){
      agent.addresses.forEach(a => a.is_primary_shipping = false);
    }

    addresses.forEach(incoming_address => {
      let matching_address: Address = agent.addresses.find(address => address.address1 == incoming_address.address1);

      if(matching_address){
        if(incoming_address.address2 && !matching_address.address2){
          matching_address.address2 = incoming_address.address2
        }

        if(incoming_address.city && !matching_address.city){
          matching_address.city = incoming_address.city
        }

        if(incoming_address.state && !matching_address.state){
          matching_address.state = incoming_address.state
        }

        if(incoming_address.zip && !matching_address.zip){
          matching_address.zip = incoming_address.zip
        }

        if(incoming_address.county && !matching_address.county){
          matching_address.county = incoming_address.county
        }

        if(incoming_address.country && !matching_address.country){
          matching_address.country = incoming_address.country
        }
      } else {
        agent.addresses.push(incoming_address);
      }

    })

    let emails: EmailAddress[] = this.extractEmailAddresses(data);
    
    if(!agent.email_addresses){
      agent.email_addresses = [];
    }

    let is_login_set: boolean = emails.filter(a => a.is_login).length > 0;

    if(is_login_set){
      agent.email_addresses.forEach(a => a.is_login = false);
    }

    let is_primary_set: boolean = emails.filter(a => a.is_primary).length > 0;

    if(is_primary_set){
      agent.email_addresses.forEach(a => a.is_primary = false);
    }

    emails.forEach(incoming_email => {
      let matching_email: EmailAddress = agent.email_addresses.find(email => email.address == incoming_email.address);

      if(matching_email){
        if(incoming_email.email_type && !matching_email.email_type){
          matching_email.email_type = incoming_email.email_type
        }   
        
        if(incoming_email.is_login){
          matching_email.is_login = true;
        } else {
          matching_email.is_login = false;
        }
        
        if(incoming_email.is_primary){
          matching_email.is_primary = true;
        } else {
          matching_email.is_primary = false;
        }
      } else {
        agent.email_addresses.push(incoming_email);
      }
    })
    
    let phone_numbers: PhoneNumber[] = this.extractPhoneNumbers(data);

    if(!agent.phone_numbers){
      agent.phone_numbers = [];
    }

    let is_primary_phone_set: boolean = phone_numbers.filter(a => a.is_primary).length > 0;

    if(is_primary_phone_set){
      agent.phone_numbers.forEach(a => a.is_primary = false);
    }

    phone_numbers.forEach(incoming_phone => {
      let stripped = incoming_phone.number.replace('(', '').replace(')', '').replace(' ', '').replace(' ', '').replace('-', '').replace('-', '')

      let matching_phone: PhoneNumber = agent.phone_numbers.find(phone => {
        let matched_strip = phone.number.replace('(', '').replace(')', '').replace(' ', '').replace(' ', '').replace('-', '').replace('-', '')
        return matched_strip == stripped
      })

      if(matching_phone){
        if(incoming_phone.phone_type && !matching_phone.phone_type){
          matching_phone.phone_type = incoming_phone.phone_type
        }  

        if(incoming_phone.is_primary){
          matching_phone.is_primary = true;
        } else {
          matching_phone.is_primary = false;
        }
      } else {
        agent.phone_numbers.push(incoming_phone);
      }
    })

    let associations: Association[] = this.extractAssociations(data);

    if(!agent.associations){
      agent.associations = [];
    }

    associations.forEach(incoming_associations => {
      let matching_association: Association = agent.associations.find(a => a.first_name == incoming_associations.first_name && a.last_name == incoming_associations.last_name)

      if(matching_association){
        if(incoming_associations.email_address && !matching_association.email_address){
          matching_association.email_address = incoming_associations.email_address
        }  

        if(incoming_associations.contact_number && !matching_association.contact_number){
          matching_association.contact_number = incoming_associations.contact_number
        } 
        
        if(incoming_associations.is_emergency_contact && !matching_association.is_emergency_contact){
          matching_association.is_emergency_contact = incoming_associations.is_emergency_contact
        } 

        if(incoming_associations.association_type && !matching_association.association_type){
          matching_association.association_type = incoming_associations.association_type
        } 

        if(incoming_associations.p_dietary_consideration){
          matching_association.p_dietary_consideration = incoming_associations.p_dietary_consideration
        } 

        if(incoming_associations.p_dietary_consideration && matching_association.p_dietary_consideration){
          matching_association.p_dietary_consideration = matching_association.p_dietary_consideration + ' ' +incoming_associations.p_dietary_consideration
        } else if(matching_association.p_dietary_consideration){
          matching_association.p_dietary_consideration = incoming_associations.p_dietary_consideration
        }

        if(incoming_associations.p_dietary_consideration_other && matching_association.p_dietary_consideration_other){
          matching_association.p_dietary_consideration_other = matching_association.p_dietary_consideration_other + ' ' +incoming_associations.p_dietary_consideration_other
        } else if(matching_association.p_dietary_consideration_other){
          matching_association.p_dietary_consideration_other = incoming_associations.p_dietary_consideration_other
        }

        if(!matching_association.address){
          matching_association.address = { ... new Address()};
        }

        if(incoming_associations.address.address1 && !matching_association.address.address1){
          matching_association.address.address1 = incoming_associations.address.address1;
        } 

        if(incoming_associations.address.address2 && !matching_association.address.address2){
          matching_association.address.address2 = incoming_associations.address.address2;
        } 


        if(incoming_associations.address.city && !matching_association.address.city){
          matching_association.address.city = incoming_associations.address.city;
        } 

        if(incoming_associations.address.state && !matching_association.address.state){
          matching_association.address.state = incoming_associations.address.state;
        } 

        if(incoming_associations.address.zip && !matching_association.address.zip){
          matching_association.address.zip = incoming_associations.address.zip;
        } 

        if(incoming_associations.address.county && !matching_association.address.county){
          matching_association.address.county = incoming_associations.address.county;
        } 

        if(incoming_associations.address.country && !matching_association.address.country){
          matching_association.address.country = incoming_associations.address.country;
        } 

      } else {
        agent.associations.push(incoming_associations);
      }
    })

    return agent;
  }

  extractAddresses(invals: Map<string, string>): Address[] {
    let retval: Address[] = [];

    let i: Map<string, string> = this.getCount(invals, 'addresses');

    i.forEach((value, key) => {
      let a: Address = this.createAddress(invals, value, key);
      if (a.address1 || a.address2 || a.city || a.state || a.zip || a.county || a.country) retval.push(a);
    });

    return retval;
  }

  createAddress(invals: Map<string, string>, value: string, key: string): Address {
    let a: Address = { ...new Address() };
    a.id = this.generateId();

    if (invals.has('addresses.' + key + '.address1')) a.address1 = invals.get('addresses.' + key + '.address1');
    if (invals.has('addresses.' + key + '.address2')) a.address2 = invals.get('addresses.' + key + '.address2');
    if (invals.has('addresses.' + key + '.city')) a.city = invals.get('addresses.' + key + '.city');
    if (invals.has('addresses.' + key + '.state')) a.state = invals.get('addresses.' + key + '.state');
    if (invals.has('addresses.' + key + '.zip')) a.zip = invals.get('addresses.' + key + '.zip');
    if (invals.has('addresses.' + key + '.county')) a.county = invals.get('addresses.' + key + '.county');
    if (invals.has('addresses.' + key + '.country')) a.country = invals.get('addresses.' + key + '.country');
    if (invals.has('addresses.' + key + '.address_type'))
      a.address_type = BUSINESS_PERSONAL_TYPE[invals.get('addresses.' + key + '.address_type').toUpperCase()];

    if (
      invals.has('addresses.' + key + '.is_primary_billing') &&
      invals.get('addresses.' + key + '.is_primary_billing').toLowerCase() == 'true'
    ) {
      a.is_primary_billing = true;
    } else {
      a.is_primary_billing = false;
    }

    if (
      invals.has('addresses.' + key + '.is_primary_shipping') &&
      invals.get('addresses.' + key + '.is_primary_shipping').toLowerCase() == 'true'
    ) {
      a.is_primary_shipping = true;
    } else {
      a.is_primary_shipping = false;
    }

    return a;
  }

  extractEmailAddresses(invals: Map<string, string>): EmailAddress[] {
    let retval: EmailAddress[] = [];

    let i: Map<string, string> = this.getCount(invals, 'email_addresses');

    i.forEach((value, key) => {
      let a: EmailAddress = this.createEmailAddress(invals, key);
      if (a.address) retval.push(a);
    });

    return retval;
  }

  createEmailAddress(invals: Map<string, string>, key: string): EmailAddress {
    let a: EmailAddress = { ...new EmailAddress() };
    a.id = this.generateId();

    if (invals.has('email_addresses.' + key + '.address'))
      a.address = invals.get('email_addresses.' + key + '.address');
    if (invals.has('email_addresses.' + key + '.email_type'))
      a.email_type = BUSINESS_PERSONAL_TYPE[invals.get('email_addresses.' + key + '.email_type').toUpperCase()];

    if (
      invals.has('email_addresses.' + key + '.is_login') &&
      invals.get('email_addresses.' + key + '.is_login').toLowerCase() == 'true'
    ) {
      a.is_login = true;
    } else {
      a.is_login = false;
    }

    if (
      invals.has('email_addresses.' + key + '.is_primary') &&
      invals.get('email_addresses.' + key + '.is_primary').toLowerCase() == 'true'
    ) {
      a.is_primary = true;
    } else {
      a.is_primary = false;
    }

    return a;
  }

  extractPhoneNumbers(invals: Map<string, string>): PhoneNumber[] {
    let retval: PhoneNumber[] = [];

    let i: Map<string, string> = this.getCount(invals, 'phone_numbers');

    i.forEach((value, key) => {
      let a: PhoneNumber = this.createPhoneNumber(invals, key);
      if (a.number) retval.push(a);
    });

    return retval;
  }

  createPhoneNumber(invals: Map<string, string>, key: string): PhoneNumber {
    let a: PhoneNumber = { ...new PhoneNumber() };
    a.id = this.generateId();

    if (invals.has('phone_numbers.' + key + '.number')) {
      a.number = invals
        .get('phone_numbers.' + key + '.number')
        .replace('.', '')
        .replace('.', '')
        .replace('-', '')
        .replace('-', '')
        .replace(' ', '')
        .replace(' ', '')
        .replace('(', '')
        .replace(')', '');
    }

    if (invals.has('phone_numbers.' + key + '.phone_type')) {
      a.phone_type = BUSINESS_PERSONAL_TYPE[invals.get('phone_numbers.' + key + '.phone_type').toUpperCase()];
    }

    if (
      invals.has('phone_numbers.' + key + '.is_primary') &&
      invals.get('phone_numbers.' + key + '.is_primary').toLowerCase() == 'true'
    ) {
      a.is_primary = true;
    } else {
      a.is_primary = false;
    }

    return a;
  }

  extractAssociations(invals: Map<string, string>): Association[] {
    let retval: Association[] = [];

    let i: Map<string, string> = this.getCount(invals, 'association');

    i.forEach((value, key) => {
      let a: Association = this.createAssociation(invals, key);
      if (a.first_name) retval.push(a);
    });

    return retval;
  }

  createAssociation(invals: Map<string, string>, key: string): Association {
    let a: Association = { ...new Association() };
    a.id = this.generateId();

    if (invals.has('association.' + key + '.first_name')) {
      a.first_name = invals.get('association.' + key + '.first_name');
    }

    if (invals.has('association.' + key + '.last_name')) {
      a.last_name = invals.get('association.' + key + '.last_name');
    }

    if (invals.has('association.' + key + '.email_address')) {
      a.email_address = invals.get('association.' + key + '.email_address');
    }

    if (invals.has('association.' + key + '.contact_number')) {
      a.contact_number = invals.get('association.' + key + '.contact_number').replace('(', '').replace(')', '').replace(' ', '').replace(' ', '').replace('-', '').replace('-', '');
    }

    if (invals.has('association.' + key + '.association_type')) {
      let t = invals.get('association.' + key + '.association_type').toUpperCase();
      
      a.association_type = ASSOCIATION_TYPE[invals.get('association.' + key + '.association_type').toUpperCase()];
    }

    if (invals.has('association.' + key + '.is_emergency_contact')) {
      if(invals.get('association.' + key + '.is_emergency_contact').toUpperCase() == 'TRUE'){
        a.is_emergency_contact = true;
      } else {
        a.is_emergency_contact = false;
      }
    }

    a.address = { ...new Address() };

    if (invals.has('association.' + key + '.address.address1')) {
      a.address.address1 = invals.get('association.' + key + '.address.address1');
    }

    if (invals.has('association.' + key + '.address.address2')) {
      a.address.address2 = invals.get('association.' + key + '.address.address2');
    }

    if (invals.has('association.' + key + '.address.city')) {
      a.address.city = invals.get('association.' + key + '.address.city');
    }

    if (invals.has('association.' + key + '.address.state')) {
      a.address.state = invals.get('association.' + key + '.address.state');
    }

    if (invals.has('association.' + key + '.address.zip')) {
      a.address.zip = invals.get('association.' + key + '.address.zip');
    }

    if (invals.has('association.' + key + '.address.county')) {
      a.address.county = invals.get('association.' + key + '.address.county');
    }

    if (invals.has('association.' + key + '.address.country')) {
      a.address.country = invals.get('association.' + key + '.address.country');
    }

    if (invals.has('association.' + key + '.p_dietary_or_personal_considerations')) {
      a.p_dietary_or_personal_considerations = invals.get('association.' + key + '.p_dietary_or_personal_considerations');
    }

    if (invals.has('association.' + key + '.p_dietary_consideration')) {
      a.p_dietary_consideration = invals.get('association.' + key + '.p_dietary_consideration');
    }

    if (invals.has('association.' + key + '.p_dietary_consideration_other')) {
      a.p_dietary_consideration_other = invals.get('association.' + key + '.p_dietary_consideration_other');
    }

    if (invals.has('association.' + key + '.p_nick_name')) {
      a.p_nick_first_name = invals.get('association.' + key + '.p_nick_name');
    }

    if (invals.has('association.' + key + '.p_nick_last_name')) {
      a.p_nick_last_name = invals.get('association.' + key + '.p_nick_last_name');
    }

    if (invals.has('association.' + key + '.p_tshirt_size')) {
      a.p_tshirt_size = invals.get('association.' + key + '.p_tshirt_size');
    }
    return a;
  }

  getCount(invals: Map<string, string>, type: string) {
    let values: Map<string, string> = new Map<string, string>();

    invals.forEach((value, key) => {
      if (key.startsWith(type)) {
        values.set(key.split('.')[1], key.split('.')[1]);
      }
    });

    return values;
  }

  generateId() {
    return 'xxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}


