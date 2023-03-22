import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { ButtonWithIndicatorModule } from '../../../button-with-indicator/button-with-indicator.module';
import { ModalWindowModule } from '../../../modal-window/modal-window.module';
import { PortalComponent } from './portal.component';
import { ReviewLevelPipe } from './review-level.pipe';

@NgModule({
  imports: [SharedModule, ModalWindowModule, ButtonWithIndicatorModule],
  declarations: [PortalComponent, ReviewLevelPipe],
  exports: [PortalComponent]
})
export class PortalModule {}
