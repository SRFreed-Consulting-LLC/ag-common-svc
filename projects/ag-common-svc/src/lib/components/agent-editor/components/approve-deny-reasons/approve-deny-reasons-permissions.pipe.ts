import { Inject, Optional, Pipe, PipeTransform } from '@angular/core';
import { AGENT_STATUS, ApproveDenyReason, BaseModelKeys } from 'ag-common-lib/public-api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LOGGED_IN_USER_EMAIL } from '../../agent-editor.model';

@Pipe({ name: 'approveDenyReasonsPermissions' })
export class ApproveDenyReasonsPermissionsPipe implements PipeTransform {
  constructor(@Optional() @Inject(LOGGED_IN_USER_EMAIL) private loggedInUserEmail$: Observable<string>) {}
  transform(approveDenyReason: ApproveDenyReason): Observable<boolean> {
    return this.loggedInUserEmail$?.pipe(
      map((loggedInUserEmail) => {
        if (!approveDenyReason || !approveDenyReason[BaseModelKeys.dbId]) {
          return true;
        }

        return approveDenyReason.created_by === loggedInUserEmail;
      })
    );
  }
}
