import { Pipe, PipeTransform } from '@angular/core';
import * as numeral from 'numeral';

@Pipe({
  name: 'showValueExpenses',
  pure: false,
})

export class ShowValueExpensesPipe implements PipeTransform {
  transform(item: any): any {
    if (typeof item === 'number') {
      return numeral(item).format('0,0');
    } else {
      return item;
    }
  }
}
