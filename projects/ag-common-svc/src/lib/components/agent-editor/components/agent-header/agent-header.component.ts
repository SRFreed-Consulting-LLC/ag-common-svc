import { Component, EventEmitter, HostBinding, Input, Output, ViewChild } from '@angular/core';
import { Agent, AgentKeys, BaseModelKeys, Lookup } from 'ag-common-lib/public-api';
import { DxFormComponent } from 'devextreme-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { ModalWindowComponent } from '../../../modal-window/modal-window.component';
import { AgentHeaderService } from './agent-header.service';
import { DropZoneComponent } from '../../../drop-zone/drop-zone.component';
import { PhoneNumberMaskPipe } from '../../../../../shared/pipes/phone-number-mask.pipe';
import { FullAddressPipe } from '../../../../../shared/pipes/full-address.pipe';
import { AgentHeaderKeys } from './agent-header.model';

@Component({
  selector: 'ag-shr-agent-header',
  templateUrl: './agent-header.component.html',
  styleUrls: ['./agent-header.component.scss'],
  providers: [AgentHeaderService, FullAddressPipe, PhoneNumberMaskPipe],
})
export class AgentHeadersComponent {
  @HostBinding('class') className = 'agent-header';
  @Input('agent') set _agent(value: Agent) {
    this.agent = value;
    this.agentHeaderFormDetails = this.agentHeaderService.getFormData(value);
  }
  @Output() onFieldsUpdated = new EventEmitter<{ agentId: string; updates: Partial<Agent> }>();
  @ViewChild('agentHeaderModalRef', { static: true }) agentHeaderModalComponent: ModalWindowComponent;
  @ViewChild('agentProfilePictureModalRef', { static: true }) agentProfilePictureModalComponent: ModalWindowComponent;
  @ViewChild('profilePictureDropZoneRef', { static: true }) profilePictureDropZoneComponent: DropZoneComponent;
  @ViewChild('agentHeaderFormRef', { static: false }) agentHeaderFormComponent: DxFormComponent;

  public AgentKeys = AgentKeys;
  public AgentHeaderKeys = AgentHeaderKeys;
  public agentHeaderFormDetails;
  public inProgress$: Observable<boolean>;
  public validationGroup = 'agentHeaderValidationGroup';
  public selectedAgentHeaderType$: BehaviorSubject<Lookup>;
  public selectedPrefix$: BehaviorSubject<Lookup>;
  public selectedSuffix$: BehaviorSubject<Lookup>;

  private agent: Agent;

  constructor(
    private agentHeaderService: AgentHeaderService,
    public phoneNumberMaskPipe: PhoneNumberMaskPipe,
    public fullAddressPipe: FullAddressPipe,
  ) {
    this.inProgress$ = agentHeaderService.inProgress$;
    this.selectedPrefix$ = agentHeaderService.selectedPrefix$;
    this.selectedSuffix$ = agentHeaderService.selectedSuffix$;
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

  public handlePrefixSelect = (item) => {
    debugger;
    this.selectedPrefix$.next(item);
  };

  public handleSuffixSelect = (item) => {
    debugger;
    this.selectedSuffix$.next(item);
  };
}
