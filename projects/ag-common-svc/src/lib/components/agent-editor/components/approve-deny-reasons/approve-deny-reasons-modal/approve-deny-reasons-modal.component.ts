import { Component, HostBinding, Input, ViewChild } from '@angular/core';
import {
  Agent,
  ApproveDenyReason,
  ApproveDenyReasonKeys,
  APPROVE_DENY_REASON_VISIBILITY_LEVEL_LOOKUP,
  BaseModelKeys,
  Lookup,
  LookupKeys
} from 'ag-common-lib/public-api';
import { DxFormComponent } from 'devextreme-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApproveDenyReasonModalService } from './approve-deny-reasons-modal.service';
import { AgentService } from '../../../../../services/agent.service';
import { ModalWindowComponent } from '../../../../modal-window/modal-window.component';

@Component({
  selector: 'ag-shr-approve-deny-reasons-modal',
  templateUrl: './approve-deny-reasons-modal.component.html',
  styleUrls: ['./approve-deny-reasons-modal.component.scss'],
  providers: [ApproveDenyReasonModalService]
})
export class ApproveDenyReasonsModalComponent {
  @HostBinding('class') className = 'approve-deny-reasons-modal';
  @ViewChild('approveDenyReasonModalRef', { static: true }) approveDenyReasonModalComponent: ModalWindowComponent;
  @ViewChild('approveDenyReasonFormRef', { static: false }) approveDenyReasonFormComponent: DxFormComponent;
  @Input() title: string;
  @Input() isVisibilityTypeLocked = false;

  public inProgress$: Observable<boolean>;
  public agentsDataSource$: Observable<any>;
  public BaseModelKeys = BaseModelKeys;
  public ApproveDenyReasonKeys = ApproveDenyReasonKeys;
  public approveDenyReasonVisibilityLevelLookup = APPROVE_DENY_REASON_VISIBILITY_LEVEL_LOOKUP;
  public approveDenyReasonFormData: ApproveDenyReason;

  private agentId: string;

  constructor(
    private agentService: AgentService,
    private approveDenyReasonModalService: ApproveDenyReasonModalService
  ) {
    this.inProgress$ = this.approveDenyReasonModalService.inProgress$;

    this.agentsDataSource$ = this.agentService.getList().pipe(
      map((response): Partial<Lookup>[] =>
        Array.isArray(response)
          ? response.map((agent: Agent) => {
              const description = [agent?.p_agent_first_name, agent?.p_agent_last_name].filter(Boolean).join(' ');
              const value = agent?.p_email;

              return {
                key: agent?.dbId,
                [LookupKeys.value]: value,
                [LookupKeys.description]: description
              };
            })
          : []
      )
    );
  }

  public showModal = async (agentId: string, data?: ApproveDenyReason) => {
    this.agentId = agentId;
    this.approveDenyReasonFormData = await this.approveDenyReasonModalService.getFormData(data);
    this.approveDenyReasonModalComponent?.showModal();
  };

  public handleSaveApproveDenyReason = (e) => {
    const validationResults = this.approveDenyReasonFormComponent.instance.validate();
    if (validationResults.isValid) {
      this.approveDenyReasonModalService.saveApproveDenyReason(this.agentId).then(() => {
        e.component.instance.hide();
      });
    }
  };

  public handleApproveDenyReasonFormPopupClose = this.approveDenyReasonModalService.onCancelEditApproveDenyReason;
}
