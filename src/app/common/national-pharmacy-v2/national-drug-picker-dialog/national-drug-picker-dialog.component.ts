import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NationalPharmacyV2Service } from '../national-pharmacy-v2.service';
import { NationalDrug, NationalDrugPickerData } from '../national-pharmacy-v2.model';

/**
 * Modal tra danh mục thuốc CSDL Dược quốc gia, tick chọn thuốc.
 *
 * Dùng chung cho mọi chỗ cần lấy thuốc từ danh mục quốc gia: gắn mã cho sản phẩm
 * (chọn một), và sau này nhập tồn đầu / nhập hàng lấy nhiều thuốc một lượt
 * (`multiple: true`).
 *
 * Tách ra làm modal riêng thay vì nhét vào màn gọi: danh mục hơn 50 nghìn thuốc,
 * bảng kết quả nhiều cột, để chung một màn với dữ liệu của nhà thuốc thì rối.
 */
@Component({
  selector: 'app-national-drug-picker-dialog',
  templateUrl: './national-drug-picker-dialog.component.html',
  styleUrls: ['./national-drug-picker-dialog.component.css']
})
export class NationalDrugPickerDialogComponent implements OnInit, OnDestroy {

  searchControl = new FormControl('');
  searching = false;
  results: NationalDrug[] = [];
  total = 0;
  page = 1;
  pageSize = 20;
  /** Tìm cả tên không ra gì thì bỏ dần từ cuối rồi tìm lại, báo cho người dùng biết */
  fallbackNote: string = null;

  /** Thuốc đã tick, giữ theo mã nên chuyển trang vẫn còn */
  selected: NationalDrug[] = [];

  private sub: Subscription;

  constructor(
    public dialogRef: MatDialogRef<NationalDrugPickerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NationalDrugPickerData,
    private service: NationalPharmacyV2Service,
  ) {
    this.data = this.data || {};
  }

  ngOnInit() {
    if (this.data.initialQuery) {
      this.searchControl.setValue(this.data.initialQuery, {emitEvent: false});
    }
    this.search(1, true);

    this.sub = this.searchControl.valueChanges.pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(() => this.search(1, false));
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  get multiple(): boolean {
    return !!this.data.multiple;
  }

  get title(): string {
    return this.data.title || 'Danh mục thuốc Dược Quốc gia';
  }

  get confirmLabel(): string {
    if (this.data.confirmLabel) {
      return this.data.confirmLabel;
    }
    if (!this.multiple) {
      return 'Chọn thuốc này';
    }
    return this.selected.length > 0 ? 'Chọn ' + this.selected.length + ' thuốc' : 'Chọn thuốc';
  }

  search(page = 1, allowFallback = false, originalQuery: string = null) {
    const q = (this.searchControl.value || '').trim();
    this.searching = true;
    this.page = page;
    if (!allowFallback) {
      this.fallbackNote = null;
    }

    this.service.searchDrugs(q, page).subscribe(res => {
      this.searching = false;
      this.results = res.items || [];
      this.total = res.total || 0;
      this.pageSize = res.page_size || 20;

      // Tên nhà thuốc hay kèm hãng/hàm lượng ở cuối ("L cystine Medisun") nên không
      // ra gì: bỏ dần từ cuối rồi tìm lại. Không lùi về một chữ quá ngắn như "L" —
      // khớp gần như cả danh mục, vô dụng.
      const words = q.split(/\s+/).filter(w => w.length > 0);
      if (allowFallback && this.total === 0 && words.length > 1) {
        const shorter = words.slice(0, -1).join(' ');
        if (shorter.replace(/[\s\-.,()]/g, '').length >= 3) {
          const original = originalQuery || q;
          this.searchControl.setValue(shorter, {emitEvent: false});
          this.search(1, true, original);
          this.fallbackNote = 'Không thấy thuốc nào khớp "' + original + '", đang tìm theo "' + shorter + '".';
        }
      }
    }, () => {
      this.searching = false;
      this.results = [];
      this.total = 0;
    });
  }

  /** Bấm nút Tìm hoặc Enter: tìm ngay, không chờ gõ xong */
  searchNow() {
    this.search(1, false);
  }

  get pageCount(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  isChecked(item: NationalDrug): boolean {
    return this.selected.some(drug => drug.national_drug_id === item.national_drug_id);
  }

  isCurrent(item: NationalDrug): boolean {
    return !!this.data.currentDrugId && this.data.currentDrugId === item.national_drug_id;
  }

  toggle(item: NationalDrug, checked: boolean) {
    if (!this.multiple) {
      // Chọn một: tick thuốc này thì bỏ tick thuốc trước đó
      this.selected = checked ? [item] : [];
      return;
    }
    this.selected = checked
      ? this.selected.concat([item])
      : this.selected.filter(drug => drug.national_drug_id !== item.national_drug_id);
  }

  /** Bấm cả dòng cũng tick, khỏi phải nhắm đúng ô vuông */
  toggleRow(item: NationalDrug) {
    this.toggle(item, !this.isChecked(item));
  }

  clearSelection() {
    this.selected = [];
  }

  confirm() {
    if (this.selected.length === 0) {
      return;
    }
    this.dialogRef.close({drugs: this.selected});
  }

  close() {
    this.dialogRef.close();
  }
}
