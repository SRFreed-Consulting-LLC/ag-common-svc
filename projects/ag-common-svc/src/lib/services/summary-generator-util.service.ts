import { Injectable } from '@angular/core';
import { PolicyTransaction } from 'ag-common-lib/lib/models/domain/policy-transaction.model';
import { ReportSummary, ReportSummaryDetail } from 'ag-common-lib/public-api';
import { TransactionGrouperService } from './transaction-grouper.service';

@Injectable({
  providedIn: 'root'
})
export class SummaryGeneratorUtil {

  constructor(private transactionGrouperService: TransactionGrouperService) { }

  createSummaryDetails(agentSummary: ReportSummary, transactions: PolicyTransaction[], year: number){
    let agStats: ReportSummaryDetail = this.transactionGrouperService.summarize(transactions, {...new ReportSummaryDetail()});
    agStats.year = Number(year);
    agentSummary.agentStats = agStats ;

    let agSalesAnalyticsMap: Map<string, ReportSummaryDetail> = this.createSalesStatsSummary(transactions);

    agSalesAnalyticsMap.forEach((value, key) => {
      delete value.transactions;
      value.name = key;
      value.year = Number(year);
      value.month =  Number(key);
      agentSummary.salesStats.push(value);
    })

    let agRevenueAnalyticsMapMonth: Map<number, ReportSummaryDetail> = this.createRevenueSummary(transactions, 'month');

    agRevenueAnalyticsMapMonth.forEach((value, key) => {
      delete value.transactions;
      value.year = Number(year);
      value.month =  Number(key);
      agentSummary.revenueStatsMonth.push(value);
    })
    
    let agRevenueAnalyticsMapWeek: Map<number, ReportSummaryDetail> = this.createRevenueSummary(transactions, 'week');

    agRevenueAnalyticsMapWeek.forEach((value, key) => {
      delete value.transactions;
      value.year = Number(year);
      value.week =  Number(key);
      agentSummary.revenueStatsWeek.push(value);
    })
  }

  private createSalesStatsSummary(transactions: PolicyTransaction[]): Map<string, ReportSummaryDetail>{
    let recruiterMap:Map<string, ReportSummaryDetail> = this.transactionGrouperService.groupTransactionsByFieldValue(transactions, 'carrier_name');
    
    recruiterMap.forEach(summary => {
      this.transactionGrouperService.summarize(summary.transactions, summary);
    })
    
    return recruiterMap;
  }

  private createRevenueSummary(transactions: PolicyTransaction[], view:string): Map<number, ReportSummaryDetail> {
    if(view == 'month'){
      return this.transactionGrouperService.groupTransactionsByMonth(transactions, 'transdate');
    } else {
      return this.transactionGrouperService.groupTransactionsByWeek(transactions, 'transdate');
    }
  }

  combineDetailSummary(summaries: ReportSummaryDetail[], reportSummary: ReportSummary): ReportSummary{
    let returnVal: ReportSummaryDetail = {...new ReportSummaryDetail()};
    
    summaries.forEach(summary => {
      returnVal = this.combineReportSummaryDetails(returnVal, summary);
    })

    reportSummary.agentStats = returnVal;

    return reportSummary;
  }

  combineSalesSummary(summaries: ReportSummaryDetail[], reportSummary: ReportSummary): ReportSummary {
    let returnVal: ReportSummaryDetail[] = [];

    let salesMap: Map<string, ReportSummaryDetail> = this.transactionGrouperService.groupTransactionsByFieldValue(summaries, 'name');

    salesMap.forEach((value, key) => {
      let tmpSummaryDetail: ReportSummaryDetail = {...new ReportSummaryDetail()};

      tmpSummaryDetail.name = key;
      
      value.transactions.forEach(detail => {
        tmpSummaryDetail = this.combineReportSummaryDetails(tmpSummaryDetail, detail);
      })
    
      returnVal.push(tmpSummaryDetail);
    })

    reportSummary.salesStats = returnVal;

    return reportSummary;
  }

  combineMonthSummary(mainSummary: ReportSummaryDetail[], reportSummary: ReportSummary, year: number): ReportSummary {
    let returnVal: ReportSummaryDetail[] = [];

    let salesMap: Map<string, ReportSummaryDetail> = this.transactionGrouperService.groupTransactionsByFieldValue(mainSummary, 'month');

    salesMap.forEach((value, key) => {
      let tmpSummaryDetail: ReportSummaryDetail = {...new ReportSummaryDetail()};
      tmpSummaryDetail.name = key;
      tmpSummaryDetail.year = year;
      tmpSummaryDetail.month = Number(key);

      value.transactions.forEach(detail => {
        tmpSummaryDetail = this.combineReportSummaryDetails(tmpSummaryDetail, detail);
      })
    
      returnVal.push(tmpSummaryDetail);
    })

    reportSummary.revenueStatsMonth = returnVal;

    return reportSummary;
  }

  combineWeekSummary(mainSummary: ReportSummaryDetail[], reportSummary: ReportSummary, year: number): ReportSummary {
    let returnVal: ReportSummaryDetail[] = [];

    let salesMap: Map<string, ReportSummaryDetail> = this.transactionGrouperService.groupTransactionsByFieldValue(mainSummary, 'week');

    salesMap.forEach((value, key) => {
      let tmpSummaryDetail: ReportSummaryDetail = {...new ReportSummaryDetail()};
      tmpSummaryDetail.year = year;
      tmpSummaryDetail.week = Number(key);

      value.transactions.forEach(detail => {
        tmpSummaryDetail = this.combineReportSummaryDetails(tmpSummaryDetail, detail);
      })
    
      returnVal.push(tmpSummaryDetail);
    })

    reportSummary.revenueStatsWeek = returnVal;

    return reportSummary;
  }

  combineReportSummaryDetails(mainSummary: ReportSummaryDetail, summary: ReportSummaryDetail,): ReportSummaryDetail{
    mainSummary.annuityTotal = (Number(mainSummary.annuityTotal) + Number(summary.annuityTotal)).toFixed(2);
    mainSummary.countTotal = (Number(mainSummary.countTotal) + Number(summary.countTotal)).toFixed(2);
    mainSummary.excessTotal = (Number(mainSummary.excessTotal) + Number(summary.excessTotal)).toFixed(2);
    mainSummary.lifeTotal = (Number(mainSummary.lifeTotal) + Number(summary.lifeTotal)).toFixed(2);
    mainSummary.outsideTotal = (Number(mainSummary.outsideTotal) + Number(summary.outsideTotal)).toFixed(2);
    mainSummary.premiumTotal = (Number(mainSummary.premiumTotal) + Number(summary.premiumTotal)).toFixed(2);
    mainSummary.targetTotal = (Number(mainSummary.targetTotal) + Number(summary.targetTotal)).toFixed(2);
    return mainSummary;
  }

  weighReportSummaryDetails(mainSummary: ReportSummaryDetail, multiplier: number): ReportSummaryDetail{
    mainSummary.annuityTotal = (Number(mainSummary.annuityTotal) * multiplier).toFixed(2);
    mainSummary.premiumTotal = (Number(mainSummary.premiumTotal) * multiplier).toFixed(2);
    return mainSummary;
  }
}
