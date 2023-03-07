import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormChangesDetector } from '../../../../../shared/utils';
import { confirm } from 'devextreme/ui/dialog';
import { AgentEmailAddressesService } from '../../../../services/agent-email-addresses.service';
import { ActiveLookup } from 'ag-common-lib/public-api';
import { CloudFunctionsService } from '../../../../services/cloud-functions.service';
import { OtpService } from '../../../../services/otp.service';
import { SetLoginEmailForm, SetLoginEmailModalSteps } from './set-login-email-modal.model';
import { DxFormComponent, DxPopupComponent } from 'devextreme-angular';
import Validator from 'devextreme/ui/validator';
import { differenceInSeconds } from 'date-fns';
import { AuthService } from '../../../../services/auth.service';

@Injectable()
export class SetLoginEmailModalService {
  private readonly RESENT_TIMEOUT = 45;
  public formData: SetLoginEmailForm;
  public hasFormChanges$: Observable<boolean>;
  public readonly formChangesDetector: FormChangesDetector = new FormChangesDetector();

  public emailAddressesLookup$: Observable<ActiveLookup[]>;

  public inProgress$: Observable<boolean>;
  private readonly _inProgress$ = new BehaviorSubject<boolean>(false);

  public isEmailValid$: Observable<boolean>;
  private readonly _isEmailValid$ = new BehaviorSubject<boolean>(false);

  public isEmailExistOnOtherRecord$: Observable<boolean>;
  private readonly _isEmailExistOnOtherRecord$ = new BehaviorSubject<boolean>(false);

  public selectedStep$: Observable<SetLoginEmailModalSteps>;
  private readonly _selectedStep$ = new BehaviorSubject<SetLoginEmailModalSteps>(SetLoginEmailModalSteps.selectEmail);

  private _agentId: string;
  private _agentUID: string;

  constructor(
    private authService: AuthService,
    private agentEmailAddressesService: AgentEmailAddressesService,
    private cloudFunctionsService: CloudFunctionsService,
    private otpService: OtpService,
  ) {
    this.inProgress$ = this._inProgress$.asObservable();
    this.isEmailValid$ = this._isEmailValid$.asObservable();
    this.selectedStep$ = this._selectedStep$.asObservable();
    this.isEmailExistOnOtherRecord$ = this._isEmailExistOnOtherRecord$.asObservable();
    this.hasFormChanges$ = this.formChangesDetector.actions$.pipe(
      map(() => {
        return this.formChangesDetector.hasChanges;
      }),
    );
  }

  public onCancelEditApproveDenyReason = ({ event, component }) => {
    if (!this.formChangesDetector?.hasChanges) {
      return;
    }

    event.cancel = true;

    const result = confirm('<i>Are you sure you want to Cancel without Saving?</i>', 'Confirm');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.formChangesDetector?.clear();
        component.instance.hide();
      }
    });
  };

  public init = (agentId, agentUID) => {
    this._agentId = agentId;
    this._agentUID = agentUID;
    this._selectedStep$.next(SetLoginEmailModalSteps.selectEmail);
    this.formData = new Proxy(
      {
        emailAddress: null,
        otp: null,
      },
      {
        set: (target, prop, value, receiver) => {
          const prevValue = target[prop];
          this.formChangesDetector.handleChange(prop, value, prevValue);
          Reflect.set(target, prop, value, receiver);

          switch (prop) {
            case 'emailAddress':
              Object.assign(this.formData, { otp: null });
              break;

            default:
              break;
          }

          return true;
        },
      },
    );

    this.emailAddressesLookup$ = this.agentEmailAddressesService.getList(agentId).pipe(
      map((emailAddress) => {
        if (!Array.isArray(emailAddress)) {
          return [];
        }

        return emailAddress.map((emailAddress): ActiveLookup => {
          return {
            dbId: emailAddress?.dbId,
            value: emailAddress?.dbId,
            description: emailAddress?.address,
            visible: !emailAddress?.is_login,
          };
        });
      }),
    );
  };

  public emailAddressAsyncValidation = async (emailLookup: ActiveLookup) => {
    const isEmailValid = await this.agentEmailAddressesService
      .findSameUserEmails(emailLookup?.description)
      .then((items) => {
        const sameEmailOnOtherAgent = items.filter((item) => item.parentDbId !== this._agentId);
        const isEmailExistOnOtherRecord = !!sameEmailOnOtherAgent?.length;
        const isEmailValid = sameEmailOnOtherAgent?.every((item) => !item?.data?.is_login);

        this._isEmailExistOnOtherRecord$.next(isEmailExistOnOtherRecord);
        this._isEmailValid$.next(isEmailValid);

        return isEmailValid;
      });

    return isEmailValid;
  };

  public otpAsyncValidation = async (otp: string) => {
    if (otp?.length != 6) {
      return false;
    }
    const email = this.formData?.emailAddress?.description;

    return this.otpService.validateOTP(otp, email);
  };

  public setLoginEmail = async () => {
    try {
      const agentDbId = this._agentId;
      const otp = this.formData?.otp;
      const emailAddressDbId = this.formData?.emailAddress?.dbId;

      await this.cloudFunctionsService.updateUserLoginEmail({
        uid: this._agentUID,
        otp,
        agentDbId,
        emailAddressDbId,
      });
    } catch (error) {
      debugger;
    }
  };

  public handleNextStepClick = async (formComponent: DxFormComponent, popupComponent: DxPopupComponent) => {
    const selectedStep = this._selectedStep$.value;

    if (selectedStep === SetLoginEmailModalSteps.selectEmail) {
      await this.handleSelectEmailStep(formComponent);
    }

    if (selectedStep === SetLoginEmailModalSteps.confirmEmail) {
      await this.handleConfirmEmailStep(formComponent, popupComponent);
    }
  };

  public backToEmailList = () => {
    this._selectedStep$.next(SetLoginEmailModalSteps.selectEmail);
  };

  private handleSelectEmailStep = async (formComponent: DxFormComponent) => {
    this._inProgress$.next(true);
    const isValid = await this.validateOneField('emailAddress', formComponent);

    if (isValid) {
      await this.otpService.sendOtp(this.formData?.emailAddress?.description);
      // TODO check possible errors
      this._selectedStep$.next(SetLoginEmailModalSteps.confirmEmail);
    }

    this._inProgress$.next(false);
  };

  private handleConfirmEmailStep = async (formComponent: DxFormComponent, popupComponent: DxPopupComponent) => {
    this._inProgress$.next(true);
    const isValid = await this.validateOneField('otp', formComponent);

    if (isValid) {
      await this.setLoginEmail();
      popupComponent.instance.hide();
      await this.authService.logOut();
      return;
    }

    this._inProgress$.next(false);
  };

  private validateOneField = async (field: string, formComponent: DxFormComponent) => {
    const editor = formComponent.instance.getEditor(field).element();
    const editorValidator = Validator.getInstance(editor) as Validator;
    const validationResults = editorValidator.validate();
    let asyncValidatorValid = !validationResults?.complete;

    if (validationResults?.complete) {
      const asyncValidationResults = await validationResults?.complete;
      asyncValidatorValid = asyncValidationResults?.isValid;
    }

    return validationResults.isValid && asyncValidatorValid;
  };
}
