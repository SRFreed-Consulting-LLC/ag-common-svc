import { Component, ElementRef, EventEmitter, HostBinding, Input, Output, ViewChild } from '@angular/core';
import { DxTextAreaComponent, DxValidatorComponent } from 'devextreme-angular';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { ModalWindowComponent } from '../modal-window/modal-window.component';

@Component({
  selector: 'ag-shr-drop-zone',
  templateUrl: './drop-zone.component.html',
  styleUrls: ['./drop-zone.component.scss']
})
export class DropZoneComponent {
  @ViewChild('urlTextBoxRef', { static: true }) urlTextBoxComponent: DxTextAreaComponent;
  @ViewChild('imageCropModalRef', { static: true }) imageCropModalModalComponent: ModalWindowComponent;
  @ViewChild('fileInput', { static: false }) fileInputComponent: ElementRef<HTMLInputElement>;
  @Input() set profilePictureUrl(data: string) {
    this.imagePreviewUrl = data;
  }
  @Output() profilePictureUrlChange = new EventEmitter<ImageCroppedEvent | null>();

  public isImageValid = true;
  public imagePreviewUrl: string;
  public imageChangedEvent: any = '';
  public imageCroppedEvent: ImageCroppedEvent;

  constructor() {}

  public customValidationCallback = () => {
    return false;
  };

  public onImgError = () => {
    this.isImageValid = false;
    this.urlTextBoxComponent.instance.option('isValid', false);
  };

  public onImgLoaded = () => {
    this.isImageValid = true;
    this.urlTextBoxComponent.instance.option('isValid', true);
  };

  public onUrlValueChanged = (e) => {
    this.profilePictureUrlChange.emit(e?.value ?? null);
    this.urlTextBoxComponent.instance.option('isValid', true);
  };

  public fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    this.imageCroppedEvent = null;
    this.imageCropModalModalComponent.showModal();
  }

  public imageCropped(event: ImageCroppedEvent) {
    this.imageCroppedEvent = event;
  }

  public handleApplyCrop = () => {
    this.imagePreviewUrl = this.imageCroppedEvent.base64;
    this.imageCropModalModalComponent.hideModal();
  };

  public handleCancelCrop = () => {
    this.fileInputComponent.nativeElement.value = null;
    this.imageChangedEvent = null;
    this.imageCroppedEvent = null;
  };
}
