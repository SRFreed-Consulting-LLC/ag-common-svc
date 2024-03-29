import { NgModule } from '@angular/core';
import { DxCheckBoxModule } from 'devextreme-angular';
import { SharedModule } from '../../../../../shared/shared.module';
import { ButtonWithIndicatorModule } from '../../../button-with-indicator/button-with-indicator.module';
import { ModalWindowModule } from '../../../modal-window/modal-window.module';
import { EmailAddressesComponent } from './email-addresses.component';
import { IsLoginEmailPipe } from './is-login-email.pipe';

@NgModule({
  imports: [SharedModule, ModalWindowModule, ButtonWithIndicatorModule, DxCheckBoxModule],
  declarations: [EmailAddressesComponent, IsLoginEmailPipe],
  exports: [EmailAddressesComponent]
})
export class EmailAddressesModule {}
