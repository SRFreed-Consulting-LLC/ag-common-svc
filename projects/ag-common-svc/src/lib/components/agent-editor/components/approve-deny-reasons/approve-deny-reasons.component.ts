import { Component, HostBinding, Input, ViewChild } from '@angular/core';
import {
  Agent,
  ApproveDenyReason,
  ApproveDenyReasonKeys,
  ApproveDenyReasonVisibilityLevel,
  APPROVE_DENY_REASON_VISIBILITY_LEVEL_LOOKUP,
  BaseModelKeys,
  Lookup,
  LookupKeys,
} from 'ag-common-lib/public-api';
import { DxFormComponent } from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { AgentApproveDenyReasonsService } from '../../../../services/agent-approve-deny-reason.service';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { ModalWindowComponent } from '../../../modal-window/modal-window.component';
import { AgentService } from '../../../../services/agent.service';
import { ApproveDenyReasonsModalComponent } from './approve-deny-reasons-modal/approve-deny-reasons-modal.component';
import { QueryParam, WhereFilterOperandKeys } from '../../../../dao/CommonFireStoreDao.dao';

@Component({
  selector: 'ag-shr-approve-deny-reasons',
  templateUrl: './approve-deny-reasons.component.html',
  styleUrls: ['./approve-deny-reasons.component.scss'],
})
export class ApproveDenyReasonsComponent {
  @HostBinding('class') className = 'approve-deny-reasons';
  @Input() set agent(agent: Agent) {
    this.agentId$.next(agent[BaseModelKeys.dbId]);
  }
  @Input() readOnly = false;
  @Input() set allowedVisibilityLevels(data: ApproveDenyReasonVisibilityLevel[]) {
    if (Array.isArray(data)) {
      this.allowedVisibilityLevels$.next(data);
    }
  }
  @ViewChild('approveDenyReasonModalRef', { static: true }) approveDenyReasonModalComponent: ModalWindowComponent;

  public inProgress$: Observable<boolean>;
  public agentsDataSource$: Observable<any>;
  public BaseModelKeys = BaseModelKeys;
  public ApproveDenyReasonKeys = ApproveDenyReasonKeys;
  public approveDenyReasonVisibilityLevelLookup = APPROVE_DENY_REASON_VISIBILITY_LEVEL_LOOKUP;
  public approveDenyReasonFormData: ApproveDenyReason;
  public approveDenyReasons$: Observable<DataSource>;
  public readonly agentId$ = new BehaviorSubject<string>(undefined);

  private allowedVisibilityLevels$ = new BehaviorSubject<ApproveDenyReasonVisibilityLevel[]>([]);

  constructor(
    private agentService: AgentService,
    private agentApproveDenyReasonsService: AgentApproveDenyReasonsService,
  ) {
    this.approveDenyReasons$ = combineLatest([this.agentId$, this.allowedVisibilityLevels$]).pipe(
      filter(Boolean),
      switchMap(([agentId, allowedVisibilityLevels]) => {
        const qp: QueryParam[] = [];

        if (Array.isArray(allowedVisibilityLevels) && allowedVisibilityLevels?.length) {
          const visibilityLevelsQueryParam = new QueryParam(
            ApproveDenyReasonKeys.visibilityLevel,
            WhereFilterOperandKeys.in,
            allowedVisibilityLevels,
          );
          qp.push(visibilityLevelsQueryParam);
        }

        return this.agentApproveDenyReasonsService.getList(agentId, qp);
      }),
      map((approveDenyReasons) => {
        return new DataSource({
          store: new ArrayStore({
            key: 'dbId',
            data: Array.isArray(approveDenyReasons) ? approveDenyReasons : [],
          }),
        });
      }),
      shareReplay(1),
    );

    this.agentsDataSource$ = this.agentService.getList().pipe(
      map((response): Partial<Lookup>[] =>
        Array.isArray(response)
          ? response.map((agent: Agent) => {
              const description = [agent?.p_agent_first_name, agent?.p_agent_last_name].filter(Boolean).join(' ');
              const value = agent?.p_email;

              return {
                key: agent?.dbId,
                [LookupKeys.value]: value,
                [LookupKeys.description]: description,
              };
            })
          : [],
      ),
    );
  }

  public showListPopup = () => {
    this.approveDenyReasonModalComponent.showModal();
  };

  public onRowRemoving = (e) => {
    e.cancel = this.agentApproveDenyReasonsService.delete(this.agentId$.value, e.data[BaseModelKeys.dbId]);
  };
}
