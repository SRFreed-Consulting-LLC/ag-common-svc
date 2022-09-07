import { BaseModel } from 'ag-common-lib/public-api';
import { CommonFireStoreDao, QueryParam } from '../dao/CommonFireStoreDao.dao';
import { FirebaseApp } from 'firebase/app';

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

  public getById(id: any): Promise<T> {
    return this.fsDao.getById(this.collection, id);
  }

  public getAllByValue(qp: QueryParam[], sortField?: string): Promise<T[]> {
    return this.fsDao.getAllByQValue(this.collection, qp, sortField);
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

  public update(value: T) {
    return this.fsDao.update(value, value.dbId, this.collection);
  }

  public delete(id: any) {
    return this.fsDao.delete(id, this.collection);
  }
}
