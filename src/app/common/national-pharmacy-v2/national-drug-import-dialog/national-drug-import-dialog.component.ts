import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ProductService } from '../../../product/product.service';
import { NationalDrug } from '../national-pharmacy-v2.model';

interface ExistingProduct {
  id: number;
  product_no: string;
  product_name: string;
  base_unit: string;
  active: boolean;
  /** Khớp theo: drug = mã định danh, registration = số đăng ký, name = trùng tên */
  match: 'drug' | 'registration' | 'name';
}

interface ImportRow {
  drug: NationalDrug;
  existing: ExistingProduct[];
  /** id sản phẩm có sẵn được chọn, 'new' = tạo sản phẩm mới */
  choice: number | 'new';
  /** Đơn vị cơ bản khi tạo mới */
  baseUnit: string;
  error?: string;
}

/**
 * Bước xác nhận sau khi tick thuốc ở modal danh mục Dược Quốc gia, trước khi đưa vào
 * phiếu (nhập hàng, sau này nhập tồn đầu).
 *
 * Phiếu cần sản phẩm của nhà thuốc, còn modal trả về thuốc quốc gia: thuốc nào cửa
 * hàng đã có thì dùng sản phẩm đó, chưa có thì tạo sản phẩm mới khớp sẵn mã định danh.
 * Hiện rõ "đã có / sẽ tạo mới" để không tạo nhầm hàng loạt.
 *
 * Trả về {product_ids} theo đúng thứ tự thuốc đã chọn.
 */
@Component({
  selector: 'app-national-drug-import-dialog',
  templateUrl: './national-drug-import-dialog.component.html',
  styleUrls: ['./national-drug-import-dialog.component.css']
})
export class NationalDrugImportDialogComponent implements OnInit {

  loading = true;
  saving = false;
  errorMessage: string = null;
  rows: ImportRow[] = [];

  constructor(
    public dialogRef: MatDialogRef<NationalDrugImportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { drugs: NationalDrug[], confirmLabel?: string },
    private productSer: ProductService,
  ) {
  }

  ngOnInit() {
    const ids = (this.data.drugs || []).map(drug => drug.national_drug_id);
    this.productSer.nationalResolve(ids).subscribe(res => {
      this.loading = false;
      this.rows = (res['items'] || []).map(item => this.toRow(item));
    }, error => {
      this.loading = false;
      this.errorMessage = error?.error?.message || 'Không kiểm tra được thuốc đã chọn.';
    });
  }

  private toRow(item): ImportRow {
    const existing: ExistingProduct[] = item.existing || [];
    // Ưu tiên sản phẩm khớp mã định danh, rồi số đăng ký; trùng tên thì chỉ gợi ý
    const preferred = existing.find(p => p.match === 'drug' && p.active)
      || existing.find(p => p.match === 'drug')
      || existing.find(p => p.match === 'registration' && p.active)
      || existing.find(p => p.match === 'registration');

    return {
      drug: item.drug,
      existing,
      choice: preferred ? preferred.id : 'new',
      baseUnit: item.default_unit || (item.drug.units || [])[0] || null,
    };
  }

  matchLabel(product: ExistingProduct): string {
    switch (product.match) {
      case 'drug':
        return 'đã khớp DQG';
      case 'registration':
        return 'cùng số đăng ký';
      default:
        return 'trùng tên, chưa khớp DQG';
    }
  }

  get newCount(): number {
    return this.rows.filter(row => row.choice === 'new').length;
  }

  get existingCount(): number {
    return this.rows.length - this.newCount;
  }

  confirm() {
    if (this.saving || this.rows.length === 0) {
      return;
    }

    const toCreate = this.rows.filter(row => row.choice === 'new');
    const create$ = toCreate.length === 0 ? of({results: []}) : this.productSer.nationalCreate(
      toCreate.map(row => ({national_drug_id: row.drug.national_drug_id, base_unit: row.baseUnit}))
    );

    this.saving = true;
    create$.subscribe(res => {
      this.saving = false;
      const results = res['results'] || [];
      let failed = false;

      results.forEach(result => {
        const row = this.rows.find(r => r.drug.national_drug_id === result.national_drug_id);
        if (!row) {
          return;
        }
        if (result.success) {
          row.choice = result.product_id;
          row.error = null;
          // Để lần bấm lại (nếu có dòng lỗi) không tạo trùng
          const created: ExistingProduct = {
            id: result.product_id,
            product_no: '',
            product_name: result.product_name,
            base_unit: result.base_unit,
            active: true,
            match: 'drug',
          };
          row.existing = [created].concat(row.existing);
        } else {
          row.error = result.message;
          failed = true;
        }
      });

      if (failed) {
        return;
      }

      const productIds = this.rows.map(row => row.choice).filter(id => id !== 'new') as number[];
      this.dialogRef.close({product_ids: productIds, created: results.length});
    }, error => {
      this.saving = false;
      this.errorMessage = error?.error?.message || 'Không tạo được sản phẩm, vui lòng thử lại.';
    });
  }

  close() {
    this.dialogRef.close();
  }
}
