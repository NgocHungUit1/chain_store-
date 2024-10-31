import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'includes'
})
export class IncludesPipe implements PipeTransform {

  transform(value: any[], data: any, key: string): unknown {
    if (!key) {
      return !!value.some(item => {
        return item === data;
      });
    }
    return !!value.find(item => {
      return item[key] === data[key];
    });
  }

}
