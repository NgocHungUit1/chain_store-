import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface DateFilterState {
  title: string;
  filter_key: string;
  date_from: string | null;
  date_to: string | null;
  skip_filter: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DateFilterService {
  private _dateFilter = new BehaviorSubject<DateFilterState>(this.getDefaultDateFilter());
  dateFilter$: Observable<DateFilterState> = this._dateFilter.asObservable();

  constructor() {}

  getDefaultDateFilter(): DateFilterState {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return {
      title: 'Tháng này',
      filter_key: 'thisMonth',
      date_from: this.formatDate(firstDayOfMonth),
      date_to: this.formatDate(today),
      skip_filter: false
    };
  }

  setDateFilter(filter: DateFilterState): void {
    this._dateFilter.next(filter);
  }

  getCurrentDateFilter(): DateFilterState {
    return this._dateFilter.getValue();
  }

  applyToHttpParams(params: any): any {
    const filter = this._dateFilter.getValue();

    if (!filter.skip_filter) {
      if (filter.date_from) {
        params['date_from'] = filter.date_from;
      }
      if (filter.date_to) {
        params['date_to'] = filter.date_to;
      }
    }

    return params;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
