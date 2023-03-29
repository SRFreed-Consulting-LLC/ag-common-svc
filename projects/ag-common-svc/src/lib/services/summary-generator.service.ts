import { Injectable } from '@angular/core';
import { DxSelectBoxComponent } from 'devextreme-angular';
import { TransactionGrouperService } from './transaction-grouper.service';
import { SummaryGeneratorUtil } from './summary-generator-util.service';
import { Agency, Agent, ReportSummary, ReportSummaryDetail } from 'ag-common-lib/public-api';
import { PolicyTransaction } from 'ag-common-lib/lib/models/domain/policy-transaction.model';
import { AgencyService } from './agency.service';
import { AgentService } from './agent.service';

@Injectable({
  providedIn: 'root'
})
export class SummaryGeneratorService {  
  agencyToAgencyIdMappingTable: Map<string, Agency> = new Map<string, Agency>();
  
  agentToAgentIdMappingTable: Map<string, Agent> = new Map<string, Agent>();

  managerList: Agent[] = [];
  agentsList: Agent[] = [];

  constructor(private transactionGrouperService: TransactionGrouperService,    
    private transactionService: TransactionGrouperService,
    private summaryCreaterService: SummaryGeneratorUtil,
    private agencyService: AgencyService,
    private agentService: AgentService){}

  public async generateSummaries(summaries: ReportSummary[] = [], transactions: PolicyTransaction[] = [], year: DxSelectBoxComponent, messages: string[]): Promise<ReportSummary[]> {
    for(const summary of this.generateAllianceGroupSummary(transactions, year.value)){
      summaries.push(summary);
    }

    for(const summary of await this.generateAgencySummary(transactions, year.value)){
      summaries.push(summary);
    }

    for(const summary of await this.generateAgentSummary(transactions, year.value)){
      summaries.push(summary);
    }

    let rmdSummaries: Map<string, ReportSummary[]> = this.transactionGrouperService.groupSummariesByArrayValue(summaries.filter(summary => summary.rmds != null
      && summary.rmds.length > 0), "rmds");

    for(const summary of this.generateRMDSummaries(rmdSummaries, year.value)){
      summaries.push(summary);
    }

    // let managerSummaries: Map<string, ReportSummary[]> = this.transactionService.groupSummariesByFieldValue(summaries.filter(summary => summary.managerId != null), "managerId");

    // for(const summary of await this.generateManagerSummaries(summaries, year.value, messages)){
    //   summaries.push(summary);
    // }

    return summaries;
  }

  private generateAllianceGroupSummary(transactions: PolicyTransaction[], year: string): ReportSummary[]{
    let retval: ReportSummary[] = [];

    let agSummary: ReportSummary = {...new ReportSummary()};
    agSummary.name = "Alliance Group"
    agSummary.type = "ag";
    agSummary.id = 'ag';
    agSummary.dbId = year + '_ag'; 
    agSummary.year = Number(year);   
    agSummary.rmds = [];

    this.summaryCreaterService.createSummaryDetails(agSummary, transactions, Number(year))

    retval.push(agSummary);

    return retval;
  }

  private async generateAgencySummary(transactions: PolicyTransaction[], year: string): Promise<ReportSummary[]> {
    let retval: ReportSummary[] = [];

    await this.agencyService.getAll().then(
      (agencies) => {
        for (let a of agencies) {
          this.agencyToAgencyIdMappingTable.set(a.agency_id, a);
        }
      },
      (err) => console.error('Error in Summary Generator Service', err)
    );

    let agencyMap: Map<string, ReportSummaryDetail> = this.transactionService.groupTransactionsByFieldValue(
      transactions,
      'mga_id'
    );

    agencyMap.forEach((summary, id) => {
      let agencySummary: ReportSummary = { ...new ReportSummary() };
      agencySummary.type = 'Agency';
      agencySummary.id = id;
      agencySummary.dbId = year + '_' + id;
      agencySummary.year = Number(year);
      
      let agency: Agency = this.agencyToAgencyIdMappingTable.get(id);

      if (agency != null) {
        agencySummary.mgaId = agency.agency_id;
        agencySummary.name = agency.name;
        agencySummary.rmds = agency.rmds;
      } else {
        agencySummary.mgaId = summary.mgaId;
        agencySummary.name = summary.mgaName;
        agencySummary.rmds = [];
      }

      this.summaryCreaterService.createSummaryDetails(agencySummary, summary.transactions, Number(year));

      retval.push(agencySummary);
    });

    return retval;
  }

