import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'isLoginEmail' })
export class IsLoginEmailPipe implements PipeTransform {
  transform(email: string, loginEmail): boolean {
    if (!loginEmail || !email) {
      return false;
    }

    return loginEmail?.toLocaleLowerCase() === email?.toLocaleLowerCase();
  }
}
