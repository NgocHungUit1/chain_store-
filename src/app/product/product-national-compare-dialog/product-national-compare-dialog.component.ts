import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { ProductService } from '../product.service';
import { ProductMedicineDialogComponent } from '../product-medicine-dialog/product-medicine-dialog.component';
import {
  NationalDrugPickerDialogComponent
} from '../../common/national-pharmacy-v2/national-drug-picker-dialog/national-drug-picker-dialog.component';
import { NationalDrug } from '../../common/national-pharmacy-v2/national-pharmacy-v2.model';

/**
 * So sánh thuốc của nhà thuốc với thuốc trong danh mục CSDL Dược quốc gia, tìm và
 * gắn đúng thuốc quốc gia.
 *
 * Danh mục quốc gia tra ở modal riêng ({@link NationalDrugPickerDialogComponent}),
 * chọn xong chỉ đưa thuốc lên cột phải để so, CHƯA lưu gì: gắn sai thuốc là phiếu gửi
 * lên cổng bị sai vĩnh viễn (không có API xoá), nên phải để người dùng nhìn hai bên
 * rồi mới bấm "Dùng thuốc này".
 */
@Component({
  selector: 'app-product-national-compare-dialog',
  templateUrl: './product-national-compare-dialog.component.html',
  styleUrls: ['./product-national-compare-dialog.component.css']
})
export class ProductNationalCompareDialogComponent implements OnInit {

  loading = true;
  saving = false;
  errorMessage: string = null;

  product: any = null;
  check: { status: string, reasons: string[] } = null;
  /** Thuốc quốc gia đang gắn với sản phẩm */
  drug: NationalDrug = null;
  unitAccepted: boolean = null;

  /** Thuốc vừa chọn từ kết quả tìm, chưa lưu */
  preview: NationalDrug = null;

  /** Đổi tên đơn vị cơ bản sang đơn vị DQG nhận — chỉ đổi tên, không quy đổi */
  renameUnit: string = null;
  renameConfirmed = false;

  /** Có lưu thay đổi — để màn gọi tải lại */
  changed = false;

  constructor(
    public dialogRef: MatDialogRef<ProductNationalCompareDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { product_id: number },
    private dialog: MatDialog,
    private productSer: ProductService,
    private notifySer: NotifierService,
  ) {
  }

  ngOnInit() {
    this.load();
  }

  private load() {
    this.loading = true;
    this.productSer.nationalCompare(this.data.product_id).subscribe(res => {
      this.applyCompare(res);
      this.loading = false;
    }, error => {
      this.loading = false;
      this.errorMessage = error?.error?.message || 'Không tải được thông tin sản phẩm.';
    });
  }

  private applyCompare(res) {
    this.product = res['product'];
    this.check = res['check'];
    this.drug = res['drug'];
    this.unitAccepted = res['unit_accepted'];
  }

  /**
   * Mở modal danh mục thuốc quốc gia. Điền sẵn tên thuốc của nhà thuốc để đa số
   * trường hợp thuốc đúng hiện ngay, chọn xong chỉ đưa lên cột phải để so, chưa lưu.
   */
  openPicker() {
    const dialogRef = this.dialog.open(NationalDrugPickerDialogComponent, {
      data: {
        multiple: false,
        initialQuery: this.product?.product_name,
        currentDrugId: this.drug ? this.drug.national_drug_id : null,
        confirmLabel: 'Chọn thuốc này để so sánh',
      },
      width: '90%',
      maxWidth: '1400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      const drug = result?.drugs?.length ? result.drugs[0] : null;
      if (!drug) {
        return;
      }
      this.preview = drug;
      this.resetRename();
    });
  }

  cancelPreview() {
    this.preview = null;
    this.resetRename();
  }

  private resetRename() {
    this.renameUnit = null;
    this.renameConfirmed = false;
  }

  /** Thuốc hiện ở cột phải: thuốc vừa chọn, không có thì thuốc đang khớp */
  get shown(): NationalDrug {
    return this.preview || this.drug;
  }

  get isPreview(): boolean {
    return !!this.preview;
  }

  /** So tên đơn vị bỏ dấu, bỏ hoa thường — gần đúng với cách backend so */
  private norm(value: string): string {
    return (value || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
  }

  /**
   * Đơn vị cơ bản có nằm trong đơn vị thuốc bên phải nhận không.
   * null = thuốc chưa có quy cách đóng gói, không kết luận được.
   */
  get baseUnitOk(): boolean {
    const drug = this.shown;
    if (!drug || !this.product) {
      return null;
    }
    if (!this.isPreview && this.unitAccepted !== null) {
      return this.unitAccepted;
    }
    if (!drug.units || drug.units.length === 0) {
      return null;
    }
    const base = this.norm(this.product.base_unit);
    return drug.units.some(unit => this.norm(unit) === base);
  }

  /** Số đăng ký của nhà thuốc có khớp thuốc bên phải không */
  get registrationOk(): boolean {
    const drug = this.shown;
    const reg = this.product?.medicine?.registration_no;
    if (!drug || !reg) {
      return false;
    }
    return this.norm(reg) === this.norm(drug.registration_no)
      || this.norm(reg) === this.norm(drug.national_old_registration_no);
  }

  get canApply(): boolean {
    if (this.saving || !this.shown) {
      return false;
    }
    if (this.renameUnit && !this.renameConfirmed) {
      return false;
    }
    // Không chọn thuốc mới và không đổi đơn vị thì không có gì để lưu
    return this.isPreview || !!this.renameUnit;
  }

  apply() {
    if (!this.canApply) {
      return;
    }
    const body: { national_drug_id: string, base_unit_name?: string } = {
      national_drug_id: this.shown.national_drug_id,
    };
    if (this.renameUnit) {
      body.base_unit_name = this.renameUnit;
    }

    this.saving = true;
    this.productSer.nationalApply(this.product.id, body).subscribe(res => {
      this.saving = false;
      if (!res['success']) {
        this.notifySer.notify('error', res['message'] || 'Không lưu được.');
        return;
      }
      this.changed = true;
      this.applyCompare(res);
      this.preview = null;
      this.resetRename();

      if (this.check.status === 'ready') {
        this.notifySer.notify('success', 'Đã gắn thuốc quốc gia, thuốc liên thông được.');
      } else {
        this.notifySer.notify('warning', 'Đã gắn thuốc quốc gia nhưng vẫn chưa liên thông được, xem lý do phía trên.');
      }
    }, error => {
      this.saving = false;
      this.notifySer.notify('error', error?.error?.message || 'Không lưu được.');
    });
  }

  /** Mở form sửa thuốc đầy đủ cho những gì hộp thoại này không sửa */
  openFullForm() {
    const dialogRef = this.dialog.open(ProductMedicineDialogComponent, {
      data: {
        action: 'Update',
        title: 'Cập nhật thuốc',
        product_id: this.product.id,
        copy_product_id: null,
      },
      width: '60%',
      minWidth: '750px',
      minHeight: '80%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.event === 'Save') {
        this.changed = true;
        this.preview = null;
        this.resetRename();
        this.load();
      }
    });
  }

  close() {
    this.dialogRef.close({changed: this.changed});
  }
}
