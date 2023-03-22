import { NgModule } from '@angular/core';
import { DxValidatorModule } from 'devextreme-angular';
import { SharedModule } from '../../../shared/shared.module';
import { ButtonWithIndicatorModule } from '../button-with-indicator/button-with-indicator.module';
import { DietaryConsiderationTypeSelectBoxComponent } from './dietary-consideration-type-select-box.component';

@NgModule({
  imports: [SharedModule, ButtonWithIndicatorModule, DxValidatorModule],
  declarations: [DietaryConsiderationTypeSelectBoxComponent],
  exports: [DietaryConsiderationTypeSelectBoxComponent]
})
export class DietaryConsiderationTypeSelectBoxModule {}
