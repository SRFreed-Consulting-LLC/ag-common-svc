import { DxPopupComponent } from 'devextreme-angular';
import { HidingEvent } from 'devextreme/ui/popup';

export interface OnPopupClosePayload {
  event: HidingEvent;
  component: DxPopupComponent;
}
