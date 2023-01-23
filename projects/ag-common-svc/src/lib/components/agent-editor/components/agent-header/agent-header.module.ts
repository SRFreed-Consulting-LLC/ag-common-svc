import { NgModule } from '@angular/core';
import { DxValidatorModule } from 'devextreme-angular';
import { SharedModule } from '../../../../../shared/shared.module';
import { ModalWindowModule } from '../../../modal-window/modal-window.module';
import { PrefixSelectBoxModule } from '../../../prefix-select-box/prefix-select-box.module';
import { SuffixSelectBoxModule } from '../../../suffix-select-box/suffix-select-box.module';
import { AgentHeadersComponent } from './agent-header.component';

@NgModule({
  imports: [SharedModule, ModalWindowModule, DxValidatorModule, SuffixSelectBoxModule, PrefixSelectBoxModule],
  declarations: [AgentHeadersComponent],
  exports: [AgentHeadersComponent]
})
export class AgentHeadersModule {}
