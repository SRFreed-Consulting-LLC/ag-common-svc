import { Pipe, PipeTransform } from '@angular/core';
import { Address, BaseModelKeys } from 'ag-common-lib/public-api';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LookupsService } from '../../public-api';

@Pipe({ name: 'prefix' })
export class PrefixPipe implements PipeTransform {
  constructor(private lookupsService: LookupsService) {}

  transform(prefixId: string): any {
    return this.lookupsService.prefixesLookup$.pipe(
      map((prefixes) => {
        if (!Array.isArray(prefixes)) {
          return '';
        }
        return prefixes.find(({ [BaseModelKeys.dbId]: dbId }) => dbId === prefixId)?.description ?? '';
      })
    );
  }
}
