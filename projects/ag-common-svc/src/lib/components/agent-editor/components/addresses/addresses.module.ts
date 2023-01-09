import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { ButtonWithIndicatorModule } from '../../../button-with-indicator/button-with-indicator.module';
import { ModalWindowModule } from '../../../modal-window/modal-window.module';
import { StateSelectBoxModule } from '../../../state-select-box/state-select-box.module';
import { AddressesComponent } from './addresses.component';

@NgModule({
  imports: [CommonModule, SharedModule, ModalWindowModule, ButtonWithIndicatorModule, StateSelectBoxModule],
  declarations: [AddressesComponent],
  exports: [AddressesComponent]
})
export class AddressesModule {}
