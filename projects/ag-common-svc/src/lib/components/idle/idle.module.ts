import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { IdleComponent } from './idle.component';

@NgModule({
  imports: [CommonModule, SharedModule],
  declarations: [IdleComponent],
  exports: [IdleComponent],
})
export class IdleModule {}
