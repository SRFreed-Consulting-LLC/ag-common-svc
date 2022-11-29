import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DxTabPanelModule } from 'devextreme-angular';
import { DxiToolbarItemModule, DxoToolbarModule } from 'devextreme-angular/ui/nested';
import { SharedModule } from '../../../shared/shared.module';
import { ApproveDenyReasonsModule } from '../agent-editor';
import { ModalWindowModule } from '../modal-window/modal-window.module';
import { AgentDispositionModalControlsPipe } from './agent-disposition-modal-controls.pipe';
import { AgentDispositionModalComponent } from './agent-disposition-modal.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ModalWindowModule,
    DxiToolbarItemModule,
    DxTabPanelModule,
    ApproveDenyReasonsModule
  ],
  declarations: [AgentDispositionModalComponent, AgentDispositionModalControlsPipe],
  exports: [AgentDispositionModalComponent]
})
export class AgentDispositionModalModule {}
