import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fullName' })
export class FullNamePipe implements PipeTransform {
  transform(items: string[]): string {
    return items.filter(Boolean).join(' ');
  }
}
