import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { ButtonWithIndicatorModule } from '../button-with-indicator/button-with-indicator.module';
import { GenderSelectBoxComponent } from './gender-select-box.component';

@NgModule({
  imports: [SharedModule, ButtonWithIndicatorModule],
  declarations: [GenderSelectBoxComponent],
  exports: [GenderSelectBoxComponent]
})
export class GenderSelectBoxModule {}
