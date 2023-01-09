import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { ButtonWithIndicatorModule } from '../button-with-indicator/button-with-indicator.module';
import { StateSelectBoxComponent } from './state-select-box.component';

@NgModule({
  imports: [SharedModule, ButtonWithIndicatorModule],
  declarations: [StateSelectBoxComponent],
  exports: [StateSelectBoxComponent]
})
export class StateSelectBoxModule {}
