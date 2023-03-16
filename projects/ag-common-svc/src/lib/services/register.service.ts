import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  Agent,
  AgentKeys,
  AGENT_STATUS,
  EmailAddress,
  Goal,
  LogMessage,
  PhoneNumber,
  PhoneNumberKeys,
  PhoneNumberType,
  RegisterUser,
} from 'ag-common-lib/public-api';
import { Role } from 'ag-common-lib/public-api';
import { AuthService } from './auth.service';
import { AgentService } from './agent.service';
import { LoggerService } from './logger.service';
import { User } from 'firebase/auth';
import { CloudFunctionsService } from './cloud-functions.service';
import { AgentEmailAddressesService } from './agent-email-addresses.service';
import { LookupsService } from './lookups.service';
import { firstValueFrom, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  public showLoader = false;

  constructor(
    private authService: AuthService,
    public router: Router,
    public ngZone: NgZone,
    public toster: ToastrService,
    private agentService: AgentService,
    private loggerService: LoggerService,
    private lookupsService: LookupsService,
    private cloudFunctionsService: CloudFunctionsService,
    private agentEmailAddressesService: AgentEmailAddressesService,
  ) {}

  public async registerWithForm(userData: RegisterUser) {
    try {
      const agentId = await this.cloudFunctionsService.findAgentDbIdByLoginEmail({ email: userData?.email });

      const firebaseUser = await this.authService
        .registerUser(userData?.email, userData?.password)
        .catch(this.handleFirebaseErrors.bind(this, userData?.email));

      if (!firebaseUser) {
        return;
      }
      console.log('agentId', agentId);

      if (!agentId) {
        await this.createAgentForUser(userData, firebaseUser.user);
        return;
      }

      await this.bindExistingAgentToUser(userData, firebaseUser.user, agentId);
      return;
    } catch (error) {
      debugger;
      return;
    }
  }

  private createAgentForUser = async (registerUser: RegisterUser, user: User) => {
    console.log('createAgentForUser');

    const agentPhoneNumber: PhoneNumber = Object.assign({}, new PhoneNumber(), {
      [PhoneNumberKeys.number]: registerUser.mobileNumber,
      [PhoneNumberKeys.is_whatsapp]: false,
      [PhoneNumberKeys.is_primary]: true,
      [PhoneNumberKeys.phone_type]: PhoneNumberType.Mobile,
    });
    const conferenceGoal: Goal = Object.assign({}, new Goal(), { year: new Date().getFullYear(), amount: 9000 });

    const agentData: Agent = Object.assign({}, new Agent(), {
      [AgentKeys.p_agent_first_name]: registerUser.firstName,
      [AgentKeys.p_agent_last_name]: registerUser.lastName,
      [AgentKeys.p_email]: registerUser.email,
      [AgentKeys.upline]: registerUser.upline,
      [AgentKeys.uid]: user.uid,
      [AgentKeys.emailVerified]: false,
      [AgentKeys.p_registered_user]: true,
      [AgentKeys.registrationDate]: new Date(),
      [AgentKeys.phone_numbers]: [agentPhoneNumber],
      [AgentKeys.agent_status]: AGENT_STATUS.NEW_AGENT,
      [AgentKeys.role]: [Role.AGENT],
      [AgentKeys.registration_source]: 'portal',
      [AgentKeys.p_headshot_link]: user.photoURL ?? null,
      [AgentKeys.conference_goals]: [conferenceGoal],
    });

    const agent = await this.agentService.create(agentData);

    if (!agent) {
      return;
    }

    const defaultEmailType = await firstValueFrom(
      this.lookupsService.emailTypeLookup$.pipe(map((items) => items.find((item) => item?.isDefault))),
    );
    const loginEmail: EmailAddress = Object.assign({}, new EmailAddress(), {
      address: registerUser?.email,
      email_type: defaultEmailType?.dbId,
      is_primary: true,
      is_login: true,
    });

    await this.agentEmailAddressesService.create(agent?.dbId, loginEmail);
  };

  private bindExistingAgentToUser = async (registerUser: RegisterUser, user: User, agentId: string) => {
    console.log('bindExistingAgentToUser');
    const agent = await this.agentService.getById(agentId);
    console.log('agent', agent);

    const agentStatus = agent[AgentKeys.agent_status] ?? AGENT_STATUS.NEW_AGENT;
    const agentRoles = agent[AgentKeys.role] ?? [Role.AGENT];
    const agentPhoneNumbers = agent[AgentKeys.phone_numbers] ?? [];
    const agentConferenceGoals = agent[AgentKeys.conference_goals] ?? [];

    const agentData: Agent = Object.assign({}, new Agent(), {
      [AgentKeys.p_agent_first_name]: registerUser.firstName,
      [AgentKeys.p_agent_last_name]: registerUser.lastName,
      [AgentKeys.p_email]: registerUser.email,
      [AgentKeys.upline]: registerUser.upline,
      [AgentKeys.uid]: user.uid,
      [AgentKeys.emailVerified]: false,
      [AgentKeys.p_registered_user]: true,
      [AgentKeys.registrationDate]: new Date(),
      [AgentKeys.agent_status]: agentStatus,
      [AgentKeys.role]: agentRoles,
      [AgentKeys.registration_source]: 'Auto',
      [AgentKeys.p_headshot_link]: user.photoURL ?? null,
    });

    const isPhoneExist = agentPhoneNumbers?.some((phoneNumber) => phoneNumber?.number === registerUser.mobileNumber);

    if (!isPhoneExist) {
      const agentPhoneNumber: PhoneNumber = Object.assign({}, new PhoneNumber(), {
        [PhoneNumberKeys.number]: registerUser.mobileNumber,
        [PhoneNumberKeys.is_whatsapp]: false,
        [PhoneNumberKeys.is_primary]: true,
        [PhoneNumberKeys.phone_type]: PhoneNumberType.Mobile,
      });

      Object.assign(agentData, {
        [AgentKeys.phone_numbers]: [...agentPhoneNumbers, agentPhoneNumber],
      });
    }

    const currentYear = new Date().getFullYear();
    const isCurrentYearGoalExist = agentConferenceGoals?.some((goal) => `${goal.year}` === `${currentYear}`);

    if (!isCurrentYearGoalExist) {
      const conferenceGoal: Goal = Object.assign({}, new Goal(), { year: new Date().getFullYear(), amount: 9000 });

      Object.assign(agentData, {
        [AgentKeys.conference_goals]: [...agentConferenceGoals, conferenceGoal],
      });
    }

    await this.agentService.updateFields(agentId, agentData);
  };

  private async logMessage(type: string, createdBy: string, message: string, data: any) {
    try {
      const logMessage: LogMessage = this.loggerService.generateLogMessage(type, createdBy, message, data);

      await this.loggerService.create(logMessage);

      return logMessage?.error_code;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  private handleFirebaseErrors = async (email, error) => {
    switch (error.code) {
      case 'auth/weak-password':
        await this.logMessage('REGISTRATION', email, 'Weak Password. ', [{ ...error }]);
        this.toster.error(
          'The minimum length of your password must be 6 characters. Please try again with a stronger password.',
          'Registration Error',
          { disableTimeOut: true },
        );
        break;
      case 'auth/email-already-in-use':
        await this.logMessage('REGISTRATION', email, 'Registering with an account that is already in use.', [
          { ...error },
        ]);
        this.toster.error(
          'That Email Address is already registered with the Portal. Try to login with that email. If you forgot the password, go to the Sign In screen, enter your email, and hit the "Forgot Password" button.',
          'Registration Error',
          { disableTimeOut: true },
        );
        break;

      default:
        const ec = await this.logMessage('REGISTRATION', email, 'Unknown error - check Data for details', [
          { ...error },
        ]);
        this.toster.error(
          'There was an error Registering with this Email Address. Please contact Alliance Group for assistance with this code: ' +
            ec,
          'Registration Error',
          { disableTimeOut: true },
        );
        break;
    }
  };
}
