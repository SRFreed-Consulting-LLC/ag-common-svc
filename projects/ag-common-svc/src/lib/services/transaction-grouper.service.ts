import { Injectable } from '@angular/core';
import { PolicyTransaction } from 'ag-common-lib/lib/models/domain/policy-transaction.model';
import { ReportSummaryDetail, ReportSummary } from 'ag-common-lib/public-api';

@Injectable({
  providedIn: 'root'
})
export class TransactionGrouperService {
  constructor(){}

  groupTransactionsByFieldValue(transactions: PolicyTransaction[], groupField: string): Map<string, ReportSummaryDetail>{
    let retval: Map<string, ReportSummaryDetail> = new Map<string, ReportSummaryDetail>();

    try{
      transactions.forEach(transaction => {
        let key: string = transaction[groupField];
  
        if(!retval.has(key)){
          let value = {...new ReportSummaryDetail()};
          value.transactions = [];   
          
          value.name = transaction.agent_name;
          value.mgaId = transaction.mga_id;
          value.mgaName = transaction.mga_name;

          retval.set(key, value)   ;
        }

        let item: ReportSummaryDetail = retval.get(key);        
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

  groupSummariesByArrayValue(summaries: ReportSummary[], groupField: string): Map<string, ReportSummary[]>{    
    let retval: Map<string, ReportSummary[]> = new Map<string, ReportSummary[]>();

    try{
      summaries.forEach(summary => {
        let fieldArray: string[] = summary[groupField];

        if(fieldArray != null && fieldArray.length > 0){
          fieldArray.forEach(fieldName => {
            if(fieldName != ''){
              if(!retval.has(fieldName)){
                let summaryList: ReportSummary[] = []  
                retval.set(fieldName, summaryList)   
              }
      
              let item: ReportSummary[] = retval.get(fieldName);        
              item.push(summary);
            }
          })
        }
      })
    } catch (err) {
      console.error(err);
    }

    return retval;
  }

  groupSummariesByFieldValue(summaries: ReportSummary[], groupField: string): Map<string, ReportSummary[]>{
    let retval: Map<string, ReportSummary[]> = new Map<string, ReportSummary[]>();

    try{
      summaries.forEach(summary => {
        let key: string = summary[groupField];
  
        if(!retval.has(key)){
          let summaryList: ReportSummary[] = []  
          retval.set(key, summaryList)   
        }

        let item: ReportSummary[] = retval.get(key);        

        item.push(summary)
      })
    } catch (err) {
      console.error(err);
    }

    return retval;
  }
  
  summarize(values: PolicyTransaction[], summary: ReportSummaryDetail): ReportSummaryDetail{
    try{
      values.forEach(record =>  {
        if(isNaN(Number(record.life_prem))) record.life_prem = 0;
        if(isNaN(Number(record.target_prem))) record.target_prem = 0;
        if(isNaN(Number(record.excess_prem))) record.excess_prem = 0;
        if(isNaN(Number(record.annuity))) record.annuity = 0;
        if(isNaN(Number(record.policies))) record.policies = 0;
        if(isNaN(Number(record.weighted_prem))) record.weighted_prem = 0;

        if(!isNaN(Number(record.life_prem)))summary.lifeTotal=(Number(summary.lifeTotal) + Number(record.life_prem)).toFixed(2);
        if(!isNaN(Number(record.target_prem)))summary.targetTotal=(Number(summary.targetTotal) + Number(record.target_prem)).toFixed(2);
        if(!isNaN(Number(record.excess_prem)))summary.excessTotal=(Number(summary.excessTotal) + Number(record.excess_prem)).toFixed(2);
        if(!isNaN(Number(record.annuity)))summary.annuityTotal=(Number(summary.annuityTotal) + Number(record.annuity)).toFixed(2);
        if(!isNaN(Number(record.policies)))summary.countTotal=(Number(summary.countTotal) + Number(record.policies)).toFixed(2);
        if(!isNaN(Number(record.weighted_prem)))summary.premiumTotal=(Number(summary.premiumTotal) + Number(record.weighted_prem)).toFixed(2);
      })
    } catch (err) {
      console.error(err);
    }

    return summary;
  }
  
  public uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
