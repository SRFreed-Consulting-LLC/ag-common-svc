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
    YesNoPipe
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
    YesNoPipe
  ]
})
export class PipesModule {}
