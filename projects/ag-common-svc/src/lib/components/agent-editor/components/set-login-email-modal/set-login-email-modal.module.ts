import { NgModule } from '@angular/core';
import { DxCheckBoxModule } from 'devextreme-angular';
import { SharedModule } from '../../../../../shared/shared.module';
import { ButtonWithIndicatorModule } from '../../../button-with-indicator/button-with-indicator.module';
import { ModalWindowModule } from '../../../modal-window/modal-window.module';
import { SetLoginEmailModalComponent } from './set-login-email-modal.component';
import { SetLoginEmailModalService } from './set-login-email-modal.service';

@NgModule({
  imports: [SharedModule, ModalWindowModule, ButtonWithIndicatorModule, DxCheckBoxModule],
  declarations: [SetLoginEmailModalComponent],
  exports: [SetLoginEmailModalComponent],
})
export class SetLoginEmailModalModule {}
