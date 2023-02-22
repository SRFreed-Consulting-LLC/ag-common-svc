import { Pipe, PipeTransform } from '@angular/core';
import { Lookups } from 'ag-common-lib/public-api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LookupsManagerService } from '../../public-api';

@Pipe({ name: 'lookupDescription' })
export class LookupDescriptionPipe implements PipeTransform {
  constructor(private lookupsManagerService: LookupsManagerService) {}

  transform(lookupId: string, lookup: Lookups): Observable<string> {
    return this.lookupsManagerService.getLookup(lookup, lookupId).pipe(
      map((item) => {
        if (item?.exists()) {
          const data = item.data();
          return data?.description;
        }
        return '';
      })
    );
  }
}
