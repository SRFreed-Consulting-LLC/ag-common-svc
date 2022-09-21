import { Inject, Injectable } from '@angular/core';
import { Agent } from 'ag-common-lib/public-api';
import { FirebaseApp } from 'firebase/app';
import { FIREBASE_APP } from '../injections/firebase-app';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class AgentService extends DataService<Agent> {
  constructor(@Inject(FIREBASE_APP) fireBaseApp: FirebaseApp) {
    super(fireBaseApp, null, AgentService.toFirestore);
    super.collection = 'agents';
  }

  static readonly toFirestore = (data: Agent): Agent => {
    const fullName = [data?.p_agent_first_name, data?.p_agent_last_name].filter(Boolean).join(' ');

    return Object.assign(data, {
      p_agent_name: fullName
    });
  };
}
