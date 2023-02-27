import { Injectable } from '@angular/core';
import {
  ImportFieldRule,
  ImportRuleSet,
  ImportRuleSetKeys,
  PrimaryFieldRule
} from 'ag-common-lib/lib/models/import-rules/import-ruleset-model';
import {
  ActiveLookup,
  Address,
  Agent,
  AgentKeys,
  BUSINESS_PERSONAL_TYPE
} from 'ag-common-lib/public-api';
import { Observable } from 'rxjs';
import { DomainUtilService } from './domain-util.service';
import { LookupsService } from './lookups.service';


@Injectable({
  providedIn: 'root'
})
export class DomainAddressService {

  private domainObjectType: ActiveLookup[];
  
  constructor(private domainUtilService: DomainUtilService, private lookupService: LookupsService) {
    this.lookupService.emailTypeLookup$.subscribe(lookups => this.domainObjectType = lookups);
  }
  
  //create address objects from datamap
  //Ensures address has address1, city, state, and zip
  extractAddresses(invals: Map<string, string>): Address[] {
    let retval: Address[] = [];

    let i: Map<string, string> = this.domainUtilService.getCount(invals, 'addresses');

    i.forEach((value, key) => {
      let a: Address = this.createAddress(invals, value, key);
      if (a.address1 || a.address2 || a.city || a.state || a.zip) retval.push(a);
    });

    return retval;
  }

  //creates list of address from datamap and assigns primaries if none assigned
  createAddresses(invals: Map<string, string>): Address[] {
    let addresses:Address[] =  this.extractAddresses(invals);

    let primary_shipping: Address[] = addresses.filter(address => address.is_primary_shipping == true);
    
    if(addresses.length > 0 && primary_shipping.length == 0){
      addresses[0].is_primary_shipping = true;
    }

    let primary_billing: Address[] = addresses.filter(address => address.is_primary_billing == true);
    
    if(addresses.length > 0 && primary_billing.length == 0){
      addresses[0].is_primary_billing = true;
    }

    return addresses;
  }

