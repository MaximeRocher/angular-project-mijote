import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncate' })
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, maxLength = 15): string {
    if (!value) {
      return '';
    }
    return value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;
  }
}
