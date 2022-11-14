import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'path' })
export class PathPipe implements PipeTransform {
  transform(items: string[]): string {
    return Array.isArray(items) ? items.filter(Boolean).join('.') : '';
  }
}
