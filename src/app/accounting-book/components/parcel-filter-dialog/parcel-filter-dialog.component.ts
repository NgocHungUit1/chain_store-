import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AccountingBookService } from '../../services/accounting-book.service';

export interface Parcel {
  parcel_no: string;
  quantity: number;
  exp_date?: string;
  original_price: number;
}

@Component({
  selector: 'app-parcel-filter-dialog',
  templateUrl: './parcel-filter-dialog.component.html',
  styleUrls: ['./parcel-filter-dialog.component.scss']
})
export class ParcelFilterDialogComponent implements OnInit {
  parcelList: Parcel[] = [];
  isLoading = false;
  selectedParcel: Parcel | null = null;

  constructor(
    public dialogRef: MatDialogRef<ParcelFilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { productId: number, currentParcel: Parcel | null },
    private accountingBookService: AccountingBookService
  ) {
    if (data && data.currentParcel) {
      this.selectedParcel = data.currentParcel;
    }
  }

  ngOnInit(): void {
    this.loadParcels();
  }

  loadParcels(): void {
    this.isLoading = true;
    this.accountingBookService.getParcelsByProduct(this.data.productId).subscribe({
      next: (response: any) => {
        // API returns array of parcel data
        const parcelData = Array.isArray(response) ? response : [response];

        this.parcelList = parcelData.map((item: any) => ({
          parcel_no: item.parcel_no,
          quantity: item.quantity_of_stock,
          exp_date: item.expiration_date,
          original_price: item.product?.original_price || 0
        }));

        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading parcels:', error);
        this.isLoading = false;
      }
    });
  }

  selectParcel(parcel: Parcel): void {
    this.selectedParcel = parcel;
  }

  onConfirm(): void {
    if (this.selectedParcel) {
      this.dialogRef.close(this.selectedParcel);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
