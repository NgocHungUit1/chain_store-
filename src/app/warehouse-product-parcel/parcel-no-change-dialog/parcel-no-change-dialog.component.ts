import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { WarehouseProductParcelService } from '../warehouse-product-parcel.service';

/**
 * Đổi số lô của một lô hàng.
 *
 * Số lô được sao chép ra nhiều bảng (lô hàng, thẻ kho, hoá đơn bán, kiểm kho,
 * kiểm nghiệm) nên đổi là đụng vào lịch sử đã chốt. Vì vậy bắt buộc đi qua
 * hai bước: đếm trước cho người dùng xem, rồi mới cho xác nhận.
 */
@Component({
  selector: 'app-parcel-no-change-dialog',
  templateUrl: './parcel-no-change-dialog.component.html',
  styleUrls: ['./parcel-no-change-dialog.component.css'],
})
export class ParcelNoChangeDialogComponent implements OnInit {

  parcelId: string;
  oldParcelNo = '';
  newParcelNo = '';
  /** Số dòng đang hiện trong bảng có cùng số lô này (một lô nhập về nhiều lần) */
  soDongCungLo = 1;

  dangDem = false;
  dangLuu = false;
  loi: string = null;
  ketQuaDem: any = null;

  constructor(
    public dialogRef: MatDialogRef<ParcelNoChangeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private parcelSer: WarehouseProductParcelService,
    private notifySer: NotifierService,
  ) {
    this.parcelId = data['parcelId'];
    this.oldParcelNo = data['parcelNo'] || '';
    this.soDongCungLo = data['soDongCungLo'] || 1;
  }

  ngOnInit() {
    this.newParcelNo = this.oldParcelNo;
  }

  /** Gõ lại số lô thì bỏ kết quả đếm cũ, bắt đếm lại cho khỏi lệch */
  onNewParcelNoChange() {
    this.ketQuaDem = null;
    this.loi = null;
  }

  get hopLe(): boolean {
    const v = (this.newParcelNo || '').trim();
    return v !== '' && v !== this.oldParcelNo && v.length <= 32;
  }

  get coCanhBao(): boolean {
    return !!this.ketQuaDem
      && (this.ketQuaDem.hoa_don_da_lien_thong_dqg > 0 || this.ketQuaDem.hoa_don_da_xuat_hddt > 0);
  }

  demTacDong() {
    if (!this.hopLe || this.dangDem) {
      return;
    }
    this.dangDem = true;
    this.loi = null;
    this.parcelSer.previewUpdateParcelNo(this.parcelId, this.newParcelNo.trim()).subscribe(res => {
      this.dangDem = false;
      this.ketQuaDem = res;
    }, err => {
      this.dangDem = false;
      this.ketQuaDem = null;
      this.loi = (err && err.error && err.error.message) ? err.error.message : 'Không kiểm tra được, vui lòng thử lại.';
    });
  }

  xacNhan() {
    if (!this.ketQuaDem || this.dangLuu) {
      return;
    }
    this.dangLuu = true;
    this.parcelSer.updateParcelNo(this.parcelId, this.newParcelNo.trim()).subscribe(res => {
      this.dangLuu = false;
      if (res && res.success) {
        this.notifySer.notify('success', 'Đã đổi số lô thành ' + res.new_parcel_no);
        this.dialogRef.close(true);
      } else {
        this.loi = (res && res.message) ? res.message : 'Đổi số lô thất bại';
      }
    }, err => {
      this.dangLuu = false;
      this.loi = (err && err.error && err.error.message) ? err.error.message : 'Có lỗi xảy ra, vui lòng thử lại.';
    });
  }

  huy() {
    this.dialogRef.close(false);
  }
}
