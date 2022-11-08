import { Inject, Injectable } from '@angular/core';
import { Association, LookupKeys } from 'ag-common-lib/public-api';
import { FirebaseApp } from 'firebase/app';
import { ToastrService } from 'ngx-toastr';
import { CommonFireStoreDao } from '../dao/CommonFireStoreDao.dao';
import { FIREBASE_APP } from '../injections/firebase-app';

@Injectable({
  providedIn: 'root'
})
export class AgentAssociationsService {
  public readonly fsDao: CommonFireStoreDao<Association>;
  private readonly agentCollectionPath = 'agents';
  private readonly associationCollectionPath = 'associations';

  constructor(@Inject(FIREBASE_APP) fireBaseApp: FirebaseApp, private toastrService: ToastrService) {
    this.fsDao = new CommonFireStoreDao<Association>(fireBaseApp, null, null);
  }

  public getList(agentId: string) {
    const table = this.getCollectionPath(agentId);

    return this.fsDao.getList(table);
  }

  public getAll(agentId: string): Promise<Association[]> {
    const table = this.getCollectionPath(agentId);

    return this.fsDao.getAll(table);
  }

  public create(agentId: string, data: Association) {
    const table = this.getCollectionPath(agentId);

    return this.fsDao
      .create(data, table)
      .then((response) => {
        this.toastrService.success('Agent Association Successfully Created!');
        this.lockLookup(data);
        return response;
      })

      .catch((e) => {
        console.log('e', e);
      });
  }

  public update(agentId: string, documentId: any, updates: Partial<Association>) {
    const table = this.getCollectionPath(agentId);

    return this.fsDao
      .update(updates, documentId, table)
      .then((response) => {
        this.toastrService.success('Agent Association Successfully Updated!');
        this.lockLookup(updates);
        return response;
      })

      .catch((e) => {
        console.log('e', e);
      });
  }

  public lockLookup = (data: Partial<Association>) => {
    if (data?.associationTypeRef && data?.associationTypeRef?.update) {
      data?.associationTypeRef?.update({ [LookupKeys.isAssigned]: true });
    }
  };

  public delete(agentId: string, documentId: any) {
    const table = this.getCollectionPath(agentId);

    return this.fsDao.delete(documentId, table).then((response) => {
      this.toastrService.success('Agent Association Removed!');
      return response;
    });
  }

  private getCollectionPath(agentId: string) {
    return [this.agentCollectionPath, agentId, this.associationCollectionPath].join('/');
  }
}
