import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'yesNo' })
export class YesNoPipe implements PipeTransform {
  transform(state: boolean): string {
    return state ? 'Yes' : 'No';
  }
}
