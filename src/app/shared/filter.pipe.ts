import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(value: any[], data: any, key: string, type: 'include' | 'exclude'): unknown {
    const filterData = key ? data['key'] : data;
    return value.filter(item => {
      return type === 'include' ? item[key] === filterData : item[key] !== filterData;
    });
  }

}
