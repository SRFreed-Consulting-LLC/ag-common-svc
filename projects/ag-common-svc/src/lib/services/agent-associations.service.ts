import { Inject, Injectable } from '@angular/core';
import { Association, LookupKeys } from 'ag-common-lib/public-api';
import { FirebaseApp } from 'firebase/app';
import { Timestamp, updateDoc } from 'firebase/firestore';
import { ToastrService } from 'ngx-toastr';
import { CommonFireStoreDao } from '../dao/CommonFireStoreDao.dao';
import { FIREBASE_APP } from '../injections/firebase-app';
import { dateFromTimestamp } from '../utils/date-from-timestamp';

@Injectable({
  providedIn: 'root'
})
export class AgentAssociationsService {
  public readonly fsDao: CommonFireStoreDao<Association>;
  private readonly agentCollectionPath = 'agents';
  private readonly associationCollectionPath = 'associations';

  constructor(@Inject(FIREBASE_APP) fireBaseApp: FirebaseApp, private toastrService: ToastrService) {
    this.fsDao = new CommonFireStoreDao<Association>(fireBaseApp, AgentAssociationsService.fromFirestore, null);
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
        //this.toastrService.success('Agent Association Successfully Created!');

        return response;
      })

      .catch((e) => {
        console.log('e', e, agentId, data);
      });
  }

  public update(agentId: string, documentId: any, updates: Partial<Association>) {
    const table = this.getCollectionPath(agentId);

    return this.fsDao
      .updateFields(updates, documentId, table)
      .then((response) => {
        //this.toastrService.success('Agent Association Successfully Updated!');

        return response;
      })

      .catch((e) => {
        console.log('e', e);
      });
  }

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

  static readonly fromFirestore = (data): Association => {
    return Object.assign({}, data, {
      dob: dateFromTimestamp(data?.dob as Timestamp)
    });
  };
}
