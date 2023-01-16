import { Pipe, PipeTransform } from '@angular/core';
import { BaseModelKeys } from 'ag-common-lib/public-api';
import { map } from 'rxjs/operators';
import { LookupsService } from '../../public-api';

@Pipe({ name: 'suffix' })
export class SuffixPipe implements PipeTransform {
  constructor(private lookupsService: LookupsService) {}

  transform(suffixId: string): any {
    return this.lookupsService.suffixesLookup$.pipe(
      map((suffixes) => {
        if (!Array.isArray(suffixes)) {
          return '';
        }
        return suffixes.find(({ [BaseModelKeys.dbId]: dbId }) => dbId === suffixId)?.description ?? '';
      })
    );
  }
}
