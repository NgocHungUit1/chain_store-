import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ColumnVisibilityMap {
  [columnId: string]: boolean | string;
}

const STORAGE_KEY = 'saleColumnVisibility';

@Injectable({
  providedIn: 'root',
})
export class SaleColumnVisibilityService {
  private visibilitySubject: BehaviorSubject<ColumnVisibilityMap>;
  constructor() {

    // Load saved state from localStorage or use default
    const saved = localStorage.getItem(STORAGE_KEY);
    let initialState: ColumnVisibilityMap;

    if (saved) {
      try {
        initialState = JSON.parse(saved);
      } catch {
        initialState = this.getDefaultVisibility();
      }
    } else {
      initialState = this.getDefaultVisibility();
    }

    this.visibilitySubject = new BehaviorSubject<ColumnVisibilityMap>(initialState);

    // Subscribe to changes to save to localStorage
    this.visibilitySubject.subscribe(value => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    });
  }

  private getDefaultVisibility(): ColumnVisibilityMap {
    return {
      image: true,
      product_no: true,
      price: true,
      discount: 'price',
      edit_as_money: true,
      last_sale_price: true,
      add_row: true,
      quantity_of_stock: false,
      note: false,
    };
  }

  public get visibility$(): Observable<ColumnVisibilityMap> {
    return this.visibilitySubject.asObservable();
  }

  setColumn(columnId: string, visible: boolean | string) {
    const current = this.visibilitySubject.value;
    this.visibilitySubject.next({
      ...current,
      [columnId]: visible,
    });
  }

  isColumnVisibleNow(columnId: string): any {
    if (columnId === 'discount') {
      return this.visibilitySubject.value[columnId];
    }
    return !!this.visibilitySubject.value[columnId];
  }

  getColumnVisibility(columnId: string): Observable<boolean> {
    return this.visibility$.pipe(map(m => !!m[columnId]));
  }
}
