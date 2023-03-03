import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UntypedFormGroup } from '@angular/forms';
import {
  Agent,
  AGENT_STATUS,
  BUSINESS_PERSONAL_TYPE,
  EmailAddress,
  Goal,
  LogMessage,
  PhoneNumber,
  PhoneNumberType,
} from 'ag-common-lib/public-api';

import { UserCredential } from '@firebase/auth';
import { Role } from 'ag-common-lib/public-api';
import { AuthService } from './auth.service';
import { AgentService } from './agent.service';
import { LoggerService } from './logger.service';

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
  ) {}

  public async registerWithForm(userData) {
    debugger;
    // const firebaseUser = await this.authService
    //   .register(userData)
    //   .catch(this.handleFirebaseErrors.bind(this, userData?.email));
    return true;

    // return this.authDao
    //   .register(registrationForm)
    //   .then((userCredentials) => {
    //     this.agentService.getAgentByEmail(registrationForm.value.email.toLowerCase()).then(
    //       (registering_agent) => {
    //         if (!registering_agent) {
    //           let agent: Agent = this.createAgentFromUserandAgentRecord(
    //             userCredentials,
    //             { ...new Agent() },
    //             registrationForm,
    //           );

    //           if (agent) {
    //             //create agent account
    //             this.agentService.create(agent).then(
    //               () => {
    //                 this.ngZone.run(() => {
    //                   this.router.navigate(['auth', 'register-landing']);
    //                 });
    //               },
    //               (err) => {
    //                 registrationForm.value.password = '****';
    //                 this.logMessage(
    //                   'REGISTRATION',
    //                   registrationForm.value.email,
    //                   'There was a problem Creating your Agent Account. ',
    //                   [{ ...err }, { ...registrationForm.value }],
    //                 ).then((ec) => {
    //                   this.toster.error(
    //                     'There was a problem creating your agent account. Please contact Alliance Group for assistance with this code: ' +
    //                       ec,
    //                     'Registration Error',
    //                     { disableTimeOut: true },
    //                   );
    //                 });
    //               },
    //             );
    //           }
    //         } else {
    //           //create agent account from existing record
    //           let agent: Agent = this.createAgentFromUserandAgentRecord(
    //             userCredentials,
    //             registering_agent,
    //             registrationForm,
    //           );

    //           if (agent) {
    //             this.agentService.update(agent).then(
    //               () => {
    //                 this.ngZone.run(() => {
    //                   this.router.navigate(['auth', 'register-landing']);
    //                 });
    //               },
    //               (err) => {
    //                 registrationForm.value.password = '****';
    //                 this.logMessage('REGISTRATION', agent.p_email, 'There was an error Updating your agent record. ', [
    //                   { ...err },
    //                   { ...agent },
    //                 ]).then((ec) => {
    //                   this.toster.error(
    //                     'There was a problem updating your agent record. Please contact Alliance Group for assistancewith this code: ' +
    //                       ec,
    //                     'Registration Error',
    //                     { disableTimeOut: true },
    //                   );
    //                 });
    //               },
    //             );
    //           }
    //         }
    //       },
    //       (err) => {},
    //     );
    //   })
    //   .catch((error) => {
    //     //error registering user
    //     registrationForm.value.password = '****';

    //     if (error.code == 'auth/weak-password') {
    //       this.logMessage('REGISTRATION', registrationForm.value.email, 'Weak Password. ', [{ ...error }]).then(
    //         (ec) => {
    //           this.toster.error(
    //             'The minimum length of your password must be 6 characters. Please try again with a stronger password.',
    //             'Registration Error',
    //             { disableTimeOut: true },
    //           );
    //         },
    //       );
    //     } else if (error.code == 'auth/email-already-in-use') {
    //       this.logMessage(
    //         'REGISTRATION',
    //         registrationForm.value.email,
    //         'Registering with an account that is already in use.',
    //         [{ ...error }],
    //       ).then((ec) => {
    //         this.toster.error(
    //           'That Email Address is already registered with the Portal. Try to login with that email. If you forgot the password, go to the Sign In screen, enter your email, and hit the "Forgot Password" button.',
    //           'Registration Error',
    //           { disableTimeOut: true },
    //         );
    //       });
    //     } else {
    //       this.logMessage('REGISTRATION', registrationForm.value.email, 'Unknown error - check Data for details', [
    //         { ...error },
    //       ]).then((ec) => {
    //         this.toster.error(
    //           'There was an error Registering with this Email Address. Please contact Alliance Group for assistance with this code: ' +
    //             ec,
    //           'Registration Error',
    //           { disableTimeOut: true },
    //         );
    //       });
    //     }
    //   });
  }

  public changeAgentEmail(registrationForm: UntypedFormGroup) {
    let agent: Agent = this.authService.currentAgent$.value;

    let currentEmailAddress = agent.p_email.trim();

    //does new email exist in list?
    let currentAddress: EmailAddress[] = agent.email_addresses.filter(
      (email) => email.address == registrationForm.value.email,
    );

    if (currentAddress.length == 0) {
      let newEmailAddress: EmailAddress = { ...new EmailAddress() };
      newEmailAddress.address = registrationForm.value.email;
      newEmailAddress.email_type = BUSINESS_PERSONAL_TYPE.BUSINESS;
      newEmailAddress.id = this.uuidv4();
      newEmailAddress.is_primary = false;
      agent.email_addresses.push(newEmailAddress);
    }

    // this.authDao.register(registrationForm).then(
    //   (userCredential) => {
    //     // agent.registrationDate = new Date();
    //     // agent.uid = userCredential.user.uid;
    //     // agent.emailVerified = false;
    //     // agent.p_email = userCredential.user.email.toLowerCase();
    //     // //set correct 'is_login'
    //     // agent.email_addresses.forEach((email) => {
    //     //   email.is_login = false;
    //     //   if (email.address == agent.p_email) {
    //     //     email.is_login = true;
    //     //   }
    //     // });
    //     // this.toster.success('You are about to be logged out now...');
    //     // let url = environment.user_admin_url + '/' + agent.dbId + '/' + currentEmailAddress;
    //     // this.http.get(url).subscribe((response) => {
    //     //   this.agentService.update(agent).then(() => {
    //     //     this.logMessage('ACCOUNT-DELETE', currentEmailAddress, 'Auth Account Deleted', [
    //     //       { ...agent },
    //     //       { ...response },
    //     //     ]);
    //     //     this.authService.logOut();
    //     //   });
    //     // });
    //   },
    //   (err) => {
    //     this.logMessage('REGISTRATION', agent.p_email, 'There was an error Updating your agent record. ', [
    //       { ...err },
    //       { ...agent },
    //     ]).then((ec) => {
    //       this.toster.error(
    //         'There was an error Updating your agent record with the new Email Address. Please contact Alliance Group for assistance with this code: ' +
    //           ec,
    //         'Registration Error',
    //         { disableTimeOut: true },
    //       );
    //     });
    //   },
    // );
  }

  private createAgentFromUserandAgentRecord(result: UserCredential, agent: Agent, registrationForm: UntypedFormGroup) {
    try {
      agent.upline = registrationForm.value.upline;
      agent.p_email = result.user.email.trim().toLowerCase();
      agent.p_agent_first_name = registrationForm.value.firstName;
      agent.p_agent_last_name = registrationForm.value.lastName;
      agent.p_agent_name = registrationForm.value.firstName + ' ' + registrationForm.value.lastName;

      agent.uid = result.user.uid;
      agent.emailVerified = result.user.emailVerified;
      agent.p_registered_user = true;
      agent.registrationDate = Date.now();

      if (!agent.email_addresses) {
        agent.email_addresses = [];
      }

      //if email address not already in list
      if (agent.email_addresses.filter((email) => email.address == result.user.email).length == 0) {
        let email: EmailAddress = { ...new EmailAddress() };
        email.id = 'init';
        email.email_type = BUSINESS_PERSONAL_TYPE.BUSINESS;
        email.is_login = true;
        email.is_primary = true;
        email.address = result.user.email.toLowerCase();
        agent.email_addresses.push(email);
      }

      if (!agent.phone_numbers) {
        agent.phone_numbers = [];
      }

      //if phone number not already in list
      if (agent.phone_numbers.filter((phone) => phone.number == registrationForm.value.mobileNumber).length == 0) {
        let number: PhoneNumber = { ...new PhoneNumber() };
        number.is_primary = true;
        number.is_whatsapp = false;
        number.phone_type = PhoneNumberType.Mobile;

        number.number = registrationForm.value.mobileNumber
          .replace('.', '')
          .replace('.', '')
          .replace('-', '')
          .replace('-', '')
          .replace(' ', '')
          .replace(' ', '')
          .replace('(', '')
          .replace(')', '');
        agent.phone_numbers.push(number);
      }

      if (!agent.agent_status) {
        agent.agent_status = AGENT_STATUS.NEW_AGENT;
      }

      if (!agent.role) {
        agent.role = [Role.AGENT];
      }

      if (!agent.dbId) {
        agent.registration_source = 'Auto';
      } else {
        agent.registration_source = 'Portal';
      }

      if (!agent.p_headshot_link && result.user.photoURL) {
        agent.p_headshot_link = result.user.photoURL;
      }

      if (!agent.conference_goals) {
        agent.conference_goals = [];
      }

      //if goal for current year is not set
      if (agent.conference_goals.filter((goal) => goal.year == new Date().getFullYear()).length == 0) {
        let goal: Goal = { ...new Goal() };
        goal.year = new Date().getFullYear();
        goal.amount = 90000;
        agent.conference_goals.push(goal);
      }

      return agent;
    } catch (err) {
      this.logMessage('REGISTRATION', result.user.email, 'There was an error Creating your agent record. ', [
        { ...err },
      ]).then((ec) => {
        this.toster.error(
          'There was a problem Creating your agent record. Please contact Alliance Group for assistance with this code: ' +
            ec,
          'Registration Error',
          { disableTimeOut: true },
        );
      });
      return null;
    }
  }

  private logMessage(type: string, created_by: string, message: string, data: any) {
    try {
      let ec = this.generateErrorCode();

      let logMessage: LogMessage = {
        ...new LogMessage(type, created_by, message, ec, data),
      };

      return this.loggerService.create(logMessage).then(() => {
        return ec;
      });
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  private generateErrorCode() {
    return 'xxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  public uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private handleFirebaseErrors = (email, error) => {
    switch (error.code) {
      case 'auth/weak-password':
        this.logMessage('REGISTRATION', email, 'Weak Password. ', [{ ...error }]).then((ec) => {
          this.toster.error(
            'The minimum length of your password must be 6 characters. Please try again with a stronger password.',
            'Registration Error',
            { disableTimeOut: true },
          );
        });
        break;
      case 'auth/email-already-in-use':
        this.logMessage('REGISTRATION', email, 'Registering with an account that is already in use.', [
          { ...error },
        ]).then((ec) => {
          this.toster.error(
            'That Email Address is already registered with the Portal. Try to login with that email. If you forgot the password, go to the Sign In screen, enter your email, and hit the "Forgot Password" button.',
            'Registration Error',
            { disableTimeOut: true },
          );
        });
        break;

      default:
        break;
    }
  };
}
