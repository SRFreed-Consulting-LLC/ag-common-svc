import { Component, Input, ViewChild } from '@angular/core';
import {
  Agent,
  AgentKeys,
  AGENT_REVIEW_LEVEL_LOOKUP,
  AGENT_STATUS,
  AGENT_TYPE,
  ListManager,
  Lookup,
  PROSPECT_STATUS
} from 'ag-common-lib/public-api';
import { DxFormComponent } from 'devextreme-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { PortalDataService } from '../../../../../lib/services/portal.service';
import { ModalWindowComponent } from '../../../modal-window/modal-window.component';

import { PortalService } from './portal.service';

@Component({
  selector: 'ag-shr-portal',
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.scss'],
  providers: [PortalService]
})
export class PortalComponent {
  @Input('agent') set _agent(data) {
    this.agent = this.portalService.getFormData(data);
  }
  @ViewChild('portalEditorModalRef', { static: true }) portalEditorModalComponent: ModalWindowComponent;
  @ViewChild('portalEditorFormRef', { static: false }) portalEditorFormComponent: DxFormComponent;

  public AgentKeys = AgentKeys;
  public agent: Partial<Agent>;
  public prospectStatuses: PROSPECT_STATUS[] = [];
  public agentStatuses: AGENT_STATUS[] = [];
  public agentTypes: AGENT_TYPE[] = [];
  public agentReviewLevelLookup: Partial<Lookup>[] = AGENT_REVIEW_LEVEL_LOOKUP;
  public roles: any[] = [];
  public inProgress = false;
  public inProgress$: Observable<boolean>;
  public isReviewLevelVisible$: BehaviorSubject<boolean>;

  constructor(
    listManager: ListManager,
    private portalDataService: PortalDataService,
    private portalService: PortalService
  ) {
    this.inProgress$ = this.portalService.inProgress$;
    this.prospectStatuses = listManager.getProspectStatuses();
    this.agentStatuses = listManager.getAgentStatuses();
    this.agentTypes = listManager.getAgentTypes();
    this.roles = listManager.getRoles();
    this.isReviewLevelVisible$ = this.portalService.isReviewLevelVisible$;
  }

  public showPortalEditorModal = () => {
    this.inProgress = false;
    this.portalEditorModalComponent.showModal();
  };

  public generateAgentId = () => {
    this.inProgress = true;
    this.portalDataService
      .getNextAgentId()
      .then((id) => {
        this.agent.p_agent_id = String(id);
      })
      .catch((error) => {
        console.error('Error in Agent Admin.', error);
      })
      .finally(() => {
        this.inProgress = false;
      });
  };

  public handelSaveClick = () => {
    this.portalService?.save(this.portalEditorModalComponent);
  };

  public handleClosePopup = (e) => {
    this.portalService.onCancel(e);
  };
}
