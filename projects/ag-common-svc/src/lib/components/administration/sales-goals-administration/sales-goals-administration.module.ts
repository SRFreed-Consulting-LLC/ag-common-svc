import { NgModule } from '@angular/core';
import { SalesGoalsAdministrationComponent } from './sales-goals-administration.component';
import { SharedModule } from '../../../../shared/shared.module';
import { ModalWindowModule } from '../../modal-window/modal-window.module';
import { IsManagerSelectedPipe } from './is-manager-selected.pipe';


@NgModule({
  declarations: [
    SalesGoalsAdministrationComponent,
    IsManagerSelectedPipe
  ],
  imports: [
    SharedModule,
    ModalWindowModule,
  ],
  exports: [
    SalesGoalsAdministrationComponent,
  ],
})
export class SalesGoalsAdministrationModule { }
