import { NgModule } from '@angular/core';
import { DxCheckBoxModule } from 'devextreme-angular';
import { SharedModule } from '../../../../../shared/shared.module';
import { ButtonWithIndicatorModule } from '../../../button-with-indicator/button-with-indicator.module';
import { ModalWindowModule } from '../../../modal-window/modal-window.module';
import { SetLoginEmailModalActionTitlePipe } from './set-login-email-modal-action-title.pipe';
import { SetLoginEmailModalComponent } from './set-login-email-modal.component';

@NgModule({
  imports: [SharedModule, ModalWindowModule, ButtonWithIndicatorModule, DxCheckBoxModule],
  declarations: [SetLoginEmailModalComponent, SetLoginEmailModalActionTitlePipe],
  exports: [SetLoginEmailModalComponent],
})
export class SetLoginEmailModalModule {}
