import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { DietaryConsiderationTypeSelectBoxModule } from '../../../dietary-consideration-type-select-box/dietary-consideration-type-select-box.module';
import { ModalWindowModule } from '../../../modal-window/modal-window.module';
import { StateSelectBoxModule } from '../../../state-select-box/state-select-box.module';
import { TShortSizeSelectBoxModule } from '../../../t-short-size-select-box/t-short-size-select-box.module';
import { AssociationsComponent } from './associations.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ModalWindowModule,
    StateSelectBoxModule,
    TShortSizeSelectBoxModule,
    DietaryConsiderationTypeSelectBoxModule
  ],
  declarations: [AssociationsComponent],
  exports: [AssociationsComponent]
})
export class AssociationsModule {}
