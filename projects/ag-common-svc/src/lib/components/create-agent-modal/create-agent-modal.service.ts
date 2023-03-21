import { Injectable } from '@angular/core';
import {
  Agent,
  AgentKeys,
  AGENT_STATUS,
  EmailAddress,
  PhoneNumber,
  PhoneNumberKeys,
  PhoneNumberType,
  RelatedEmailAddress,
  Role,
} from 'ag-common-lib/public-api';
import { AgentEmailAddressesService } from 'ag-common-svc/lib/services/agent-email-addresses.service';
import { AgentService, LookupsService } from 'ag-common-svc/public-api';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, firstValueFrom, map, Observable } from 'rxjs';
import { CloudFunctionsService } from '../../services/cloud-functions.service';
import { LoggerService } from '../../services/logger.service';
import { CreateAgentModalFormData } from './create-agent-modal.model';

@Injectable()
export class CreateAgentModalService {
  public inProgress$: Observable<boolean>;
  private readonly _inProgress$ = new BehaviorSubject<boolean>(false);

  public emailsExistOnOtherRecord$: Observable<RelatedEmailAddress[]>;
  private readonly _emailsExistOnOtherRecord$ = new BehaviorSubject<RelatedEmailAddress[]>([]);

  constructor(
    private agentService: AgentService,
    private cloudFunctionsService: CloudFunctionsService,
    private lookupsService: LookupsService,
    private agentEmailAddressesService: AgentEmailAddressesService,
    private toster: ToastrService,
    private loggerService: LoggerService,
  ) {
    this.inProgress$ = this._inProgress$.asObservable();
    this.emailsExistOnOtherRecord$ = this._emailsExistOnOtherRecord$.asObservable();
  }

  public emailAddressAsyncValidation = async (email: string) => {
    const results = await this.agentEmailAddressesService.findSameUserEmails(email);
    const isEmailValid = results?.every((item) => !item?.data?.is_login);

    this._emailsExistOnOtherRecord$.next(results ?? []);

    return isEmailValid;
  };
  public save = (formData: CreateAgentModalFormData): Promise<void> => {
    this._inProgress$.next(true);

    return this.createAgent(formData).finally(() => {
      this._inProgress$.next(false);
    });
  };

  private createAgent = async (formData: CreateAgentModalFormData) => {
    const email = formData?.email ?? '';
    const agentData = Object.assign({}, new Agent(), {
      [AgentKeys.p_agent_first_name]: formData?.firstName ?? '',
      [AgentKeys.p_agent_last_name]: formData?.lastName ?? '',
      [AgentKeys.p_email]: email,
      [AgentKeys.agent_status]: AGENT_STATUS.NEW_AGENT,
      [AgentKeys.role]: [Role.AGENT],
    });

    if (formData.phoneNumber) {
      const agentPhoneNumber: PhoneNumber = Object.assign({}, new PhoneNumber(), {
        [PhoneNumberKeys.number]: formData.phoneNumber,
        [PhoneNumberKeys.is_whatsapp]: false,
        [PhoneNumberKeys.is_primary]: true,
        [PhoneNumberKeys.phone_type]: PhoneNumberType.Mobile,
      });
      agentData.phone_numbers = [agentPhoneNumber];
    }

    const agent = await this.agentService.create(agentData);

    if (!!email) {
      const defaultEmailType = await firstValueFrom(
        this.lookupsService.emailTypeLookup$.pipe(map((items) => items.find((item) => item?.isDefault))),
      );
      const loginEmail: EmailAddress = Object.assign({}, new EmailAddress(), {
        address: email,
        email_type: defaultEmailType?.dbId,
        is_primary: true,
        is_login: true,
      });

      await this.agentEmailAddressesService.create(agent?.dbId, loginEmail);
    }
  };
}
