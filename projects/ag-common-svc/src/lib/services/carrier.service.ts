import { Inject, Injectable } from '@angular/core';
import { Carrier } from 'ag-common-lib/public-api';
import { FirebaseApp } from 'firebase/app';
import { FIREBASE_APP } from '../injections/firebase-app';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class CarrierService extends DataService<Carrier> {
  constructor(@Inject(FIREBASE_APP) fireBaseApp: FirebaseApp) {
    super(fireBaseApp);
    super.collection = 'carriers';
  }
}
