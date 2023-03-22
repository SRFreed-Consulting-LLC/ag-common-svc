import { Inject, Injectable } from '@angular/core';
import { ExternalPerson, LookupKeys } from 'ag-common-lib/public-api';
import { FirebaseApp } from 'firebase/app';
import { updateDoc } from 'firebase/firestore';
import { ToastrService } from 'ngx-toastr';
import { CommonFireStoreDao } from '../dao/CommonFireStoreDao.dao';
import { FIREBASE_APP } from '../injections/firebase-app';

@Injectable({
  providedIn: 'root'
})
export class AgentExternalPersonsService {
  public readonly fsDao: CommonFireStoreDao<ExternalPerson>;
  private readonly agentCollectionPath = 'agents';
  private readonly subcollectionPath = 'external-persons';

  constructor(@Inject(FIREBASE_APP) fireBaseApp: FirebaseApp, private toastrService: ToastrService) {
    this.fsDao = new CommonFireStoreDao<ExternalPerson>(fireBaseApp, null, null);
  }

  public getList(agentId: string) {
    const table = this.getCollectionPath(agentId);

    return this.fsDao.getList(table);
  }

  public getAll(agentId: string): Promise<ExternalPerson[]> {
    const table = this.getCollectionPath(agentId);

    return this.fsDao.getAll(table);
  }

  public create(agentId: string, data: ExternalPerson) {
    const table = this.getCollectionPath(agentId);

    return this.fsDao
      .create(data, table)
      .then((response) => {
        this.toastrService.success('Agent External Person Successfully Created!');

        return response;
      })

      .catch((e) => {
        console.log('e', e);
      });
  }

  public update(agentId: string, documentId: any, updates: Partial<ExternalPerson>) {
    const table = this.getCollectionPath(agentId);

    return this.fsDao
      .updateFields(updates, documentId, table)
      .then((response) => {
        this.toastrService.success('Agent External Person Successfully Updated!');

        return response;
      })

      .catch((e) => {
        console.log('e', e);
      });
  }

  public delete(agentId: string, documentId: any) {
    const table = this.getCollectionPath(agentId);

    return this.fsDao.delete(documentId, table).then((response) => {
      this.toastrService.success('Agent External Person Removed!');
      return response;
    });
  }

  private getCollectionPath(agentId: string) {
    return [this.agentCollectionPath, agentId, this.subcollectionPath].join('/');
  }
}
