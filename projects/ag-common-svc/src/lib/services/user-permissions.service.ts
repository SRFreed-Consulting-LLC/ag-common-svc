import { Inject, Injectable } from '@angular/core';
import { Agent, AgentKeys, AG_APPLICATIONS, UserPermission } from 'ag-common-lib/public-api';
import { FirebaseApp } from 'firebase/app';
import { Timestamp } from 'firebase/firestore';
import { Observable, Subscription } from 'rxjs';
import { CommonFireStoreDao, QueryParam, WhereFilterOperandKeys } from '../../public-api';
import { FIREBASE_APP } from '../injections/firebase-app';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class UserPermissionService {
  public readonly fsDao: CommonFireStoreDao<UserPermission>;
  private readonly agentCollectionPath = 'agents';
  private readonly associationCollectionPath = 'user-permissions';

  constructor(@Inject(FIREBASE_APP) fireBaseApp: FirebaseApp) {
    this.fsDao = new CommonFireStoreDao<UserPermission>(fireBaseApp, null, null);
  }  

  public getList(agentId: string, qp: QueryParam[] = []) {
    const table = this.getCollectionPath(agentId);

    return this.fsDao.getList(table, qp);
  }

  public getAll(agentId: string): Promise<UserPermission[]> {
    const table = this.getCollectionPath(agentId);

    return this.fsDao.getAll(table);
  }

  public create(agentId: string, data: UserPermission, silent = false) {
    const table = this.getCollectionPath(agentId);

    return this.fsDao.create(data, table)
      .catch((e) => {
        console.log('e', e);
      });
  }

  public update(agentId: string, documentId: any, updates: Partial<UserPermission>, silent = false) {
    const table = this.getCollectionPath(agentId);

    return this.fsDao
      .updateFields(updates, documentId, table)
      .catch((e) => {
        console.log('e', e);
      });
  }

  public delete(agentId: string, documentId: any) {
    const table = this.getCollectionPath(agentId);

    return this.fsDao.delete(documentId, table).then((response) => {
      return response;
    });
  }

  isUserPermittedinARM(dbId: string): Promise<boolean>{
    return this.getAll(dbId).then(permissions => {
      let p = permissions.filter(permission => permission.application == AG_APPLICATIONS.ARM)

      if(p.length == 1 && p[0].is_enabled){
        return true;
      } else {
        return false;
      }
    })
  }

  isUserPermittedinPortal(dbId: string): Promise<boolean>{
    return this.getAll(dbId).then(permissions => {
      let p = permissions.filter(permission => permission.application == AG_APPLICATIONS.PORTAL)

      if(p.length == 1 && p[0].is_enabled){
        return true;
      } else {
        return false;
      }
    })
  }

  private getCollectionPath(agentId: string) {
    return [this.agentCollectionPath, agentId, this.associationCollectionPath].join('/');
  }
}
