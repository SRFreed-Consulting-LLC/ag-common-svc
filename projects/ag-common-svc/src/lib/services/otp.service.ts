import { Inject, Injectable } from '@angular/core';
import { differenceInSeconds, isFuture } from 'date-fns';
import { FirebaseApp } from 'firebase/app';
import { Timestamp } from 'firebase/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { CommonFireStoreDao } from '../dao/CommonFireStoreDao.dao';
import { FIREBASE_APP } from '../injections/firebase-app';
import { dateFromTimestamp } from '../utils/date-from-timestamp';
import { CloudFunctionsService } from './cloud-functions.service';

@Injectable()
export class OtpService {
  private readonly RESENT_TIMEOUT = 45;

  private readonly fsDao: CommonFireStoreDao<any>;
  private collection = 'otp';

  public isResendAvailable$: Observable<boolean>;
  private readonly _isResendAvailable$ = new BehaviorSubject<boolean>(true);

  public resendTimeout$: Observable<number>;
  private readonly _resendTimeout$ = new BehaviorSubject<number>(this.RESENT_TIMEOUT);

  public isSendOTPInProgress$: Observable<boolean>;
  private readonly _isSendOTPInProgress$ = new BehaviorSubject<boolean>(false);

  public isOTPSended$: Observable<boolean>;
  private readonly _isOTPSended$ = new BehaviorSubject<boolean>(false);
  private _lastCountdownValue: Date;

  constructor(@Inject(FIREBASE_APP) fireBaseApp: FirebaseApp, private cloudFunctionsService: CloudFunctionsService) {
    this.fsDao = new CommonFireStoreDao<any>(fireBaseApp, OtpService.fromFirestore, null);

    this.isSendOTPInProgress$ = this._isSendOTPInProgress$.asObservable();
    this.isOTPSended$ = this._isOTPSended$.asObservable();
    this.isResendAvailable$ = this._isResendAvailable$.asObservable();
    this.resendTimeout$ = this._resendTimeout$.asObservable();
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

  public sendOtp = async (email) => {
    try {
      this._isOTPSended$.next(false);
      this._isSendOTPInProgress$.next(true);
      this._isResendAvailable$.next(false);
      await this.cloudFunctionsService
        .sendOTP({ email })
        .then((data) => {
          this.startCountdown();
          this._isOTPSended$.next(true);
        })
        .catch((e) => {
          this._isResendAvailable$.next(true);
        })
        .finally(() => {
          this._isSendOTPInProgress$.next(false);
        });
    } catch (error) {
      debugger;
    }
  };

  private startCountdown = () => {
    const currentDate = new Date();

    if (!this._lastCountdownValue) {
      this._isResendAvailable$.next(false);
      this._resendTimeout$.next(this.RESENT_TIMEOUT);
      this._lastCountdownValue = currentDate;
      setTimeout(this.startCountdown, 100);

      return;
    }

    const diff = differenceInSeconds(currentDate, this._lastCountdownValue);
    const resendTimeout = this._resendTimeout$.value;
    const secondsLeft = resendTimeout - diff;

    if (secondsLeft <= 0) {
      this._resendTimeout$.next(0);
      this._isResendAvailable$.next(true);
      this._lastCountdownValue = null;
      return;
    }

    if (diff > 0) {
      this._resendTimeout$.next(secondsLeft);
      this._lastCountdownValue = currentDate;
    }

    setTimeout(this.startCountdown, 100);
  };
}
