import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { DxButtonModule, DxFileUploaderModule, DxProgressBarModule, DxTextBoxModule } from 'devextreme-angular';
import dxTextBox from 'devextreme/ui/text_box';
import { ImageCropperModule } from 'ngx-image-cropper';
import { ModalWindowModule } from '../modal-window/modal-window.module';
import { DropZoneComponent } from './drop-zone.component';

@NgModule({
  imports: [
    CommonModule,
    DxFileUploaderModule,
    DxProgressBarModule,
    ImageCropperModule,
    ModalWindowModule,
    DxButtonModule,
    DxTextBoxModule,
    HttpClientModule
  ],
  declarations: [DropZoneComponent],
  exports: [DropZoneComponent]
})
export class DropZoneModule {}
