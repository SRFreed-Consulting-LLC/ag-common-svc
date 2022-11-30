import { Component, HostBinding, Inject, Input, Optional, ViewChild } from '@angular/core';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
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
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { AgentApproveDenyReasonsService } from '../../../../../services/agent-approve-deny-reason.service';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { AgentService } from '../../../../../services/agent.service';
import { ApproveDenyReasonsModalComponent } from '../approve-deny-reasons-modal/approve-deny-reasons-modal.component';
import { LOGGED_IN_USER_EMAIL } from '../../../agent-editor.model';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { QueryParam, WhereFilterOperandKeys } from '../../../../../dao/CommonFireStoreDao.dao';
import { ApproveDenyReasonEditorConfig } from './approve-deny-reasons-grid.model';

@UntilDestroy()
@Component({
  selector: 'ag-shr-approve-deny-reasons-grid',
  templateUrl: './approve-deny-reasons-grid.component.html',
  styleUrls: ['./approve-deny-reasons-grid.component.scss'],
})
export class ApproveDenyReasonsGridComponent {
  @HostBinding('class') className = 'approve-deny-reasons-grid';
  @ViewChild('approveDenyReasonModalRef')
  approveDenyReasonsModalComponent: ApproveDenyReasonsModalComponent;
  @Input() set agentId(dbId: string) {
    this.agentId$.next(dbId);
  }
  @Input() title: string;
  @Input() isEditable: boolean = true;
  @Input() extraToolbarItems = [];
  @Input() editModalOptions: ApproveDenyReasonEditorConfig;
  @Input() set allowedVisibilityLevels(data: ApproveDenyReasonVisibilityLevel[]) {
    if (Array.isArray(data)) {
      this.allowedVisibilityLevels$.next(data);
    }
  }

  public agentsDataSource$: Observable<any>;
  public BaseModelKeys = BaseModelKeys;
  public ApproveDenyReasonKeys = ApproveDenyReasonKeys;
  public approveDenyReasonVisibilityLevelLookup = APPROVE_DENY_REASON_VISIBILITY_LEVEL_LOOKUP;
  public approveDenyReasons$: Observable<DataSource>;

  private readonly agentId$ = new BehaviorSubject<string>(undefined);
  private loggedInUserEmail = undefined;
  private allowedVisibilityLevels$ = new BehaviorSubject<ApproveDenyReasonVisibilityLevel[]>([]);

  constructor(
    private agentService: AgentService,
    private agentApproveDenyReasonsService: AgentApproveDenyReasonsService,
    @Optional() @Inject(LOGGED_IN_USER_EMAIL) private loggedInUserEmail$: Observable<string>,
  ) {
    this.loggedInUserEmail$?.pipe(untilDestroyed(this)).subscribe((loggedInUserEmail) => {
      this.loggedInUserEmail = loggedInUserEmail;
    });
    this.approveDenyReasons$ = combineLatest([this.agentId$, this.allowedVisibilityLevels$]).pipe(
      filter(([agentId]) => !!agentId),
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

  public onRowRemoving = (e) => {
    e.cancel = this.agentApproveDenyReasonsService.delete(this.agentId$.value, e.data[BaseModelKeys.dbId]);
  };

  public showAddApproveDenyReasonPopup = () => {
    this.approveDenyReasonsModalComponent.showModal(
      this.agentId$.value,
      this.editModalOptions?.initialApproveDenyReason as ApproveDenyReason,
    );
  };

  public showEditPopup = ({ row: { data } }) => {
    this.approveDenyReasonsModalComponent.showModal(this.agentId$.value, data);
  };

  public getIsEditingAllowed = ({ row: { data } }) => {
    return !!this.loggedInUserEmail && this.loggedInUserEmail === data[BaseModelKeys.createdBy];
  };
}
