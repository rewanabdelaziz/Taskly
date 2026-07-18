import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusLabel',
  standalone: true
})
export class StatusLabelPipe implements PipeTransform {

  transform(value: string): unknown {

    return value.toLowerCase().split('_').map((w)=> w=='qa' ? w.toUpperCase() : w[0].toUpperCase()+w.slice(1,)).join(' ')
  }

}
