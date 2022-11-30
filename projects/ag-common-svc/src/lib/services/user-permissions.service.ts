import { Inject, Injectable } from '@angular/core';
import { Agent, AgentKeys, AG_APPLICATIONS, UserPermission } from 'ag-common-lib/public-api';
import { FirebaseApp } from 'firebase/app';
import { Timestamp } from 'firebase/firestore';
import { QueryParam, WhereFilterOperandKeys } from '../../public-api';
import { FIREBASE_APP } from '../injections/firebase-app';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class UserPermissionService extends DataService<UserPermission> {
  constructor(@Inject(FIREBASE_APP) fireBaseApp: FirebaseApp) {
    super(fireBaseApp);
    super.collection = 'user-permissions';
  }  

  getPermissionsByUserDbId(dbid: String): Promise<UserPermission[]>{
    return this.getAllByValue([new QueryParam('owner', WhereFilterOperandKeys.equal, dbid)])
  }

  isUserPermittedinARM(dbId: string): Promise<boolean>{
    return this.getPermissionsByUserDbId(dbId).then(permissions => {
      let p = permissions.filter(permission => permission.application == AG_APPLICATIONS.ARM)

      if(p.length == 1 && p[0].is_enabled){
        return true;
      } else {
        return false;
      }
    })
  }

  isUserPermittedinPortal(dbId: string): Promise<boolean>{
    return this.getPermissionsByUserDbId(dbId).then(permissions => {
      let p = permissions.filter(permission => permission.application == AG_APPLICATIONS.PORTAL)

      if(p.length == 1 && p[0].is_enabled){
        return true;
      } else {
        return false;
      }
    })
  }
}
