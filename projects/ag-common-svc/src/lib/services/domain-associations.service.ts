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
  Association,
  AssociationKeys,
  BaseModelKeys,
  LookupKeys,
} from 'ag-common-lib/public-api';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { AgentAssociationsService } from './agent-associations.service';
import { DomainUtilService } from './domain-util.service';
import { LookupsService } from './lookups.service';

@Injectable({
  providedIn: 'root'
})
export class DomainAssociationsService {
  private associationTypeLookup$: Observable<ActiveLookup[]>;

  lookupsMap: Map<string, ActiveLookup[]>;

  constructor(
    private lookupsService: LookupsService,
    private agentAssociationsService: AgentAssociationsService,
    private domainUtilService: DomainUtilService
  ) {
    this.associationTypeLookup$ = this.lookupsService.associationTypeLookup$;
  }

  async updateAssociations(
    agent_or_invitees: Map<string, string>, // full invitee map
    agent: Agent,
    selectedRuleSet: ImportRuleSet,
    messages: string[], 
    key: string,
    lookupsMap: Map<string, ActiveLookup[]>
  ) {
    this.lookupsMap = lookupsMap;

    
    let associations_map: Map<string, Map<string, string>> = new Map<string, Map<string, string>>();
    
    //filter all associations from agent_or_invitees map
    agent_or_invitees.forEach((v, k) => {
      let key_split: string[] = k.split('.');

      let association_vals: Map<string, string>;

      if (associations_map.has(key_split[0] + '.' + key_split[1])) {
        association_vals = associations_map.get(key_split[0] + '.' + key_split[1]);
      } else {
        association_vals = new Map<string, string>();
      }

      if (k.startsWith(key_split[0] + '.' + key_split[1])) {
        if (key_split.length == 4) {
          association_vals.set(key_split[key_split.length - 2] + '.' + key_split[key_split.length - 1], v);
        } else {
          association_vals.set(key_split[key_split.length - 1], v);
        }

        associations_map.set(key_split[0] + '.' + key_split[1], association_vals);
      }
    });

    const incomingAssociations: Association[] = [];

    //iterate through assocations_map and create incoming association for each
    associations_map.forEach((v,k) => {
      if(k.startsWith(key)){
        let association_map: Map<string, string> = v;

        let association: Association = { ... new Association() };

        selectedRuleSet.import_mappings.forEach(async (mapping) => {
          let registrant_field = mapping.field_name_registrant;

          let agent_field = mapping.field_name_agent;
          if(agent_field.startsWith('association')){
            agent_field = agent_field;
          }

          if ((association_map.has(registrant_field) && association_map.get(registrant_field) != '')) {
            if (mapping.data_type == 'string' || mapping.data_type == 'select') {
              association[registrant_field] = association_map.get(registrant_field);
            }
  
            if (mapping.data_type == 'yes-no') {
              association[registrant_field] = this.domainUtilService.getYesNoValue(
                association_map.get(registrant_field).trim()
              );
            }
  
            if (mapping.data_type == 'date') {
              association[registrant_field] = new Date(association_map.get(registrant_field));
            }
  
            if (mapping.data_type == 'lookup') {
              association[registrant_field] = await this.getLookupValue(
                mapping.values,
                association_map.get(registrant_field)
              );
            }
  
            if (mapping.data_type == 'boolean') {
              association[registrant_field] = this.domainUtilService.getBoolean(
                association_map.get(registrant_field)
              );
            }
  
            if (mapping.data_type == 'currency') {
              association[registrant_field] = association_map.get(registrant_field);
            }
          }
        });

        incomingAssociations.push(association);
      }
    })

    const promises: Promise<any>[] = [];
    const existingAssociations: Association[] = await this.agentAssociationsService.getAll(agent[BaseModelKeys.dbId]);

    //iterate through incoming association and check to see if one already exists in agent profile
    for (const incomingAssociation of incomingAssociations) {
      const matchingAssociation: Association = existingAssociations.find(
        (association) =>
          association.first_name == incomingAssociation.first_name &&
          association.last_name == incomingAssociation.last_name
      );

      if (!matchingAssociation) {
        promises.push(
          this.agentAssociationsService.create(agent[BaseModelKeys.dbId], incomingAssociation).then((association) => {
            if (association) {
              messages.push(
                'Associate created (' + association.first_name + ' ' + association.last_name + ') to ' + agent.p_email
              );
            }
          })
        );
      }

      if (matchingAssociation) {
        selectedRuleSet.import_mappings.forEach(async (mapping) => {
          if (incomingAssociation[mapping.field_name_registrant]) {
            if (mapping.data_type == 'string' || mapping.data_type == 'select') {
              this.domainUtilService.updateField(
                selectedRuleSet[mapping.field_name_registrant],
                matchingAssociation,
                mapping.field_name_agent,
                incomingAssociation[mapping.field_name_registrant]
              );
            }
    
            if (mapping.data_type == 'yes-no') {
              this.domainUtilService.updateField(
                selectedRuleSet[mapping.field_name_registrant],
                matchingAssociation,
                mapping.field_name_agent,
                this.domainUtilService.getYesNoValue(incomingAssociation[mapping.field_name_registrant].trim())
              );
            }
    
            if (mapping.data_type == 'date') {
              this.domainUtilService.updateField(
                selectedRuleSet[mapping.field_name_agent],
                matchingAssociation,
                mapping.field_name_agent,
                new Date(incomingAssociation[mapping.field_name_registrant].trim())
              );
            }
    
            if (mapping.data_type == 'lookup') {          
              let lookupval: string = this.getLookupValue(mapping.values, incomingAssociation[mapping.field_name_registrant]);
    
              this.domainUtilService.updateField(
                selectedRuleSet[mapping.field_name_registrant],
                matchingAssociation,
                mapping.field_name_agent,
                lookupval.trim()
              );
            }
    
            if (mapping.data_type == 'boolean') {
              this.domainUtilService.updateField(
                selectedRuleSet[mapping.field_name_registrant],
                matchingAssociation,
                mapping.field_name_agent,
                this.domainUtilService.getBoolean(incomingAssociation[mapping.field_name_registrant].trim())
              );
            }
          }
        });

        promises.push(
          this.agentAssociationsService
            .update(agent[BaseModelKeys.dbId], matchingAssociation[BaseModelKeys.dbId], matchingAssociation)
            .then((association) => {
              if (association) {
                messages.push(
                  'Associate updated (' + association.first_name + ' ' + association.last_name + ') to ' + agent.p_email
                );
              }
            })
        );
      }
    }

    Promise.all(promises);

    return true;
  }

