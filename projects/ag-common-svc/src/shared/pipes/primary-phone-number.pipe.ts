import { Pipe, PipeTransform } from '@angular/core';
import { PhoneNumber } from 'ag-common-lib/public-api';

@Pipe({ name: 'primaryPhoneNumber' })
export class PrimaryPhoneNumberPipe implements PipeTransform {
  transform(numbers: PhoneNumber[]): string {
    const phoneNumber = Array.isArray(numbers)
      ? numbers.find((phoneNumber) => {
          return phoneNumber?.is_primary;
        })?.number ?? null
      : null;

    return phoneNumber;
  }
}
