import { Component, EventEmitter, HostBinding, Inject, Input, Optional, Output, ViewChild } from '@angular/core';
import {
  Agent,
  AgentKeys,
  AGENT_STATUS,
  ApproveDenyReason,
  ApproveDenyReasonKeys,
  ApproveDenyReasonVisibilityLevel,
  BaseModelKeys
} from 'ag-common-lib/public-api';
import { DxFormComponent } from 'devextreme-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { ModalWindowComponent } from '../modal-window/modal-window.component';
import { AgentDispositionModalService, ChangeAgentStatusConfig } from './agent-disposition-modal.service';
import { AgentService } from '../../services/agent.service';
import { AgentApproveDenyReasonsService } from '../../services/agent-approve-deny-reason.service';
import { ToastrService } from 'ngx-toastr';
import { LOGGED_IN_USER_EMAIL } from '../agent-editor/agent-editor.model';

@Component({
  selector: 'ag-shr-agent-disposition-modal',
  templateUrl: './agent-disposition-modal.component.html',
  styleUrls: ['./agent-disposition-modal.component.scss'],
  providers: [AgentDispositionModalService]
})
export class AgentDispositionModalComponent {
  @HostBinding('class') className = 'agent-disposition-modal';
  @ViewChild('agentDispositionModalRef', { static: true }) agentDispositionModalComponent: ModalWindowComponent;
  @ViewChild('agentDispositionFormRef', { static: false }) agentDispositionFormComponent: DxFormComponent;
  @ViewChild('updateAgentStatusModalRef', { static: true }) updateAgentStatusModalComponent: ModalWindowComponent;
  @ViewChild('updateAgentStatusFormRef', { static: false }) updateAgentStatusFormComponent: DxFormComponent;

  @Input() showFullInfo = true;
  @Input() isManagerVisible = false;
  @Input() isAgencyVisible = false;
  @Input() approveDenyReasonVisibilityLevel: ApproveDenyReasonVisibilityLevel;
  @Output() onAgentUpdated = new EventEmitter();

  public agentDispositionFormData: Partial<Agent>;
  public inProgress$: Observable<boolean>;
  public AGENT_STATUS = AGENT_STATUS;
  public isUpdateStatusInProgress = false;
  public changeAgentStatusConfig: ChangeAgentStatusConfig;

  private readonly agentId$ = new BehaviorSubject<string>(undefined);

  constructor(
    private toster: ToastrService,
    private agentService: AgentService,
    private agentDispositionModalService: AgentDispositionModalService,
    private agentApproveDenyReasonsService: AgentApproveDenyReasonsService,
    @Optional() @Inject(LOGGED_IN_USER_EMAIL) private loggedInUserEmail$: Observable<string>
  ) {}

  public showPopup = async (agent: Agent) => {
    this.agentDispositionFormData = this.agentDispositionModalService.getFormData(agent);
    this.agentDispositionModalComponent.showModal();
  };

  public handleSave = (e) => {};

  public handleFormPopupClose = this.agentDispositionModalService.onCancelEdit;

  public handleChangeAgentStatus = async (e) => {
    const validationResults = this.updateAgentStatusFormComponent.instance.validate();

    if (validationResults.isValid) {
      const loggedInUserEmail = await this.loggedInUserEmail$.pipe(take(1)).toPromise();
      const formData = this.updateAgentStatusFormComponent.formData;
      const approveDenyReason = Object.assign(
        {
          [BaseModelKeys.createdDate]: new Date(),
          [BaseModelKeys.createdBy]: loggedInUserEmail,
          [ApproveDenyReasonKeys.activity]: formData?.reason ?? null,
          [ApproveDenyReasonKeys.visibilityLevel]: this.changeAgentStatusConfig.approveDenyReasonVisibilityLevel
        },
        new ApproveDenyReason()
      );
      const agentId = this.agentDispositionFormData[BaseModelKeys.dbId];
      const agentStatus = this.changeAgentStatusConfig.agentStatus;

      this.isUpdateStatusInProgress = true;

      Promise.all([
        this.agentService.updateFields(agentId, {
          [AgentKeys.agent_status]: agentStatus
        }),
        formData?.reason && this.agentApproveDenyReasonsService.create(agentId, approveDenyReason, true)
      ])
        .then(() => {
          this.toster.success('Agent Status Successfully set to ' + agentStatus);
          this.updateAgentStatusFormComponent.instance.resetValues();

          e.component.instance.hide();

          this.agentDispositionModalComponent.hideModal();
          this.onAgentUpdated.emit();
        })
        .finally(() => {
          this.isUpdateStatusInProgress = false;
        });
    }
  };

  public handleChangeAgentStatusClick = (changeAgentStatusConfig: ChangeAgentStatusConfig) => {
    this.changeAgentStatusConfig = changeAgentStatusConfig;
    this.updateAgentStatusModalComponent?.showModal();
  };
}
