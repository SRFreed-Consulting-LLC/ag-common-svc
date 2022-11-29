import { EventEmitter, ViewChild } from '@angular/core';
import { HostBinding, Input, Output } from '@angular/core';
import { Component } from '@angular/core';
import { DxPopupComponent } from 'devextreme-angular';

@Component({
  selector: 'ag-shr-modal-window',
  templateUrl: './modal-window.component.html',
  styleUrls: ['./modal-window.component.scss']
})
export class ModalWindowComponent {
  @HostBinding('class') className = 'modal-window';
  @ViewChild('popupRef', { static: true }) popupComponent: DxPopupComponent;
  @Input() inProgress: boolean;
  @Input() title: string;
  @Input() actionTitle: string = 'SAVE';
  @Input() showSaveButton = true;
  @Input() width: string | number = '80vw';
  @Input() height: string | number = '80vh';
  @Input() extraToolbarItems = [];
  @Output() onSaveClick = new EventEmitter<{ component: DxPopupComponent }>();
  @Output() onPopupClose = new EventEmitter<any>();

  public isFullScreen = false;

  constructor() {}

  public showModal = () => {
    this.isFullScreen = false;
    this.popupComponent.instance.show();
  };

  public hideModal = () => {
    this.popupComponent.instance.hide();
  };

  public handelSaveClick = () => {
    this.onSaveClick.emit({ component: this.popupComponent });
  };

  public handleClosePopup = (event?: any) => {
    this.onPopupClose.emit({ event, component: this.popupComponent });
  };

  public toggleScreenSize = () => {
    this.isFullScreen = !this.isFullScreen;
    setTimeout(() => {
      this.popupComponent.instance.repaint();
    }, 0);
  };
}
