import { Injectable } from '@angular/core';
import {
  ImportRuleSet,
  ImportRuleSetKeys,
} from 'ag-common-lib/lib/models/import-rules/import-ruleset-model';
import {
  Agent,
  AgentKeys,
  BUSINESS_PERSONAL_TYPE,
  Social,
} from 'ag-common-lib/public-api';
import { DomainUtilService } from './domain-util.service';
import { SOCIAL_MEDIA } from 'ag-common-lib/lib/lists/social-media-types.enum';

@Injectable({
  providedIn: 'root'
})
export class DomainSocialsService {
  constructor(private domainUtilService: DomainUtilService) {}

  extractSocials(invals: Map<string, string>): Social[] {
    let retval: Social[] = [];

    let i: Map<string, string> = this.domainUtilService.getCount(invals, 'socials');

    i.forEach((value, key) => {
      let a: Social = this.createSocial(invals, key);
      if (a.url) retval.push(a);
    });

    return retval;
  }

  createSocials(invals: Map<string, string>): Social[] {
    return this.extractSocials(invals);
  }

  private createSocial(invals: Map<string, string>, key: string): Social {
    let a: Social = { ...new Social() };
    a.id = this.domainUtilService.generateId();

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
            this.domainUtilService.updateField(
              selectedRuleSet[ImportRuleSetKeys.social_social_type],
              matching_social,
              'social_type',
              incoming_social.social_type
            );
          }

          if (incoming_social.social_media) {
            this.domainUtilService.updateField(
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
}
