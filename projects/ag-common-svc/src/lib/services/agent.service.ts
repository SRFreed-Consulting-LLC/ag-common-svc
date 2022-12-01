import { Inject, Injectable } from '@angular/core';
import { Agent, AgentKeys } from 'ag-common-lib/public-api';
import { FirebaseApp } from 'firebase/app';
import { Timestamp } from 'firebase/firestore';
import { QueryParam, WhereFilterOperandKeys } from '../../public-api';
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

  getAgentByEmail(email: string): Promise<Agent>{
    return this.getAllByValue([new QueryParam('p_email', WhereFilterOperandKeys.equal, email)]).then(agents => {
      if(agents.length == 0){
        return null;
      } else if (agents.length == 1){
        return agents[0];
      } else {
        console.error("More than 1 agent found with this email address");
        return null;
      }
    })
  }

  getAgentByAgentId(id: string): Promise<Agent>{
    return this.getAllByValue([new QueryParam('p_agent_id', WhereFilterOperandKeys.equal, id)]).then(agents => {
      if(agents.length == 0){
        return null;
      } else if (agents.length == 1){
        return agents[0];
      } else {
        console.error("More than 1 agent found with this agent id");
        return null;
      }
    })
  }

  getAgentForChristmasCardList(): Promise<Agent[]>{
    return this.getAllByValue([new QueryParam(AgentKeys.christmasCard, WhereFilterOperandKeys.equal, true)]);
  }

  getAgentsByAgencyId(id: string, sortField: string): Promise<Agent[]>{
    return this.getAllByValue([new QueryParam('p_agency_id', WhereFilterOperandKeys.equal, id)], sortField);
  }

  getAgentsByProspectStatuses(id: string[], sortField: string): Promise<Agent[]>{
    return this.getAllByValue([new QueryParam('prospect_status', WhereFilterOperandKeys.in, id)], sortField);
  }

  getAgentsByAgentStatuses(id: string[], sortField: string): Promise<Agent[]>{
    return this.getAllByValue([new QueryParam('agent_status', WhereFilterOperandKeys.in, id)], sortField);
  }

  getMGAsByMGAId(id: string, sortField: string): Promise<Agent[]>{
    return this.getAllByValue([new QueryParam('p_mga_id', WhereFilterOperandKeys.equal, id)], sortField);
  }

  getManagersByMGAId(id: string, sortField: string): Promise<Agent[]>{
    let qp: QueryParam[] = [];
    qp.push(new QueryParam('is_manager', WhereFilterOperandKeys.equal, true));
    qp.push(new QueryParam('p_mga_id', WhereFilterOperandKeys.equal, id));

    return this.getAllByValue(qp, sortField);
  }

  getManagersByAgencyId(id: string, sortField: string): Promise<Agent[]>{
    let qp: QueryParam[] = [];
    qp.push(new QueryParam('is_manager', WhereFilterOperandKeys.equal, true));
    qp.push(new QueryParam('p_agency_id', WhereFilterOperandKeys.equal, id));

    return this.getAllByValue(qp, sortField);
  }
  
}
