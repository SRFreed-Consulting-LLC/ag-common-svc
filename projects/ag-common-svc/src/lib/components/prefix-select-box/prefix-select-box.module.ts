import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { ButtonWithIndicatorModule } from '../button-with-indicator/button-with-indicator.module';
import { PrefixSelectBoxComponent } from './prefix-select-box.component';

@NgModule({
  imports: [SharedModule, ButtonWithIndicatorModule],
  declarations: [PrefixSelectBoxComponent],
  exports: [PrefixSelectBoxComponent]
})
export class PrefixSelectBoxModule {}
