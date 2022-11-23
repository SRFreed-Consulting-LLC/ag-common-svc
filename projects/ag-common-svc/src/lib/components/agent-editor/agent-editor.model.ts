import { InjectionToken } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export const LOGGED_IN_USER_EMAIL = new InjectionToken<BehaviorSubject<Observable<string>>>('loggedInUserEmail');
