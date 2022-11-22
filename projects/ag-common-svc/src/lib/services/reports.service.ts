import { Inject, Injectable } from '@angular/core';
import { PolicyTransaction } from 'ag-common-lib/lib/models/domain/policy-transaction.model';
import { Report } from 'ag-common-lib/public-api';
import { FirebaseApp } from 'firebase/app';
import { Subject } from 'rxjs';
import { FIREBASE_APP } from '../../public-api';
import { DataService } from './data.service';


@Injectable({
  providedIn: 'root'
})
export class ReportsService extends DataService<Report> {

  public paidRecords = new Subject<PolicyTransaction[]>();
  public paidRecordsCount = new Subject<number>();
  public paidCurrentCount = new Subject<number>();

  constructor(@Inject(FIREBASE_APP) fireBaseApp: FirebaseApp) {
    super(fireBaseApp);
    super.collection = 'reports';
  }

}
