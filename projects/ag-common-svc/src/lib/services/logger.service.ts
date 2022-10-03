import { Inject, Injectable } from "@angular/core";
import { LogMessage } from "ag-common-lib/public-api";
import { FirebaseApp } from "firebase/app";
import { QueryParam } from "../dao/CommonFireStoreDao.dao";
import { FIREBASE_APP } from "../injections/firebase-app";
import { DataService } from "./data.service";

@Injectable({
  providedIn: "root",
})
export class LoggerService  extends DataService<LogMessage>{
  public includeLogs: boolean = false;

  constructor(@Inject(FIREBASE_APP) fireBaseApp: FirebaseApp) {
    super(fireBaseApp, null, null);
    super.collection = 'log-messages';
  }

  public getAll(sortField?: string): Promise<LogMessage[]> {
    return this.fsDao.getAll(this.collection, sortField);
  }

  public getById(id: any): Promise<LogMessage> {
    return this.fsDao.getById(this.collection, id);
  }

  public getAllByCondition(
    qp: QueryParam[],
    sortField?: string
  ): Promise<LogMessage[]> {
    return this.fsDao.getAllByQValue(this.collection, qp, sortField);
  }

  public add(message: LogMessage) {
    return this.fsDao.create(message, this.collection);
  }

  public update(message: LogMessage) {
    return this.fsDao.update(message, message.dbId, this.collection);
  }

  public delete(id: any) {
    return this.fsDao.delete(id, this.collection);
  }
}
