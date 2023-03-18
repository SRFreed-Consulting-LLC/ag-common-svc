import { Component, HostBinding, Inject, Input, Optional, ViewChild } from '@angular/core';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import {
  Agent,
  BaseModelKeys,
  Lookup,
  LookupKeys,
  NeedToKnow,
  NeedToKnowKeys,
  NeedToKnowVisibilityLevel,
  NEED_TO_KNOW_VISIBILITY_LEVEL_LOOKUP,
} from 'ag-common-lib/public-api';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { AgentService } from '../../../../../services/agent.service';
import { NeedToKnowModalComponent } from '../need-to-know-modal/need-to-know-modal.component';
import { LOGGED_IN_USER_EMAIL } from '../../../agent-editor.model';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { QueryParam, WhereFilterOperandKeys } from '../../../../../dao/CommonFireStoreDao.dao';
import { NeedToKnowConfig } from './need-to-know-grid.model';
import { AgentNeedToKnowService } from 'projects/ag-common-svc/src/lib/services/agent-need-to-know.service';

@UntilDestroy()
@Component({
  selector: 'ag-shr-need-to-know-grid',
  templateUrl: './need-to-know-grid.component.html',
  styleUrls: ['./need-to-know-grid.component.scss'],
})
export class NeedToKnowGridComponent {
  @HostBinding('class') className = 'need-to-know-grid';
  @ViewChild('needToKnowModalRef') needToKnowModalComponent: NeedToKnowModalComponent;
  @Input() set agentId(dbId: string) {
    this.agentId$.next(dbId);
  }
  @Input() title: string;
  @Input() isEditable: boolean = true;
  @Input() extraToolbarItems = [];
  @Input() editModalOptions: NeedToKnowConfig;
  @Input() set allowedVisibilityLevels(data: NeedToKnowVisibilityLevel[]) {
    if (Array.isArray(data)) {
      this.allowedVisibilityLevels$.next(data);
    }
  }

  public agentsDataSource$: Observable<any>;
  public BaseModelKeys = BaseModelKeys;
  public NeedToKnowKeys = NeedToKnowKeys;
  public needToKnowVisibilityLevelLookup = NEED_TO_KNOW_VISIBILITY_LEVEL_LOOKUP;
  public needToKnow$: Observable<DataSource>;

  private readonly agentId$ = new BehaviorSubject<string>(undefined);
  private loggedInUserEmail = undefined;
  private allowedVisibilityLevels$ = new BehaviorSubject<NeedToKnowVisibilityLevel[]>([]);

  constructor(
    private agentService: AgentService,
    private agentNeedToKnowService: AgentNeedToKnowService,
    @Optional() @Inject(LOGGED_IN_USER_EMAIL) private loggedInUserEmail$: Observable<string>,
  ) {
    this.loggedInUserEmail$?.pipe(untilDestroyed(this)).subscribe((loggedInUserEmail) => {
      this.loggedInUserEmail = loggedInUserEmail;
    });
    this.needToKnow$ = combineLatest([this.agentId$, this.allowedVisibilityLevels$]).pipe(
      filter(([agentId]) => !!agentId),
      switchMap(([agentId, allowedVisibilityLevels]) => {
        const qp: QueryParam[] = [];
        if (Array.isArray(allowedVisibilityLevels) && allowedVisibilityLevels?.length) {
          const visibilityLevelsQueryParam = new QueryParam(
            NeedToKnowKeys.visibilityLevel,
            WhereFilterOperandKeys.in,
            allowedVisibilityLevels,
          );
          qp.push(visibilityLevelsQueryParam);
        }

        return this.agentNeedToKnowService.getList(agentId, qp);
      }),
      map((needToKnows) => {
        return new DataSource({
          store: new ArrayStore({
            key: 'dbId',
            data: Array.isArray(needToKnows) ? needToKnows : [],
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
    e.cancel = this.agentNeedToKnowService.delete(this.agentId$.value, e.data[BaseModelKeys.dbId]);
  };

  public showAddNeedToKnowPopup = () => {
    this.needToKnowModalComponent.showModal(
      this.agentId$.value,
      this.editModalOptions?.initialNeedToKnow as NeedToKnow,
    );
  };

  public showEditPopup = ({ row: { data } }) => {
    this.needToKnowModalComponent.showModal(this.agentId$.value, data);
  };

  public getIsEditingAllowed = ({ row: { data } }) => {
    return !!this.loggedInUserEmail && this.loggedInUserEmail === data[BaseModelKeys.createdBy];
  };
}
