import { Injectable } from '@angular/core';
import { ImportFieldRule, PrimaryFieldRule } from 'ag-common-lib/lib/models/import-rules/import-ruleset-model';

@Injectable({
  providedIn: 'root'
})
export class DomainUtilService {

  constructor() { }

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
