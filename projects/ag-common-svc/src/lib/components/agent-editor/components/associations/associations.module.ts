import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { ModalWindowModule } from '../../../modal-window/modal-window.module';
import { RelationshipTypeSelectBoxModule } from '../../../relationship-type-select-box/relationship-type-select-box.module';
import { StateSelectBoxModule } from '../../../state-select-box/state-select-box.module';
import { AssociationsComponent } from './associations.component';

@NgModule({
  imports: [CommonModule, SharedModule, ModalWindowModule, StateSelectBoxModule, RelationshipTypeSelectBoxModule],
  declarations: [AssociationsComponent],
  exports: [AssociationsComponent]
})
export class AssociationsModule {}
