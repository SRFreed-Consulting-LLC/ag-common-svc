import { Pipe, PipeTransform } from '@angular/core';
import { PhoneNumber } from 'ag-common-lib/public-api';

@Pipe({ name: 'primaryPhoneNumber' })
export class PrimaryPhoneNumberPipe implements PipeTransform {
  transform(numbers: PhoneNumber[]): PhoneNumber {
    const phoneNumber = Array.isArray(numbers)
      ? numbers.find((phoneNumber) => {
          return phoneNumber?.is_primary;
        }) ?? null
      : null;

    return phoneNumber;
  }
}
