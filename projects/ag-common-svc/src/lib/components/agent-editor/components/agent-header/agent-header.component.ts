import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Address, Agency, Agent, BaseModelKeys, EmailAddress, Lookup, PhoneNumber } from 'ag-common-lib/public-api';
import { DxFormComponent } from 'devextreme-angular';
import { FireStorageDao } from '../../../../dao/FireStorage.dao';
import { BehaviorSubject, Observable } from 'rxjs';
import { ModalWindowComponent } from '../../../modal-window/modal-window.component';
import { AgentHeaderService } from './agent-header.service';
import { DropZoneComponent } from '../../../drop-zone/drop-zone.component';

@Component({
  selector: 'ag-shr-agent-header',
  templateUrl: './agent-header.component.html',
  styleUrls: ['./agent-header.component.scss'],
  providers: [AgentHeaderService]
})
export class AgentHeadersComponent {
  @Input('agent') set _agent(value: Agent) {
    this.agent = value;
    this.agentHeaderFormDetails = this.agentHeaderService.getFormData(value);
  }
  @Output() onFieldsUpdated = new EventEmitter<{ agentId: string; updates: Partial<Agent> }>();
  @ViewChild('agentHeaderModalRef', { static: true }) agentHeaderModalComponent: ModalWindowComponent;
  @ViewChild('agentProfilePictureModalRef', { static: true }) agentProfilePictureModalComponent: ModalWindowComponent;
  @ViewChild('profilePictureDropZoneRef', { static: true }) profilePictureDropZoneComponent: DropZoneComponent;
  @ViewChild('agentHeaderFormRef', { static: false }) agentHeaderFormComponent: DxFormComponent;

  public agentHeaderFormDetails;
  public inProgress$: Observable<boolean>;
  public validationGroup = 'agentHeaderValidationGroup';
  public selectedAgentHeaderType$: BehaviorSubject<Lookup>;

  private agent: Agent;

  constructor(private agentHeaderService: AgentHeaderService, private fireStorageDao: FireStorageDao) {
    this.inProgress$ = agentHeaderService.inProgress$;
  }

  public saveAgentProfileImagesUpdates = () => {
    if (this.profilePictureDropZoneComponent.isImageValid) {
      this.agentHeaderService.handleSave(this.agent[BaseModelKeys.dbId]).then((data) => {
        this.onFieldsUpdated.emit(data);
        this.agentProfilePictureModalComponent.hideModal();
      });
    }
  };

  public saveAgentHeaderInfoUpdates = () => {
    const validationResults = this.agentHeaderFormComponent.instance.validate();

    if (validationResults.isValid) {
      this.agentHeaderService.handleSave(this.agent[BaseModelKeys.dbId]).then((data) => {
        this.onFieldsUpdated.emit(data);
        this.agentHeaderModalComponent.hideModal();
      });
    }
  };

  public showEditorModal = () => {
    this.agentHeaderModalComponent.showModal();
  };

  public showProfilePictureEditorModal = () => {
    this.agentProfilePictureModalComponent.showModal();
  };

  public handleClosePopup = (e) => {
    this.agentHeaderService.onCancelEdit(e);
  };
}
