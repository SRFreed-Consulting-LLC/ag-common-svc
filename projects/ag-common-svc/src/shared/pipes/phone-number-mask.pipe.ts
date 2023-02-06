import { Pipe, PipeTransform } from '@angular/core';
import { PhoneNumber } from 'ag-common-lib/public-api';

@Pipe({ name: 'phoneNumberMask' })
export class PhoneNumberMaskPipe implements PipeTransform {
  transform(phoneNumber: PhoneNumber, showExtension: boolean = true): string {
    if (!phoneNumber || !phoneNumber?.number) {
      return '';
    }
    const matcher = phoneNumber?.number.match(/(\d{3})(\d{3})(\d{4})/);
    const number = matcher ? `(${matcher[1]}) ${matcher[2]} - ${matcher[3]}` : phoneNumber?.number;

    return `${number} ${showExtension && phoneNumber?.extension ? ` (ext. ${phoneNumber?.extension})` : ''}`;
  }
}
