import { Pipe, PipeTransform } from '@angular/core';
import { Agency } from 'ag-common-lib/public-api';
import { where } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AgencyService, QueryParam, WhereFilterOperandKeys } from '../../public-api';

@Pipe({ name: 'agency' })
export class AgencyPipe implements PipeTransform {
  constructor(private agencyService: AgencyService) {}

  transform(agencyId: string, converter?: (agency: Agency) => string): Observable<string> {
    const qp = [new QueryParam('agency_id', WhereFilterOperandKeys.equal, agencyId)];
    return this.agencyService.getList(qp).pipe(
      map(([agency]) => {
        if (converter) {
          return converter(agency);
        }
        return agency?.name;
      })
    );
  }
}
