import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Agent, AgentKeys } from 'ag-common-lib/public-api';
import { AgentService } from '../../../../services/agent.service';
import { ModalWindowComponent } from '../../../modal-window/modal-window.component';

@Component({
  selector: 'ag-shr-sizes',
  templateUrl: './sizes.component.html',
  styleUrls: ['./sizes.component.scss']
})
export class SizesComponent {
  @Input('agent') agent: Agent;
  @ViewChild('sizeModalRef', { static: true }) sizeModalComponent: ModalWindowComponent;

  public inProgress = false;

  constructor(private agentService: AgentService) {}

  public saveAgentUpdates = () => {
    this.agentService.updateFields(this.agent?.dbId, {
      [AgentKeys.p_tshirt_size]: this.agent[AgentKeys.p_tshirt_size],
      [AgentKeys.unisex_tshirt_size]: this.agent[AgentKeys.unisex_tshirt_size],
      [AgentKeys.shoe_size]: this.agent[AgentKeys.shoe_size],
      [AgentKeys.hobbies]: this.agent[AgentKeys.hobbies],
      [AgentKeys.favorite_destination]: this.agent[AgentKeys.favorite_destination]
    });
  };

  public showEditorModal = () => {
    this.inProgress = false;
    this.sizeModalComponent.showModal();
  };

  public handleClosePopup = () => {
    this.inProgress = false;
  };
}
