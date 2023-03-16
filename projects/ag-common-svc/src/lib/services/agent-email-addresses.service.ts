import { Inject, Injectable } from '@angular/core';
import { EmailAddress } from 'ag-common-lib/public-api';
import { FirebaseApp } from 'firebase/app';
import { collectionGroup, getDocs, query, QueryConstraint, QuerySnapshot, where } from 'firebase/firestore';
import { ToastrService } from 'ngx-toastr';
import { CommonFireStoreDao, QueryParam, WhereFilterOperandKeys } from '../dao/CommonFireStoreDao.dao';
import { FIREBASE_APP } from '../injections/firebase-app';
import { AgentService } from './agent.service';

@Injectable({
  providedIn: 'root',
})
export class AgentEmailAddressesService {
  public readonly fsDao: CommonFireStoreDao<EmailAddress>;
  private readonly agentCollectionPath = 'agents';
  private readonly emailAddressCollectionPath = 'email-addresses';

  constructor(@Inject(FIREBASE_APP) fireBaseApp: FirebaseApp, private toastrService: ToastrService) {
    this.fsDao = new CommonFireStoreDao<EmailAddress>(fireBaseApp, null, null);
  }

  public getList(agentId: string) {
    const table = this.getCollectionPath(agentId);

    return this.fsDao.getList(table);
  }

  public getAll(agentId: string): Promise<EmailAddress[]> {
    const table = this.getCollectionPath(agentId);

    return this.fsDao.getAll(table);
  }

  public async create(agentId: string, data: EmailAddress) {
    const table = this.getCollectionPath(agentId);
    const emailAddress = await this.fsDao.create(data, table).catch((e) => {
      console.log('e', e);
    });

    this.toastrService.success('Agent Email Address Successfully Created!');

    return emailAddress;
  }

  public async update(agentId: string, documentId: any, updates: Partial<EmailAddress>) {
    const table = this.getCollectionPath(agentId);

    const emailAddress = await this.fsDao.updateFields(updates, documentId, table).catch((e) => {
      console.log('e', e);
    });

    this.toastrService.success('Agent Email Address Successfully Updated!');

    return emailAddress;
  }

  public delete(agentId: string, documentId: any) {
    const table = this.getCollectionPath(agentId);

    return this.fsDao.delete(documentId, table).then((response) => {
      this.toastrService.success('Agent Email Address Removed!');
      return response;
    });
  }

  public findSameUserEmails = (email): Promise<Array<{ data: EmailAddress; parentDbId: string }>> => {
    const queries: QueryParam[] = [];

    const emailAddressQuery = new QueryParam('address', WhereFilterOperandKeys.equal, email);
    const isLoginQuery = new QueryParam('is_login', WhereFilterOperandKeys.equal, true);

    queries.push(emailAddressQuery);

    const queryConstraints: QueryConstraint[] = queries.map((query) =>
      where(query.field, query.operation, query.value),
    );

    const collectionGroupRef = collectionGroup(this.fsDao.db, this.emailAddressCollectionPath).withConverter({
      toFirestore: null,
      fromFirestore: this.fsDao.convertResponse,
    });

    const collectionGroupQuery = query(collectionGroupRef, ...queryConstraints);

    return getDocs(collectionGroupQuery).then((collectionSnapshot: QuerySnapshot<any>): any => {
      const items = collectionSnapshot.docs.map((document) => {
        if (!document.exists()) {
          return null;
        }
        const data = document.data();

        const parentDbId = document?.ref?.parent?.parent?.id;
        return { data, parentDbId };
      });

      return items;
    });
  };

  private getCollectionPath(agentId: string) {
    return [this.agentCollectionPath, agentId, this.emailAddressCollectionPath].join('/');
  }
}
