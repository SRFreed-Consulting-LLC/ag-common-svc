import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from 'firebase/firestore';

@Pipe({ name: 'timestamp' })
export class TimestampPipe implements PipeTransform {
  transform(value?: Timestamp | Date | string): Date | string {
    if (typeof value === 'string') {
      return value;
    }

    if (!!value || 'seconds' in value) {
      return new Date((value as Timestamp)?.seconds * 1000);
    }

    return value;
  }
}
