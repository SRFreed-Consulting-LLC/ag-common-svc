import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DxTextAreaComponent } from 'devextreme-angular';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { BehaviorSubject, Observable } from 'rxjs';
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
    this._isImageValid$.next(!!data);
    this.imagePreviewUrl = data;
  }
  @Output() profilePictureUrlChange = new EventEmitter<string | null>();

  public imagePreviewUrl: string;
  public imageChangedEvent: any = '';
  public imageCroppedEvent: ImageCroppedEvent;

  public isImageValid$: Observable<boolean>;
  private _isImageValid$ = new BehaviorSubject(true);

  constructor() {
    this.isImageValid$ = this._isImageValid$.asObservable();
  }

  public customValidationCallback = () => {
    return false;
  };

  public onImgError = () => {
    this._isImageValid$.next(false);
    this.urlTextBoxComponent.instance.option('isValid', false);
  };

  public onImgLoaded = () => {
    this._isImageValid$.next(true);
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
