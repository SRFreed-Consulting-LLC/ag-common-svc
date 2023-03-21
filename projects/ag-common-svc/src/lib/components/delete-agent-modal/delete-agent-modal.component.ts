import { Component, EventEmitter, HostBinding, Output, ViewChild } from '@angular/core';
import { Agent } from 'ag-common-lib/public-api';
import { Observable } from 'rxjs';
import { ModalWindowComponent } from '../modal-window/modal-window.component';
import { DeleteAgentModalFormData } from './delete-agent-modal.model';
import { DeleteAgentModalService } from './delete-agent-modal.service';

@Component({
  selector: 'ag-shr-delete-agent-modal',
  templateUrl: './delete-agent-modal.component.html',
  styleUrls: ['./delete-agent-modal.component.scss'],
  providers: [DeleteAgentModalService],
})
export class DeleteAgentModalComponent {
  @HostBinding('class') className = 'delete-agent-modal';
  @ViewChild('deleteAgentModalRef', { static: true }) deleteAgentModalComponent: ModalWindowComponent;

  @Output() onAgentDeleted = new EventEmitter();

  public inProgress$: Observable<boolean>;
  public formData: DeleteAgentModalFormData;

  private agent: Agent;

  constructor(private deleteAgentModalService: DeleteAgentModalService) {
    this.inProgress$ = this.deleteAgentModalService.inProgress$;
  }

  public showPopup = async (agent: Agent) => {
    this.agent = agent;
    this.formData = {
      deleteAuthLogin: !!agent?.uid,
      deleteAgentRecord: true,
    };

    this.deleteAgentModalComponent.showModal();
  };

  public handleSave = (e) => {
    const hasFieldsToDelete = Object.values(this.formData).some(Boolean);
    if (!hasFieldsToDelete) {
      return;
    }
    this.deleteAgentModalService.save(this.agent, this.formData).then(() => {
      if (this.formData?.deleteAgentRecord) {
        this.onAgentDeleted.emit(this.agent);
      }
      this.deleteAgentModalComponent.hideModal();
    });
  };
}
