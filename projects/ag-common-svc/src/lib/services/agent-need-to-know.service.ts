import { Inject, Injectable } from '@angular/core';
import { NeedToKnow } from 'ag-common-lib/public-api';
import { FirebaseApp } from 'firebase/app';
import { ToastrService } from 'ngx-toastr';
import { CommonFireStoreDao, QueryParam } from '../dao/CommonFireStoreDao.dao';
import { FIREBASE_APP } from '../injections/firebase-app';

@Injectable({
  providedIn: 'root'
})
export class AgentNeedToKnowService {
  public readonly fsDao: CommonFireStoreDao<NeedToKnow>;
  private readonly agentCollectionPath = 'agents';
  private readonly associationCollectionPath = 'need-to-knows';

  constructor(@Inject(FIREBASE_APP) fireBaseApp: FirebaseApp, private toastrService: ToastrService) {
    this.fsDao = new CommonFireStoreDao<NeedToKnow>(fireBaseApp, null, null);
  }

  public getList(agentId: string, qp: QueryParam[] = []) {
    const table = this.getCollectionPath(agentId);

    return this.fsDao.getList(table, qp);
  }

  public getAll(agentId: string): Promise<NeedToKnow[]> {
    const table = this.getCollectionPath(agentId);

    return this.fsDao.getAll(table);
  }

  public create(agentId: string, data: NeedToKnow, silent = false) {
    const table = this.getCollectionPath(agentId);

    return this.fsDao
      .create(data, table)
      .then((response) => {
        !silent && this.toastrService.success('Agent Status Activity Successfully Created!');
        return response;
      })

      .catch((e) => {
        console.log('e', e);
      });
  }

  public update(agentId: string, documentId: any, updates: Partial<NeedToKnow>, silent = false) {
    const table = this.getCollectionPath(agentId);

    return this.fsDao
      .updateFields(updates, documentId, table)
      .then((response) => {
        !silent && this.toastrService.success('Agent Status Activity Successfully Updated!');
        return response;
      })

      .catch((e) => {
        console.log('e', e);
      });
  }

  public delete(agentId: string, documentId: any) {
    const table = this.getCollectionPath(agentId);

    return this.fsDao.delete(documentId, table).then((response) => {
      this.toastrService.success('Agent NeedToKnow Removed!');
      return response;
    });
  }

  private getCollectionPath(agentId: string) {
    return [this.agentCollectionPath, agentId, this.associationCollectionPath].join('/');
  }
}
