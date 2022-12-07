import { Injectable } from '@angular/core';
import {
  ImportFieldRule,
  ImportRuleSet,
  ImportRuleSetKeys,
  PrimaryFieldRule
} from 'ag-common-lib/lib/models/import-rules/import-ruleset-model';
import {
  Agent,
  AgentKeys,
  BUSINESS_PERSONAL_TYPE,
  Social,
  SOCIAL_MEDIA,
} from 'ag-common-lib/public-api';

@Injectable({
  providedIn: 'root'
})
export class DomainSocialsService {
  constructor() {}

  extractSocials(invals: Map<string, string>): Social[] {
    let retval: Social[] = [];

    let i: Map<string, string> = this.getCount(invals, 'socials');

    i.forEach((value, key) => {
      let a: Social = this.createSocial(invals, key);
      if (a.url) retval.push(a);
    });

    return retval;
  }

  createSocial(invals: Map<string, string>, key: string): Social {
    let a: Social = { ...new Social() };
    a.id = this.generateId();

    if (invals.has('socials.' + key + '.url')) {
      a.url = invals.get('socials.' + key + '.url');
    }

    if (invals.has('socials.' + key + '.social_type')) {
      a.social_type = BUSINESS_PERSONAL_TYPE[invals.get('socials.' + key + '.social_type').toUpperCase()];
    }

    if (invals.has('socials.' + key + '.social_media')) {
      a.social_media = SOCIAL_MEDIA[invals.get('socials.' + key + '.social_media').toUpperCase()];
    }

    return a;
  }

  updateSocials(data: Map<string, string>, agent: Agent, selectedRuleSet: ImportRuleSet, messages: string[]) {
    let incoming_socials: Social[] = this.extractSocials(data);

    if (incoming_socials.length > 0) {
      if (!agent[AgentKeys.socials]) {
        agent[AgentKeys.socials] = [];
      }

      //look at each incoming and update if matching or add to list
      incoming_socials.forEach((incoming_social) => {
        let matching_social: Social = agent[AgentKeys.socials].find((email) => email.url == incoming_social.url);

        if (matching_social) {
          if (incoming_social.social_type) {
            this.updateField(
              selectedRuleSet[ImportRuleSetKeys.social_social_type],
              matching_social,
              'social_type',
              incoming_social.social_type
            );
          }

          if (incoming_social.social_media) {
            this.updateField(
              selectedRuleSet[ImportRuleSetKeys.social_social_media],
              matching_social,
              'social_media',
              incoming_social.social_media
            );
          }
        } else {
          agent[AgentKeys.socials].push(incoming_social);
        }
      });
    }

    return true;
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
