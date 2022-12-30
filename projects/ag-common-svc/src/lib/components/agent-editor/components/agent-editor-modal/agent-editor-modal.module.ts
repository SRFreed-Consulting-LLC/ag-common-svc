import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { ModalWindowModule } from '../../../modal-window/modal-window.module';
import { AgentEditorModalComponent } from './agent-editor-modal.component';

@NgModule({
  imports: [CommonModule, SharedModule, ModalWindowModule],
  declarations: [AgentEditorModalComponent],
  exports: [AgentEditorModalComponent]
})
export class AgentEditorModalModule {}
