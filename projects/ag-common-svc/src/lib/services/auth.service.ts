import { Inject, Injectable, InjectionToken, NgZone, Optional } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Agent, AgentKeys, AGENT_STATUS, BaseModelKeys, LogMessage, UserPermission } from 'ag-common-lib/public-api';
import { AgentService } from './agent.service';
import { FIREBASE_APP } from '../injections/firebase-app';
import { FirebaseApp } from 'firebase/app';
import {
  Auth,
  browserSessionPersistence,
  checkActionCode,
  createUserWithEmailAndPassword,
  getAuth,
  IdTokenResult,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
  verifyPasswordResetCode
} from 'firebase/auth';
import { UserPermissionService } from './user-permissions.service';
import { LoggerService } from './logger.service';
import { BehaviorSubject, firstValueFrom, fromEventPattern, iif, Observable, of } from 'rxjs';
import { mergeMap, map, tap, shareReplay, filter } from 'rxjs/operators';

export const DOMAIN = new InjectionToken<string>('DOMAIN');
export const SESSION_EXPIRATION = new InjectionToken<number>('SESSION_EXPIRATION');
export const AGENT_PORTAL_URL = new InjectionToken<string>('AGENT_PORTAL_URL');
export const AFTER_LOGIN_REDIRECT_PATH = new InjectionToken<string>('AFTER_LOGIN_REDIRECT_PATH');
export const AFTER_LOGOUT_REDIRECT_PATH = new InjectionToken<string>('AFTER_LOGOUT_REDIRECT_PATH');

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth;

  public readonly currentUser$: Observable<User>;
  public readonly loggedInAgent$: Observable<Agent>;
  public readonly userPermissions$: Observable<UserPermission[]>;

  /**
   * @deprecated Use loggedInAgent$ observable instead
   */
  public currentAgent$: BehaviorSubject<Agent> = new BehaviorSubject(undefined);

  constructor(
    @Inject(FIREBASE_APP) fireBaseApp: FirebaseApp,
    @Inject(SESSION_EXPIRATION) private sessionExpiration: number,
    @Optional() @Inject(AFTER_LOGIN_REDIRECT_PATH) private afterLoginRedirectPath: string,
    @Optional() @Inject(AFTER_LOGOUT_REDIRECT_PATH) private afterLogoutRedirectPath: string,
    @Optional() @Inject(AGENT_PORTAL_URL) private agentPortalUrl: string,
    public router: Router,
    public ngZone: NgZone,
    public toster: ToastrService,
    private route: ActivatedRoute,
    private agentService: AgentService,
    private loggerService: LoggerService,
    private userPermissionService: UserPermissionService
  ) {
    this.auth = getAuth(fireBaseApp);

    this.currentUser$ = fromEventPattern(
      (handler) => this.auth.onAuthStateChanged(handler),
      (_handler, unsubscribe) => {
        unsubscribe();
      }
    );

    this.loggedInAgent$ = this.currentUser$.pipe(
      mergeMap((user: User) => user?.getIdTokenResult()),
      map((idTokenResult: IdTokenResult) => {
        const claims = idTokenResult?.claims;

        return claims?.agentDbId;
      }),
      mergeMap((agentId: string) =>
        iif(
          () => !!agentId,
          of(agentId).pipe(mergeMap((id) => this.agentService.getDocument(id).pipe(map((doc) => doc.data())))),
          of(null).pipe(
            mergeMap(() => this.router.navigate([this.afterLogoutRedirectPath ?? 'auth/login'])),
            map(() => null)
          )
        )
      ),
      tap((agent) => {
        // TODO temp solution
        this.currentAgent$.next(agent);
      }),
      shareReplay(1)
    );

    this.userPermissions$ = this.loggedInAgent$.pipe(
      filter(Boolean),
      mergeMap((agent) => {
        return this.userPermissionService.getList(agent[BaseModelKeys.dbId]);
      })
    );
  }

  public async signInWithEmailAndPassword(email: string, password: string) {
    try {
      const userData = await this.signIn(email, password);

      if (!userData?.user?.emailVerified) {
        this.navigateRegisterLanding();
        return;
      }
      const agent = await firstValueFrom(
        this.loggedInAgent$.pipe(filter((agent) => agent?.uid === userData?.user?.uid))
      );

      if (!agent) {
        const ec = await this.logMessage('LOGIN', userData?.user?.email, 'Could not find agent record for user');

        this.toster.error(
          'An Agent record matching that Email Address could not be found. Please contact Alliance Group for Assistance with this code:' +
            ec,
          'Login Error',
          { disableTimeOut: true }
        );
        await this.logOut();
        return;
      }

      if (agent.agent_status !== AGENT_STATUS.APPROVED) {
        await this.logMessage('LOGIN', userData?.user?.email, 'User exists but not green lighted. ', [{ ...agent[0] }]);

        this.navigateAgentUnderReview();

        return;
      }

      this.logUserIntoPortal(agent);
    } catch (error) {
      switch (error.code) {
        case 'auth/wrong-password':
          this.logMessage('LOGIN', email, 'You have entered an incorrect password for this email address.', [
            { ...error }
          ]).then((ec) => {
            this.toster.error(
              'You have entered an incorrect password for this email address. If you have forgotten your password, enter your Email Address and press the "Forgot Password" button. If the problem continues, please contact Alliance Group for assistance with this code: ' +
                ec,
              'Login Error',
              { disableTimeOut: true }
            );
          });
          break;

        case 'auth/user-not-found':
          this.logMessage('LOGIN', email, 'The email address (' + email + ') is not recognized.', [{ ...error }]).then(
            (ec) => {
              this.toster.error(
                'The email address (' +
                  email +
                  ') is not recognized. Correct the Email Address and Try again. If the problem continues, please contact Alliance Group for assistance with this code: ' +
                  ec,
                'Login Error',
                { disableTimeOut: true }
              );
            }
          );
          break;

        case 'auth/too-many-requests':
          this.logMessage('LOGIN', email, 'Too many failed attempts. The account is temporarily locked.', [
            { ...error }
          ]).then((ec) => {
            this.toster.error(
              'There have been too many failed logins to this account. Please reset your password by going to the login screen, entering your password, and pressing the "Forgot Password" button. If the problem continues, please contact Alliance Group for assistance with this code: ' +
                ec,
              'Login Error',
              { disableTimeOut: true }
            );
          });
          break;

        default:
          this.logMessage(
            'LOGIN',
            email,
            'Unknown Error loggin in with the email address (' + email + '). Check Error details for more information',
            [{ ...error }]
          ).then((ec) => {
            this.toster.error(
              'There was an Error accessing your account. Please contact Alliance Group for Assistance with this code: ' +
                ec,
              'Login Error',
              { disableTimeOut: true }
            );
          });
          break;
      }
    }
  }

  public verifyPasswordResetCode = (actionCode: string) => {
    return verifyPasswordResetCode(this.auth, actionCode);
  };

  public checkActionCode = (actionCode: string) => {
    return checkActionCode(this.auth, actionCode);
  };

  private logUserIntoPortal(agent: Agent) {
    if (!agent) {
      return;
    }
    const updates = {
      [AgentKeys.login_count]: Number.isInteger(agent?.login_count) ? agent?.login_count + 1 : 1,
      [AgentKeys.last_login_date]: new Date()
    };

    if (!agent.logged_in) {
      Object.assign(updates, {
        [AgentKeys.logged_in]: true,
        [AgentKeys.first_login_date]: new Date()
      });
    }

    this.agentService.updateFields(agent?.dbId, updates);

    let destination: string = this.afterLoginRedirectPath ?? 'dashboard';

    if (this.route.snapshot.queryParamMap.has('returnUrl')) {
      destination = this.route.snapshot.queryParamMap.get('returnUrl');
    }

    this.ngZone.run(() => {
      this.router.navigate([destination]);
    });
  }

  public async logOut(withRedirect = true) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    try {
      if (withRedirect) {
        await this.router.navigate([this.afterLogoutRedirectPath ?? 'auth/login']);
      }
      await signOut(this.auth);
    } catch (error) {
      console.error('Error in Auth Service.', error);
    }
  }

  public forgotPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email)
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

    // TODO

    return Promise.reject();
  }

  public registerUser = (email, password): Promise<UserCredential> => {
    return createUserWithEmailAndPassword(this.auth, email, password);
  };

  private signIn(email, password): Promise<UserCredential> {
    return setPersistence(this.auth, browserSessionPersistence).then(() => {
      return signInWithEmailAndPassword(this.auth, email, password);
    });
  }

  private logMessage(type: string, created_by: string, message: string, data?: any) {
    try {
      let ec = this.generateErrorCode();

      let logMessage: LogMessage = {
        ...new LogMessage(type, created_by, message, ec, data)
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

  private navigateRegisterLanding = () => {
    if (this.agentPortalUrl) {
      // TODO check on environments does guards works correct
      window.open(`${this.agentPortalUrl}/auth/register-landing`, '_blank');
      return;
    }

    this.ngZone.run(() => {
      this.router.navigate(['auth', 'register-landing']);
    });
  };

  private navigateAgentUnderReview = () => {
    if (this.agentPortalUrl) {
      // TODO check on environments does guards works correct
      window.open(`${this.agentPortalUrl}/auth/agent-under-review`, '_blank');
      return;
    }
    this.ngZone.run(() => {
      this.router.navigate(['auth', 'agent-under-review']);
    });
  };

  private generateErrorCode() {
    return 'xxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}