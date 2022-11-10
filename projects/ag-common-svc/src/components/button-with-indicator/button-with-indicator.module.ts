import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxButtonModule, DxLoadIndicatorModule, DxScrollViewModule } from 'devextreme-angular';
import { ButtonWithIndicatorComponent } from './button-with-indicator.component';

@NgModule({
  imports: [CommonModule, DxButtonModule, DxLoadIndicatorModule, DxScrollViewModule],
  declarations: [ButtonWithIndicatorComponent],
  exports: [ButtonWithIndicatorComponent],
  providers: []
})
export class ButtonWithIndicatorModule {}
