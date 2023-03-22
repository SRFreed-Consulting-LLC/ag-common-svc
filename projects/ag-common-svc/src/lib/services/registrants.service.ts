import { Inject, Injectable } from '@angular/core';
import { Registrant } from 'ag-common-lib/public-api';
import { FirebaseApp } from 'firebase/app';
import { FIREBASE_APP } from '../injections/firebase-app';
import { DataService } from './data.service';
import { QueryParam, WhereFilterOperandKeys } from '../../public-api';

@Injectable({
  providedIn: 'root'
})
export class RegistrantsService extends DataService<Registrant> {
  constructor(@Inject(FIREBASE_APP) fireBaseApp: FirebaseApp) {
    super(fireBaseApp);
    super.collection = 'registrants';
  }

  getRegistrantsByAgentId(agent_id: string, sortField?: string): Promise<Registrant[]>{
    let qp: QueryParam[] = [];
    qp.push(new QueryParam('agent_id', WhereFilterOperandKeys.equal, agent_id));

    return this.getAllByValue(qp, sortField)
  }

  getRegistrantsByInviteeEmail(invitee_email: string, sortField?: string): Promise<Registrant[]>{
    let qp: QueryParam[] = [];
    qp.push(new QueryParam('invitee_email', WhereFilterOperandKeys.equal, invitee_email));
    qp.push(new QueryParam('invitee_guest', WhereFilterOperandKeys.equal, 'Invitee'));
    return this.getAllByValue(qp, sortField)
  }

  getRegistrantsByEventId(event_id: string, sortField: string): Promise<Registrant[]>{
    let qp: QueryParam[] = [];
    qp.push(new QueryParam('event_id', WhereFilterOperandKeys.equal, event_id));

    return this.getAllByValue(qp, sortField)
  }

  getRegistrantsByEventIdAndApprovalFlag(event_id: string, approved: boolean, sortField: string): Promise<Registrant[]>{
    let qp: QueryParam[] = [];
    qp.push(new QueryParam('event_id', WhereFilterOperandKeys.equal, event_id));
    qp.push(new QueryParam('approved', WhereFilterOperandKeys.equal, approved));

    return this.getAllByValue(qp, sortField)
  }

  getRegistrantByEventIdAndEmail(event_id: string, email_address: string): Promise<Registrant>{
    let qp: QueryParam[] = [];
    qp.push(new QueryParam('event_id', WhereFilterOperandKeys.equal, event_id));
    qp.push(new QueryParam('agent.p_email', WhereFilterOperandKeys.equal, email_address));

    return this.getAllByValue(qp).then(registrants => {
      if(registrants.length == 0){
        return null;
      } else if (registrants.length == 1){
        return registrants[0];
      } else {
        console.error("More than 1 registrant found with this email address for this event");
        return null;
      }
    })
  }
}
