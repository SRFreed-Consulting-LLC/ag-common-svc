import { Component, ViewChild } from '@angular/core';
import { ActiveLookup } from 'ag-common-lib/public-api';
import { DxFormComponent } from 'devextreme-angular';
import { AuthService } from '../../../../services/auth.service';
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
  public hasSameEmailOnOtherAgent = false;
  public emailAddressesLookup$: Observable<ActiveLookup[]>;
  public isValidating = false;
  public inProgress$: Observable<boolean>;
  public isSendOTPInProgress$: Observable<boolean>;
  public isOTPSended$: Observable<boolean>;
  public isEmailValid$: Observable<boolean>;
  public isEmailExistOnOtherRecord$: Observable<boolean>;

  constructor(private setLoginEmailModalService: SetLoginEmailModalService, private authService: AuthService) {
    this.isSendOTPInProgress$ = this.setLoginEmailModalService.isSendOTPInProgress$;
    this.isOTPSended$ = this.setLoginEmailModalService.isOTPSended$;
    this.isEmailValid$ = this.setLoginEmailModalService.isEmailValid$;
    this.isEmailExistOnOtherRecord$ = this.setLoginEmailModalService.isEmailExistOnOtherRecord$;
  }

  public showModal = async (agentId: string, agentUID: string) => {
    this.setLoginEmailModalService.init(agentId, agentUID);
    this.formData = this.setLoginEmailModalService.formData;
    this.emailAddressesLookup$ = this.setLoginEmailModalService.emailAddressesLookup$;
    this.setPrimaryEmailModalComponent?.showModal();
  };

  public emailAddressAsyncValidation = (item) => {
    return this.setLoginEmailModalService.emailAddressAsyncValidation(item?.value as ActiveLookup);
  };

  public otpAsyncValidation = (item) => this.setLoginEmailModalService.otpAsyncValidation(item?.value);

  public sendOtp = this.setLoginEmailModalService.sendOtp;

  public handleSetEmailLogin = async (e) => {
    this.isValidating = true;
    debugger;
    const validationResults = this.setPrimaryEmailFormComponent.instance.validate();
    if (validationResults?.complete) {
      debugger;
      await validationResults?.complete;
    }

    this.isValidating = false;
    if (validationResults.isValid) {
      debugger;

      await this.setLoginEmailModalService.setLoginEmail();
      e.component.instance.hide();
      await this.authService.logOut();
    }
  };
}
