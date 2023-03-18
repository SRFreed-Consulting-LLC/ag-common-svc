import { Inject, Optional, Pipe, PipeTransform } from '@angular/core';
import { BaseModelKeys, NeedToKnow } from 'ag-common-lib/public-api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LOGGED_IN_USER_EMAIL } from '../../agent-editor.model';

@Pipe({ name: 'needToKnowPermissions' })
export class NeedToKnowPermissionsPipe implements PipeTransform {
  constructor(@Optional() @Inject(LOGGED_IN_USER_EMAIL) private loggedInUserEmail$: Observable<string>) {}
  transform(needToKnow: NeedToKnow): Observable<boolean> {
    return this.loggedInUserEmail$?.pipe(
      map((loggedInUserEmail) => {
        if (!needToKnow || !needToKnow[BaseModelKeys.dbId]) {
          return true;
        }

        return needToKnow.created_by === loggedInUserEmail;
      })
    );
  }
}
