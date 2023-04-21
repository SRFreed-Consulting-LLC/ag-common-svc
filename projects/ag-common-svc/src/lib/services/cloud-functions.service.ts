import { Inject, Injectable } from '@angular/core';
import {
  Agent,
  BindUserToAgent,
  ConfirmEmail,
  DeleteAgent,
  DeleteFirebaseUser,
  FunctionsNames,
  SendOTP,
  UpdateUserLoginEmail,
} from 'ag-common-lib/public-api';
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
    connectFunctionsEmulator(this.functions, "localhost", 5001);
  }

  public sendOTP = (payload: SendOTP): Promise<any> => httpsCallable(this.functions, FunctionsNames.sendOTP)(payload);

  public bindUserToAgent = (uid: string, agentDbId: string): Promise<any> => {
    const payload: BindUserToAgent = { uid, agentDbId };

    return httpsCallable(this.functions, FunctionsNames.bindUserToAgent)(payload);
  };

  public confirmEmail = (payload: ConfirmEmail): Promise<any> => {
    return httpsCallable(this.functions, FunctionsNames.confirmEmail)(payload);
  };

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

  public updateSalesGoals = (payload: Partial<Agent[]>): Promise<any> => {
    return httpsCallable(this.functions, FunctionsNames.updateSalesGoals)(payload);
  };
}
