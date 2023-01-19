import { NgModule } from '@angular/core';
import { DxValidatorModule } from 'devextreme-angular';
import { SharedModule } from '../../../../../shared/shared.module';
import { DietaryConsiderationTypeSelectBoxModule } from '../../../dietary-consideration-type-select-box/dietary-consideration-type-select-box.module';
import { ModalWindowModule } from '../../../modal-window/modal-window.module';
import { DietaryConsiderationsComponent } from './dietary-considerations.component';

@NgModule({
  imports: [SharedModule, ModalWindowModule, DietaryConsiderationTypeSelectBoxModule, DxValidatorModule],
  declarations: [DietaryConsiderationsComponent],
  exports: [DietaryConsiderationsComponent]
})
export class DietaryConsiderationsModule {}
