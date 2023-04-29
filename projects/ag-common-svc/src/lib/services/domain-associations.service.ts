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
  LookupKeys
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
  lookupsMap: Map<string, ActiveLookup[]>;

  constructor(
    private agentAssociationsService: AgentAssociationsService,
    private domainUtilService: DomainUtilService
  ) {}

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
      if (k.startsWith(key)) {
        let key_split: string[] = k.split('.');

        let association_vals: Map<string, string>;

        if (associations_map.has(k.split('.')[0] + '.' + k.split('.')[1])) {
          association_vals = associations_map.get(key_split[0] + '.' + key_split[1]);
        } else {
          association_vals = new Map<string, string>();
        }

        association_vals.set(k, v);

        associations_map.set(key_split[0] + '.' + key_split[1], association_vals);
      }
    });

    const incomingAssociations: Association[] = [];

    //iterate through assocations_map and create incoming association for each
    associations_map.forEach((v, k) => {
      if (k.startsWith(key)) {
        let association_map: Map<string, string> = v;

        let association: Association = { ...new Association() };

        // selectedRuleSet.import_mappings.forEach(async (mapping) => {
        //   if (association_map.has(mapping.field_name_agent) && association_map.get(mapping.field_name_agent) != '') {
        //     let modified_field_name =
        //       mapping.field_name_agent.split('.')[mapping.field_name_agent.split('.').length - 1];
        //     let incoming_value = association_map.get(mapping.field_name_agent);

        //     if (mapping.data_type == 'string' || mapping.data_type == 'select' || mapping.data_type == 'currency') {
        //       //should introduce type = 'phone number'
        //       if (modified_field_name == 'contact_number') {
        //         incoming_value = incoming_value
        //           .replace('+', '')
        //           .replace('.', '')
        //           .replace('.', '')
        //           .replace('-', '')
        //           .replace('-', '')
        //           .replace(' ', '')
        //           .replace(' ', '')
        //           .replace('(', '')
        //           .replace(')', '');

        //         if (incoming_value.startsWith('1')) {
        //           incoming_value = incoming_value.substring(1);
        //         }
        //       }
        //       association[modified_field_name] = incoming_value;
        //     }

        //     if (mapping.data_type == 'yes-no') {
        //       association[modified_field_name] = this.domainUtilService.getYesNoValue(incoming_value.trim());
        //     }

        //     if (mapping.data_type == 'date') {
        //       association[modified_field_name] = new Date(incoming_value);
        //     }

        //     if (mapping.data_type == 'lookup') {
        //       let lookup = this.getLookupValue(mapping.values, incoming_value);

        //       association[modified_field_name] = lookup;
        //     }

        //     if (mapping.data_type == 'boolean') {
        //       association[modified_field_name] = this.domainUtilService.getBoolean(incoming_value);
        //     }
        //   }
        // });

        if (association.first_name && association.last_name) {
          incomingAssociations.push(association);
        }
      }
    });

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
      } else {
        // selectedRuleSet.import_mappings.forEach(async (mapping) => {
        //   if (mapping.field_name_agent && mapping.field_name_agent != '') {
        //     let modified_field_name = mapping.field_name_agent.split(".")[mapping.field_name_agent.split(".").length-1];
        //     let incoming_value = incomingAssociation[modified_field_name];

        //     //try to trim value if allowed
        //     try{
        //       incoming_value = incomingAssociation[modified_field_name].trim();
        //     } catch(err){

        //     }

        //     //added 'association_' +  as a temp fix to get the correct rule
        //     if (incomingAssociation[modified_field_name]) {
        //       if (mapping.data_type == 'string' || mapping.data_type == 'select' || mapping.data_type == 'currency') {
        //         this.domainUtilService.updateField(
        //           selectedRuleSet['association_' + modified_field_name],
        //           matchingAssociation,
        //           modified_field_name,
        //           incoming_value
        //         );
        //       }

        //       if (mapping.data_type == 'yes-no') {
        //         this.domainUtilService.updateField(
        //           selectedRuleSet['association_' + modified_field_name],
        //           matchingAssociation,
        //           modified_field_name,
        //           this.domainUtilService.getYesNoValue(incoming_value)
        //         );
        //       }

        //       if (mapping.data_type == 'date') {
        //         this.domainUtilService.updateField(
        //           selectedRuleSet['association_' + modified_field_name],
        //           matchingAssociation,
        //           modified_field_name,
        //           new Date(incoming_value)
        //         );
        //       }

        //       if (mapping.data_type == 'lookup') {
        //         this.domainUtilService.updateField(
        //           selectedRuleSet['association_' + modified_field_name],
        //           matchingAssociation,
        //           modified_field_name,
        //           incoming_value
        //         );
        //       }

        //       if (mapping.data_type == 'boolean') {
        //         this.domainUtilService.updateField(
        //           selectedRuleSet['association_' + modified_field_name],
        //           matchingAssociation,
        //           modified_field_name,
        //           this.domainUtilService.getBoolean(incoming_value)
        //         );
        //       }
        //     }
        //   }
        // });

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

  getLookupValue(lookupName: string, matchVal: string): string {
    if (!this.lookupsMap.has(lookupName)) {
      console.log("Couldn't find lookups for ", lookupName);
      return '';
    }

    let lookup: ActiveLookup = this.lookupsMap
      .get(lookupName)
      .find((val) => val.value.toLowerCase() == matchVal.toLowerCase());

    if (lookup) {
      return lookup.dbId;
    } else {
      console.log("Couldn't find lookup value for ", lookupName, matchVal);
      return '';
    }
  }
}
