import { BaseModel } from 'ag-common-lib/public-api';
import { CommonFireStoreDao, QueryParam } from '../dao/CommonFireStoreDao.dao';
import { FirebaseApp } from 'firebase/app';
import { Observable } from 'rxjs';
import { DocumentReference } from 'firebase/firestore';

export class DataService<T extends BaseModel> {
  public readonly fsDao: CommonFireStoreDao<T>;

  constructor(
    fireBaseApp: FirebaseApp,
    fromFirestore: (data: Partial<T>) => T = null,
    toFirestore: (item: T) => T = null
  ) {
    this.fsDao = new CommonFireStoreDao<T>(fireBaseApp, fromFirestore, toFirestore);
  }

  public collection: string;

  public getDocReference(id: string): DocumentReference<T> {
    return this.fsDao.getDocReference(this.collection, id);
  }

  public getDocument(id: string): Observable<any> {
    return this.fsDao.getDocument(this.collection, id);
  }

  public getById(id: any): Promise<T> {
    return this.fsDao.getById(this.collection, id);
  }

  public getAllByValue(qp: QueryParam[], sortField?: string): Promise<T[]> {
    return this.fsDao.getAllByQValue(this.collection, qp, sortField);
  }

  public getList(qp: QueryParam[] = [], includeRef: boolean = false, sortField: string = null): Observable<T[]> {
    return this, this.fsDao.getList(this.collection, qp, includeRef, sortField);
  }

  public getAll(sortField?: string): Promise<T[]> {
    return this.fsDao.getAll(this.collection, sortField);
  }

  public create(value: T) {
    return this.fsDao.create(value, this.collection);
  }

  public createWithId(value: T) {
    return this.fsDao.createWithId(value, value.dbId, this.collection);
  }

  /**
   * @deprecated Use updateFields instead // TODO rename to set
   */
  public update(value: T) {
    return this.fsDao.update(value, value.dbId, this.collection);
  }

  public updateFields(documentId: string, data: Partial<T>) {
    return this.fsDao.updateFields(data, documentId, this.collection);
  }

  public delete(id: any) {
    return this.fsDao.delete(id, this.collection);
  }
}
