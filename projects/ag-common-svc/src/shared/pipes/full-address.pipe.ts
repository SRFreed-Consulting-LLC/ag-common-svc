import { Pipe, PipeTransform } from '@angular/core';
import { Address } from 'ag-common-lib/public-api';

@Pipe({ name: 'fullAddress' })
export class FullAddressPipe implements PipeTransform {
  transform(address: Address, limit?: number): string {
    const fullAddress = address
      ? [address?.address1, address?.address2, address?.city, address?.state, address?.zip].filter(Boolean).join(' ')
      : '';

    if (!fullAddress) {
      return '';
    }

    if (limit && limit < fullAddress.length) {
      return fullAddress.slice(0, limit) + '...';
    }

    return fullAddress;
  }
}
