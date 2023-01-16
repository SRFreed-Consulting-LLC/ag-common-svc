import { Pipe, PipeTransform } from '@angular/core';
import { BaseModelKeys } from 'ag-common-lib/public-api';
import { map } from 'rxjs/operators';
import { LookupsService } from '../../public-api';

@Pipe({ name: 'dietaryConsiderationType' })
export class DietaryConsiderationTypePipe implements PipeTransform {
  constructor(private lookupsService: LookupsService) {}

  transform(dietaryConsiderationTypeId: string): any {
    return this.lookupsService.dietaryConsiderationTypesLookup$.pipe(
      map((dietaryConsiderationTypes) => {
        if (!Array.isArray(dietaryConsiderationTypes)) {
          return '';
        }
        return (
          dietaryConsiderationTypes.find(({ [BaseModelKeys.dbId]: dbId }) => dbId === dietaryConsiderationTypeId)
            ?.description ?? ''
        );
      })
    );
  }
}
