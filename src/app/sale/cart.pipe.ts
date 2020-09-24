import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'showPrice',
  pure: false,
})

export class ShowPricePipe implements PipeTransform {
  transform(item: any): any {
    if (item.product?.end_price === undefined) {
      return item?.common_price;
    } else {
      return item.product?.end_price;
    }
  }
}

@Pipe({
  name: 'totalPrice',
  pure: false,
})

export class TotalPricePipe implements PipeTransform {
  transform(item: any): any {
    if (item.product?.end_price === undefined) {
      return item?.common_price * item.amount;
    } else {
      return item.product?.end_price * item.amount;
    }
  }
}
