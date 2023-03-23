import { Pipe, PipeTransform } from '@angular/core';
import { BaseModelKeys, NeedToKnow } from 'ag-common-lib/public-api';
import { AuthService } from 'ag-common-svc/public-api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({ name: 'needToKnowPermissions' })
export class NeedToKnowPermissionsPipe implements PipeTransform {
  constructor(private authService: AuthService) {}
  transform(needToKnow: NeedToKnow): Observable<boolean> {
    return this.authService.currentUser$?.pipe(
      map((user) => user.email),
      map((loggedInUserEmail) => {
        if (!needToKnow || !needToKnow[BaseModelKeys.dbId]) {
          return true;
        }

        return needToKnow.created_by === loggedInUserEmail;
      }),
    );
  }
}
