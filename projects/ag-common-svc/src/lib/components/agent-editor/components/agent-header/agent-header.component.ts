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

  //
  imageSource = '';
  isDropZoneActive = false;
  textVisible = true;
  progressVisible = false;
  progressValue = 0;
  agencies: Agency[] = [];
  filteredAgencies: Agency[] = [];
  filteredMGAs: Agency[];
  filteredManagers: Agent[] = [];
  primaryEmailAddress: EmailAddress;
  primaryShippingAddress: Address;
  primaryBillingAddress: Address;
  primaryPhoneNumber: PhoneNumber;

  onDropZoneEnter = (e) => {
    if (e.dropZoneElement.id === 'dropzone-external') {
      this.isDropZoneActive = true;
    }
  };

  onDropZoneLeave = (e) => {
    if (e.dropZoneElement.id === 'dropzone-external') {
      this.isDropZoneActive = false;
    }
  };

  onUploaded = (e) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      this.isDropZoneActive = false;
      this.imageSource = fileReader.result as string;
    };
    fileReader.readAsDataURL(e);

    fileReader.onloadend = () => {
      let file_name: string = '';
      if (this.agentHeaderFormDetails.p_agent_first_name) {
        file_name = this.agentHeaderFormDetails.p_agent_first_name + '_';
      }

      if (this.agentHeaderFormDetails.p_agent_middle_name) {
        file_name += this.agentHeaderFormDetails.p_agent_middle_name + '_';
      }

      if (this.agentHeaderFormDetails.p_agent_last_name) {
        file_name += this.agentHeaderFormDetails.p_agent_last_name;
      }

      if (file_name == '') {
        file_name = this.uuidv4();
      }

      this.fireStorageDao.uploadFile(e, '/head_shot/' + file_name).then((file) => {
        this.fireStorageDao.getFileURL(file.ref).then((url) => {
          this.imageSource = url;
          this.agentHeaderFormDetails.p_headshot_link = url;
          this.textVisible = false;
          this.progressVisible = false;
          this.progressValue = 0;
        });
      });
    };
  };

  onProgress = (e) => {
    this.progressValue = (e.bytesLoaded / e.bytesTotal) * 100;
  };

  onUploadStarted = (e) => {
    this.imageSource = '';
    this.progressVisible = true;
  };

  uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };
}
