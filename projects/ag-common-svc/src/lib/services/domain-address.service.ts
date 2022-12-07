import { Injectable } from '@angular/core';
import {
  ImportFieldRule,
  ImportRuleSet,
  ImportRuleSetKeys,
  PrimaryFieldRule
} from 'ag-common-lib/lib/models/import-rules/import-ruleset-model';
import {
  Address,
  Agent,
  AgentKeys,
  BUSINESS_PERSONAL_TYPE
} from 'ag-common-lib/public-api';


@Injectable({
  providedIn: 'root'
})
export class DomainAddressService {
  constructor() {}

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

  updateAddresses(data: Map<string, string>,agent: Agent,selectedRuleSet: ImportRuleSet,messages: string[]): boolean {
    let incoming_addresses: Address[] = this.extractAddresses(data);

    if (incoming_addresses.length > 0 && this.validateAddresses(incoming_addresses, selectedRuleSet, agent, messages)) {
      if (!agent[AgentKeys.addresses]) {
        agent[AgentKeys.addresses] = [];
      }

      let required_to_update_shipping =
        PrimaryFieldRule[selectedRuleSet[ImportRuleSetKeys.primary_shipping_address]] ==
        PrimaryFieldRule.UPDATE_PRIMARY_VALUE;

      let required_to_update_billing =
        PrimaryFieldRule[selectedRuleSet[ImportRuleSetKeys.primary_billing_address]] ==
        PrimaryFieldRule.UPDATE_PRIMARY_VALUE;

      //look at each incoming and update if matching or add to list
      incoming_addresses.forEach((incoming_address) => {
        let matching_address: Address = agent[AgentKeys.addresses].find(
          (address) => address.address1 == incoming_address.address1
        );

        if (matching_address) {
          if (incoming_address.address2) {
            this.updateField(
              selectedRuleSet[ImportRuleSetKeys.address_address2],
              matching_address,
              'address2',
              incoming_address.address2
            );
          }
          if (incoming_address.city) {
            this.updateField(
              selectedRuleSet[ImportRuleSetKeys.address_city],
              matching_address,
              'city',
              incoming_address.city
            );
          }
          if (incoming_address.state) {
            this.updateField(
              selectedRuleSet[ImportRuleSetKeys.address_state],
              matching_address,
              'state',
              incoming_address.state
            );
          }
          if (incoming_address.zip) {
            this.updateField(
              selectedRuleSet[ImportRuleSetKeys.address_zip],
              matching_address,
              'zip',
              incoming_address.zip
            );
          }
          if (incoming_address.county) {
            this.updateField(
              selectedRuleSet[ImportRuleSetKeys.address_county],
              matching_address,
              'county',
              incoming_address.county
            );
          }
          if (incoming_address.country) {
            this.updateField(
              selectedRuleSet[ImportRuleSetKeys.address_country],
              matching_address,
              'country',
              incoming_address.country
            );
          }
          if (incoming_address.is_primary_billing && required_to_update_billing) {
            this.updateField(
              selectedRuleSet[ImportRuleSetKeys.address_is_primary_billing],
              matching_address,
              'is_primary_billing',
              incoming_address.is_primary_billing
            );
          }
          if (incoming_address.is_primary_shipping && required_to_update_shipping) {
            this.updateField(
              selectedRuleSet[ImportRuleSetKeys.address_is_primary_shipping],
              matching_address,
              'is_primary_shipping',
              incoming_address.is_primary_shipping
            );
          }
        } else {
          if (!required_to_update_shipping) {
            incoming_address.is_primary_shipping = false;
          }

          if (!required_to_update_billing) {
            incoming_address.is_primary_billing = false;
          }

          agent[AgentKeys.addresses].push(incoming_address);
        }
      });

      //after creating new list, check for a primary shipping
      let is_primary_shipping_set = agent[AgentKeys.addresses].filter((a) => a.is_primary_shipping)?.length > 0;

      //if no primary shipping set, set first address to primary shipping
      if (!is_primary_shipping_set && agent[AgentKeys.addresses].length > 0) {
        agent[AgentKeys.addresses][0].is_primary_shipping = true;
      }

      //after creating new list, check for a primary billing
      let is_primary_billing_set = agent[AgentKeys.addresses].filter((a) => a.is_primary_billing)?.length > 0;

      //if no primary billing set, set first email to primary billing
      if (!is_primary_billing_set && agent[AgentKeys.addresses].length > 0) {
        agent[AgentKeys.addresses][0].is_primary_billing = true;
      }
      return true;
    } else {
      return false;
    }
  }

