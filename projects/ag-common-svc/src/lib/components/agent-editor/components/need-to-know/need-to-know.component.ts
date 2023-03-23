import { Component, HostBinding, Input, ViewChild } from '@angular/core';
import {
  Agent,
  BaseModelKeys,
  Lookup,
  LookupKeys,
  NeedToKnow,
  NeedToKnowKeys,
  NEED_TO_KNOW_VISIBILITY_LEVEL_LOOKUP,
} from 'ag-common-lib/public-api';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { ModalWindowComponent } from '../../../modal-window/modal-window.component';
import { AgentService } from '../../../../services/agent.service';
import { QueryParam, WhereFilterOperandKeys } from '../../../../dao/CommonFireStoreDao.dao';
import { AgentNeedToKnowService } from '../../../../services/agent-need-to-know.service';
import { NeedToKnowVisibilityLevel } from 'ag-common-lib/lib/lists/need-to-know-visibility-level.enum';

@Component({
  selector: 'ag-shr-need-to-know',
  templateUrl: './need-to-know.component.html',
  styleUrls: ['./need-to-know.component.scss'],
})
export class NeedToKnowComponent {
  @HostBinding('class') className = 'need-to-know';
  @Input() set agent(agent: Agent) {
    this.agentId$.next(agent[BaseModelKeys.dbId]);
  }
  @Input() readOnly = false;
  @Input() set allowedVisibilityLevels(data: NeedToKnowVisibilityLevel[]) {
    if (Array.isArray(data)) {
      this.allowedVisibilityLevels$.next(data);
    }
  }
  @ViewChild('needToKnowModalRef', { static: true }) needToKnowModalComponent: ModalWindowComponent;

  public inProgress$: Observable<boolean>;
  public agentsDataSource$: Observable<any>;
  public BaseModelKeys = BaseModelKeys;
  public NeedToKnowKeys = NeedToKnowKeys;
  public needToKnowVisibilityLevelLookup = NEED_TO_KNOW_VISIBILITY_LEVEL_LOOKUP;
  public needToKnowFormData: NeedToKnow;
  public needToKnow$: Observable<DataSource>;
  public readonly agentId$ = new BehaviorSubject<string>(undefined);

  private allowedVisibilityLevels$ = new BehaviorSubject<NeedToKnowVisibilityLevel[]>([]);

  constructor(
    private agentService: AgentService,
    private agentNeedToKnowService: AgentNeedToKnowService,
  ) {
    this.needToKnow$ = combineLatest([this.agentId$, this.allowedVisibilityLevels$]).pipe(
      filter(Boolean),
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

  public showListPopup = () => {
    this.needToKnowModalComponent.showModal();
  };

  public onRowRemoving = (e) => {
    e.cancel = this.agentNeedToKnowService.delete(this.agentId$.value, e.data[BaseModelKeys.dbId]);
  };
}
