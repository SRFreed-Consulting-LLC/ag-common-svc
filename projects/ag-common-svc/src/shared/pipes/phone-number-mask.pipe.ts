import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'phoneNumberMask' })
export class PhoneNumberMaskPipe implements PipeTransform {
  transform(phoneNumber: string): string {
    if (!phoneNumber) {
      return '';
    }
    const matcher = phoneNumber.match(/(\d{3})(\d{3})(\d{4})/);

    return matcher ? `(${matcher[1]}) ${matcher[2]} - ${matcher[3]}` : phoneNumber;
  }
}
