import { Injectable } from '@angular/core';
import { PolicyTransaction } from 'ag-common-lib/lib/models/domain/policy-transaction.model';
import { Report, ReportSummaryDetail } from 'ag-common-lib/public-api';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { CommonFireStoreDao } from '../dao/CommonFireStoreDao.dao';


@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  public paidRecords = new Subject<PolicyTransaction[]>();
  public paidRecordsCount = new Subject<number>();
  public paidCurrentCount = new Subject<number>();

  constructor(public fsDao: CommonFireStoreDao<Report>, 
    public fsTDao: CommonFireStoreDao<PolicyTransaction>,
    public toster: ToastrService){}

  private collection: string = "reports";

  public getReportById(id: any): Promise<Report> {
    return this.fsDao.getById(this.collection, id);
  }

  public getAllReports(): Promise<Report[]> {
    return this.fsDao.getAllOrderBy(this.collection, 'uploadDate');
  }

  public getMostRecentReport(): Promise<Report[]> {
    return this.fsDao.getMostRecentOrderBy(this.collection, 'uploadDate');
  }

  public createReport(report: Report){
    return this.fsDao.create(report, this.collection);
  }

  public updateReport(report: Report){
    return this.fsDao.update(report, report.dbId, this.collection);
  }

  public deleteReport(id: any){
    return this.fsDao.delete(id, this.collection);
  }

  importPaidFile(file: File): Promise <PolicyTransaction[]>{
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => {
        let text = reader.result;
        let transactions = this.createPaidArray(text);
        this.paidRecordsCount.next(transactions.length);
        resolve(transactions);
      };
    });
  }

  createPaidArray(csvText): PolicyTransaction[]{
    let count: number = 1;
    let lines: string[] = csvText.split("\n");
    let headers: string[] = lines[0].split(",");
    let headersTransformed: string[] = [];
  
    headers.forEach(h => {
      headersTransformed.push(h.replace(/ /g,"_"));
    })

    let transactions: PolicyTransaction[] = [];

    for (var i = 1; i < lines.length-1; i++) {
      try{
        var obj =  {... new PolicyTransaction()};
        let currentline: string[] = lines[i].split(",");
        
        for (var j = 0; j < headers.length; j++) {
            obj[headersTransformed[j]] = currentline[j].trim();
        }
      
        transactions.push(obj);
      } catch (err){
        console.error(err)
      } 
    }

    return transactions;
  }

  groupTransactionsByFieldValue(transactions: PolicyTransaction[], groupField: string): Map<string, ReportSummaryDetail>{
    let retval: Map<string, ReportSummaryDetail> = new Map<string, ReportSummaryDetail>();

    try{
      transactions.forEach( transaction => {
        let fieldName: string = transaction[groupField];
  
        if(!retval.has(fieldName)){
          let item = {...new ReportSummaryDetail()};
          item.transactions = [];   
          retval.set(fieldName, item)   
        }

        let item: ReportSummaryDetail = retval.get(fieldName);        
        item.transactions.push(transaction);
        item.count=item.transactions.length;
        item.countTotal=Number(item.count + transaction.policies).toFixed(0);
      })
    } catch (err) {
      console.error(err);
    }

    return retval;
  }

  groupTransactionsByMonth(transactions: PolicyTransaction[], field: string): Map<number, ReportSummaryDetail>{
    let retval: Map<number, ReportSummaryDetail> = new Map<number, ReportSummaryDetail>();

    try{
      transactions.forEach( transaction => {
        let fieldName: number = new Date(transaction[field]).getMonth();
        if(!retval.has(fieldName)){
          let item = {...new ReportSummaryDetail()};
          item.transactions = [];   
          retval.set(fieldName, item)   
        }

        let item: ReportSummaryDetail = retval.get(fieldName);        
        item.transactions.push(transaction);
        item.count=item.transactions.length;
        item.countTotal=Number(item.count + transaction.policies).toFixed(0);
      })

      retval.forEach(value => {
        this.summarize(value.transactions, value);
      })
    } catch (err) {
      console.error(err);
    }

    return retval;
  }

  groupTransactionsByWeek(transactions: PolicyTransaction[], field: string): Map<number, ReportSummaryDetail>{
    let retval: Map<number, ReportSummaryDetail> = new Map<number, ReportSummaryDetail>();

    try{
      transactions.forEach( transaction => {
        let fieldName: number = new Date(transaction[field]).getWeek();
        if(!retval.has(fieldName)){
          let item = {...new ReportSummaryDetail()};
          item.transactions = [];   
          retval.set(fieldName, item)   
        }

        let item: ReportSummaryDetail = retval.get(fieldName);        
        item.transactions.push(transaction);
        item.count=item.transactions.length;
        item.countTotal=Number(item.count + transaction.policies).toFixed(0);
      })

      retval.forEach(value => {
        this.summarize(value.transactions, value);
      })
    } catch (err) {
      console.error(err);
    }

    return retval;
  }

  summarize(values: PolicyTransaction[], summary: ReportSummaryDetail): ReportSummaryDetail{
    try{
      values.forEach(record =>  {
        if(!isNaN(Number(record.life_prem)))summary.lifeTotal=(Number(summary.lifeTotal) + Number(record.life_prem)).toFixed(2);
        if(!isNaN(Number(record.target_prem)))summary.targetTotal=(Number(summary.targetTotal) + Number(record.target_prem)).toFixed(2);
        if(!isNaN(Number(record.excess_prem)))summary.excessTotal=(Number(summary.excessTotal) + Number(record.excess_prem)).toFixed(2);
        if(!isNaN(Number(record.annuity)))summary.annuityTotal=(Number(summary.annuityTotal) + Number(record.annuity)).toFixed(2);
        if(!isNaN(Number(record.policies)))summary.countTotal=(Number(summary.countTotal) + Number(record.policies)).toFixed(0);
        if(!isNaN(Number(record.weighted_prem)))summary.premiumTotal=(Number(summary.premiumTotal) + Number(record.weighted_prem)).toFixed(2);
      })
    } catch (err) {
      console.error(err);
    }

    return summary;
  }

  combine(values: PolicyTransaction[], summary: ReportSummaryDetail): ReportSummaryDetail{
    try{
      values.forEach(record =>  {
        if(!isNaN(Number(record.life_prem)))summary.lifeTotal=(Number(summary.lifeTotal) + Number(record.life_prem)).toFixed(2);
        if(!isNaN(Number(record.target_prem)))summary.targetTotal=(Number(summary.targetTotal) + Number(record.target_prem)).toFixed(2);
        if(!isNaN(Number(record.excess_prem)))summary.excessTotal=(Number(summary.excessTotal) + Number(record.excess_prem)).toFixed(2);
        if(!isNaN(Number(record.annuity)))summary.annuityTotal=(Number(summary.annuityTotal) + Number(record.annuity)).toFixed(2);
        if(!isNaN(Number(record.policies)))summary.countTotal=(Number(summary.countTotal) + Number(record.policies)).toFixed(0);
        if(!isNaN(Number(record.weighted_prem)))summary.premiumTotal=(Number(summary.premiumTotal) + Number(record.weighted_prem)).toFixed(2);
      })
    } catch (err) {
      console.error(err);
    }

    return summary;
  }
}
