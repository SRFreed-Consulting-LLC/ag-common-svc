import { Pipe, PipeTransform } from '@angular/core';
import { ApproveDenyReason, BaseModelKeys } from 'ag-common-lib/public-api';
import { AuthService } from '../../../../services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({ name: 'approveDenyReasonsPermissions' })
export class ApproveDenyReasonsPermissionsPipe implements PipeTransform {
  constructor(private authService: AuthService) {}
  transform(approveDenyReason: ApproveDenyReason): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      map((user) => user?.email),
      map((loggedInUserEmail) => {
        if (!approveDenyReason || !approveDenyReason[BaseModelKeys.dbId]) {
          return true;
        }

        return approveDenyReason.created_by === loggedInUserEmail;
      }),
    );
  }
}
