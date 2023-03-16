import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { ModalWindowModule } from '../modal-window/modal-window.module';
import { DeleteAgentModalComponent } from './delete-agent-modal.component';

@NgModule({
  imports: [CommonModule, SharedModule, ModalWindowModule],
  declarations: [DeleteAgentModalComponent],
  exports: [DeleteAgentModalComponent],
})
export class DeleteAgentModalModule {}
