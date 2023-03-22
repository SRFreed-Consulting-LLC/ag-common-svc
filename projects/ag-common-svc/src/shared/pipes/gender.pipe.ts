import { Pipe, PipeTransform } from '@angular/core';
import { BaseModelKeys } from 'ag-common-lib/public-api';
import { map } from 'rxjs/operators';
import { LookupsService } from '../../public-api';

@Pipe({ name: 'gender' })
export class GenderPipe implements PipeTransform {
  constructor(private lookupsService: LookupsService) {}

  transform(genderId: string): any {
    return this.lookupsService.gendersLookup$.pipe(
      map((genders) => {
        if (!Array.isArray(genders)) {
          return '';
        }
        return genders.find(({ [BaseModelKeys.dbId]: dbId }) => dbId === genderId)?.description ?? '';
      })
    );
  }
}
