import { Pipe, PipeTransform } from '@angular/core';
import { BaseModelKeys } from 'ag-common-lib/public-api';
import { map } from 'rxjs/operators';
import { LookupsService } from '../../public-api';

@Pipe({ name: 'tShortSize' })
export class TShortSizePipe implements PipeTransform {
  constructor(private lookupsService: LookupsService) {}

  transform(tShortSizeId: string): any {
    return this.lookupsService.tShortSizesLookup$.pipe(
      map((tShortSizes) => {
        if (!Array.isArray(tShortSizes)) {
          return '';
        }
        return tShortSizes.find(({ [BaseModelKeys.dbId]: dbId }) => dbId === tShortSizeId)?.description ?? '';
      })
    );
  }
}
