import { Pipe, PipeTransform } from '@angular/core';
import { format, isValid, parse } from 'date-fns';

@Pipe({ name: 'formateLogDate' })
export class FormateLogDatePipe implements PipeTransform {
  transform(date: Date, time?: string): string {
    const isValidDate = date && isValid(date);

    if (!isValidDate) {
      return '';
    }

    const dateTime = isValidDate ? parse(time ?? '23:59', 'HH:mm', date) : null;

    return format(dateTime, time ? "P 'at' KK':'mm a 'EDT'" : 'P');
  }
}
