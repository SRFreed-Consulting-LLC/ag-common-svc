import { Inject, Injectable } from '@angular/core';
import { Agency } from 'ag-common-lib/public-api';
import { isFuture, isPast } from 'date-fns';
import { FirebaseApp } from 'firebase/app';
import { Timestamp } from 'firebase/firestore';
import { CommonFireStoreDao } from '../dao/CommonFireStoreDao.dao';
import { FIREBASE_APP } from '../injections/firebase-app';
import { dateFromTimestamp } from '../utils/date-from-timestamp';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class OtpService {
  private readonly fsDao: CommonFireStoreDao<any>;
  private collection = 'otp';

  constructor(@Inject(FIREBASE_APP) fireBaseApp: FirebaseApp) {
    this.fsDao = new CommonFireStoreDao<any>(fireBaseApp, OtpService.fromFirestore, null);
  }

  static readonly fromFirestore = (data): any => {
    return Object.assign({}, data, {
      expirationDate: dateFromTimestamp(data?.expirationDate as Timestamp),
    });
  };

  public validateOTP = (otp, email) => {
    return this.fsDao.getById(this.collection, otp).then((item) => {
      const isValid = item?.email === email && isFuture(item?.expirationDate);

      return isValid;
    });
  };
}
