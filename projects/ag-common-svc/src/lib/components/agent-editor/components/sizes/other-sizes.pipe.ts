import { Pipe, PipeTransform } from '@angular/core';
import { Lookup, LookupKeys } from 'ag-common-lib/public-api';

@Pipe({ name: 'otherSize' })
export class OtherSizePipe implements PipeTransform {
  transform(selectedLookup: Lookup): boolean {
    return selectedLookup && selectedLookup[LookupKeys.value] === 'Other';
  }
}
