// src/app/shared/sale-column-visibility.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ColumnVisibilityMap {
  [columnId: string]: boolean|String;
}

/**
 * This service holds a BehaviorSubject<{ columnId: boolean }> which maps each
 * column‐key to true (visible) or false (hidden). We initialize EVERY column to true.
 */
@Injectable({
  providedIn: 'root'
})
export class SaleColumnVisibilityService {
  private visibilitySubject = new BehaviorSubject<ColumnVisibilityMap>({
    // 1) Ảnh hàng hóa
    image:             true,
    // 2) Mã hàng
    product_no:        true,
    // 3) Giá bán
    price:             true,
    // 4) Giảm giá
    discount:          "price",
    // 5) Chỉnh sửa thành tiền
    edit_as_money:     true,
    // 6) Xem giá bán gần nhất
    last_sale_price:   true,
    // 7) Thêm dòng
    add_row:           true,
    // 8) Số lượng tồn kho
    quantity_of_stock: false, 
    // 9) Ghi chúchú
    note: false, 

    // (If you still want your original columns too, you can keep them. But here, 
    // we assume these nine *cover* all the dynamic‐toggle needs.)
  });

  /** Expose the map as an Observable so consumers can react to any change. */
  public visibility$: Observable<ColumnVisibilityMap> =
    this.visibilitySubject.asObservable();

  /**
   * setColumn( key, true|false ) will flip that column on or off.
   * Example: setColumn('price', false) hides the “Giá bán” column.
   */
  setColumn(columnId: string, visible: boolean) {
    const current = this.visibilitySubject.value;
    this.visibilitySubject.next({
      ...current,
      [columnId]: visible
    });
  }

  /**
   * Convenience method: return the current (boolean) for one column immediately,
   * before subscribing. Used to seed initial toggle states in CartComponent.
   */
  isColumnVisibleNow(columnId: string): any {
    if(columnId === 'discount') {
      // Special case: 'discount' is a string, not a boolean.
      return this.visibilitySubject.value[columnId];
    }
    return !!this.visibilitySubject.value[columnId];
  }

  /**
   * If any component wants to subscribe to one column's visibility alone,
   * they can call getColumnVisibility('price') and get back an Observable<boolean>.
   */
  getColumnVisibility(columnId: string): Observable<boolean> {
    return this.visibility$.pipe(map(m => !!m[columnId]));
  }
}
 