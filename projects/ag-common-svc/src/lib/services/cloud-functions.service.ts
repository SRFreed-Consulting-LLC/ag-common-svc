import { Inject, Injectable } from '@angular/core';
import {
  DeleteAgent,
  DeleteFirebaseUser,
  FunctionsNames,
  SendOTP,
  UpdateUserLoginEmail,
} from 'ag-common-lib/public-api';
import { FirebaseApp } from 'firebase/app';
import { Functions, getFunctions, httpsCallable } from 'firebase/functions';
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

  public deleteAgent = (agentDbId: string): Promise<any> => {
    const payload: DeleteAgent = { agentDbId };

    return httpsCallable(this.functions, FunctionsNames.deleteAgent)(payload);
  };

  public deleteFirebaseUser = (uid: string): Promise<any> => {
    const payload: DeleteFirebaseUser = { uid };

    return httpsCallable(this.functions, FunctionsNames.deleteFirebaseUser)(payload);
  };

  public findAgentDbIdByLoginEmail = (payload: { email }): Promise<string> =>
    httpsCallable<{ email: string }, string>(
      this.functions,
      FunctionsNames.findAgentDbIdByLoginEmail,
    )(payload).then((response) => response?.data);

  public updateUserLoginEmail = (payload: UpdateUserLoginEmail): Promise<any> =>
    httpsCallable(this.functions, FunctionsNames.updateUserLoginEmail)(payload);
}
