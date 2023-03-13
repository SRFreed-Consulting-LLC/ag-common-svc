import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, filter, fromEvent, merge, Observable, Subject, takeUntil } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { addSeconds, differenceInSeconds } from 'date-fns';

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class IdleService {
  public readonly isIdleTimeoutExpired$: Observable<boolean>;
  public keepAliveExpirationDate$: Observable<Date>;

  private readonly _isIdleTimeoutExpired$: BehaviorSubject<boolean>;

  private idleTimer: any;
  private keepaliveTimer: any;
  private readonly idleTimeout = 20; // in seconds
  private readonly localStorageKey = 'idle-last-action';
  private _unsubscribeNotifier: Subject<void>;
  private _keepAliveExpirationDate$ = new BehaviorSubject<Date>(null);

  // TODO test
  private testTimeout;

  constructor(private ngZone: NgZone) {
    this._isIdleTimeoutExpired$ = new BehaviorSubject(false);
    this.keepAliveExpirationDate$ = this._keepAliveExpirationDate$.asObservable();

    this.isIdleTimeoutExpired$ = merge(this._isIdleTimeoutExpired$);

    this.setupStorageListener();
    this.setupEventListeners();
    this.setIdleTimeout();

    // TODO test

    this.keepAliveExpirationDate$.subscribe((date) => {
      clearTimeout(this.testTimeout);

      const logCountdown = () => {
        const dateNow = new Date();

        const diff = differenceInSeconds(date, dateNow);
        console.log(`${diff} Left to Logout`);

        this.testTimeout = setTimeout(logCountdown, 500);
      };

      if (date) {
        logCountdown();
      }
    });
  }

  private resetIdleTimer() {
    this.setIdleTimeout();

    localStorage.setItem(this.localStorageKey, new Date().toISOString());
  }

  private setupStorageListener = () => {
    fromEvent(window, 'storage')
      .pipe(
        // takeUntil(this._unsubscribeNotifier),
        filter((event: StorageEvent) => event.key === this.localStorageKey),
      )
      .subscribe(() => {
        this.setIdleTimeout();
      });
  };

  private setupEventListeners() {
    this._unsubscribeNotifier = new Subject();

    merge(fromEvent(document, 'click'))
      .pipe(takeUntil(this._unsubscribeNotifier))
      .subscribe(() => {
        this.resetIdleTimer();
      });
  }

  private disableListeners = () => {
    this._unsubscribeNotifier.next();
    this._unsubscribeNotifier.complete();
  };

  private setIdleTimeout = (idleTimeout?: number) => {
    if (this.keepaliveTimer) {
      clearTimeout(this.keepaliveTimer);
      this.keepaliveTimer = null;
      this.setupEventListeners();
      this._keepAliveExpirationDate$.next(null);
    }

    clearTimeout(this.idleTimer);
    const durationInMs = idleTimeout ?? this.idleTimeout * 1000;

    this.idleTimer = setTimeout(() => {
      console.log('Set Keepalive timer, and start count 60 seconds');

      this.disableListeners();
      const expirationDate = addSeconds(new Date(), 60);
      this._keepAliveExpirationDate$.next(expirationDate);
      this.keepaliveTimer = setTimeout(() => {
        this._isIdleTimeoutExpired$.next(true);
      }, 60000);
    }, durationInMs);
  };
}
