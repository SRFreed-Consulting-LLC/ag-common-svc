import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { ModalWindowModule } from '../../../modal-window/modal-window.module';
import { ApproveDenyReasonsGridComponent } from './approve-deny-reasons-grid/approve-deny-reasons-grid.component';
import { ApproveDenyReasonsModalComponent } from './approve-deny-reasons-modal/approve-deny-reasons-modal.component';
import { ApproveDenyReasonsPermissionsPipe } from './approve-deny-reasons-permissions.pipe';
import { ApproveDenyReasonsComponent } from './approve-deny-reasons.component';

@NgModule({
  imports: [CommonModule, SharedModule, ModalWindowModule],
  declarations: [
    ApproveDenyReasonsComponent,
    ApproveDenyReasonsGridComponent,
    ApproveDenyReasonsModalComponent,
    ApproveDenyReasonsPermissionsPipe
  ],
  exports: [ApproveDenyReasonsComponent, ApproveDenyReasonsGridComponent, ApproveDenyReasonsModalComponent]
})
export class ApproveDenyReasonsModule {}
