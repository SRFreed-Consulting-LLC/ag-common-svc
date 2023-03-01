import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormChangesDetector } from '../../../../../shared/utils';
import { confirm } from 'devextreme/ui/dialog';
import { AgentEmailAddressesService } from '../../../../services/agent-email-addresses.service';
import { ActiveLookup, Lookup } from 'ag-common-lib/public-api';
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

  private _agentId: string;

  constructor(
    private agentEmailAddressesService: AgentEmailAddressesService,
    private cloudFunctionsService: CloudFunctionsService,
    private otpService: OtpService,
  ) {
    this.inProgress$ = this._inProgress$.asObservable();
    this.isSendOTPInProgress$ = this._isSendOTPInProgress$.asObservable();
    this.hasFormChanges$ = this.formChangesDetector.actions$.pipe(
      map(() => {
        return this.formChangesDetector.hasChanges;
      }),
    );
  }

  public setLoginEmail = (agentId) => {};

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

  public init = (agentId) => {
    this._agentId = agentId;
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
    const items = await this.agentEmailAddressesService.findSameUserEmails(emailLookup?.description);

    const sameEmailOnOtherAgent = items.filter((item) => item.parentDbId !== this._agentId);

    if (!sameEmailOnOtherAgent?.length) {
      return true;
    }

    return sameEmailOnOtherAgent?.some((item) => item?.data?.is_login);
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

      this._isSendOTPInProgress$.next(true);
      this.cloudFunctionsService
        .sendOTP({ email })
        .then((data) => {
          debugger;
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
    // try {
    //   await this.authService.changeUserEmail(emailAddress.address);
    //   const emailAddresses = await firstValueFrom(this.emailAddresses$);
    //   const loginEmailAddress = emailAddresses.find((item) => item?.is_login);
    //   await Promise.all([
    //     this.agentEmailAddressesService.update(this.agentId$.value, emailAddress.dbId, { is_login: true }),
    //     this.agentEmailAddressesService.update(this.agentId$.value, loginEmailAddress.dbId, { is_login: false }),
    //   ]).then(() => false);
    //   this.toastrService.success(
    //     'Your email is being changed and you will be logged out of the portal\n Please login with your new Email Address.',
    //   );
    // } catch (error) {
    //   debugger;
    // }
  };
}
