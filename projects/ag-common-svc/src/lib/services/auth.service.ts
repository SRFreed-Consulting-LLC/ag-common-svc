import { Inject, Injectable, InjectionToken, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { Agent, AGENT_STATUS, LogMessage } from 'ag-common-lib/public-api';
import { getAuth, updateEmail, UserCredential } from 'firebase/auth';
import { mergeMap } from 'rxjs';
import { addMinutes } from 'date-fns';
import { FireAuthDao, ID_TOKEN_COOKIE_NAME } from '../dao/FireAuthDao.dao';
import { LoggerService } from './logger.service';
import { AgentService } from './agent.service';

export const DOMAIN = new InjectionToken<string>('DOMAIN');
export const SESSION_EXPIRATION = new InjectionToken<number>('SESSION_EXPIRATION');

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public showLoader = false;

  public showPWReset = false;

  constructor(
    @Inject(ID_TOKEN_COOKIE_NAME) private idTokenCookieName: string,
    @Inject(DOMAIN) private domain: string,
    @Inject(SESSION_EXPIRATION) private sessionExpiration: number,
    public router: Router,
    public ngZone: NgZone,
    public toster: ToastrService,
    public authDao: FireAuthDao,
    private cookieService: CookieService,
    private route: ActivatedRoute,
    // private dashboardService: DashboardService,
    private loggerService: LoggerService,
    private agentService: AgentService,
  ) {}

  public signInWithEmailAndPassword(email: string, password: string) {
    this.cookieService.delete(this.idTokenCookieName);
    this.showLoader = true;

    return this.authDao
      .signIn(email, password)
      .then(
        (result) => {
          debugger;
          return this.agentService.getAgentByAuthUID(result.user.uid).then((agent) => {
            debugger;
            if (!agent) {
              this.logMessage('LOGIN', result.user.email, 'Could not find agent record for user').then((ec) => {
                this.toster.error(
                  'An Agent record matching that Email Address could not be found. Please contact Alliance Group for Assistance with this code:' +
                    ec,
                  'Login Error',
                  { disableTimeOut: true },
                );
              });
            } else {
              if (agent.agent_status == AGENT_STATUS.APPROVED) {
                this.logUserIntoPortal(result, agent);
              } else {
                this.logMessage('LOGIN', result.user.email, 'User exists but not green lighted. ', [
                  { ...agent[0] },
                ]).then((ec) => {
                  this.toster.error(
                    'Your portal access status is under review. Please try again in 24-48 hours. If you believe you have reached this message in error, please contact Alliance Group for Assistance with this code:' +
                      ec,
                    'Login Error',
                    { disableTimeOut: true },
                  );
                });
              }
            }
          });
        },
        (error) => {
          if (error.code == 'auth/wrong-password') {
            this.logMessage('LOGIN', email, 'You have entered an incorrect password for this email address.', [
              { ...error },
            ]).then((ec) => {
              this.toster.error(
                'You have entered an incorrect password for this email address. If you have forgotten your password, enter your Email Address and press the "Forgot Password" button. If the problem continues, please contact Alliance Group for assistance with this code: ' +
                  ec,
                'Login Error',
                { disableTimeOut: true },
              );
            });
          } else if (error.code == 'auth/user-not-found') {
            this.logMessage('LOGIN', email, 'The email address (' + email + ') is not recognized.', [
              { ...error },
            ]).then((ec) => {
              this.toster.error(
                'The email address (' +
                  email +
                  ') is not recognized. Correct the Email Address and Try again. If the problem continues, please contact Alliance Group for assistance with this code: ' +
                  ec,
                'Login Error',
                { disableTimeOut: true },
              );
            });
          } else if (error.code == 'auth/too-many-requests') {
            this.logMessage('LOGIN', email, 'Too many failed attempts. The account is temporarily locked.', [
              { ...error },
            ]).then((ec) => {
              this.toster.error(
                'There have been too many failed logins to this account. Please reset your password by going to the login screen, entering your password, and pressing the "Forgot Password" button. If the problem continues, please contact Alliance Group for assistance with this code: ' +
                  ec,
                'Login Error',
                { disableTimeOut: true },
              );
            });
          } else {
            this.logMessage(
              'LOGIN',
              email,
              'Unknown Error loggin in with the email address (' +
                email +
                '). Check Error details for more information',
              [{ ...error }],
            ).then((ec) => {
              this.toster.error(
                'There was an Error accessing your account. Please contact Alliance Group for Assistance with this code: ' +
                  ec,
                'Login Error',
                { disableTimeOut: true },
              );
            });
          }
        },
      )
      .finally(() => (this.showLoader = false));
  }

  private logUserIntoPortal(authResult: UserCredential, agent: Agent) {
    //if the user has never logged in before
    if (!agent.logged_in) {
      agent.logged_in = true;
      agent.first_login_date = new Date();
      agent.login_count = 0;
      agent.uid = authResult.user.uid;

      if (isNaN(+agent.login_count)) {
        agent.login_count = 0;
      }
    }

    //if(user has been verified, but not set in db)
    if (authResult.user.emailVerified && !agent.emailVerified) {
      agent.emailVerified = true;
    }

    //set last login date and increment login count
    agent.last_login_date = new Date();

    agent.login_count = agent.login_count + 1;

    this.agentService.update(agent).then(() => {
      agent.showSplashScreen = true;

      if (!authResult.user.emailVerified && !agent.emailVerified) {
        this.ngZone.run(() => {
          this.router.navigate(['auth', 'register-landing']);
        });
      } else {
        this.setAuthExpirationTime().then(() => {
          let destination: string = 'dashboard';
          if (this.route.snapshot.queryParamMap.has('returnUrl')) {
            destination = this.route.snapshot.queryParamMap.get('returnUrl');
          }

          this.ngZone.run(() => {
            this.router.navigate([destination]);
          });

          this.showLoader = false;
        });
      }
    });
  }

  public logOut() {
    this.cookieService.delete(this.idTokenCookieName, '/', this.domain);

    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };

    return this.authDao
      .signOut()
      .then(() => {
        this.showLoader = false;
        this.router.navigate(['auth', 'login']);
      })
      .catch((error) => {
        console.error('Error in Auth Service.', error);
      });
  }

  public forgotPassword(email: string) {
    return this.authDao
      .forgotPassword(email)
      .then(() => {
        this.toster.info('Password reset email sent, check your inbox.');
      })
      .catch((error) => {
        this.toster.error(error);
      });
  }

  public setAuthExpirationTime(session_expiration?: number) {
    const dateNow = new Date();

    if (session_expiration) {
      dateNow.setHours(dateNow.getHours() + session_expiration);
    } else {
      dateNow.setMinutes(dateNow.getMinutes() + this.sessionExpiration);
    }

    if (this.authDao.auth.currentUser) {
      return this.authDao.auth.currentUser.getIdToken(true).then((t) => {
        this.cookieService.set(this.idTokenCookieName, t, dateNow, '/', this.domain, false, 'Lax');
      });
    }

    return Promise.reject();
  }

  changeUserEmail(email: string) {
    let auth = getAuth();
    return this.authDao.currentUser$.pipe(
      mergeMap((user) => {
        return user.getIdToken();
      }),
      mergeMap((token) => {
        this.cookieService.set(
          this.idTokenCookieName,
          token,
          addMinutes(new Date(), this.sessionExpiration),
          '/',
          this.domain,
          false,
          'Lax',
        );
        return updateEmail(auth.currentUser, email);
      }),
    );
  }

  public getLoadingStatus() {
    return this.showLoader;
  }

  private logMessage(type: string, created_by: string, message: string, data?: any) {
    try {
      let ec = this.generateErrorCode();

      let logMessage: LogMessage = {
        ...new LogMessage(type, created_by, message, ec, data),
      };

      console.warn('logMessage', logMessage);

      return this.loggerService.create(logMessage).then(() => {
        return ec;
      });
    } catch (err) {
      console.error('error', err);
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
}
