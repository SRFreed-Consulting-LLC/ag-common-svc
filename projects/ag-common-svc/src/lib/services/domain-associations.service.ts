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
  constructor(
    private lookupsService: LookupsService,
    private agentAssociationsService: AgentAssociationsService,
    private domainUtilService: DomainUtilService
  ) {
    this.associationTypeLookup$ = this.lookupsService.associationTypeLookup$;
  }

  async extractAssociations(invals: Map<string, string>): Promise<Association[]> {
    const associations: Association[] = [];
    const incomingAssociationsMap: Map<string, string> = this.domainUtilService.getCount(invals, 'association');

    for (const iterator of incomingAssociationsMap) {
      const association: Association = await this.createAssociation(invals, iterator[1]);
      if (association.first_name) {
        associations.push(association);
      }
    }

    return associations;
  }

  async createAssociation(invals: Map<string, string>, key: string): Promise<Association> {
    const association: Association = { ...new Association() };

    if (invals.has('association.' + key + '.first_name')) {
      association.first_name = invals.get('association.' + key + '.first_name');
    }

    if (invals.has('association.' + key + '.last_name')) {
      association.last_name = invals.get('association.' + key + '.last_name');
    }

    if (invals.has('association.' + key + '.email_address')) {
      association.email_address = invals.get('association.' + key + '.email_address');
    }

    if (invals.has('association.' + key + '.contact_number')) {
      association.contact_number = invals
        .get('association.' + key + '.contact_number')
        .replace('(', '')
        .replace(')', '')
        .replace(' ', '')
        .replace(' ', '')
        .replace('-', '')
        .replace('-', '');
    }

    if (invals.has('association.' + key + '.association_type')) {
      const associations = await this.associationTypeLookup$.pipe(take(1)).toPromise();
      const associationType = invals.get('association.' + key + '.association_type');
      const lookupValue = associations.find((lookup) => {
        return `${associationType}`
          .replace(/\W|_/g, '')
          .toLocaleLowerCase()
          .match(lookup[LookupKeys.value].replace(/\W|_/g, '').toLocaleLowerCase());
      });

      association[AssociationKeys.associationTypeRef] = lookupValue[LookupKeys.reference];
    }

    if (invals.has('association.' + key + '.is_emergency_contact')) {
      if (invals.get('association.' + key + '.is_emergency_contact').toUpperCase() == 'TRUE') {
        association.is_emergency_contact = true;
      } else {
        association.is_emergency_contact = false;
      }
    }

    association.address = { ...new Address() };

    if (invals.has('association.' + key + '.address.address1')) {
      association.address.address1 = invals.get('association.' + key + '.address.address1');
    }

    if (invals.has('association.' + key + '.address.address2')) {
      association.address.address2 = invals.get('association.' + key + '.address.address2');
    }

    if (invals.has('association.' + key + '.address.city')) {
      association.address.city = invals.get('association.' + key + '.address.city');
    }

    if (invals.has('association.' + key + '.address.state')) {
      association.address.state = invals.get('association.' + key + '.address.state');
    }

    if (invals.has('association.' + key + '.address.zip')) {
      association.address.zip = invals.get('association.' + key + '.address.zip');
    }

    if (invals.has('association.' + key + '.address.county')) {
      association.address.county = invals.get('association.' + key + '.address.county');
    }

    if (invals.has('association.' + key + '.address.country')) {
      association.address.country = invals.get('association.' + key + '.address.country');
    }

    if (invals.has('association.' + key + '.dietary_or_personal_considerations')) {
      association.dietary_or_personal_considerations = this.domainUtilService.getYesNoValue(
        invals.get('association.' + key + '.dietary_or_personal_considerations').trim()
      );
    }

    if (invals.has('association.' + key + '.dietary_consideration')) {
      association.dietary_consideration = invals.get('association.' + key + '.dietary_consideration');
    }

    if (invals.has('association.' + key + '.dietary_consideration_type')) {
      association.dietary_consideration_type = invals.get('association.' + key + '.dietary_consideration_type');
    }

    if (invals.has('association.' + key + '.p_nick_name')) {
      association.p_nick_first_name = invals.get('association.' + key + '.p_nick_name');
    }

    if (invals.has('association.' + key + '.p_nick_last_name')) {
      association.p_nick_last_name = invals.get('association.' + key + '.p_nick_last_name');
    }

    if (invals.has('association.' + key + '.unisex_tshirt_size')) {
      association.unisex_tshirt_size = invals.get('association.' + key + '.unisex_tshirt_size');
    }

    if (invals.has('association.' + key + '.unisex_tshirt_size_other')) {
      association.unisex_tshirt_size_other = invals.get('association.' + key + '.unisex_tshirt_size_other');
    }
    return association;
  }

  async updateAssociations(
    data: Map<string, string>,
    agent: Agent,
    selectedRuleSet: ImportRuleSet,
    messages: string[]
  ) {
    const promises: Promise<any>[] = [];
    const existingAssociations: Association[] = await this.agentAssociationsService.getAll(agent[BaseModelKeys.dbId]);
    const incomingAssociations: Association[] = await this.extractAssociations(data);

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
              // messages.push(
              //   'Associate created (' + association.first_name + ' ' + association.last_name + ') to ' + agent.p_email
              // );
            }
          })
        );
      }

      if (matchingAssociation) {
        if (incomingAssociation.email_address) {
          this.domainUtilService.updateField(
            selectedRuleSet[ImportRuleSetKeys.email_address_address],
            matchingAssociation,
            'email_address',
            incomingAssociation.email_address
          );
        }
        if (incomingAssociation.contact_number) {
          this.domainUtilService.updateField(
            selectedRuleSet[ImportRuleSetKeys.association_contact_number],
            matchingAssociation,
            'contact_number',
            incomingAssociation.contact_number
          );
        }
        if (incomingAssociation.is_emergency_contact) {
          this.domainUtilService.updateField(
            selectedRuleSet[ImportRuleSetKeys.association_is_emergency_contact],
            matchingAssociation,
            'is_emergency_contact',
            incomingAssociation.is_emergency_contact
          );
        }

        if (incomingAssociation.dietary_or_personal_considerations) {
          this.domainUtilService.updateField(
            selectedRuleSet[ImportRuleSetKeys.association_dietary_or_personal_considerations],
            matchingAssociation,
            'dietary_or_personal_considerations',
            this.domainUtilService.getYesNoValue(incomingAssociation.dietary_or_personal_considerations.trim())
          );
        }
        if (incomingAssociation.dietary_consideration) {
          this.domainUtilService.updateField(
            selectedRuleSet[ImportRuleSetKeys.association_dietary_consideration],
            matchingAssociation,
            'dietary_consideration',
            incomingAssociation.dietary_consideration
          );
        }
        if (incomingAssociation.dietary_consideration_type) {
          this.domainUtilService.updateField(
            selectedRuleSet[ImportRuleSetKeys.association_dietary_consideration_type],
            matchingAssociation,
            'dietary_consideration_type',
            incomingAssociation.dietary_consideration_type
          );
        }
        if (!matchingAssociation.address) {
          matchingAssociation.address = { ...new Address() };
        }
        if (incomingAssociation.address.address1) {
          this.domainUtilService.updateField(
            selectedRuleSet[ImportRuleSetKeys.association_address_address1],
            matchingAssociation.address,
            'address1',
            incomingAssociation.address.address1
          );
        }
        if (incomingAssociation.address.address2) {
          this.domainUtilService.updateField(
            selectedRuleSet[ImportRuleSetKeys.association_address_address2],
            matchingAssociation.address,
            'address2',
            incomingAssociation.address.address2
          );
        }
        if (incomingAssociation.address.city) {
          this.domainUtilService.updateField(
            selectedRuleSet[ImportRuleSetKeys.association_address_city],
            matchingAssociation.address,
            'city',
            incomingAssociation.address.city
          );
        }
        if (incomingAssociation.address.state) {
          this.domainUtilService.updateField(
            selectedRuleSet[ImportRuleSetKeys.association_address_state],
            matchingAssociation.address,
            'state',
            incomingAssociation.address.state
          );
        }
        if (incomingAssociation.address.zip) {
          this.domainUtilService.updateField(
            selectedRuleSet[ImportRuleSetKeys.association_address_zip],
            matchingAssociation.address,
            'zip',
            incomingAssociation.address.zip
          );
        }
        if (incomingAssociation.address.county) {
          this.domainUtilService.updateField(
            selectedRuleSet[ImportRuleSetKeys.association_address_county],
            matchingAssociation.address,
            'county',
            incomingAssociation.address.county
          );
        }
        if (incomingAssociation.address.country) {
          this.domainUtilService.updateField(
            selectedRuleSet[ImportRuleSetKeys.association_address_country],
            matchingAssociation.address,
            'country',
            incomingAssociation.address.country
          );
        }

        if (incomingAssociation[AssociationKeys.associationTypeRef]) {
          this.domainUtilService.updateField(
            selectedRuleSet[ImportRuleSetKeys.association_association_type],
            matchingAssociation,
            AssociationKeys.associationTypeRef,
            incomingAssociation[AssociationKeys.associationTypeRef]
          );
        }

        promises.push(
          this.agentAssociationsService
            .update(agent[BaseModelKeys.dbId], matchingAssociation[BaseModelKeys.dbId], matchingAssociation)
            .then((association) => {
              if (association) {
                // messages.push(
                //   'Associate updated (' + association.first_name + ' ' + association.last_name + ') to ' + agent.p_email
                // );
              }
            })
        );
      }
    }

    Promise.all(promises);

    return true;
  }
}
