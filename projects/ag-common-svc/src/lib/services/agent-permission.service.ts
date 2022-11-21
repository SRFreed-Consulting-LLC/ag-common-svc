import { Inject, Injectable } from '@angular/core';
import { AgentPermission } from 'ag-common-lib/lib/models/utils/agent-permission.model';
import { FirebaseApp } from 'firebase/app';
import { QueryParam, WhereFilterOperandKeys } from '../dao/CommonFireStoreDao.dao';
import { FIREBASE_APP } from '../injections/firebase-app';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class AgentPermissionService extends DataService<AgentPermission> {
  constructor(@Inject(FIREBASE_APP) fireBaseApp: FirebaseApp) {
    super(fireBaseApp);
    super.collection = 'agent-permissions';
  }

  getAgentPermissonsByOwnerId(owner_id: string, sortField: string): Promise<AgentPermission[]>{
    return this.getAllByValue([new QueryParam('owner_id', WhereFilterOperandKeys.equal, owner_id)], sortField);
  }

  getAgentPermissonsByGrantedToId(granted_to_id: string, sortField: string): Promise<AgentPermission[]>{
    return this.getAllByValue([new QueryParam('granted_to_id', WhereFilterOperandKeys.equal, granted_to_id)], sortField);
  }
}
