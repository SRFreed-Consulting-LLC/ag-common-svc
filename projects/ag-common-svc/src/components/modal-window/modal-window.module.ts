import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ButtonWithIndicatorModule } from '../button-with-indicator/button-with-indicator.module';
import { ModalWindowComponent } from './modal-window.component';

@NgModule({
  imports: [SharedModule, ButtonWithIndicatorModule],
  declarations: [ModalWindowComponent],
  exports: [ModalWindowComponent]
})
export class ModalWindowModule {}
