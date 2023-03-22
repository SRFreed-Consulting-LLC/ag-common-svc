import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { ModalWindowModule } from '../../../modal-window/modal-window.module';
import { NeedToKnowGridComponent } from './need-to-know-grid/need-to-know-grid.component';
import { NeedToKnowModalComponent } from './need-to-know-modal/need-to-know-modal.component';
import { NeedToKnowPermissionsPipe } from './need-to-know-permissions.pipe';
import { NeedToKnowComponent } from './need-to-know.component';

@NgModule({
  imports: [CommonModule, SharedModule, ModalWindowModule],
  declarations: [
    NeedToKnowComponent,
    NeedToKnowGridComponent,
    NeedToKnowModalComponent,
    NeedToKnowPermissionsPipe
  ],
  exports: [NeedToKnowComponent, NeedToKnowGridComponent, NeedToKnowModalComponent]
})
export class NeedToKnowModule {}
