import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProductService } from '../product.service';
import { ProductNationalCompareDialogComponent } from '../product-national-compare-dialog/product-national-compare-dialog.component';
import { ProductNationalUnitDialogComponent } from '../product-national-unit-dialog/product-national-unit-dialog.component';

interface ScanSummary {
  total: number;
  ready: number;
  blocked: number;
  not_required: number;
  /** Số thuốc vừa được gắn mã định danh trong lượt quét này */
  linked: number;
}

interface BlockedProduct {
  id: number;
  product_no: string;
  product_name: string;
  registration_no: string;
  unit: string;
  reasons: string[];
  /** Chặn vì đơn vị tính: sửa bằng khai quy đổi (1 Vỉ = 10 Viên) */
  unit_issue?: boolean;
  /** Đã sửa lại và kiểm tra lại: liên thông được */
  fixed?: boolean;
}

/**
 * Quét toàn bộ thuốc của cửa hàng xem liên thông được lên CSDL Dược quốc gia chưa,
 * liệt kê thuốc chưa được kèm lý do, và cho sửa ngay từng thuốc.
 *
 * Quét chỉ kiểm tra và gắn mã trong RX20, không gửi gì lên CSDL Dược.
 */
@Component({
  selector: 'app-product-national-scan-dialog',
  templateUrl: './product-national-scan-dialog.component.html',
  styleUrls: ['./product-national-scan-dialog.component.css']
})
export class ProductNationalScanDialogComponent implements OnInit {

  stage: 'running' | 'done' | 'error' = 'running';
  summary: ScanSummary = null;
  blocked: BlockedProduct[] = [];
  errorMessage: string = null;

  /** Có thuốc vừa được gắn mã hoặc sửa — để màn danh sách tải lại */
  changed = false;

  constructor(
    public dialogRef: MatDialogRef<ProductNationalScanDialogComponent>,
    private dialog: MatDialog,
    private productSer: ProductService,
  ) {
  }

  ngOnInit() {
    this.scan();
  }

  scan() {
    this.stage = 'running';
    this.dialogRef.disableClose = true;

    this.productSer.nationalScan().subscribe(res => {
      this.dialogRef.disableClose = false;
      this.summary = res['summary'];
      this.blocked = res['blocked'] || [];
      this.stage = 'done';
      if (this.summary && this.summary.linked > 0) {
        this.changed = true;
      }
    }, error => {
      this.dialogRef.disableClose = false;
      this.errorMessage = error?.error?.message || 'Không quét được, vui lòng thử lại.';
      this.stage = 'error';
    });
  }

  /** Mở hộp thoại so sánh với thuốc quốc gia, có thay đổi thì kiểm tra lại riêng thuốc đó */
  edit(item: BlockedProduct) {
    const dialogRef = this.dialog.open(ProductNationalCompareDialogComponent, {
      data: {product_id: item.id},
      width: '90%',
      maxWidth: '1500px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result?.changed) {
        return;
      }
      this.changed = true;
      this.recheck(item);
    });
  }

  private recheck(item: BlockedProduct) {
    this.productSer.getDetail(String(item.id), 'medicine,nationalPharmacyCheck').subscribe(product => {
      const check = product['nationalPharmacyCheck'] || {};
      const medicine = product['medicine'] || {};
      item.product_name = product['product_name'];
      item.registration_no = medicine['registration_no'];
      item.unit = product['base_unit'];
      item.reasons = check['reasons'] || [];
      item.fixed = check['status'] !== 'blocked';
    });
  }

  /** Số thuốc còn vướng đơn vị tính, chưa sửa */
  get unitIssueCount(): number {
    return this.blocked.filter(item => item.unit_issue && !item.fixed).length;
  }

  /** Khai quy đổi đơn vị cho nhiều thuốc một lượt, xong thì quét lại */
  openUnitDialog() {
    const dialogRef = this.dialog.open(ProductNationalUnitDialogComponent, {
      width: '95%',
      maxWidth: '1400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.changed) {
        this.changed = true;
        this.scan();
      }
    });
  }

  get remaining(): number {
    return this.blocked.filter(item => !item.fixed).length;
  }

  close() {
    this.dialogRef.close({changed: this.changed});
  }
}
