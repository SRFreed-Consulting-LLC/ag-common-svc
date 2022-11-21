import { Inject, Injectable } from '@angular/core';
import { Lookup, Lookups } from 'ag-common-lib/public-api';
import { FirebaseApp } from 'firebase/app';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CommonFireStoreDao, QueryParam } from '../dao/CommonFireStoreDao.dao';
import { FIREBASE_APP } from '../injections/firebase-app';

@Injectable({ providedIn: 'root' })
export class LookupsManagerService {
  public readonly tenantId: string;
  public readonly fsDao: CommonFireStoreDao<Lookup>;
  public readonly collection = 'lookups';

  constructor(@Inject(FIREBASE_APP) fireBaseApp: FirebaseApp) {
    this.fsDao = new CommonFireStoreDao<Lookup>(fireBaseApp);
    this.tenantId = 'default'; // TODO get tenant id form auth
  }

  public getList = (lookupId: Lookups, queryParams: QueryParam[] = [], includeRef: boolean = true): Observable<any> => {
    const path = this.getPath(lookupId);

    return this.fsDao.getList(path, queryParams, includeRef).pipe(
      tap((data) => {
        console.log('data', data);
      })
    );
  };

  public create = (lookupId: Lookups, lookup: Lookup) => {
    const path = this.getPath(lookupId);
    return this.fsDao.create(lookup, path);
  };

  public update = (lookupId: Lookups, documentId: string, updates: Partial<Lookup>) => {
    const path = this.getPath(lookupId);
    return this.fsDao.updateFields(updates, documentId, path);
  };

  public delete = (lookupId: Lookups, documentId: string) => {
    const path = this.getPath(lookupId);

    return this.fsDao.delete(path, documentId);
  };

  private getPath = (lookupId: Lookups): string => {
    return [this.collection, this.tenantId, lookupId].join('/');
  };
}
