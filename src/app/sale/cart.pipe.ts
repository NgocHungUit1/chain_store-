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


@Pipe({
  name: 'showPriceVat',
  pure: false,
})
export class ShowPricePipeVat implements PipeTransform {
  transform(item: any): any {
    if (item.product?.end_price === undefined) {
      return Math.round(item?.common_price  * (1 + ((item?.product?.vat_percent || 0) / 100)));
    } else {
      return Math.round(item.product?.end_price * (1 + ((item?.product?.vat_percent || 0) / 100)));
    }
  }
}

@Pipe({
  name: 'totalPriceVat',
  pure: false,
})
export class TotalPricePipeVat implements PipeTransform {
  transform(item: any): any {
    if (item.product?.end_price === undefined) {
      return Math.round((item?.common_price * item.amount) * (1 + ((item?.product?.vat_percent || 0) / 100)));
    } else {
      return Math.round((item.product?.end_price * item.amount) * (1 + ((item?.product?.vat_percent || 0) / 100)));
    }
  }
}
