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
  @Input() showSaveButton = true;
  @Output() onSaveClick = new EventEmitter<{ component: DxPopupComponent }>();
  @Output() onPopupClose = new EventEmitter<any>();

  constructor() {}

  public showModal = () => {
    this.popupComponent.instance.show();
  };

  public handelSaveClick = () => {
    this.onSaveClick.emit({ component: this.popupComponent });
  };

  public handleClosePopup = (event?: any) => {
    this.onPopupClose.emit({ event, component: this.popupComponent });
  };
}
