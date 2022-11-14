import { Inject, Injectable } from '@angular/core';
import { Prospect } from 'ag-common-lib/public-api';
import { FirebaseApp } from 'firebase/app';
import { FIREBASE_APP } from '../injections/firebase-app';
import { dateFromTimestamp } from '../utils/date-from-timestamp';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class ProspectService extends DataService<Prospect> {
  constructor(@Inject(FIREBASE_APP) fireBaseApp: FirebaseApp) {
    super(fireBaseApp, ProspectService.fromFirestore);
    super.collection = 'prospects';
  }

  static readonly fromFirestore = (data): Prospect => {
    return Object.assign({}, data, {
      inquiry_received_date: dateFromTimestamp(data?.inquiry_received_date)
    });
  };
}
