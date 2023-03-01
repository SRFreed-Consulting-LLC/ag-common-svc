import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { ButtonWithIndicatorModule } from '../button-with-indicator/button-with-indicator.module';
import { RelationshipTypeSelectBoxComponent } from './relationship-type-select-box.component';

@NgModule({
  imports: [SharedModule, ButtonWithIndicatorModule],
  declarations: [RelationshipTypeSelectBoxComponent],
  exports: [RelationshipTypeSelectBoxComponent]
})
export class RelationshipTypeSelectBoxModule {}
