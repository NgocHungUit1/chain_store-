import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

/**
 * Hỏi số liều trước khi đẩy đơn thuốc mẫu vào hoá đơn.
 *
 * Nhân ở đây chứ không nhân sau khi đã thêm vào hoá đơn: order.service gộp dòng theo
 * product_id nên một thuốc vừa mua lẻ vừa nằm trong đơn mẫu sẽ dính làm một dòng,
 * lúc đó không tách ra để nhân riêng phần đơn mẫu được nữa.
 */
@Component({
  selector: 'app-sample-prescription-dose-dialog',
  templateUrl: './sample-prescription-dose-dialog.component.html',
})
export class SamplePrescriptionDoseDialogComponent implements OnInit {

  /** Số liều khách mua */
  doseCount = 1;

  /** Giá trọn gói của MỘT liều, do nhà thuốc đặt khi tạo đơn mẫu */
  packagePrice = 0;

  items: any[] = [];
  sampleName = '';

  /** Cho phép bán âm kho hay không, lấy theo cấu hình cửa hàng */
  canNegativeStock = false;

  constructor(
    public dialogRef: MatDialogRef<SamplePrescriptionDoseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    const sample = (this.data && this.data.sample) ? this.data.sample : {};
    this.items = (sample.items || []).filter(item => item.status === 10);
    this.packagePrice = Number(sample.total_amount) || 0;
    this.sampleName = this.data && this.data.sampleName ? this.data.sampleName : 'Đơn thuốc mẫu';
    this.canNegativeStock = !!(this.data && this.data.canNegativeStock);

    const initial = Number(this.data && this.data.initialDose);
    this.doseCount = (!initial || initial < 1) ? 1 : Math.floor(initial);
  }

  getDoseCount(): number {
    const n = Number(this.doseCount);
    return (isNaN(n) || n < 1) ? 1 : Math.floor(n);
  }

  onDoseChange(value) {
    const n = Number(value);
    this.doseCount = (isNaN(n) || n < 1) ? 1 : Math.floor(n);
  }

  changeDose(step: number) {
    const next = this.getDoseCount() + step;
    if (next < 1) { return; }
    this.doseCount = next;
  }

  /** Số lượng một liều, theo đúng đơn vị đã chọn lúc tạo đơn mẫu */
  getAmountPerDose(item): number {
    const n = Number(item.amount);
    return (isNaN(n) || n < 0) ? 0 : n;
  }

  /** Tổng số lượng phải xuất kho cho số liều đang chọn */
  getTotalAmount(item): number {
    return this.getAmountPerDose(item) * this.getDoseCount();
  }

  /**
   * Tồn kho quy về đơn vị đang bán. quantity_of_stock luôn tính theo đơn vị cơ bản,
   * nên phải chia cho hệ số quy đổi của đơn vị.
   */
  getStockInUnit(item): number {
    const stock = Number(item.quantity_of_stock) || 0;
    const unit = this.getSelectedUnit(item);
    const value = unit && Number(unit.value) > 0 ? Number(unit.value) : 1;
    return Math.floor(stock / value);
  }

  getSelectedUnit(item): any {
    if (!item || !item.productUnits || !item.productUnits.length) { return null; }
    const found = item.productUnits.find(u => u.id === item.product_unit_id);
    return found ? found : item.productUnits[0];
  }

  getUnitName(item): string {
    const unit = this.getSelectedUnit(item);
    return unit && unit.name ? unit.name : '';
  }

  /** Dòng này có bị thiếu hàng ở số liều đang chọn không */
  isNotEnough(item): boolean {
    if (this.canNegativeStock) { return false; }
    return this.getTotalAmount(item) > this.getStockInUnit(item);
  }

  /** Số liều tối đa bán được mà không âm kho */
  getMaxDose(): number {
    if (this.canNegativeStock || !this.items.length) { return 0; }
    let max = null;
    this.items.forEach(item => {
      const perDose = this.getAmountPerDose(item);
      if (perDose <= 0) { return; }
      const possible = Math.floor(this.getStockInUnit(item) / perDose);
      if (max === null || possible < max) { max = possible; }
    });
    return max === null ? 0 : max;
  }

  hasNotEnough(): boolean {
    return this.items.some(item => this.isNotEnough(item));
  }

  /** Tiền phải thu = giá trọn gói một liều nhân số liều */
  getTotalPrice(): number {
    return this.packagePrice * this.getDoseCount();
  }

  confirm() {
    this.dialogRef.close(this.getDoseCount());
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
