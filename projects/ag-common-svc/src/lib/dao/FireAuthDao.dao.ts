import { Inject, Injectable, InjectionToken, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { Agent, AgentKeys, BaseModelKeys, UserPermission } from 'ag-common-lib/public-api';
import { FirebaseApp } from 'firebase/app';
import {
  Auth,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  User,
  UserCredential,
} from 'firebase/auth';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  fromEventPattern,
  map,
  mergeMap,
  Observable,
  of,
  shareReplay,
} from 'rxjs';

import { FIREBASE_APP } from '../injections/firebase-app';
import { AgentService } from '../services/agent.service';
import { UserPermissionService } from '../services/user-permissions.service';
import { QueryParam, WhereFilterOperandKeys } from './CommonFireStoreDao.dao';

export const AUTH_COOKIE_NAME = new InjectionToken<string>('AUTH_COOKIE_NAME');
export const USER_COOKIE_NAME = new InjectionToken<string>('USER_COOKIE_NAME');
export const ID_TOKEN_COOKIE_NAME = new InjectionToken<string>('ID_TOKEN_COOKIE_NAME');

@Injectable({
  providedIn: 'root',
})
export class FireAuthDao {
  public auth: Auth;
  public authSate$ = new BehaviorSubject<boolean>(undefined);
  public currentUser$: Observable<User>;
  public currentAgent$: BehaviorSubject<Agent> = new BehaviorSubject(undefined);
  public userPermissions$: BehaviorSubject<UserPermission[]> = new BehaviorSubject(undefined);

  private loggedInAgent$: Observable<Agent>;

  constructor(
    @Inject(FIREBASE_APP) fireBaseApp: FirebaseApp,
    @Inject(AUTH_COOKIE_NAME) private authCookieName: string,
    @Inject(USER_COOKIE_NAME) private userCookieName: string,
    @Inject(ID_TOKEN_COOKIE_NAME) private idTokenCookieName: string,
    public router: Router,
    public ngZone: NgZone,
    public toster: ToastrService,
    private agentService: AgentService,
    private cookieService: CookieService,
    private userPermissionService: UserPermissionService,
  ) {
    this.auth = getAuth(fireBaseApp);
    this.authSate$.next(this.cookieService.check(this.idTokenCookieName));

    this.currentUser$ = fromEventPattern(
      (handler) => this.auth.onAuthStateChanged(handler),
      (_handler, unsubscribe) => {
        unsubscribe();
      },
    );

    this.loggedInAgent$ = this.currentUser$.pipe(
      filter(Boolean),
      mergeMap((user: User) => {
        const qp: QueryParam[] = [];

        if (!!user) {
          qp.push(new QueryParam(AgentKeys.p_email, WhereFilterOperandKeys.equal, user.email));
        }
        return this.agentService.getList(qp);
      }),
      map((agents) => {
        if (!Array.isArray(agents) || agents?.length !== 1) {
          throw new Error('More than 1 agent found with this email address');
        }
        return agents[0];
      }),
      shareReplay(1),
    );

    this.loggedInAgent$
      .pipe(
        mergeMap((agent) => {
          return combineLatest([of(agent), this.userPermissionService.getList(agent[BaseModelKeys.dbId])]);
        }),
      )
      .subscribe(([agent, userPermissions]) => {
        this.userPermissions$.next(userPermissions);
        this.currentAgent$.next(agent);
        debugger;
      });
  }

  public signIn(email, password): Promise<UserCredential> {
    this.auth.onAuthStateChanged((user) => {
      this.authSate$.next(!!user);
      if (!user) {
        localStorage.removeItem(this.userCookieName);
        this.cookieService.delete(this.authCookieName);
        this.cookieService.delete(this.userCookieName);
        this.cookieService.delete(this.idTokenCookieName);
      }
    });

    return setPersistence(this.auth, browserLocalPersistence).then(() => {
      return signInWithEmailAndPassword(this.auth, email, password);
    });
  }

  public authLogin(provider): Promise<UserCredential> {
    return setPersistence(this.auth, browserSessionPersistence).then(() => {
      return signInWithPopup(this.auth, provider);
    });
  }

  public async register(userData) {
    const userCredentials = await createUserWithEmailAndPassword(this.auth, userData.email, userData.password);

    await sendEmailVerification(userCredentials.user);
    await setPersistence(this.auth, browserSessionPersistence);

    return userCredentials;
  }

  public preRegister(user: Agent) {
    return createUserWithEmailAndPassword(this.auth, user.p_email, 'password').then(() => {
      return setPersistence(this.auth, browserSessionPersistence);
    });
  }

  public signOut() {
    return signOut(this.auth);
  }

  public resendVerificationEmail(user: Agent) {}

  public forgotPassword(passwordResetEmail) {
    return sendPasswordResetEmail(this.auth, passwordResetEmail);
  }

  public resetPassword(newPassword: string) {
    let that = this;

    updatePassword(this.auth.currentUser, newPassword)
      .then(() => {
        that.toster.info('Password Successfully changed for ', this.auth.currentUser.displayName);
        return true;
      })
      .catch(function (error) {
        that.toster.error(error);
        return false;
      });
  }

  signInAnonymously(): Promise<any> {
    return this.signInAnonymously();
  }
}
