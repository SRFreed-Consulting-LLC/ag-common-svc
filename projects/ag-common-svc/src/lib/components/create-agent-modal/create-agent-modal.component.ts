import { Component, EventEmitter, HostBinding, Output, ViewChild } from '@angular/core';
import { Agent, EmailAddress, RelatedEmailAddress } from 'ag-common-lib/public-api';
import { DxFormComponent } from 'devextreme-angular';
import { Observable } from 'rxjs';
import { ModalWindowComponent } from '../modal-window/modal-window.component';
import { CreateAgentModalFormData } from './create-agent-modal.model';
import { CreateAgentModalService } from './create-agent-modal.service';

@Component({
  selector: 'ag-shr-create-agent-modal',
  templateUrl: './create-agent-modal.component.html',
  styleUrls: ['./create-agent-modal.component.scss'],
  providers: [CreateAgentModalService],
})
export class CreateAgentModalComponent {
  @HostBinding('class') className = 'create-agent-modal';
  @ViewChild('createAgentModalRef', { static: true }) createAgentModalComponent: ModalWindowComponent;
  @ViewChild('newAgentFormRef', { static: false }) newAgentFormComponent: DxFormComponent;

  @Output() onAgentCreated = new EventEmitter();
  @Output() handleShowExistingAgent: EventEmitter<string> = new EventEmitter();

  public inProgress$: Observable<boolean>;
  public formData: CreateAgentModalFormData;
  public emailsExistOnOtherRecord$: Observable<RelatedEmailAddress[]>;

  constructor(private createAgentModalService: CreateAgentModalService) {
    this.formData = Object.assign({}, new CreateAgentModalFormData());
    this.inProgress$ = this.createAgentModalService.inProgress$;
    this.emailsExistOnOtherRecord$ = this.createAgentModalService.emailsExistOnOtherRecord$;
  }

  public fieldDataChanged = (e) => {
    this.newAgentFormComponent.instance.validate();
  };

  public emailAddressAsyncValidation = (item) => {
    if (!item?.value) {
      return Promise.resolve(true);
    }
    return this.createAgentModalService.emailAddressAsyncValidation(item?.value);
  };

  public atLeastOneRequired = (e) => {
    return Object.values(this.formData).some(Boolean);
  };

  public showPopup = async () => {
    // this.formData = Object.assign({}, new CreateAgentModalFormData());
    this.newAgentFormComponent.instance.resetValues();
    this.createAgentModalComponent.showModal();
  };

  public handleSaveNewAgent = (e) => {
    const validationResults = this.newAgentFormComponent.instance.validate();

    if (!validationResults?.isValid) {
      return;
    }

    this.createAgentModalService.save(this.formData).then(() => {
      this.createAgentModalComponent?.hideModal();
    });
  };
}
