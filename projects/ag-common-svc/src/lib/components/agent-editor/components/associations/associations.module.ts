import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { ModalWindowModule } from '../../../modal-window/modal-window.module';
import { AssociationsComponent } from './associations.component';

@NgModule({
  imports: [CommonModule, SharedModule, ModalWindowModule],
  declarations: [AssociationsComponent],
  exports: [AssociationsComponent]
})
export class AssociationsModule {}
