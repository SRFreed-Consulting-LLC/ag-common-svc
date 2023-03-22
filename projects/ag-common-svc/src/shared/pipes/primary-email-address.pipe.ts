import { Pipe, PipeTransform } from '@angular/core';
import { EmailAddress } from 'ag-common-lib/public-api';

@Pipe({ name: 'primaryEmailAddress' })
export class PrimaryEmailAddressPipe implements PipeTransform {
  transform(emails: EmailAddress[]): string {
    const primaryEmail = Array.isArray(emails)
      ? emails.find((email) => {
          return email?.is_primary;
        })?.address ?? null
      : null;

    return primaryEmail;
  }
}
