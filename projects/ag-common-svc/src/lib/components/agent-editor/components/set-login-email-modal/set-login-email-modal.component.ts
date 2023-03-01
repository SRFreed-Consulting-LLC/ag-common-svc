import { Component, ViewChild } from '@angular/core';
import { ActiveLookup } from 'ag-common-lib/public-api';
import { DxFormComponent } from 'devextreme-angular';
import { Observable } from 'rxjs';
import { ModalWindowComponent } from '../../../modal-window/modal-window.component';
import { SetLoginEmailModalService } from './set-login-email-modal.service';

@Component({
  selector: 'ag-shr-set-login-email-modal',
  templateUrl: './set-login-email-modal.component.html',
  styleUrls: ['./set-login-email-modal.component.scss'],
  providers: [SetLoginEmailModalService],
})
export class SetLoginEmailModalComponent {
  @ViewChild('setPrimaryEmailModalRef', { static: true }) setPrimaryEmailModalComponent: ModalWindowComponent;
  @ViewChild('setPrimaryEmailFormRef', { static: false }) setPrimaryEmailFormComponent: DxFormComponent;

  public formData;
  public isEmailValid = false;
  public emailAddressesLookup$: Observable<ActiveLookup[]>;
  public isValidating = false;
  public inProgress$: Observable<boolean>;
  public isSendOTPInProgress$: Observable<boolean>;

  constructor(private setLoginEmailModalService: SetLoginEmailModalService) {
    this.isSendOTPInProgress$ = this.setLoginEmailModalService.isSendOTPInProgress$;
  }

  public showModal = async (agentId: string) => {
    this.setLoginEmailModalService.init(agentId);
    this.formData = this.setLoginEmailModalService.formData;
    this.emailAddressesLookup$ = this.setLoginEmailModalService.emailAddressesLookup$;
    this.setPrimaryEmailModalComponent?.showModal();
  };

  public emailAddressAsyncValidation = (item) => {
    this.isEmailValid = false;

    return this.setLoginEmailModalService
      .emailAddressAsyncValidation(item?.value as ActiveLookup)
      .then((isEmailValid) => {
        this.isEmailValid = isEmailValid;
        return isEmailValid;
      });
  };

  public otpAsyncValidation = (item) => this.setLoginEmailModalService.otpAsyncValidation(item?.value);

  public sendOtp = this.setLoginEmailModalService.sendOtp;

  public handleSetEmailLogin = async (e) => {
    this.isValidating = true;
    const validationResults = this.setPrimaryEmailFormComponent.instance.validate();

    if (validationResults?.complete) {
      await validationResults?.complete;
    }

    this.isValidating = false;
    if (validationResults.isValid) {
      debugger;
      // this.approveDenyReasonModalService.saveApproveDenyReason(this.agentId).then(() => {
      //   e.component.instance.hide();
      // });
    }
  };
}