  private createAddress(invals: Map<string, string>, value: string, key: string): Address {
    let a: Address = { ...new Address() };
    a.id = this.domainUtilService.generateId();

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

  //If a match is found for incoming address, address will be updated with incoming data from datamap
  //If a match is not found, address will be added to agents address list
  //If the ruleset requires updating primary shipping (and a primary shipping is provided), primaryshipping  address will be set
  //After all is done, a final check will ensure that at least 1 primary shipping is set (1st in list)

  //If the ruleset requires updating primary billing (and a primary billing is provided), primary billing address will be set
  //After all is done, a final check will ensure that at least 1 primary billing is set (1st in list)
  updateAddresses(data: Map<string, string>, agent: Agent, selectedRuleSet: ImportRuleSet, messages: string[]): boolean {
    let incoming_addresses: Address[] = this.extractAddresses(data);

    if (!agent[AgentKeys.addresses]) {
      agent[AgentKeys.addresses] = [];
    }

    if (incoming_addresses.length > 0) {
      let required_to_update_shipping = this.updatePrimaryShippingAddressRequired(incoming_addresses, selectedRuleSet, agent, messages);

      if(required_to_update_shipping){
        agent.addresses.forEach((a) => (a.is_primary_shipping = false));
      }

      let required_to_update_billing = this.updatePrimaryBillingAddressRequired(incoming_addresses, selectedRuleSet, agent, messages);

      if(required_to_update_billing){
        agent.addresses.forEach((a) => (a.is_primary_billing = false));
      }

      //look at each incoming and update if matching or add to list
      incoming_addresses.forEach((incoming_address) => {
        let matching_address: Address = agent[AgentKeys.addresses].find(address => address.address1?.split(' ')[0] == incoming_address.address1?.split(' ')[0]);

        if (matching_address) {
          if (incoming_address.address1) {
            this.domainUtilService.updateField(
              selectedRuleSet[ImportRuleSetKeys.address_address1],
              matching_address,
              'address1',
              incoming_address.address1
            );
          }
          if (incoming_address.address2) {
            this.domainUtilService.updateField(
              selectedRuleSet[ImportRuleSetKeys.address_address2],
              matching_address,
              'address2',
              incoming_address.address2
            );
          }
          if (incoming_address.city) {
            this.domainUtilService.updateField(
              selectedRuleSet[ImportRuleSetKeys.address_city],
              matching_address,
              'city',
              incoming_address.city
            );
          }
          if (incoming_address.state) {
            this.domainUtilService.updateField(
              selectedRuleSet[ImportRuleSetKeys.address_state],
              matching_address,
              'state',
              incoming_address.state
            );
          }
          if (incoming_address.zip) {
            this.domainUtilService.updateField(
              selectedRuleSet[ImportRuleSetKeys.address_zip],
              matching_address,
              'zip',
              incoming_address.zip
            );
          }
          if (incoming_address.county) {
            this.domainUtilService.updateField(
              selectedRuleSet[ImportRuleSetKeys.address_county],
              matching_address,
              'county',
              incoming_address.county
            );
          }
          if (incoming_address.country) {
            this.domainUtilService.updateField(
              selectedRuleSet[ImportRuleSetKeys.address_country],
              matching_address,
              'country',
              incoming_address.country
            );
          }
          if (incoming_address.is_primary_billing && required_to_update_billing) {
            this.domainUtilService.updateField(
              selectedRuleSet[ImportRuleSetKeys.address_is_primary_billing],
              matching_address,
              'is_primary_billing',
              incoming_address.is_primary_billing
            );
          }
          if (incoming_address.is_primary_shipping && required_to_update_shipping) {
            this.domainUtilService.updateField(
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
    } 
    
    return true;
  }

  //checks to see if update of Shipping Primary is required and incoming Shipping Primary exists
  private updatePrimaryShippingAddressRequired(incoming_addresses: Address[], selectedRuleSet: ImportRuleSet, agent: Agent, messages: string[]) {
    let returnVal: boolean = false;

    let shipping_rule = selectedRuleSet[ImportRuleSetKeys.primary_shipping_address];

    let required_to_update_shipping = PrimaryFieldRule[shipping_rule] == PrimaryFieldRule.UPDATE_PRIMARY_VALUE;

    if (required_to_update_shipping) {
      let incoming_has_primary_shipping = incoming_addresses.filter((add) => add.is_primary_shipping == true);

      if (incoming_has_primary_shipping.length == 0) {// <---if 0 found in file, then do not update any primaries
        returnVal = false;
      } else if (incoming_has_primary_shipping.length == 1) {// <---if 1 found in file, then update the primary
        returnVal = true;
      } else if (incoming_has_primary_shipping.length >= 2) {// <---if more than 1 found, this is an error -- should not occur from Data Validation check
        returnVal = false;
      } 
    }

    return returnVal;
  }

  //checks to see if update of Billing Primary is required and incoming Billing Primary exists
  private updatePrimaryBillingAddressRequired(incoming_addresses: Address[], selectedRuleSet: ImportRuleSet, agent: Agent, messages: string[]) {
    let returnVal: boolean = false;

    let billing_rule = selectedRuleSet[ImportRuleSetKeys.primary_billing_address];

    let required_to_update_billinging = PrimaryFieldRule[billing_rule] == PrimaryFieldRule.UPDATE_PRIMARY_VALUE;

    if (required_to_update_billinging) {
      let incoming_has_primary_billing = incoming_addresses.filter((add) => add.is_primary_billing == true);

      if (incoming_has_primary_billing.length == 0) {// <---if 0 found in file, then do not update any primaries
        returnVal = false;
      } else if (incoming_has_primary_billing.length == 1) {// <---if 1 found in file, then update the primary
        returnVal = true;
      } else if (incoming_has_primary_billing.length >= 2) {// <---if more than 1 found, this is an error -- should not occur from Data Validation check
        returnVal = false;
      }
    }

    return returnVal;
  }

  private getLookupValue(lookups: ActiveLookup[],  matchVal: string): string{
    let lookup: ActiveLookup  = lookups.find(val => val.description == matchVal);

    if(lookup){
      return lookup.dbId
    } else {
      console.log("Couldn't find lookup value for ", matchVal)
      return matchVal
    }
  }
}
