import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { ButtonWithIndicatorModule } from '../button-with-indicator/button-with-indicator.module';
import { TShortSizeSelectBoxComponent } from './t-short-size-select-box.component';

@NgModule({
  imports: [SharedModule, ButtonWithIndicatorModule],
  declarations: [TShortSizeSelectBoxComponent],
  exports: [TShortSizeSelectBoxComponent]
})
export class TShortSizeSelectBoxModule {}
