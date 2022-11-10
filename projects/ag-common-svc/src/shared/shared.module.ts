import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  DxAccordionModule,
  DxButtonModule,
  DxDataGridModule,
  DxDateBoxModule,
  DxFileUploaderModule,
  DxFormModule,
  DxHtmlEditorModule,
  DxListModule,
  DxLoadIndicatorModule,
  DxPopupModule,
  DxProgressBarModule,
  DxScrollViewModule,
  DxSelectBoxModule,
  DxSwitchModule,
  DxTabsModule,
  DxTagBoxModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxToolbarModule,
  DxTreeListModule
} from 'devextreme-angular';
import { PipesModule } from './pipes/pipes.module';

@NgModule({
  declarations: [],
  exports: [
    PipesModule,
    CommonModule,
    RouterModule,
    DxButtonModule,
    DxLoadIndicatorModule,
    DxFormModule,
    DxDateBoxModule,
    DxPopupModule,
    DxScrollViewModule,
    DxTabsModule,
    DxAccordionModule,
    DxDataGridModule,
    DxToolbarModule,
    DxTreeListModule,
    DxTagBoxModule,
    DxHtmlEditorModule,
    DxSelectBoxModule,
    DxSwitchModule,
    DxTextBoxModule,
    DxProgressBarModule,
    DxFileUploaderModule,
    DxTextAreaModule,
    DxFormModule,
    DxListModule
  ]
})
export class SharedModule {}
