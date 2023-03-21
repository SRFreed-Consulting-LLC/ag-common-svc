import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { ModalWindowModule } from '../modal-window/modal-window.module';
import { CreateAgentModalComponent } from './create-agent-modal.component';

@NgModule({
  imports: [CommonModule, SharedModule, ModalWindowModule],
  declarations: [CreateAgentModalComponent],
  exports: [CreateAgentModalComponent],
})
export class CreateAgentModalModule {}
