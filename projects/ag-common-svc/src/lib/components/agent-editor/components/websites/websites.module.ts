import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { WebsitesComponent } from './websites.component';
import { ModalWindowModule } from '../../../modal-window/modal-window.module';


@NgModule({
  declarations: [WebsitesComponent],
  imports: [
    SharedModule,
    ModalWindowModule
  ],
  exports: [WebsitesComponent]
})
export class WebsitesModule { }
