import { Inject, Injectable } from '@angular/core';
import { Agent, AgentKeys } from 'ag-common-lib/public-api';
import { FirebaseApp } from 'firebase/app';
import { Timestamp } from 'firebase/firestore';
import { FIREBASE_APP } from '../injections/firebase-app';
import { dateFromTimestamp } from '../utils/date-from-timestamp';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class AgentService extends DataService<Agent> {
  constructor(@Inject(FIREBASE_APP) fireBaseApp: FirebaseApp) {
    super(fireBaseApp, AgentService.fromFirestore, AgentService.toFirestore);
    super.collection = 'agents';
  }

  static readonly fromFirestore = (data): Agent => {

    data[AgentKeys.approve_deny_reasons]?.forEach(reason => {
      reason.created_date = dateFromTimestamp(reason.created_date as Timestamp)
    });

    return Object.assign({}, data, {
      [AgentKeys.campaigns_user_since]: dateFromTimestamp(data?.campaigns_user_since as Timestamp)
    });
  };

  static readonly toFirestore = (data: Agent): Agent => {
    const fullName = [data[AgentKeys.p_agent_first_name], data[AgentKeys.p_agent_last_name]].filter(Boolean).join(' ');

    return Object.assign(data, {
      [AgentKeys.p_agent_name]: fullName
    });
  };
}
