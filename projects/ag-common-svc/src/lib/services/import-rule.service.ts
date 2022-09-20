import { Inject, Injectable } from '@angular/core';
import { ImportRule } from 'ag-common-lib/lib/models/import-rules/import-rule.model';

import { FirebaseApp } from 'firebase/app';
import { FIREBASE_APP } from '../injections/firebase-app';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class ImportRuleService extends DataService<ImportRule> {
  constructor(@Inject(FIREBASE_APP) fireBaseApp: FirebaseApp) {
    super(fireBaseApp);
    super.collection = 'import-rule';
  }
}
