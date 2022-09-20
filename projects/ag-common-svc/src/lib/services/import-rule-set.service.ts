import { Inject, Injectable } from '@angular/core';
import { ImportRuleSet } from 'ag-common-lib/lib/models/import-rules/import-rule-set.model';
import { FirebaseApp } from 'firebase/app';
import { FIREBASE_APP } from '../injections/firebase-app';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class ImportRuleSetService extends DataService<ImportRuleSet> {
  constructor(@Inject(FIREBASE_APP) fireBaseApp: FirebaseApp) {
    super(fireBaseApp);
    super.collection = 'import-rules';
  }
}
