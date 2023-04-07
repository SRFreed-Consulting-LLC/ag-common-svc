import { Inject, Injectable } from '@angular/core';
import { BaseModelKeys, Lookup, LookupKeys, Lookups } from 'ag-common-lib/public-api';
import { FirebaseApp } from 'firebase/app';
import { DocumentSnapshot } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { CommonFireStoreDao, QueryParam } from '../dao/CommonFireStoreDao.dao';
import { FIREBASE_APP } from '../injections/firebase-app';

@Injectable({ providedIn: 'root' })
export class LookupsManagerService {
  public readonly tenantId: string;
  public readonly fsDao: CommonFireStoreDao<Lookup>;
  public readonly collection = 'lookups';

  constructor(@Inject(FIREBASE_APP) fireBaseApp: FirebaseApp) {
    this.fsDao = new CommonFireStoreDao<Lookup>(fireBaseApp, LookupsManagerService.fromFirestore);
    this.tenantId = 'default'; // TODO get tenant id form auth
  }

  public getLookup = (lookupCategory: Lookups, lookupId: string): Observable<DocumentSnapshot<Lookup>> => {
    const path = this.getPath(lookupCategory);

    return this.fsDao.getDocument(path, lookupId);
  };

  public getList = (lookupId: Lookups, queryParams: QueryParam[] = [], includeRef: boolean = true): Observable<any> => {
    const path = this.getPath(lookupId);

    return this.fsDao.getList(path, queryParams, { includeRef });
  };

  public create = async (lookupId: Lookups, lookup: Lookup, lookupItems$?: Observable<Lookup[]>) => {
    const path = this.getPath(lookupId);

    if (lookup?.isDefault) {
      await this.uncheckDefault(lookupId, lookupItems$);
    }

    return this.fsDao.create(lookup, path);
  };

  public createWithId = async (lookupId: Lookups, lookup: Lookup, lookupItems$?: Observable<Lookup[]>) => {
    const path = this.getPath(lookupId);
    if (lookup?.isDefault) {
      await this.uncheckDefault(lookupId, lookupItems$);
    }
    return this.fsDao.createWithId(lookup, lookup[LookupKeys.value], path);
  };

  public update = async (
    lookupId: Lookups,
    documentId: string,
    updates: Partial<Lookup>,
    lookupItems$?: Observable<Lookup[]>
  ) => {
    const path = this.getPath(lookupId);
    if (updates?.isDefault) {
      await this.uncheckDefault(lookupId, lookupItems$);
    }
    return this.fsDao.updateFields(updates, documentId, path);
  };

  public delete = (lookupId: Lookups, documentId: string) => {
    const path = this.getPath(lookupId);

    return this.fsDao.delete(documentId, path);
  };

  private uncheckDefault = async (lookupId: Lookups, lookupItems$?: Observable<Lookup[]>) => {
    const items = await lookupItems$.pipe(take(1)).toPromise();

    if (!Array.isArray(items) || !items?.length) {
      return null;
    }

    return items
      .filter((item) => item?.isDefault)
      .map((lookup) => {
        const path = this.getPath(lookupId);

        return this.fsDao.updateFields({ [LookupKeys.isDefault]: false }, lookup[BaseModelKeys.dbId], path);
      });
  };

  private getPath = (lookupId: Lookups): string => {
    return [this.collection, this.tenantId, lookupId].join('/');
  };

  static readonly fromFirestore = (data): Lookup => {
    return Object.assign({}, data, {
      [LookupKeys.isDefault]: data[LookupKeys.isDefault] ?? false
    });
  };
}
