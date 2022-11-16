import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { ModalWindowModule } from '../../../modal-window/modal-window.module';
import { ApproveDenyReasonsComponent } from './approve-deny-reasons.component';

@NgModule({
  imports: [CommonModule, SharedModule, ModalWindowModule],
  declarations: [ApproveDenyReasonsComponent],
  exports: [ApproveDenyReasonsComponent]
})
export class ApproveDenyReasonsModule {}
