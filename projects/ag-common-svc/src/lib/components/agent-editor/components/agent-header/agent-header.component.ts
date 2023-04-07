import { Component, EventEmitter, HostBinding, Input, Output, ViewChild } from '@angular/core';
import { Agent, AgentKeys, BaseModelKeys, Lookup } from 'ag-common-lib/public-api';
import { DxFormComponent } from 'devextreme-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { AgentHeaderService } from './agent-header.service';
import { AgentHeaderKeys } from './agent-header.model';
import { map, take } from 'rxjs/operators';
import { DropZoneComponent } from 'ag-common-svc/lib/components/drop-zone/drop-zone.component';
import { ModalWindowComponent } from 'ag-common-svc/lib/components/modal-window/modal-window.component';
import { FullAddressPipe } from 'ag-common-svc/shared/pipes/full-address.pipe';
import { PhoneNumberMaskPipe } from 'ag-common-svc/shared/pipes/phone-number-mask.pipe';

@Component({
  selector: 'ag-shr-agent-header',
  templateUrl: './agent-header.component.html',
  styleUrls: ['./agent-header.component.scss'],
  providers: [AgentHeaderService, FullAddressPipe, PhoneNumberMaskPipe],
})
export class AgentHeadersComponent {
  @HostBinding('class') className = 'agent-header';
  @Input('agentId') set _agentId(value: string) {
    this.agentId = value;
    this.agent$ = this.agentHeaderService
      .getAgentById(value)
      .pipe(map((agent) => (this.agentHeaderFormDetails = this.agentHeaderService.getFormData(agent))));
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
  public agent$: Observable<Agent>;

  private agentId: string;

  constructor(
    private agentHeaderService: AgentHeaderService,
    public phoneNumberMaskPipe: PhoneNumberMaskPipe,
    public fullAddressPipe: FullAddressPipe,
  ) {
    this.inProgress$ = agentHeaderService.inProgress$;
    this.selectedPrefix$ = agentHeaderService.selectedPrefix$;
    this.selectedSuffix$ = agentHeaderService.selectedSuffix$;
  }

  public saveAgentProfileImagesUpdates = async () => {
    const isImageValid = await this.profilePictureDropZoneComponent.isImageValid$.pipe(take(1)).toPromise();
    if (isImageValid) {
      this.agentHeaderService.handleSave(this.agentId).then((data) => {
        this.onFieldsUpdated.emit(data);
        this.agentProfilePictureModalComponent.hideModal();
      });
    }
  };

  public saveAgentHeaderInfoUpdates = () => {
    const validationResults = this.agentHeaderFormComponent.instance.validate();

    if (validationResults.isValid) {
      this.agentHeaderService.handleSave(this.agentId).then((data) => {
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
    this.selectedPrefix$.next(item);
  };

  public handleSuffixSelect = (item) => {
    this.selectedSuffix$.next(item);
  };

  public phoneNumberDisplayExpr = (item) => {
    return this.phoneNumberMaskPipe.transform(item, true);
  };
}
