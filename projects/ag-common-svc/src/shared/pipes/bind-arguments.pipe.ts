import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'bindArguments' })
export class BindArgumentsPipe implements PipeTransform {
  transform(func: (...args: any[]) => void, ...args: any[]): (...args: any[]) => void {
    return func.bind(this, ...args);
  }
}
