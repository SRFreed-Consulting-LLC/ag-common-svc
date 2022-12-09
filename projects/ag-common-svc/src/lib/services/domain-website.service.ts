import { Injectable } from '@angular/core';
import {
  ImportRuleSet,
  ImportRuleSetKeys,
} from 'ag-common-lib/lib/models/import-rules/import-ruleset-model';
import {
  Agent,
  AgentKeys,
  BUSINESS_PERSONAL_TYPE,
  Website
} from 'ag-common-lib/public-api';
import { DomainUtilService } from './domain-util.service';

@Injectable({
  providedIn: 'root'
})
export class DomainWebsiteService {
  constructor(private domainUtilService: DomainUtilService) {}

  extractWebsites(invals: Map<string, string>): Website[] {
    let retval: Website[] = [];

    let i: Map<string, string> = this.domainUtilService.getCount(invals, 'websites');

    i.forEach((value, key) => {
      let a: Website = this.createWebsite(invals, key);
      if (a.url) retval.push(a);
    });

    return retval;
  }

  createWebsites(invals: Map<string, string>): Website[] {
    return this.extractWebsites(invals);
  }

  private createWebsite(invals: Map<string, string>, key: string): Website {
    let a: Website = { ...new Website() };
    a.id = this.domainUtilService.generateId();

    if (invals.has('websites.' + key + '.url')) {
      a.url = invals.get('websites.' + key + '.url');
    }

    if (invals.has('websites.' + key + '.website_type')) {
      a.website_type = BUSINESS_PERSONAL_TYPE[invals.get('websites.' + key + '.website_type').toUpperCase()];
    }

    return a;
  }

  updateWebsites(data: Map<string, string>, agent: Agent, selectedRuleSet: ImportRuleSet, messages: string[]) {
    let incoming_websites: Website[] = this.extractWebsites(data);

    if (incoming_websites.length > 0) {
      if (!agent[AgentKeys.websites]) {
        agent[AgentKeys.websites] = [];
      }

      //look at each incoming and update if matching or add to list
      incoming_websites.forEach((incoming_website) => {
        let matching_website: Website = agent[AgentKeys.websites].find((email) => email.url == incoming_website.url);

        if (matching_website) {
          if (incoming_website.website_type) {
            this.domainUtilService.updateField(
              selectedRuleSet[ImportRuleSetKeys.website_website_type],
              matching_website,
              'website_type',
              incoming_website.website_type
            );
            matching_website.website_type = incoming_website.website_type;
          }
        } else {
          agent[AgentKeys.websites].push(incoming_website);
        }
      });
    }

    return true;
  }
}
