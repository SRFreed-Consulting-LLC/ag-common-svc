import { Component, OnInit, ViewChild } from '@angular/core';
import { GOALS_TYPES, GOALS_TYPES_LOOKUP, modalLabelMap, SalesGoals } from './sales-goals.model';
import { DxDataGridComponent } from 'devextreme-angular';
import { ModalWindowComponent } from '../../modal-window/modal-window.component';
import { combineLatest, map, Observable, shareReplay, Subject } from 'rxjs';
import DataSource from 'devextreme/data/data_source';
import { AgentService } from '../../../services/agent.service';
import { SalesGoalsModalService } from './sales-goals-modal.service';
import { ToastrService } from 'ngx-toastr';
import { Agent, AgentKeys } from 'ag-common-lib/lib/models/domain/agent.model';
import ArrayStore from 'devextreme/data/array_store';

@Component({
  selector: 'ag-shr-sales-goals-administration',
  templateUrl: './sales-goals-administration.component.html',
  styleUrls: ['./sales-goals-administration.component.scss'],
  providers: [SalesGoalsModalService]
})
export class SalesGoalsAdministrationComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid: DxDataGridComponent;
  @ViewChild('salesGoalsModalRef', { static: true }) salesGoalsModalComponent: ModalWindowComponent;

  public years: number[] = [];
  public currentYear: number = new Date().getFullYear();
  public startYear = 2020;

  public selectedYear = this.currentYear;
  public selectedYearChanged$ = new Subject();

  public agentsDataSource$: Observable<DataSource>;
  public salesGoalsFormData: Partial<SalesGoals>;
  public inProgress$: Observable<boolean>;

  protected readonly AgentKeys = AgentKeys;
  protected readonly modalLabelMap = modalLabelMap;
  protected readonly GOALS_TYPES = GOALS_TYPES;
  protected readonly GOALS_TYPES_LOOKUP = GOALS_TYPES_LOOKUP;

  constructor(private agentService: AgentService,
              private salesGoalsModalService: SalesGoalsModalService,
              private toastr: ToastrService) { }

  ngOnInit(): void {
    this.initYearsFilter();
    this.inProgress$ = this.salesGoalsModalService.inProgress$;

    this.agentsDataSource$ = combineLatest([this.agentService.getList(), this.selectedYearChanged$])
      .pipe(
        map(([agents, selectedYear]) => {
          return agents?.map((agent: Agent) => {
              const description = [agent?.p_agent_first_name, agent?.p_agent_last_name].filter(Boolean).join(' ');
              const currentPersonalGoals = agent[AgentKeys.personal_goals].find(goal => goal.year === this.selectedYear)?.amount;
              const currentConferenceGoals = agent[AgentKeys.conference_goals].find(goal => goal.year === this.selectedYear)?.amount;
              const currentManagerGoals = agent[AgentKeys.is_manager] ? agent[AgentKeys.manager_goals].find(goal => goal.year === this.selectedYear)?.amount : null;

              return {
                key: agent?.dbId,
                description,
                currentPersonalGoals,
                currentConferenceGoals,
                currentManagerGoals,
                [AgentKeys.personal_goals]: agent[AgentKeys.personal_goals],
                [AgentKeys.conference_goals]: agent[AgentKeys.conference_goals],
                [AgentKeys.manager_goals]: agent[AgentKeys.manager_goals],
                [AgentKeys.is_manager]: agent[AgentKeys.is_manager],  // todo ask is_manager or is_rmd ???
              };
            })
            ?? [];
        }),
        map((data) => {
          console.log('data', data);
          return new DataSource({
            store: new ArrayStore({
              key: 'key',
              data:  Array.isArray(data) ? data : []
            }),
          });
        }),
        shareReplay(1),
      )
  }

  public getSelectedRowData() {
    return this.dataGrid.instance.getSelectedRowsData();
  }

  public showSalesGoalsModal(goalsType: GOALS_TYPES) {
    const salesGoalData = {
      selectedAgents: this.getSelectedRowData(),
      year: this.selectedYear,
      goalsType: goalsType
    }
    this.salesGoalsFormData = this.salesGoalsModalService.getFormData(salesGoalData);
    this.salesGoalsModalComponent.showModal();
  }

  public updateSalesGoals() {
    this.salesGoalsModalService.handleSave().then(() => {
      this.toastr.success('Successfully saved all Goals');
      this.salesGoalsModalComponent.hideModal();
    });
  }

  private initYearsFilter() {
    for (let i = this.currentYear; i >= this.startYear; i--) {
      this.years.push(i);
    }
  }
}
