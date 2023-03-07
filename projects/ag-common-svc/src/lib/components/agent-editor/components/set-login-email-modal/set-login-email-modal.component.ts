import { Component, ViewChild } from '@angular/core';
import { ActiveLookup } from 'ag-common-lib/public-api';
import { DxFormComponent } from 'devextreme-angular';
import { AuthService } from '../../../../services/auth.service';
import { Observable } from 'rxjs';
import { ModalWindowComponent } from '../../../modal-window/modal-window.component';
import { SetLoginEmailModalService } from './set-login-email-modal.service';
import { SetLoginEmailForm, SetLoginEmailModalSteps } from './set-login-email-modal.model';
import { OtpService } from '../../../../services/otp.service';

@Component({
  selector: 'ag-shr-set-login-email-modal',
  templateUrl: './set-login-email-modal.component.html',
  styleUrls: ['./set-login-email-modal.component.scss'],
  providers: [OtpService, SetLoginEmailModalService],
})
export class SetLoginEmailModalComponent {
  @ViewChild('setPrimaryEmailModalRef', { static: true }) setPrimaryEmailModalComponent: ModalWindowComponent;
  @ViewChild('setPrimaryEmailFormRef', { static: false }) setPrimaryEmailFormComponent: DxFormComponent;

  public formData: SetLoginEmailForm;
  public hasSameEmailOnOtherAgent = false;
  public SetLoginEmailModalSteps = SetLoginEmailModalSteps;
  public emailAddressesLookup$: Observable<ActiveLookup[]>;
  public inProgress$: Observable<boolean>;
  public isSendOTPInProgress$: Observable<boolean>;
  public isOTPSended$: Observable<boolean>;
  public isEmailValid$: Observable<boolean>;
  public isEmailExistOnOtherRecord$: Observable<boolean>;
  public isResendAvailable$: Observable<boolean>;
  public resendTimeout$: Observable<number>;
  public selectedStep$: Observable<SetLoginEmailModalSteps>;

  constructor(private setLoginEmailModalService: SetLoginEmailModalService, private otpService: OtpService) {
    this.inProgress$ = this.setLoginEmailModalService.inProgress$;

    this.isEmailValid$ = this.setLoginEmailModalService.isEmailValid$;
    this.isEmailExistOnOtherRecord$ = this.setLoginEmailModalService.isEmailExistOnOtherRecord$;
    this.selectedStep$ = this.setLoginEmailModalService.selectedStep$;
    this.isResendAvailable$ = this.otpService.isResendAvailable$;
    this.resendTimeout$ = this.otpService.resendTimeout$;
    this.isSendOTPInProgress$ = this.otpService.isSendOTPInProgress$;
    this.isOTPSended$ = this.otpService.isOTPSended$;
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

  public sendOtp = () => this.otpService.sendOtp(this.formData?.emailAddress?.description);

  public otpAsyncValidation = (item) => this.setLoginEmailModalService.otpAsyncValidation(item?.value);

  public handleNextStepClick = async (e) => {
    this.setLoginEmailModalService.handleNextStepClick(this.setPrimaryEmailFormComponent, e.component);
  };

  public backToEmailList = this.setLoginEmailModalService.backToEmailList;
}
