import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {Observable, of} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {ProductService} from '../../../product/product.service';
import {MedicineRecallService} from '../../services/medicine-recall.service';
import {MedicineRecallFormDialogComponent} from '../medicine-recall-form-dialog/medicine-recall-form-dialog.component';

/**
 * Tra cứu thu hồi theo lô: chọn thuốc + số lô -> còn tồn ở chi nhánh nào, đã bán cho ai.
 * Từ kết quả có thể xuất Excel danh sách khách để liên hệ, hoặc tạo dòng sổ thu hồi điền sẵn.
 */
@Component({
  selector: 'app-lot-trace-dialog',
  templateUrl: './lot-trace-dialog.component.html',
  styleUrls: ['./lot-trace-dialog.component.scss']
})
export class LotTraceDialogComponent implements OnInit {
  productCtrl = new FormControl('');
  products$: Observable<any[]>;
  product: any = null;
  lots: any[] = [];
  parcelNo = '';
  result: any = null;
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<LotTraceDialogComponent>,
    private dialog: MatDialog,
    private productService: ProductService,
    private recallService: MedicineRecallService,
    private notify: NotifierService,
  ) {
  }

  ngOnInit(): void {
    this.products$ = this.productCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => (typeof term === 'string' && term.trim().length >= 2)
        ? this.productService.autocomplete(term.trim()) as Observable<any[]>
        : of([]))
    );
  }

  displayProduct(p: any): string {
    return p && typeof p === 'object' ? `${p.product_no} - ${p.product_name}` : (p || '');
  }

  onSelectProduct(p: any) {
    this.product = p;
    this.parcelNo = '';
    this.result = null;
    this.lots = [];
    this.recallService.getTraceLots(p.id).subscribe(res => this.lots = res || []);
  }

  search() {
    if (!this.product || !this.parcelNo) {
      this.notify.notify('warning', 'Chọn thuốc và số lô cần tra cứu');
      return;
    }
    this.loading = true;
    this.recallService.trace(this.product.id, this.parcelNo).subscribe(res => {
      this.result = res;
      this.loading = false;
    }, err => {
      this.loading = false;
      this.notify.notify('error', err?.error?.message || 'Không tra cứu được');
    });
  }

  exportExcel() {
    this.recallService.traceExport(this.product.id, this.parcelNo).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `truy-vet-lo-${this.parcelNo}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    }, () => this.notify.notify('error', 'Không xuất được file'));
  }

  /** Mở form sổ thu hồi, điền sẵn thuốc, lô, số đã bán và danh sách khách */
  createRecall() {
    const r = this.result;
    const customers = (r.sales || [])
      .filter(s => s.customer_name)
      .map(s => `${s.customer_name}${s.customer_phone ? ' (' + s.customer_phone + ')' : ''}`);
    const lot = this.lots.find(l => l.parcel_no === this.parcelNo);
    const ref = this.dialog.open(MedicineRecallFormDialogComponent, {
      width: '800px',
      data: {
        isEdit: false,
        medicine_name: r.product?.product_name,
        batch_number: this.parcelNo + (lot?.expiration_date ? ', HD ' + lot.expiration_date : ''),
        manufacturer: r.product?.manufacturer || '',
        units_sold: r.total_sold,
        returned_amount: r.total_returned,
        quantity: r.total_stock,
        customer_info: Array.from(new Set(customers)).join('; '),
      }
    });
    ref.afterClosed().subscribe(saved => {
      if (saved) {
        this.dialogRef.close(true);
      }
    });
  }

  close() {
    this.dialogRef.close(false);
  }
}
