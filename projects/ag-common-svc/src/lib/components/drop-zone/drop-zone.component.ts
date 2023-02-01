// import { HttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, HostBinding, Input, Output, ViewChild } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { ModalWindowComponent } from '../modal-window/modal-window.component';

@Component({
  selector: 'ag-shr-drop-zone',
  templateUrl: './drop-zone.component.html',
  styleUrls: ['./drop-zone.component.scss']
})
export class DropZoneComponent {
  @ViewChild('imageCropModalRef', { static: true }) imageCropModalModalComponent: ModalWindowComponent;
  @ViewChild('fileInput', { static: false }) fileInputComponent: ElementRef<HTMLInputElement>;
  @Input() set profilePictureUrl(data: string) {
    this.imagePreviewUrl = data;
    this.remoteImageUrl = data;
  }
  @Output() profilePictureChange = new EventEmitter<ImageCroppedEvent | null>();

  public remoteImageUrl: string;
  public imagePreviewUrl: string;
  public imageChangedEvent: any = '';
  public imageURL: string;
  public imageCroppedEvent: ImageCroppedEvent;

  constructor(private http: HttpClient) {}

  public handleUploadFromRemote = async () => {
    // this.imageURL = this.remoteImageUrl;
    // this.imageCropModalModalComponent.showModal();

    let imageURL = 'https://cs8.pikabu.ru/post_img/2017/11/19/4/1511067536137770808.jpg';
    let imageDescription = 'The Mozilla logo';

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Creating new Image object with the name img
    var img = new Image();

    // Setting cross origin value to anonymous
    img.crossOrigin = 'anonymous';

    // The Image URL is been set to the
    // src property of the image
    img.src = imageURL;

    // This function waits until the image being loaded.
    img.onload = function () {
      // Matches the canvas width to that of the image
      canvas.width = img.width;

      // Matches the canvas height to that of the image
      canvas.height = img.height;

      // Displays the image to the canvas tag of id Canvas
      canvas.getContext('2d').drawImage(img, 0, 0);
    };
  };

  public fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    this.imageCropModalModalComponent.showModal();
  }

  public imageCropped(event: ImageCroppedEvent) {
    this.imageCroppedEvent = event;

    // fetch(event?.base64)
    //   .then((res) => res.blob())
    //   .then((blob) => {
    //     this.file = new File([blob], 'logo.png', { type: blob.type });
    //   });
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
