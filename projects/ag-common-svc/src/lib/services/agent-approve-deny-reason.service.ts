import { Inject, Injectable } from '@angular/core';
import { ApproveDenyReason } from 'ag-common-lib/lib/models/utils/approve-deny-reason.model';
import { FirebaseApp } from 'firebase/app';
import { ToastrService } from 'ngx-toastr';
import { CommonFireStoreDao, QueryParam } from '../dao/CommonFireStoreDao.dao';
import { FIREBASE_APP } from '../injections/firebase-app';

@Injectable({
  providedIn: 'root',
})
export class AgentApproveDenyReasonsService {
  public readonly fsDao: CommonFireStoreDao<ApproveDenyReason>;
  private readonly agentCollectionPath = 'agents';
  private readonly associationCollectionPath = 'approve-deny-reason';

  constructor(@Inject(FIREBASE_APP) fireBaseApp: FirebaseApp, private toastrService: ToastrService) {
    this.fsDao = new CommonFireStoreDao<ApproveDenyReason>(fireBaseApp, null, null);
  }

  public getList(agentId: string, qp: QueryParam[] = []) {
    const table = this.getCollectionPath(agentId);

    return this.fsDao.getList(table, qp);
  }

  public getAll(agentId: string): Promise<ApproveDenyReason[]> {
    const table = this.getCollectionPath(agentId);

    return this.fsDao.getAll(table);
  }

  public create(agentId: string, data: ApproveDenyReason, silent = false) {
    const table = this.getCollectionPath(agentId);

    return this.fsDao
      .create(data, table)
      .then((response) => {
        !silent && this.toastrService.success('Agent Approve / Deny Reason Successfully Created!');
        return response;
      })

      .catch((e) => {
        console.log('e', e);
      });
  }

  public update(agentId: string, documentId: any, updates: Partial<ApproveDenyReason>, silent = false) {
    const table = this.getCollectionPath(agentId);

    return this.fsDao
      .updateFields(updates, documentId, table)
      .then((response) => {
        !silent && this.toastrService.success('Agent Approve / Deny Reason Successfully Updated!');
        return response;
      })

      .catch((e) => {
        console.log('e', e);
      });
  }

  public delete(agentId: string, documentId: any) {
    const table = this.getCollectionPath(agentId);

    return this.fsDao.delete(documentId, table).then((response) => {
      this.toastrService.success('Agent ApproveDenyReason Removed!');
      return response;
    });
  }

  private getCollectionPath(agentId: string) {
    return [this.agentCollectionPath, agentId, this.associationCollectionPath].join('/');
  }
}
