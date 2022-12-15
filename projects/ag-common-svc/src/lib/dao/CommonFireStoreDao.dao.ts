import { FirebaseApp } from '@firebase/app';
import { BaseModelKeys } from 'ag-common-lib/public-api';
import {
  addDoc,
  doc,
  getDoc,
  getFirestore,
  query,
  where,
  collection,
  getDocs,
  setDoc,
  onSnapshot,
  deleteDoc,
  limit,
  QueryConstraint,
  Firestore,
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
  orderBy,
  updateDoc,
  startAfter,
  startAt
} from 'firebase/firestore';
import { fromUnixTime, isDate, isValid } from 'date-fns';
import { fromEventPattern, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

const localeCompareOptions = {
  numeric: true,
  sensitivity: 'base',
  ignorePunctuation: true
};
export class CommonFireStoreDao<T> {
  readonly db: Firestore;
  private fromFirestore: (documentData: DocumentData) => T = null;
  private toFirestore: (item: T) => T = null;

  constructor(
    fireBaseApp: FirebaseApp,
    fromFirestore: (data: Partial<T>) => T = null,
    toFirestore: (item: T) => T = null
  ) {
    this.db = getFirestore(fireBaseApp);

    this.fromFirestore = fromFirestore ?? null;
    this.toFirestore = toFirestore ?? null;
  }

  public async createWithId(value: T, uid: string, table: string): Promise<T> {
    const ref = doc(this.db, table, uid).withConverter({
      fromFirestore: null,
      toFirestore: (item: T): DocumentData => {
        return Object.assign(this.toFirestore ? this.toFirestore(item) : item, {
          [BaseModelKeys.createdDate]: new Date()
        });
      }
    });

    await setDoc(ref, value);

    return this.getById(table, uid);
  }

  public async create(value: T, table: string): Promise<T> {
    const ref = collection(this.db, table).withConverter({
      fromFirestore: null,
      toFirestore: (item: T): DocumentData => {
        return Object.assign(this.toFirestore ? this.toFirestore(item) : item, {
          [BaseModelKeys.createdDate]: new Date()
        });
      }
    });

    const snap = await addDoc(ref, value);

    return this.getById(table, snap.id);
  }

  public async createInSubcollection(value: T, table: string, record_id: string, subcollection: string): Promise<T> {
    const ref = collection(this.db, table, record_id, subcollection).withConverter({
      fromFirestore: null,
      toFirestore: (item: T): DocumentData => {
        return Object.assign(this.toFirestore ? this.toFirestore(item) : item, {
          [BaseModelKeys.createdDate]: new Date()
        });
      }
    });

    const snap = await addDoc(ref, value);

    return this.getById(table, snap.id);
  }

  public getList(table, queries: QueryParam[] = [], includeRef: boolean = false, sortField?: string): Observable<T[]> {
    const queryConstraints: QueryConstraint[] = queries.map((query) =>
      where(query.field, query.operation, query.value)
    );
    const collectionRef = collection(this.db, table).withConverter({
      toFirestore: null,
      fromFirestore: this.convertResponse
    });
    const collectionQuery = query(collectionRef, ...queryConstraints);

    return fromEventPattern(
      (handler) => onSnapshot(collectionQuery, handler),
      (handler, unsubscribe) => {
        unsubscribe();
      }
    ).pipe(
      map((collectionSnapshot: any) => {
        const items = collectionSnapshot.docs.map((document) => {
          if (!document.exists()) {
            return null;
          }
          const data = document.data();
          if (includeRef) {
            Object.assign(data, { [BaseModelKeys.firebaseRef]: document.ref });
          }

          return data;
        });

        return items;
      })
    );
  }

  public async getAll(table: string, sortField?: string): Promise<T[]> {
    const collectionRef = collection(this.db, table).withConverter({
      toFirestore: null,
      fromFirestore: this.convertResponse
    });

    const querySnapshot = await getDocs(collectionRef);

    const docsData = querySnapshot.docs.map((item) => (item.exists() ? item.data() : null));

    if (sortField) {
      docsData.sort((left, right) =>
        String(left[sortField]).localeCompare(String(right[sortField]), 'en', localeCompareOptions)
      );
    }

    return docsData;
  }

  public async getAllllllll(table: string, sortField: string, skip: number): Promise<T[]> {
    const collectionRef = collection(this.db, table).withConverter({
      toFirestore: null,
      fromFirestore: this.convertResponse
    });

    const querySnapshot = await getDocs(query(collectionRef, orderBy(sortField), limit(100), startAfter(skip)));

    const docsData = querySnapshot.docs.map((item) => (item.exists() ? item.data() : null));

    if (sortField) {
      docsData.sort((left, right) =>
        String(left[sortField]).localeCompare(String(right[sortField]), 'en', localeCompareOptions)
      );
    }

    return docsData;
  }

  public async getAllFromSubCollection(table: string, record_id: string, subcollection: string): Promise<T[]> {
    const ref = collection(this.db, table, record_id, subcollection).withConverter({
      toFirestore: null,
      fromFirestore: this.convertResponse
    });

    const snap = await getDocs(ref);

    const docsData = snap.docs.map((item) => (item.exists() ? item.data() : null));

    return docsData;
  }

  public async getAllOrderBy(table: string, order: string): Promise<T[]> {
    const ref = collection(this.db, table).withConverter({
      toFirestore: null,
      fromFirestore: this.convertResponse
    });

    const snap = await getDocs(ref);

    const docsData = snap.docs.map((item) => (item.exists() ? item.data() : null));

    if (order) {
      docsData.sort((left, right) => String(left[order]).localeCompare(String(right), 'en', localeCompareOptions));
    }

    return docsData;
  }

  public async getMostRecentOrderBy(table: string, order: string): Promise<T[]> {
    const ref = collection(this.db, table).withConverter({
      toFirestore: null,
      fromFirestore: this.convertResponse
    });

    const q = query(ref, orderBy(order, 'desc'), limit(1));

    const snap = await getDocs(q);

    const docsData = snap.docs.map((item) => (item.exists() ? item.data() : null));

    if (order) {
      docsData.sort((left, right) =>
        String(left[order]).localeCompare(String(right[order]), 'en', localeCompareOptions)
      );
    }

    return docsData;
  }

  public getDocReference(table: string, id: string) {
    return doc(this.db, table, id).withConverter({
      toFirestore: null,
      fromFirestore: this.convertResponse
    });
  }

  public async getById(table: string, id: string): Promise<T> {
    const ref = this.getDocReference(table, id);

    const snap = await getDoc(ref);
    const isExist = snap?.exists();

    return isExist ? (snap?.data() as T) : null;
  }

  public async getAllByValueOrderBy(
    table: string,
    field: string,
    value: string,
    operation: WhereFilterOperandKeys,
    order: string
  ): Promise<T[]> {
    const ref = collection(this.db, table).withConverter({
      toFirestore: null,
      fromFirestore: this.convertResponse
    });
    const q = query(ref, where(field, operation, value));

    const snap = await getDocs(q);

    const docsData = snap.docs.map((item) => (item.exists() ? item.data() : null));

    if (order) {
      docsData.sort((left, right) =>
        String(left[order]).localeCompare(String(right[order]), 'en', localeCompareOptions)
      );
    }

    return docsData;
  }

  public delete(id: string, table: string): Promise<void> {
    const ref = doc(this.db, table, id);

    return deleteDoc(ref);
  }

  public async updateFields(value, id: string, table: string): Promise<T> {
    const ref = doc(this.db, table, id).withConverter({
      fromFirestore: null,
      toFirestore: (item: T): DocumentData => {
        return Object.assign(this.toFirestore ? this.toFirestore(item) : item, {
          [BaseModelKeys.updatedDate]: new Date()
        });
      }
    });

    await setDoc(ref, value, { merge: true });

    return this.getById(table, id);
  }

  /**
   * @deprecated Use updateFields instead
   */
  public async update(value, id: string, table: string): Promise<T> {
    const ref = doc(this.db, table, id).withConverter({
      fromFirestore: null,
      toFirestore: (item: T): DocumentData => {
        return Object.assign(this.toFirestore ? this.toFirestore(item) : item, {
          [BaseModelKeys.updatedDate]: new Date()
        });
      }
    });

    await setDoc(ref, value);

    return this.getById(table, id);
  }

  public async getAllByQValue(table: string, queries: QueryParam[], sortField?: string): Promise<T[]> {
    const queryConstraints: QueryConstraint[] = queries.map((query) =>
      where(query.field, query.operation, query.value)
    );

    const ref = collection(this.db, table).withConverter({
      toFirestore: null,
      fromFirestore: this.convertResponse
    });

    const documentQuery = query(ref, ...queryConstraints);

    const snap = await getDocs(documentQuery);

    const docsData = snap.docs.map((item) => (item.exists() ? item.data() : null));

    if (sortField) {
      docsData.sort((left, right) =>
        String(left[sortField]).localeCompare(String(right[sortField]), 'en', localeCompareOptions)
      );
    }

    return docsData;
  }

  public async getAllInSubCollectionByQValue(
    table: string,
    record_id: string,
    subcollection: string,
    queries: QueryParam[],
    sortField?: string
  ): Promise<T[]> {
    const queryConstraints: QueryConstraint[] = queries.map((query) =>
      where(query.field, query.operation, query.value)
    );

    const ref = collection(this.db, table, record_id, subcollection).withConverter({
      toFirestore: null,
      fromFirestore: this.convertResponse
    });

    const documentQuery = query(ref, ...queryConstraints);

    const snap = await getDocs(documentQuery);

    const docsData = snap.docs.map((item) => (item.exists() ? item.data() : null));

    if (sortField) {
      docsData.sort((left, right) =>
        String(left[sortField]).localeCompare(String(right[sortField]), 'en', localeCompareOptions)
      );
    }

    return docsData;
  }

  public async updateInSubcollection(
    value: T,
    table: string,
    record_id: string,
    subcollection: string,
    id: string
  ): Promise<T> {
    const ref = doc(this.db, table, record_id, subcollection, id).withConverter({
      fromFirestore: null,
      toFirestore: (item: T): DocumentData => {
        return Object.assign(this.toFirestore ? this.toFirestore(item) : item, {
          [BaseModelKeys.updatedDate]: new Date()
        });
      }
    });

    await setDoc(ref, value);

    return this.getById(table, id);
  }

  public deleteFromSubcollection(table: string, record_id: string, subcollection: string, id: string): Promise<void> {
    const ref = doc(this.db, table, record_id, subcollection, id);

    return deleteDoc(ref);
  }

  private convertResponse = (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): any => {
    const isExist = snapshot.exists();
    if (!isExist) {
      return;
    }
    const data = snapshot.data(options);

    const normalizedData = Object.assign({}, data, {
      dbId: snapshot.id,
      [BaseModelKeys.createdDate]: this.dateFromTimestamp(data[BaseModelKeys.createdDate]),
      [BaseModelKeys.updatedDate]: this.dateFromTimestamp(data[BaseModelKeys.createdDate])
    });

    return this.fromFirestore ? this.fromFirestore(normalizedData) : normalizedData;
  };

  private dateFromTimestamp = (item: Timestamp) => {
    if (!item) {
      return null;
    }

    if (isDate(item)) {
      return item;
    }

    let normalizedDate;

    if (item?.seconds) {
      normalizedDate = fromUnixTime(item.seconds);
    }

    return isValid(normalizedDate) ? normalizedDate : null;
  };
}

export enum WhereFilterOperandKeys {
  less = '<',
  lessOrEqual = '<=',
  equal = '==',
  notEqual = '!=',
  more = '>',
  moreOrEqual = '>=',
  arrayContains = 'array-contains',
  in = 'in',
  arrayContainsAny = 'array-contains-any',
  notIn = 'not-in'
}

export class QueryParam {
  constructor(field: string, operation: WhereFilterOperandKeys, value: any) {
    this.field = field;
    this.operation = operation;
    this.value = value;
  }
  field: string;
  value: any;
  operation: WhereFilterOperandKeys;
}
