import { Component, Input, ViewChild } from '@angular/core';
import { ModalWindowComponent } from '../../../modal-window/modal-window.component';

@Component({
  selector: 'ag-shr-agent-editor-modal',
  templateUrl: './agent-editor-modal.component.html',
  styleUrls: ['./agent-editor-modal.component.scss']
})
export class AgentEditorModalComponent {
  @Input() title: string = 'Agent Details';
  @ViewChild('agentEditorModalRef', { static: true }) private agentEditorModalComponent: ModalWindowComponent;

  constructor() {}

  public showModal = () => {
    this.agentEditorModalComponent.showModal();
  };

  public showProspectInfo = () => {};
}
