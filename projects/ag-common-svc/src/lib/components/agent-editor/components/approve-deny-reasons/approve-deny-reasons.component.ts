import { Component, HostBinding, Input, ViewChild } from '@angular/core';
import {
  Agent,
  ApproveDenyReason,
  ApproveDenyReasonKeys,
  ApproveDenyReasonVisibilityLevel,
  APPROVE_DENY_REASON_VISIBILITY_LEVEL_LOOKUP,
  BaseModelKeys
} from 'ag-common-lib/public-api';
import { DxFormComponent } from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { AgentApproveDenyReasonsService } from '../../../../services/agent-approve-deny-reason.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { ModalWindowComponent } from '../../../modal-window/modal-window.component';
import { ApproveDenyReasonFormService } from './approve-deny-reasons-form.service';

@Component({
  selector: 'ag-shr-approve-deny-reasons',
  templateUrl: './approve-deny-reasons.component.html',
  styleUrls: ['./approve-deny-reasons.component.scss'],
  providers: [ApproveDenyReasonFormService]
})
export class ApproveDenyReasonsComponent {
  @HostBinding('class') className = 'approve-deny-reasons';
  @Input() set agent(agent: Agent) {
    this.agentId$.next(agent[BaseModelKeys.dbId]);
  }
  @ViewChild('approveDenyReasonModalRef', { static: true }) approveDenyReasonModalComponent: ModalWindowComponent;
  @ViewChild('approveDenyReasonFormRef', { static: false }) approveDenyReasonFormComponent: DxFormComponent;
  @ViewChild('editApproveDenyReasonModalRef', { static: true })
  editApproveDenyReasonModalComponent: ModalWindowComponent;

  public inProgress$: Observable<boolean>;
  public BaseModelKeys = BaseModelKeys;
  public ApproveDenyReasonKeys = ApproveDenyReasonKeys;
  public approveDenyReasonVisibilityLevelLookup = APPROVE_DENY_REASON_VISIBILITY_LEVEL_LOOKUP;
  public approveDenyReasonFormData: ApproveDenyReason;
  public approveDenyReasons$: Observable<DataSource>;

  private readonly agentId$ = new BehaviorSubject<string>(undefined);

  constructor(
    private approveDenyReasonFormService: ApproveDenyReasonFormService,
    private agentApproveDenyReasonsService: AgentApproveDenyReasonsService
  ) {
    this.inProgress$ = this.approveDenyReasonFormService.inProgress$;
    this.approveDenyReasons$ = this.agentId$.pipe(
      filter(Boolean),
      switchMap((agentId: string) => this.agentApproveDenyReasonsService.getList(agentId)),
      map((approveDenyReasons) => {
        console.log('approveDenyReasons', approveDenyReasons);

        return new DataSource({
          store: new ArrayStore({
            key: 'dbId',
            data: Array.isArray(approveDenyReasons) ? approveDenyReasons : []
          })
        });
      }),
      shareReplay(1)
    );
  }

  public showListPopup = () => {
    this.approveDenyReasonModalComponent.showModal();
  };

  public showAddApproveDenyReasonPopup = () => {
    this.approveDenyReasonFormData = this.approveDenyReasonFormService.getFormData();
    this.editApproveDenyReasonModalComponent.showModal();
  };

  public showEditPopup = ({ row: { data } }) => {
    this.approveDenyReasonFormData = this.approveDenyReasonFormService.getFormData(data);
    this.editApproveDenyReasonModalComponent.showModal();
  };

  public onRowRemoving = (e) => {
    e.cancel = this.agentApproveDenyReasonsService.delete(this.agentId$.value, e.data[BaseModelKeys.dbId]);
  };

  public handleSaveApproveDenyReason = (e) => {
    const validationResults = this.approveDenyReasonFormComponent.instance.validate();
    if (validationResults.isValid) {
      this.approveDenyReasonFormService.saveApproveDenyReason(this.agentId$.value).then(() => {
        e.component.instance.hide();
      });
    }
  };

  public handleApproveDenyReasonFormPopupClose = this.approveDenyReasonFormService.onCancelEditApproveDenyReason;
}
