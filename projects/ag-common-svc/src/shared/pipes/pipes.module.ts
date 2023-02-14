import { NgModule } from '@angular/core';
import { MultipleClickDirective } from '../directives/multiple-clicks.directive';
import { BindArgumentsPipe } from './bind-arguments.pipe';
import { FormChangeDetectionPipe } from './form-change-detection.pipe';
import { FormateLogDatePipe } from './format-log-date.pipe';
import { FullAddressPipe } from './full-address.pipe';
import { FullNamePipe } from './full-name.pipe';
import { PathPipe } from './path.pipe';
import { YesNoPipe } from './yes-no.pipe';
import { PhoneNumberMaskPipe } from './phone-number-mask.pipe';
import { PrimaryPhoneNumberPipe } from './primary-phone-number.pipe';
import { SafeHTMLPipe } from './safe-html.pipe';
import { TaskWorkflowDetailsPipe } from './task-workflow-details.pipe';
import { TimestampPipe } from './timestamp.pipe';
import { PrefixPipe } from './prefix.pipe';
import { DietaryConsiderationTypePipe } from './dietary-consideration-type.pipe';
import { GenderPipe } from './gender.pipe';
import { SuffixPipe } from './suffix.pipe';
import { TShortSizePipe } from './t-short-size.pipe';
import { PrimaryEmailAddressPipe } from './primary-email-address.pipe';
import { PrimaryShippingAddressPipe } from './primary-shipping-address.pipe';
import { PrimaryBillingAddressPipe } from './primary-billing-address.pipe';
import { AgencyPipe } from './agent.pipe';
import { LookupDescriptionPipe } from './lookup-description.pipe';

@NgModule({
  declarations: [
    SafeHTMLPipe,
    PathPipe,
    TimestampPipe,
    BindArgumentsPipe,
    FormateLogDatePipe,
    MultipleClickDirective,
    FullNamePipe,
    FormChangeDetectionPipe,
    TaskWorkflowDetailsPipe,
    PrimaryPhoneNumberPipe,
    PhoneNumberMaskPipe,
    FullAddressPipe,
    YesNoPipe,
    PrefixPipe,
    DietaryConsiderationTypePipe,
    GenderPipe,
    SuffixPipe,
    TShortSizePipe,
    PrimaryEmailAddressPipe,
    PrimaryShippingAddressPipe,
    PrimaryBillingAddressPipe,
    AgencyPipe,
    LookupDescriptionPipe,
  ],
  exports: [
    SafeHTMLPipe,
    PathPipe,
    TimestampPipe,
    BindArgumentsPipe,
    FormateLogDatePipe,
    MultipleClickDirective,
    FullNamePipe,
    FormChangeDetectionPipe,
    TaskWorkflowDetailsPipe,
    PrimaryPhoneNumberPipe,
    PhoneNumberMaskPipe,
    FullAddressPipe,
    YesNoPipe,
    PrefixPipe,
    DietaryConsiderationTypePipe,
    GenderPipe,
    SuffixPipe,
    TShortSizePipe,
    PrimaryEmailAddressPipe,
    PrimaryShippingAddressPipe,
    PrimaryBillingAddressPipe,
    AgencyPipe,
    LookupDescriptionPipe,
  ],
})
export class PipesModule {}
