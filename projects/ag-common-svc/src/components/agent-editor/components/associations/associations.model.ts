import { InjectionToken } from '@angular/core';
import { Lookup, Lookups } from 'ag-common-lib/public-api';
import { Observable } from 'rxjs';

export const RELATIONSHIP_LOOKUP = new InjectionToken<Observable<Lookup[]> | Promise<Lookup[]>>(
  Lookups.AssociationType
);
