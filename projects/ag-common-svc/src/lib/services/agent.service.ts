import { Inject, Injectable } from '@angular/core';
import { Agent, AgentKeys } from 'ag-common-lib/public-api';
import { FirebaseApp } from 'firebase/app';
import { collectionGroup, getDocs, query, QueryConstraint, QuerySnapshot, Timestamp, where } from 'firebase/firestore';
import { QueryParam, WhereFilterOperandKeys } from '../../public-api';
import { FIREBASE_APP } from '../injections/firebase-app';
import { dateFromTimestamp } from '../utils/date-from-timestamp';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class AgentService extends DataService<Agent> {
  private readonly emailAddressCollectionPath = 'email-addresses';

  constructor(@Inject(FIREBASE_APP) fireBaseApp: FirebaseApp) {
    super(fireBaseApp, AgentService.fromFirestore);
    super.collection = 'agents';
  }

  static readonly fromFirestore = (data): Agent => {
    data[AgentKeys.approve_deny_reasons]?.forEach((reason) => {
      reason.created_date = dateFromTimestamp(reason.created_date as Timestamp);
    });

    const fullName = [data[AgentKeys.p_agent_first_name], data[AgentKeys.p_agent_last_name]].filter(Boolean).join(' ');

    return Object.assign({}, data, {
      [AgentKeys.p_agent_name]: fullName,
      [AgentKeys.registrant_review_level_update_date]: dateFromTimestamp(
        data?.registrant_review_level_update_date as Timestamp
      ),
      [AgentKeys.prospect_status_update_date]: dateFromTimestamp(data?.prospect_status_update_date as Timestamp),
      [AgentKeys.campaigns_user_since]: dateFromTimestamp(data?.campaigns_user_since as Timestamp),
      [AgentKeys.dob]: dateFromTimestamp(data?.dob as Timestamp),
      [AgentKeys.first_login_date]: dateFromTimestamp(data?.first_login_date as Timestamp),
      [AgentKeys.last_login_date]: dateFromTimestamp(data?.last_login_date as Timestamp),
      [AgentKeys.registrationDate]: dateFromTimestamp(data?.registrationDate as Timestamp),
      [AgentKeys.personal_goals]: Array.isArray(data?.personal_goals) ? data?.personal_goals : [],
      [AgentKeys.conference_goals]: Array.isArray(data?.conference_goals) ? data?.conference_goals : []
    });
  };

  public updateFields(documentId: string, data: Partial<Agent>): Promise<Agent> {
    if (AgentKeys.agent_review_level in data) {
      Object.assign(data, { [AgentKeys.registrant_review_level_update_date]: new Date() });
    }

    if (AgentKeys.prospect_status in data) {
      Object.assign(data, { [AgentKeys.prospect_status_update_date]: new Date() });
    }

    return super.updateFields(documentId, data);
  }

  public findAgentByLoginEmail = async (email) => {
    const queries: QueryParam[] = [];

    const emailAddressQuery = new QueryParam('address', WhereFilterOperandKeys.equal, email);
    const isLoginQuery = new QueryParam('is_login', WhereFilterOperandKeys.equal, true);

    queries.push(emailAddressQuery);
    queries.push(isLoginQuery);

    const queryConstraints: QueryConstraint[] = queries.map((query) =>
      where(query.field, query.operation, query.value)
    );

    const collectionGroupRef = collectionGroup(this.fsDao.db, this.emailAddressCollectionPath).withConverter({
      toFirestore: null,
      fromFirestore: this.fsDao.convertResponse
    });

    const collectionGroupQuery = query(collectionGroupRef, ...queryConstraints);
    const querySnapshot = await getDocs(collectionGroupQuery);

    if (!querySnapshot.size) {
      return null;
    }
    if (querySnapshot.size > 1) {
      throw new Error('More That One Agents With same login email was found');
    }

    const document = querySnapshot.docs[0];
    const parentDbId = document?.ref?.parent?.parent?.id;

    return this.fsDao.getById(this.collection, parentDbId);
  };

  getAgentByEmail(email: string): Promise<Agent> {
    return this.getAllByValue([new QueryParam('p_email', WhereFilterOperandKeys.equal, email)]).then((agents) => {
      if (agents.length == 0) {
        return null;
      } else if (agents.length == 1) {
        return agents[0];
      } else {
        console.error('More than 1 agent found with this email address');
        return null;
      }
    });
  }

  getAgentByAnyEmailIn(email: string[]): Promise<Agent> {
    return this.getAllByValue([
      new QueryParam('email_Addresses.address', WhereFilterOperandKeys.arrayContainsAny, email)
    ]).then((agents) => {
      debugger;
      if (agents.length == 0) {
        return null;
      } else if (agents.length == 1) {
        return agents[0];
      } else {
        console.error('More than 1 agent found with this email address');
        return null;
      }
    });
  }

  getAgentByAuthUID(uid: string): Promise<Agent> {
    return this.getAllByValue([new QueryParam(AgentKeys.uid, WhereFilterOperandKeys.equal, uid)]).then((agents) => {
      return agents[0];
    });
  }

  getAgentByAgentId(id: string): Promise<Agent> {
    return this.getAllByValue([new QueryParam('p_agent_id', WhereFilterOperandKeys.equal, id)]).then((agents) => {
      if (agents.length == 0) {
        return null;
      } else if (agents.length == 1) {
        return agents[0];
      } else {
        console.error('More than 1 agent found with this agent id');
        return null;
      }
    });
  }

  getAgentForChristmasCardList(): Promise<Agent[]> {
    return this.getAllByValue([new QueryParam(AgentKeys.christmas_card, WhereFilterOperandKeys.equal, true)]);
  }

  getAgentsByAgencyId(id: string, sortField: string): Promise<Agent[]> {
    return this.getAllByValue([new QueryParam('p_agency_id', WhereFilterOperandKeys.equal, id)], sortField);
  }

  getAgentsByProspectStatuses(id: string[], sortField: string): Promise<Agent[]> {
    return this.getAllByValue([new QueryParam('prospect_status', WhereFilterOperandKeys.in, id)], sortField);
  }

  getAgentsByAgentStatuses(id: string[], sortField: string): Promise<Agent[]> {
    return this.getAllByValue([new QueryParam('agent_status', WhereFilterOperandKeys.in, id)], sortField);
  }

  getMGAsByMGAId(id: string, sortField: string): Promise<Agent[]> {
    return this.getAllByValue([new QueryParam('p_mga_id', WhereFilterOperandKeys.equal, id)], sortField);
  }

  getManagersByMGAId(id: string, sortField: string): Promise<Agent[]> {
    let qp: QueryParam[] = [];
    qp.push(new QueryParam('is_manager', WhereFilterOperandKeys.equal, true));
    qp.push(new QueryParam('p_mga_id', WhereFilterOperandKeys.equal, id));

    return this.getAllByValue(qp, sortField);
  }

  getManagersByAgencyId(id: string, sortField: string): Promise<Agent[]> {
    let qp: QueryParam[] = [];
    qp.push(new QueryParam('is_manager', WhereFilterOperandKeys.equal, true));
    qp.push(new QueryParam('p_agency_id', WhereFilterOperandKeys.equal, id));

    return this.getAllByValue(qp, sortField);
  }
}
