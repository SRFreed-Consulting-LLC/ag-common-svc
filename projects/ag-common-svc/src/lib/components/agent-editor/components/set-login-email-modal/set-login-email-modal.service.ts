import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { FormChangesDetector } from '../../../../../shared/utils';
import { confirm } from 'devextreme/ui/dialog';
import { AgentEmailAddressesService } from '../../../../services/agent-email-addresses.service';
import { ActiveLookup } from 'ag-common-lib/public-api';
import { CloudFunctionsService } from '../../../../services/cloud-functions.service';
import { OtpService } from '../../../../services/otp.service';

@Injectable()
export class SetLoginEmailModalService {
  public formData: any;
  public hasFormChanges$: Observable<boolean>;
  public readonly formChangesDetector: FormChangesDetector = new FormChangesDetector();

  public emailAddressesLookup$: Observable<ActiveLookup[]>;

  public inProgress$: Observable<boolean>;
  private readonly _inProgress$ = new BehaviorSubject<boolean>(false);

  public isSendOTPInProgress$: Observable<boolean>;
  private readonly _isSendOTPInProgress$ = new BehaviorSubject<boolean>(false);

  public isOTPSended$: Observable<boolean>;
  private readonly _isOTPSended$ = new BehaviorSubject<boolean>(false);

  public isEmailValid$: Observable<boolean>;
  private readonly _isEmailValid$ = new BehaviorSubject<boolean>(false);

  public isEmailExistOnOtherRecord$: Observable<boolean>;
  private readonly _isEmailExistOnOtherRecord$ = new BehaviorSubject<boolean>(false);

  private _agentId: string;
  private _agentUID: string;

  constructor(
    private agentEmailAddressesService: AgentEmailAddressesService,
    private cloudFunctionsService: CloudFunctionsService,
    private otpService: OtpService,
  ) {
    this.inProgress$ = this._inProgress$.asObservable();
    this.isSendOTPInProgress$ = this._isSendOTPInProgress$.asObservable();
    this.isOTPSended$ = this._isOTPSended$.asObservable();
    this.isEmailValid$ = this._isEmailValid$.asObservable();
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

  public sendOtp = () => {
    try {
      const email = this.formData?.emailAddress?.description;

      this._isOTPSended$.next(false);
      this._isSendOTPInProgress$.next(true);
      this.cloudFunctionsService
        .sendOTP({ email })
        .then((data) => {
          this._isOTPSended$.next(true);
        })
        .catch((e) => {
          debugger;
        })
        .finally(() => {
          this._isSendOTPInProgress$.next(false);
        });
    } catch (error) {
      debugger;
    }
  };

  public setLoginEmail = async () => {
    try {
      const agentDbId = this._agentId;
      const otp = this.formData?.otp;
      const emailAddressDbId = this.formData?.emailAddress?.dbId;
      debugger;
      await this.cloudFunctionsService.updateUserLoginEmail({
        uid: this._agentUID,
        otp,
        agentDbId,
        emailAddressDbId,
      });
      debugger;
    } catch (error) {
      debugger;
    }
  };
}
