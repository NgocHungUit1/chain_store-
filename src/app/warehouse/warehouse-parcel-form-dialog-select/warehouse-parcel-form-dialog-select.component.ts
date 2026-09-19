import {Component, Inject, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";
import { NewParcel} from "../warehouse-import-form/warehouse-import-form.component";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {debounceTime, map, startWith} from "rxjs/operators";


interface ParcelSelectionData {
  product_id: string;
  selectedParcels: NewParcel[];
}
@Component({
  selector: 'app-warehouse-parcel-form-dialog-select',
  templateUrl: './warehouse-parcel-form-dialog-select.component.html',
  styleUrls: ['./warehouse-parcel-form-dialog-select.component.css']
})
export class WarehouseParcelFormDialogSelectComponent implements OnInit {

  searchControl = new FormControl('');
  filteredParcels: object[] = [];
  availableParcels: object[] = [];

  constructor(
    public dialogRef: MatDialogRef<WarehouseParcelFormDialogSelectComponent>,
    @Inject(MAT_DIALOG_DATA) public data: object
  ) {
    this.availableParcels = data['selectedParcels'];
  }


  get selectedLotCount(): number {
    return (this.availableParcels || []).filter(p => Number(p['quantity']) > 0).length;
  }

  get totalParcelQty(): number {
    return (this.availableParcels || []).reduce((sum, p) => sum + (Number(p['quantity']) || 0), 0);
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

  // isSelected(parcel: AvailableParcel): boolean {
  //   return this.data.selectedParcels.some(p => p.parcel_no === parcel.parcel_no);
  // }

  onCancel(): void {
    this.dialogRef.close();
  }

  toggleParcelSelection(parcel: any): void {
    if (parcel.quantity > 0) {
      // If already selected, reset quantity
      parcel.quantity = null;
    } else {
      // If not selected, set quantity to 1
      parcel.quantity = 1;
    }
  }

  isSelected(parcel: any): boolean {
    return parcel.quantity > 0;
  }
  increment(parcel: any) {
    parcel.quantity = (parcel.quantity || 0) + 1;
  }

  decrement(parcel: any) {
    if (parcel.quantity > 0) {
      parcel.quantity--;
    }
  }
  onSave(): void {
    // Lấy từ toàn bộ danh sách chứ không phải danh sách đang lọc theo ô tìm kiếm,
    // nếu không lô đã chọn mà đang bị ẩn bởi ô tìm sẽ bị mất khi bấm Ok.
    const selectedParcels = this.availableParcels
      .filter(p => p['quantity'] > 0)
      .map(p => ({
        parcel_no: p['parcel_no'],
        expiration_date: p['expiration_date'],
        quantity: p['quantity'],
        inventory: p['quantity_of_stock'],
      }));

    this.dialogRef.close(selectedParcels);
  }
}
