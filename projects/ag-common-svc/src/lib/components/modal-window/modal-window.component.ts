import { Component, EventEmitter, HostBinding, Input, Output, ViewChild } from '@angular/core';
import { DxPopupComponent } from 'devextreme-angular';
import dxPopup, { ShowingEvent, HiddenEvent, HidingEvent, InitializedEvent, Properties } from 'devextreme/ui/popup';
import { OnPopupClosePayload } from './modal-window.models';

@Component({
  selector: 'ag-shr-modal-window',
  templateUrl: './modal-window.component.html',
  styleUrls: ['./modal-window.component.scss']
})
export class ModalWindowComponent {
  @HostBinding('class') className = 'modal-window';
  @ViewChild('popupRef', { static: true }) popupComponent: DxPopupComponent;
  @Input() inProgress: boolean;
  @Input() isFullScreen: boolean = false;
  @Input() title: string;
  @Input() actionTitle: string = 'SAVE';
  @Input() useScrollView = true;
  @Input() showSaveButton = true;
  @Input() showCancelButton = true;
  @Input() showCloseButton = true;
  @Input() closeOnEscapeButton = true;
  @Input() saveButtonDisabled = false;
  @Input() width: string | number = '80vw';
  @Input() height: string | number = '80vh';
  @Input() extraToolbarItems = [];
  @Input() onCloseModal: () => Promise<boolean>;

  @Output() onSaveClick = new EventEmitter<{ component: DxPopupComponent }>();
  /**
   * @deprecated Use onCloseModal instead
   */
  @Output() onPopupClose = new EventEmitter<OnPopupClosePayload>();
  @Output() onShowing = new EventEmitter<ShowingEvent>();
  @Output() onHidden = new EventEmitter<HiddenEvent>();

  constructor() {}

  onInitialized = (e: InitializedEvent) => {
    if (this.onCloseModal) {
      e.component.instance().on('hiding', this.onClosePopup);
    }

    if (!this.closeOnEscapeButton) {
      e.component.registerKeyHandler('escape', function (event) {
        event.stopPropagation();
      });
    }
  };

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

  public handleClosePopup = (event?: HidingEvent) => {
    this.onPopupClose.emit({ event, component: this.popupComponent });
  };

  public toggleScreenSize = () => {
    this.isFullScreen = !this.isFullScreen;
    setTimeout(() => {
      this.popupComponent.instance.repaint();
    }, 0);
  };

  private forceCloseModal = async (component: dxPopup<Properties>) => {
    component.off('hiding', this.onClosePopup);
    await component.hide();
    component.on('hiding', this.onClosePopup);
  };

  private onClosePopup = async (event: HidingEvent) => {
    event.cancel = true;

    const isCloseConfirmed = await this.onCloseModal();

    if (isCloseConfirmed) {
      await this.forceCloseModal(event.component);
    }
  };
}
