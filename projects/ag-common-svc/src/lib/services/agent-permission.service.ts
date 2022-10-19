import { Inject, Injectable } from '@angular/core';
import { AgentPermission } from 'ag-common-lib/lib/models/utils/agent-permission.model';
import { FirebaseApp } from 'firebase/app';
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
}