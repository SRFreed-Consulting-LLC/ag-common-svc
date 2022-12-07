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
  Website
} from 'ag-common-lib/public-api';

@Injectable({
  providedIn: 'root'
})
export class DomainWebsiteService {
  constructor() {}

  extractWebsites(invals: Map<string, string>): Website[] {
    let retval: Website[] = [];

    let i: Map<string, string> = this.getCount(invals, 'websites');

    i.forEach((value, key) => {
      let a: Website = this.createWebsite(invals, key);
      if (a.url) retval.push(a);
    });

    return retval;
  }

  createWebsite(invals: Map<string, string>, key: string): Website {
    let a: Website = { ...new Website() };
    a.id = this.generateId();

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
            this.updateField(
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

  getBoolean(value) {
    switch (value) {
      case true:
      case 'true':
      case 'True':
      case 'TRUE':
      case 1:
      case '1':
      case 'on':
      case 'On':
      case 'ON':
      case 'yes':
      case 'Yes':
      case 'YES':
        return true;
      default:
        return false;
    }
  }

  getYesNoValue(value) {
    switch (value) {
      case true:
      case 'true':
      case 'TRUE':
      case 'T':
      case 't':
      case 'YES':
      case 'yes':
      case 'Y':
      case 'y':
        return 'Yes';
      default:
        return 'No';
    }
  }
}
