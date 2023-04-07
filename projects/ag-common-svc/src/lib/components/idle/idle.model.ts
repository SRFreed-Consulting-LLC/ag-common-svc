export const BROADCAST_CHANEL = 'IDLE_TIME_SERVICE_CHANEL' as const;

export const DEFAULT_IDLE_TIME_DELAY = 1; // TODO replace after testing

export const idleTimeDelaysLookup = [DEFAULT_IDLE_TIME_DELAY, 2, 30, 45];

export enum IdleTimeServiceActions {
  logOut = 'LOG_OUT',
  resetTimer = 'RESET_TIMER',
}

export class IdleTimeServiceMessage {
  action: IdleTimeServiceActions;

  constructor(action: IdleTimeServiceActions) {
    this.action = action;
  }
}
