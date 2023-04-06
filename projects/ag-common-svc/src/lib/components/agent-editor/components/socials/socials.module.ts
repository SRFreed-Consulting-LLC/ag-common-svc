import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { ButtonWithIndicatorModule } from '../../../button-with-indicator/button-with-indicator.module';
import { ModalWindowModule } from '../../../modal-window/modal-window.module';
import { SocialsComponent } from './socials.component';

@NgModule({
  imports: [SharedModule, ModalWindowModule, ButtonWithIndicatorModule],
  declarations: [SocialsComponent],
  exports: [SocialsComponent]
})
export class SocialsModule {}