  private async extractAssociations(invals: Map<string, string>, key: string): Promise<Association[]> {
    const associations: Association[] = [];
    const incomingAssociationsMap: Map<string, string> = this.domainUtilService.getCount(invals, key);

    //split up into different guests
    // let guests: Map<string, Map<string, string>> = new Map<string, Map<string, string>>();

    // guest_map.forEach((v, k) => {
    //   let key_split: string[] = k.split('.');

    //   let guest_vals: Map<string, string>;

    //   if (guests.has(key_split[0] + '.' + key_split[1])) {
    //     guest_vals = guests.get(key_split[0] + '.' + key_split[1]);
    //   } else {
    //     guest_vals = new Map<string, string>();
    //   }

    //   if (k.startsWith(key_split[0] + '.' + key_split[1])) {
    //     if (key_split.length == 4) {
    //       guest_vals.set(key_split[key_split.length - 2] + '.' + key_split[key_split.length - 1], v);
    //     } else {
    //       guest_vals.set(key_split[key_split.length - 1], v);
    //     }

    //     guests.set(key_split[0] + '.' + key_split[1], guest_vals);
    //   }
    // });



    for (const iterator of incomingAssociationsMap) {
      const association: Association = await this.createAssociation(invals, iterator[1], key);
      if (association.first_name) {
        associations.push(association);
      }
    }

    return associations;
  }

