import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { debounceTime, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-sale-product-parcel-select-dialog',
  templateUrl: './sale-product-parcel-select-dialog.component.html',
  styleUrls: ['./sale-product-parcel-select-dialog.component.css']
})
export class SaleProductParcelSelectDialogComponent implements OnInit {
  searchControl = new FormControl('');
  filteredParcels: object[] = [];
  availableParcels: object[] = [];
  selectedParcel: object;
  quantity: number;
  unitValue: number;
  unitName: string;
  constructor(
    public dialogRef: MatDialogRef<SaleProductParcelSelectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: object
  ) {
    this.availableParcels = data['allParcels'];
    this.selectedParcel = data['selectedParcel'];
    this.quantity = data['quantity'];
    this.unitValue = data['unit_value'] || 1;
    this.unitName = data['unit_name'] || '';
  }

  getConvertedStock(parcel: object): number {
    return Math.floor(parcel['quantity_of_stock'] / this.unitValue);
  }

  /**
   * UX-05: Số ngày còn lại đến hạn sử dụng của lô.
   */
  getDaysUntilExpiry(expirationDate: any): number | null {
    if (!expirationDate) {
      return null;
    }
    const expiry = new Date(expirationDate);
    if (isNaN(expiry.getTime())) {
      return null;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);
    return Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * UX-05: Trạng thái hạn sử dụng: 'expired' | 'warning' | 'normal'.
   */
  getExpiryStatus(expirationDate: any): string {
    const days = this.getDaysUntilExpiry(expirationDate);
    if (days === null) {
      return 'normal';
    }
    if (days < 0) {
      return 'expired';
    }
    if (days <= 30) {
      return 'warning';
    }
    return 'normal';
  }

  getExpiryTooltip(expirationDate: any): string {
    const days = this.getDaysUntilExpiry(expirationDate);
    if (days === null) {
      return '';
    }
    if (days < 0) {
      return 'Lô đã hết hạn ' + Math.abs(days) + ' ngày';
    }
    if (days <= 30) {
      return 'Lô sắp hết hạn (còn ' + days + ' ngày)';
    }
    return 'Còn hạn ' + days + ' ngày';
  }
  ngOnInit() {
    // Initialize your parcels list and setup search
    this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map(value => this.filterParcels(value))
    ).subscribe(parcels => this.filteredParcels = parcels);
  }
  filterParcels(value: string): object[] {
    const filterValue = value?.toLowerCase() || '';
    return this.availableParcels.filter(parcel =>
      parcel['parcel_no'].toLowerCase().includes(filterValue)
    );
  }
  onCancel(): void {
    this.dialogRef.close();
  }

  toggleParcelSelection(parcel: any): void {
    if (!this.selectedParcel) {
      this.selectedParcel = parcel;
    }
    if (parcel.parcel_no == this.selectedParcel["parcel_no"]) return;
    this.selectedParcel = parcel;
    this.quantity = Math.min(this.quantity || 1, this.getConvertedStock(parcel));
  }
  isSelected(parcel: any): boolean {
    if(!this.selectedParcel) {
      return false;
    }
     const q=  parcel.parcel_no == this.selectedParcel["parcel_no"];
     return q;
  }
  increment(parcel: any) {
    const max = this.getConvertedStock(parcel);
    this.quantity = Math.min((this.quantity || 0) + 1, max);
  }

  decrement(parcel: any) {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  onQuantityInput(value: string): void {
    const max = this.selectedParcel ? this.getConvertedStock(this.selectedParcel) : Infinity;
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 1) {
      this.quantity = 1;
    } else if (parsed > max) {
      this.quantity = max;
    } else {
      this.quantity = parsed;
    }
  }

  onSave(): void {
    const selectedParcels = {
      parcel: this.selectedParcel,
      quantity: this.quantity,
    };

    this.dialogRef.close(selectedParcels);
  }

}
