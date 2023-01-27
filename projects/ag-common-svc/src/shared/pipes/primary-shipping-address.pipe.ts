import { Pipe, PipeTransform } from '@angular/core';
import { Address } from 'ag-common-lib/public-api';

@Pipe({ name: 'primaryShippingAddress' })
export class PrimaryShippingAddressPipe implements PipeTransform {
  transform(addresses: Address[]): Address {
    const primaryShipping = Array.isArray(addresses)
      ? addresses.find((email) => {
          return email?.is_primary_shipping;
        })
      : null;

    return primaryShipping;
  }
}
