import { Inject, Injectable } from '@angular/core';
import { Prospect } from 'ag-common-lib/public-api';
import { FirebaseApp } from 'firebase/app';
import { FIREBASE_APP } from '../injections/firebase-app';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class ProspectService extends DataService<Prospect> {
  constructor(@Inject(FIREBASE_APP) fireBaseApp: FirebaseApp) {
    super(fireBaseApp);
    super.collection = 'prospects';
  }
}
