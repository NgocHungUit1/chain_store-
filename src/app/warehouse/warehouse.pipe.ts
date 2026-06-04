import { Pipe, PipeTransform } from '@angular/core';
import * as numeral from 'numeral';

@Pipe({
  name: 'showValueExpenses',
  pure: false,
})

export class ShowValueExpensesPipe implements PipeTransform {
  transform(item: any): any {
    if (typeof item === 'number') {
      // '0,0.[00]': hiển thị tối đa 2 số lẻ, chỉ hiện khi có phần thập phân
      // (giá vốn lẻ vd 72.626,77 hiển thị đúng, giá nguyên không kèm ,00 thừa)
      return numeral(item).format('0,0.[00]');
    } else {
      return item;
    }
  }
}