  private async createAssociation(invals: Map<string, string>, iteration: string, key: string): Promise<Association> {
    const association: Association = { ...new Association() };

    if (invals.has(key + '.' + iteration + '.first_name')) {
      association.first_name = invals.get(key + '.' + iteration + '.first_name');
    }

    if (invals.has(key + '.' + iteration + '.last_name')) {
      association.last_name = invals.get(key + '.' + iteration + '.last_name');
    }

    if (invals.has(key + '.' + iteration + '.email_address')) {
      association.email_address = invals.get(key + '.' + iteration + '.email_address');
    }

    if (invals.has(key + '.' + iteration + '.contact_number')) {
      association.contact_number = invals
        .get(key + '.' + iteration + '.contact_number')
        .replace('+', '')
        .replace('.', '')
        .replace('.', '')
        .replace('-', '')
        .replace('-', '')
        .replace(' ', '')
        .replace(' ', '')
        .replace('(', '')
        .replace(')', '');

        if(association.contact_number.startsWith('1')){
          association.contact_number = association.contact_number.substring(1);
        }
    }

    if (invals.has(key + '.' + iteration + '.association_type')) {
      const associations = await this.associationTypeLookup$.pipe(take(1)).toPromise();
      const associationType = invals.get(key + '.' + iteration + '.association_type');
      const lookupValue = associations.find((lookup) => {
        return `${associationType}`
          .replace(/\W|_/g, '')
          .toLocaleLowerCase()
          .match(lookup[LookupKeys.value].replace(/\W|_/g, '').toLocaleLowerCase());
      });

      association[AssociationKeys.associationTypeRef] = lookupValue[LookupKeys.reference];
    }

    if (invals.has(key + '.' + iteration + '.is_emergency_contact')) {
      if (invals.get(key + '.' + iteration + '.is_emergency_contact').toUpperCase() == 'TRUE') {
        association.is_emergency_contact = true;
      } else {
        association.is_emergency_contact = false;
      }
    }

    association.address = { ...new Address() };

    if (invals.has(key + '.' + iteration + '.address.address1')) {
      association.address.address1 = invals.get(key + '.' + iteration + '.address.address1');
    }

    if (invals.has(key + '.' + iteration + '.address.address2')) {
      association.address.address2 = invals.get(key + '.' + iteration + '.address.address2');
    }

    if (invals.has(key + '.' + iteration + '.address.city')) {
      association.address.city = invals.get(key + '.' + iteration + '.address.city');
    }

    if (invals.has(key + '.' + iteration + '.address.state')) {
      association.address.state = invals.get(key + '.' + iteration + '.address.state');
    }

    if (invals.has(key + '.' + iteration + '.address.zip')) {
      association.address.zip = invals.get(key + '.' + iteration + '.address.zip');
    }

    if (invals.has(key + '.' + iteration + '.address.county')) {
      association.address.county = invals.get(key + '.' + iteration + '.address.county');
    }

    if (invals.has(key + '.' + iteration + '.address.country')) {
      association.address.country = invals.get(key + '.' + iteration + '.address.country');
    }

    if (invals.has(key + '.' + iteration + '.dietary_or_personal_considerations')) {
      association.dietary_or_personal_considerations = this.domainUtilService.getYesNoValue(
        invals.get(key + '.' + iteration + '.dietary_or_personal_considerations').trim()
      );
    }

    if (invals.has(key + '.' + iteration + '.dietary_consideration')) {
      association.dietary_consideration = invals.get(key + '.' + iteration + '.dietary_consideration');
    }

    if (invals.has(key + '.' + iteration + '.dietary_consideration_type')) {
      association.dietary_consideration_type = invals.get(key + '.' + iteration + '.dietary_consideration_type');
    }

    if (invals.has(key + '.' + iteration + '.p_nick_first_name')) {
      association.p_nick_first_name = invals.get(key + '.' + iteration + '.p_nick_first_name');
    }

    if (invals.has(key + '.' + iteration + '.p_nick_last_name')) {
      association.p_nick_last_name = invals.get(key + '.' + iteration + '.p_nick_last_name');
    }

    if (invals.has(key + '.' + iteration + '.unisex_tshirt_size')) {
      association.unisex_tshirt_size = invals.get(key + '.' + iteration + '.unisex_tshirt_size');
    }

    if (invals.has(key + '.' + iteration + '.unisex_tshirt_size_other')) {
      association.unisex_tshirt_size_other = invals.get(key + '.' + iteration + '.unisex_tshirt_size_other');
    }

    if (invals.has(key + '.' + iteration + '.gender')) {
      association.gender = invals.get(key + '.' + iteration + '.gender');
    }

    if (invals.has(key + '.' + iteration + '.dob')) {
      association.dob = new Date(invals.get(key + '.' + iteration + '.dob'));
    }
    return association;
  }

  getLookupValue(lookupName: string, matchVal: string):string {
    if (!this.lookupsMap.has(lookupName)) {
      console.log("Couldn't find lookups for ", lookupName);
      return '';
    }

    let lookup: ActiveLookup = this.lookupsMap.get(lookupName).find((val) => val.value.toLowerCase() == matchVal.toLowerCase());

    if (lookup) {
      return lookup.dbId;
    } else {
      console.log("Couldn't find lookup value for ", lookupName, matchVal);
      return '';
    }
  };
}
