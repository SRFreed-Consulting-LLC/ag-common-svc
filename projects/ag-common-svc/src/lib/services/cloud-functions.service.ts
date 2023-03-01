import { Inject, Injectable } from '@angular/core';
import { FirebaseApp } from 'firebase/app';
import { Functions, getFunctions, HttpsCallable, httpsCallable } from 'firebase/functions';
import { FIREBASE_APP } from '../injections/firebase-app';

@Injectable({
  providedIn: 'root',
})
export class CloudFunctionsService {
  public sendOTP: HttpsCallable;
  public sendOTPOnCall: HttpsCallable;

  private functions: Functions;

  constructor(@Inject(FIREBASE_APP) fireBaseApp: FirebaseApp) {
    this.functions = getFunctions(fireBaseApp);

    this.sendOTP = httpsCallable(this.functions, 'sendOTP');
    this.sendOTPOnCall = httpsCallable(this.functions, 'sendOTPOnCall');
  }

  public updateUserLoginEmail = ({ uid, agentDbId, emailAddressDbId }): Promise<any> =>
    httpsCallable(this.functions, 'updateUserLoginEmail')({ uid, agentDbId, emailAddressDbId });
}
