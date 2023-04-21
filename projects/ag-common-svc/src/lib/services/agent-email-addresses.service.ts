import { Inject, Injectable } from '@angular/core';
import { EmailAddress, EmailAddressKeys, RelatedEmailAddress } from 'ag-common-lib/public-api';
import { FirebaseApp } from 'firebase/app';
import { collectionGroup, getDocs, query, QueryConstraint, QuerySnapshot, where } from 'firebase/firestore';
import { ToastrService } from 'ngx-toastr';
import { map, Observable } from 'rxjs';
import { CommonFireStoreDao, QueryParam, WhereFilterOperandKeys } from '../dao/CommonFireStoreDao.dao';
import { FIREBASE_APP } from '../injections/firebase-app';

export interface AgentEmailAddressLookup {
  agentDbId: string;
  email: string;
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class AgentEmailAddressesService {
  public readonly fsDao: CommonFireStoreDao<EmailAddress>;
  private readonly agentCollectionPath = 'agents';
  private readonly emailAddressCollectionPath = 'email-addresses';

  private allAgentEmailAddresses$: Observable<RelatedEmailAddress[]>;

  constructor(@Inject(FIREBASE_APP) fireBaseApp: FirebaseApp, private toastrService: ToastrService) {
    this.fsDao = new CommonFireStoreDao<EmailAddress>(fireBaseApp, null, null);
  }

  public getAll(): Observable<RelatedEmailAddress[]> {
    if (!this.allAgentEmailAddresses$) {
      this.allAgentEmailAddresses$ = this.fsDao.getCollectionGroupSnapshot(this.emailAddressCollectionPath).pipe(
        map((snapshot) => {
          return snapshot.docs.map((doc) => {
            if (!doc.exists()) {
              return null;
            }
            const data = doc.data();
            const parentAgent = doc?.ref?.parent?.parent;
            const parentDbId = parentAgent?.id;

            const result = { data, parentDbId };

            return result;
          });
        }),
      );
    }

    return this.allAgentEmailAddresses$;
  }

  public getList(agentId: string, qp: QueryParam[] = []) {
    const table = this.getCollectionPath(agentId);

    return this.fsDao.getList(table, qp);
  }

  public async create(agentId: string, data: EmailAddress) {
    const table = this.getCollectionPath(agentId);
    const emailAddress = await this.fsDao
      .create(Object.assign(data, { [EmailAddressKeys.agentDbId]: agentId }), table)
      .catch((e) => {
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

  public findSameUserEmails = (email): Promise<RelatedEmailAddress[]> => {
    const queries: QueryParam[] = [];

    const emailAddressQuery = new QueryParam(
      'address',
      WhereFilterOperandKeys.equal,
      email?.toLocaleLowerCase()?.trim(),
    );
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
        const parentAgent = document?.ref?.parent?.parent;
        const parentDbId = parentAgent?.id;

        const result = { data, parentDbId };

        return result;
      });

      return items;
    });
  };

  private getCollectionPath(agentId: string) {
    return [this.agentCollectionPath, agentId, this.emailAddressCollectionPath].join('/');
  }
}
