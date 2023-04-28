import { CommonModule, NgOptimizedImage } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  DxButtonModule,
  DxFileUploaderModule,
  DxProgressBarModule,
  DxTextBoxModule,
  DxValidatorModule
} from 'devextreme-angular';
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
    DxValidatorModule,
    NgOptimizedImage
  ],
  declarations: [DropZoneComponent],
  exports: [DropZoneComponent]
})
export class DropZoneModule {}
