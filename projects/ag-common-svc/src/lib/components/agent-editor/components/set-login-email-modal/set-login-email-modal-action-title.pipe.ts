import { Pipe, PipeTransform } from '@angular/core';
import { SetLoginEmailModalSteps } from './set-login-email-modal.model';

@Pipe({ name: 'setLoginEmailModalActionTitle' })
export class SetLoginEmailModalActionTitlePipe implements PipeTransform {
  constructor() {}
  transform(step: SetLoginEmailModalSteps): string {
    if (step === SetLoginEmailModalSteps.selectEmail) {
      return 'SEND CONFIRMATION';
    }
    if (step === SetLoginEmailModalSteps.confirmEmail) {
      return 'CONFIRM';
    }
    return '';
  }
}
