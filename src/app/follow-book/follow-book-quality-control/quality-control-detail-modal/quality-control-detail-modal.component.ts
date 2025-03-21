import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProductService } from '../../services/product.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-quality-control-detail-modal',
  templateUrl: './quality-control-detail-modal.component.html',
  styleUrls: ['./quality-control-detail-modal.component.scss']
})
export class QualityControlDetailModalComponent implements OnInit {
  detail: any;
  isLoading = true;
  displayedColumns = ['stt', 'product', 'lot', 'hsd', 'sl', 'reason', 'quality'];

  constructor(
    private dialogRef: MatDialogRef<QualityControlDetailModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private productService: ProductService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadDetail();
  }

  private loadDetail() {
    this.productService.getQualityCheckDetail(this.data.id).subscribe({
      next: (response) => {
        this.detail = response;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onExport(): void {
    this.productService.exportQualityCheck(this.data.id).subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/vnd.ms-excel' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `quality-check-${this.detail.no}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('Xuất file thành công', 'Đóng', {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      },
      error: () => {
        this.snackBar.open('Có lỗi xảy ra khi xuất file', 'Đóng', {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      }
    });
  }
}
