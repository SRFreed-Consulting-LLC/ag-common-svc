import { Inject, Injectable } from '@angular/core';
import { EmailAddress } from 'ag-common-lib/public-api';
import { FirebaseApp } from 'firebase/app';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { CommonFireStoreDao, QueryParam, WhereFilterOperandKeys } from '../dao/CommonFireStoreDao.dao';
import { FIREBASE_APP } from '../injections/firebase-app';

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

  public create(agentId: string, data: EmailAddress) {
    const table = this.getCollectionPath(agentId);

    return this.fsDao
      .create(data, table)
      .then((response) => {
        //this.toastrService.success('Agent Email Address Successfully Created!');
        // this.lockLookup(data);
        return response;
      })

      .catch((e) => {
        console.log('e', e);
      });
  }

  public update(agentId: string, documentId: any, updates: Partial<EmailAddress>) {
    const table = this.getCollectionPath(agentId);

    return this.fsDao
      .updateFields(updates, documentId, table)
      .then((response) => {
        //this.toastrService.success('Agent Email Address Successfully Updated!');
        // this.lockLookup(updates);
        return response;
      })

      .catch((e) => {
        console.log('e', e);
      });
  }

  // public lockLookup = (data: Partial<EmailAddress>) => {
  //   if (data?.associationTypeRef) {
  //     updateDoc(data?.associationTypeRef, { [LookupKeys.isAssigned]: true });
  //   }
  // };

  public delete(agentId: string, documentId: any) {
    const table = this.getCollectionPath(agentId);

    return this.fsDao.delete(documentId, table).then((response) => {
      this.toastrService.success('Agent Email Address Removed!');
      return response;
    });
  }

  public findSameEmails(email): Observable<EmailAddress[]> {
    const qp: QueryParam[] = [];

    const emailAddressQuery = new QueryParam('address', WhereFilterOperandKeys.equal, email);

    qp.push(emailAddressQuery);

    return this.fsDao.getCollectionGroup(this.emailAddressCollectionPath, qp);
  }

  private getCollectionPath(agentId: string) {
    return [this.agentCollectionPath, agentId, this.emailAddressCollectionPath].join('/');
  }
}
