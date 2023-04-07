import { Injectable } from '@angular/core';
import { AuthService } from 'ag-common-svc/public-api';
import { fromEvent, merge, Observable, Subject, Subscription, timer } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';
import {
  BROADCAST_CHANEL,
  DEFAULT_IDLE_TIME_DELAY,
  IdleTimeServiceActions,
  IdleTimeServiceMessage,
} from './idle.model';

@Injectable()
export class IdleService {
  public showNotification$: Observable<boolean>;
  private _showNotification$ = new Subject<boolean>();

  private ignoreInternalActivities = false;
  private readonly broadcastChannel = new BroadcastChannel(BROADCAST_CHANEL);
  private idle: Subject<void> = new Subject();
  private timeoutDelayMinutes: number = DEFAULT_IDLE_TIME_DELAY;
  private destroyed$: Subject<void> = new Subject();
  private timer: Subscription;
  private broadcastChannelAction$: Observable<IdleTimeServiceActions>;
  // private externalIdle$: Observable<void>;
  private resetSources$: Observable<void>;

  constructor(private authService: AuthService) {
    this.showNotification$ = this._showNotification$.asObservable();
    this.broadcastChannelAction$ = fromEvent<MessageEvent<IdleTimeServiceMessage>>(
      this.broadcastChannel,
      'message',
    ).pipe(map((message) => message.data?.action));

    // this.externalIdle$ = this.broadcastChannelAction$.pipe(
    //   filter((action) => action === IdleTimeServiceActions.logOut),
    //   map(() => null),
    // );

    const externalReset$ = this.broadcastChannelAction$.pipe(
      filter((action) => action === IdleTimeServiceActions.resetTimer),

      map(() => {
        this._showNotification$.next(false);
        return null;
      }),
    );

    const events = ['keydown', 'playvideo', 'click' /* 'scroll', 'wheel', 'touchmove', 'touchend' */];

    const eventStreams = events.map((event) =>
      fromEvent(document, event).pipe(
        filter(() => !this.ignoreInternalActivities),
        tap((e) => {
          this.broadcastChannel.postMessage(new IdleTimeServiceMessage(IdleTimeServiceActions.resetTimer));
        }),
      ),
    );

    this.resetSources$ = merge(externalReset$, ...eventStreams);

    this.authService.currentUser$.pipe(takeUntil(this.destroyed$), filter(Boolean)).subscribe(() => {
      this.initIdle();
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
    this.idle.complete();
    this.timer.unsubscribe();
    this.broadcastChannel.close();
  }

  public staySighIn = (timeoutDelayMinutes: number) => {
    this.timeoutDelayMinutes = timeoutDelayMinutes;
    this.broadcastChannel.postMessage(new IdleTimeServiceMessage(IdleTimeServiceActions.resetTimer));
    this.resetTimer();
  };

  private resetTimer = () => {
    this.ignoreInternalActivities = false;
    this.setTimer(this.timeoutDelayMinutes * 60 * 1000, this.promptStayLoggedIn);
  };

  private promptStayLoggedIn = () => {
    this.ignoreInternalActivities = true;
    this._showNotification$.next(true);

    this.setTimer(15 * 1000, () => this.authService.logOut());
  };

  private setTimer = (delay, callback) => {
    this.clearTimer();
    this.timer = timer(delay).pipe(takeUntil(this.destroyed$)).subscribe(callback);
  };

  private clearTimer = () => {
    if (this.timer) {
      this.timer.unsubscribe();
      this.timer = null;
    }
  };

  public initIdle = () => {
    this.resetTimer();
    this.resetSources$.pipe(takeUntil(this.destroyed$)).subscribe(this.resetTimer);
  };
}
