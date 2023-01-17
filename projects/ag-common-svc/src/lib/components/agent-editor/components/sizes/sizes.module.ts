import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { ButtonWithIndicatorModule } from '../../../button-with-indicator/button-with-indicator.module';
import { ModalWindowModule } from '../../../modal-window/modal-window.module';
import { TShortSizeSelectBoxModule } from '../../../t-short-size-select-box/t-short-size-select-box.module';
import { SizesComponent } from './sizes.component';

@NgModule({
  imports: [SharedModule, ModalWindowModule, ButtonWithIndicatorModule, TShortSizeSelectBoxModule],
  declarations: [SizesComponent],
  exports: [SizesComponent]
})
export class SizesModule {}
