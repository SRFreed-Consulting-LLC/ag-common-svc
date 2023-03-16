import { Component, EventEmitter, HostBinding, Output, ViewChild } from '@angular/core';
import { Agent } from 'ag-common-lib/public-api';
import { Observable } from 'rxjs';
import { ModalWindowComponent } from '../modal-window/modal-window.component';
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

  @Output() agentDeleted = new EventEmitter();

  public inProgress$: Observable<boolean>;
  public deleteAuthLoginVisible: boolean = true;
  public deleteAuthLogin: boolean = true;
  public deleteAgentRecord: boolean = true;

  private agent: Agent;

  constructor(private deleteAgentModalService: DeleteAgentModalService) {
    this.inProgress$ = this.deleteAgentModalService.inProgress$;
  }

  public showPopup = async (agent: Agent) => {
    this.agent = agent;
    this.deleteAuthLogin = !!agent?.uid;
    this.deleteAgentRecord = true;
    this.deleteAgentModalComponent.showModal();
  };

  public handleSave = (e) => {
    this.deleteAgentModalService.save(this.agent, this.deleteAuthLogin, this.deleteAgentRecord).then(() => {
      this.agentDeleted.emit(this.agent);
      this.deleteAgentModalComponent.hideModal();
    });
  };
}
