import { ActiveLookup, EmailAddress } from 'ag-common-lib/public-api';

export enum SetLoginEmailModalSteps {
  selectEmail = 'selectEmail',
  confirmEmail = 'confirmEmail',
}

export interface SetLoginEmailForm {
  emailAddress: ActiveLookup;
  otp: string;
}
