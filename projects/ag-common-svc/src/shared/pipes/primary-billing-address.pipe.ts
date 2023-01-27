import { Pipe, PipeTransform } from '@angular/core';
import { Address } from 'ag-common-lib/public-api';

@Pipe({ name: 'primaryBillingAddress' })
export class PrimaryBillingAddressPipe implements PipeTransform {
  transform(addresses: Address[]): Address {
    const primaryBilling = Array.isArray(addresses)
      ? addresses.find((email) => {
          return email?.is_primary_shipping;
        })
      : null;

    return primaryBilling;
  }
}
