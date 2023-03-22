import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { ButtonWithIndicatorModule } from '../button-with-indicator/button-with-indicator.module';
import { SuffixSelectBoxComponent } from './suffix-select-box.component';

@NgModule({
  imports: [SharedModule, ButtonWithIndicatorModule],
  declarations: [SuffixSelectBoxComponent],
  exports: [SuffixSelectBoxComponent]
})
export class SuffixSelectBoxModule {}
