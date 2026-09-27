import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { ProductService } from '../product.service';

interface UnitRow {
  id: number;
  product_no: string;
  product_name: string;
  base_unit: string;
  packing: string;
  accepted_units: string[];
  national_unit_name: string;
  national_unit_factor: number;
  suggested_unit: string;
  suggested_factor: number;
  status: string;
  reasons: string[];

  /** Giá trị đang sửa trên màn hình */
  unit: string;
  factor: number;
  /** Tick = lưu dòng này */
  checked: boolean;
  /** Ô hệ số đang lấy theo gợi ý, chưa ai sửa — tô màu để người dùng soát */
  fromSuggestion: boolean;
  /** Kết quả sau khi lưu */
  saved?: boolean;
  error?: string;
}

/**
 * Khai quy đổi đơn vị khi liên thông CSDL Dược quốc gia, nhiều thuốc một lượt.
 *
 * Dành cho thuốc lấy Vỉ/Hộp/Chai làm đơn vị cơ bản trong khi CSDL Dược chỉ nhận
 * Viên...: khai "1 Vỉ = 10 Viên" thì lúc gửi phiếu số lượng nhân 10, đơn giá chia 10.
 * Tồn kho, giá bán trong RX20 giữ nguyên.
 *
 * Hệ số được đoán sẵn từ quy cách đóng gói, dòng đoán được thì tick sẵn; người dùng
 * soát lại, bỏ tick dòng nghi ngờ rồi lưu.
 */
@Component({
  selector: 'app-product-national-unit-dialog',
  templateUrl: './product-national-unit-dialog.component.html',
  styleUrls: ['./product-national-unit-dialog.component.css']
})
export class ProductNationalUnitDialogComponent implements OnInit {

  loading = true;
  saving = false;
  errorMessage: string = null;
  rows: UnitRow[] = [];

  /** Chỉ hiện thuốc chưa khai quy đổi */
  onlyPending = true;
  keyword = '';

  changed = false;

  constructor(
    public dialogRef: MatDialogRef<ProductNationalUnitDialogComponent>,
    private productSer: ProductService,
    private notifySer: NotifierService,
  ) {
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.errorMessage = null;
    this.productSer.nationalUnits().subscribe(res => {
      this.loading = false;
      this.rows = (res['items'] || []).map(item => this.toRow(item));
    }, error => {
      this.loading = false;
      this.errorMessage = error?.error?.message || 'Không tải được danh sách thuốc.';
    });
  }

  private toRow(item): UnitRow {
    const declared = !!item.national_unit_name && item.national_unit_factor > 0;
    return {
      ...item,
      unit: declared ? item.national_unit_name : (item.suggested_unit || null),
      factor: declared ? item.national_unit_factor : (item.suggested_factor || null),
      // Đoán được từ quy cách thì tick sẵn, tô màu để người dùng soát trước khi lưu
      checked: !declared && !!item.suggested_unit && !!item.suggested_factor,
      fromSuggestion: !declared && !!item.suggested_factor,
    } as UnitRow;
  }

  isDeclared(row: UnitRow): boolean {
    return !!row.national_unit_name && row.national_unit_factor > 0;
  }

  get visibleRows(): UnitRow[] {
    const keyword = (this.keyword || '').trim().toLowerCase();
    return this.rows.filter(row => {
      if (this.onlyPending && this.isDeclared(row) && !row.checked) {
        return false;
      }
      if (keyword && (row.product_name || '').toLowerCase().indexOf(keyword) === -1
        && (row.product_no || '').toLowerCase().indexOf(keyword) === -1) {
        return false;
      }
      return true;
    });
  }

  get pendingCount(): number {
    return this.rows.filter(row => !this.isDeclared(row)).length;
  }

  get checkedRows(): UnitRow[] {
    return this.rows.filter(row => row.checked);
  }

  canCheck(row: UnitRow): boolean {
    return !!row.unit && row.factor >= 1;
  }

  get allVisibleChecked(): boolean {
    const rows = this.visibleRows.filter(row => this.canCheck(row));
    return rows.length > 0 && rows.every(row => row.checked);
  }

  toggleAll(checked: boolean) {
    this.visibleRows.forEach(row => row.checked = checked && this.canCheck(row));
  }

  /** Người dùng sửa hệ số/đơn vị: bỏ màu "gợi ý", tự tick nếu đủ dữ liệu */
  onEdit(row: UnitRow) {
    row.fromSuggestion = false;
    row.saved = false;
    row.error = null;
    row.checked = this.canCheck(row);
  }

  save() {
    const rows = this.checkedRows.filter(row => this.canCheck(row));
    if (rows.length === 0 || this.saving) {
      return;
    }

    this.saving = true;
    this.productSer.nationalUnitsSave(rows.map(row => ({
      id: row.id,
      national_unit_name: row.unit,
      national_unit_factor: Number(row.factor),
    }))).subscribe(res => {
      this.saving = false;
      let ok = 0;
      (res['results'] || []).forEach(result => {
        const row = this.rows.find(item => item.id === result.id);
        if (!row) {
          return;
        }
        if (result.success) {
          ok++;
          row.saved = true;
          row.error = null;
          row.checked = false;
          row.fromSuggestion = false;
          row.national_unit_name = row.unit;
          row.national_unit_factor = Number(row.factor);
          row.status = result.status;
          row.reasons = result.reasons || [];
        } else {
          row.saved = false;
          row.error = result.message;
        }
      });

      if (ok > 0) {
        this.changed = true;
      }
      const failed = rows.length - ok;
      this.notifySer.notify(failed ? 'warning' : 'success',
        'Đã lưu quy đổi cho ' + ok + ' thuốc' + (failed ? ', ' + failed + ' thuốc lỗi (xem dòng tô đỏ).' : '.'));
    }, error => {
      this.saving = false;
      this.notifySer.notify('error', error?.error?.message || 'Không lưu được, vui lòng thử lại.');
    });
  }

  /** Bỏ quy đổi đã khai của một thuốc */
  clear(row: UnitRow) {
    this.saving = true;
    this.productSer.nationalUnitsSave([{id: row.id, national_unit_name: '', national_unit_factor: 0}]).subscribe(res => {
      this.saving = false;
      const result = (res['results'] || [])[0];
      if (result?.success) {
        this.changed = true;
        row.national_unit_name = null;
        row.national_unit_factor = null;
        row.unit = row.suggested_unit || null;
        row.factor = row.suggested_factor || null;
        row.fromSuggestion = !!row.suggested_factor;
        row.saved = false;
        row.status = result.status;
        row.reasons = result.reasons || [];
      }
    }, () => this.saving = false);
  }

  close() {
    this.dialogRef.close({changed: this.changed});
  }
}