  validateAddresses(incoming_addresses: Address[], selectedRuleSet: ImportRuleSet, agent: Agent, messages: string[]) {
    let returnVal: boolean = false;

    let shipping_rule = selectedRuleSet[ImportRuleSetKeys.primary_shipping_address];

    let required_to_update_shipping = PrimaryFieldRule[shipping_rule] == PrimaryFieldRule.UPDATE_PRIMARY_VALUE;

    if (required_to_update_shipping) {
      let incoming_has_primary_shipping = incoming_addresses.filter((add) => add.is_primary_shipping == true);

      if (incoming_has_primary_shipping.length == 0) {
        messages.push(
          'Selected Rule Set requires Primary Shipping Address to be updated, but no Primary is set. Please set primary for ' +
            agent.p_email +
            ' or change the import rule.'
        );
        returnVal = false;
      } else if (incoming_has_primary_shipping.length == 1) {
        agent.addresses.forEach((add) => (add.is_primary_shipping = false));
        returnVal = true;
      } else if (incoming_has_primary_shipping.length == 2) {
        messages.push(
          'Selected Rule Set requires Primary Shipping Address to be updated, but 2 Primararies are set. Please set set only 1 primary for ' +
            agent.p_email +
            ' or change the import rule.'
        );
        returnVal = false;
      } else {
        returnVal = true;
      }
    }

    let billing_rule = selectedRuleSet[ImportRuleSetKeys.primary_billing_address];

    let required_to_update_billinging = PrimaryFieldRule[billing_rule] == PrimaryFieldRule.UPDATE_PRIMARY_VALUE;

    if (required_to_update_billinging) {
      let incoming_has_primary_billing = incoming_addresses.filter((add) => add.is_primary_billing == true);

      if (incoming_has_primary_billing.length == 0) {
        messages.push(
          'Selected Rule Set requires Primary Billing Address to be updated, but no Primary is set. Please set primary for ' +
            agent.p_email +
            ' or change the import rule.'
        );
        returnVal = returnVal && false;
      } else if (incoming_has_primary_billing.length == 1) {
        agent.addresses.forEach((add) => (add.is_primary_billing = false));
        returnVal = returnVal && true;
      } else if (incoming_has_primary_billing.length == 2) {
        messages.push(
          'Selected Rule Set requires Primary Billing Address to be updated, but 2 Primararies are set. Please set set only 1 primary for ' +
            agent.p_email +
            ' or change the import rule.'
        );
        returnVal = returnVal && false;
      } else {
        returnVal = returnVal && false;
      }
    }

    return returnVal;
  }

  updateField(rule, itemToUpdate, field_name: string, value) {
    if (ImportFieldRule[rule] == ImportFieldRule.APPEND_TO_EXISTING) {
      itemToUpdate[field_name] = itemToUpdate[field_name] + ' ' + value;
    } else if (ImportFieldRule[rule] == ImportFieldRule.DO_NOT_UPDATE) {
      itemToUpdate[field_name] = itemToUpdate[field_name];
    } else if (ImportFieldRule[rule] == ImportFieldRule.UPDATE_EXISTING_VALUE) {
      itemToUpdate[field_name] = value;
    } else if (ImportFieldRule[rule] == ImportFieldRule.UPDATE_IF_BLANK) {
      if (!itemToUpdate[field_name] || itemToUpdate[field_name] == '') {
        itemToUpdate[field_name] = value;
      }
    } else if (PrimaryFieldRule[rule] == PrimaryFieldRule.UPDATE_PRIMARY_VALUE) {
      itemToUpdate[field_name] = value;
    } else if (PrimaryFieldRule[rule] == PrimaryFieldRule.DO_NOT_UPDATE) {
      itemToUpdate[field_name] = itemToUpdate[field_name];
    }
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
