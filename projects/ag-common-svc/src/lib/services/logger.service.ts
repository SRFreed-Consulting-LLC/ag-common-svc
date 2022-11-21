import { Inject, Injectable } from "@angular/core";
import { LogMessage } from "ag-common-lib/public-api";
import { FirebaseApp } from "firebase/app";
import { QueryParam, WhereFilterOperandKeys } from "../dao/CommonFireStoreDao.dao";
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

  getLogsByArchivedFlag(archived: boolean, sortField: string): Promise<LogMessage[]>{
    return this.getAllByValue([new QueryParam('archived', WhereFilterOperandKeys.equal, archived)], sortField);
  }
}
