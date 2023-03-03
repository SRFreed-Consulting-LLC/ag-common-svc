import { Inject, Injectable } from '@angular/core';
import { FunctionsNames, SendOTP, UpdateUserLoginEmail } from 'ag-common-lib/public-api';
import { FirebaseApp } from 'firebase/app';
import { connectFunctionsEmulator, Functions, getFunctions, httpsCallable } from 'firebase/functions';
import { FIREBASE_APP } from '../injections/firebase-app';

@Injectable({
  providedIn: 'root',
})
export class CloudFunctionsService {
  private functions: Functions;

  constructor(@Inject(FIREBASE_APP) fireBaseApp: FirebaseApp) {
    this.functions = getFunctions(fireBaseApp);
  }

  public sendOTP = (payload: SendOTP): Promise<any> => httpsCallable(this.functions, FunctionsNames.sendOTP)(payload);

  public updateUserLoginEmail = (payload: UpdateUserLoginEmail): Promise<any> =>
    httpsCallable(this.functions, FunctionsNames.updateUserLoginEmail)(payload);
}