  private async generateAgentSummary(transactions: PolicyTransaction[], year: string): Promise<ReportSummary[]> {
    let retval: ReportSummary[] = [];

    await this.agentService.getAll().then(
      (agencies) => {
        for (let a of agencies) {
          this.agentToAgentIdMappingTable.set(a.p_agent_id, a);
        }
      },
      (err) => console.error('Error in Summary Generator Service', err)
    );

    //create map of transactions for each agent id
    let agentSummaryMap: Map<string, ReportSummaryDetail> = this.transactionGrouperService.groupTransactionsByFieldValue(transactions, 'agent_id');

    //iterate through each agent in map and group agents transactions by mga_id/
    agentSummaryMap.forEach((agent_summary, agentId) => { 
      let agentAgencySummaryMap: Map<string, ReportSummaryDetail> = this.transactionGrouperService.groupTransactionsByFieldValue(agent_summary.transactions, 'mga_id');

      //generate record for each agent by mga 
      agentAgencySummaryMap.forEach((agent_agency_summary, mga_id) => { 
        let agentSummary: ReportSummary = { ...new ReportSummary() };

        agentSummary.type = 'Agent';
        agentSummary.rmds = [];
        agentSummary.id = agentId;
        agentSummary.dbId = year + '_' + mga_id + '_' + agentId;
        agentSummary.mgaId = mga_id;
        agentSummary.year = Number(year);

        if (this.agentToAgentIdMappingTable.has(agentId)) {
          let agent: Agent =  this.agentToAgentIdMappingTable.get(agentId);
          //we do know this person in the portal
          agentSummary.name = agent.p_agent_first_name + ' ' + agent.p_agent_last_name;
  
          if (agent.manager_id) {
            agentSummary.managerId = agent.manager_id;
          }
        } else {
          //we do not know this person, but they have an id
          agentSummary.name = agent_agency_summary.name;
          agentSummary.managerId = '';
        } 

        this.summaryCreaterService.createSummaryDetails(agentSummary, agent_agency_summary.transactions, agentSummary.year);  
        retval.push(agentSummary);
      })
    })
    
    return retval;
  }

  private generateRMDSummaries(summaries: Map<string, ReportSummary[]>, year: number): ReportSummary[]{
    let retval:ReportSummary[] = [];

    summaries.forEach((value, id) => {
      let summary: ReportSummary = {...new ReportSummary()};
      summary.agentStats = {... new ReportSummaryDetail()};
      summary.revenueStatsMonth = [];
      summary.revenueStatsWeek = [];
      summary.salesStats = [];

      summary.name = "RMD_ " + id;
      summary.type = "RMD";
      summary.id = id;
      summary.dbId = year + '_' + id + '_RMD';
      summary.year = Number(year);
      summary.rmds = [];
  
      let agencySummaryDetails: ReportSummaryDetail[] = [];
      let salesSummaryDetails: ReportSummaryDetail[] = [];
      let monthlySummaryDetails: ReportSummaryDetail[] = [];
      let weeklySummaryDetails: ReportSummaryDetail[] = [];

      value.forEach(s => {
        agencySummaryDetails.push(s.agentStats);

        s.salesStats.forEach(stat => {
          salesSummaryDetails.push(stat);
        })

        s.revenueStatsMonth.forEach(stat => {
          monthlySummaryDetails.push(stat);
        })

        s.revenueStatsWeek.forEach(stat => {
          weeklySummaryDetails.push(stat);
        })
      });

      summary = this.summaryCreaterService.combineDetailSummary(agencySummaryDetails, summary)

      summary = this.summaryCreaterService.combineSalesSummary(salesSummaryDetails, summary);
  
      summary = this.summaryCreaterService.combineMonthSummary(monthlySummaryDetails, summary, year);
  
      summary = this.summaryCreaterService.combineWeekSummary(weeklySummaryDetails, summary, year);

      retval.push(summary);
    })

    return retval;
  }
}


