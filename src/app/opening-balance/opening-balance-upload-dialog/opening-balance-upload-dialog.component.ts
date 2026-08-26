import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { UserService } from '../../user/user.service';
import { OpeningBalanceService } from '../opening-balance.service';

/**
 * Popup nạp tồn đầu từ Excel — 4 bước: tải file mẫu, tải file lên, xem kết quả
 * kiểm tra, nạp dòng hợp lệ vào phiếu.
 *
 * API chỉ đọc và kiểm tra file, KHÔNG tạo phiếu. Người dùng xem lại trên lưới
 * rồi mới Lưu tạm / Hoàn thành.
 */
@Component({
  selector: 'app-opening-balance-upload-dialog',
  templateUrl: './opening-balance-upload-dialog.component.html',
  styleUrls: ['./opening-balance-upload-dialog.component.css'],
})
export class OpeningBalanceUploadDialogComponent implements OnInit {

  constructor(
    public service: OpeningBalanceService,
    public userService: UserService,
    public dialogRef: MatDialogRef<OpeningBalanceUploadDialogComponent>,
    public notifySer: NotifierService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
  }

  @ViewChild('fileInput') fileInput: any;

  /** 1: tải mẫu · 2: chọn file · 3: kết quả kiểm tra · 4: nạp vào phiếu */
  step = 2;
  steps = [
    {index: 1, label: 'Tải file mẫu'},
    {index: 2, label: 'Tải file lên'},
    {index: 3, label: 'Kiểm tra dữ liệu'},
    {index: 4, label: 'Nạp vào phiếu'},
  ];

  templateLink: string = null;
  selectedFile: File = null;
  submitted = false;

  branchList: any[] = [];
  branchId: any = null;
  closingDate: string = null;
  /** Mã hàng chưa có trong danh mục sẽ được tạo mới khi bật. */
  autoCreateProduct = true;

  summary: any = null;
  rows: any[] = [];

  ngOnInit(): void {
    this.templateLink = this.service.getDownloadTemplateLink();
    this.branchId = this.data && this.data.branch_id ? this.data.branch_id : null;
    this.closingDate = this.data && this.data.closing_date ? this.data.closing_date : null;

    this.userService.getStoreBranchList().subscribe(res => {
      this.branchList = (res.body as any) || [];
    });

    if (!this.branchId) {
      this.userService.getBranchLogin().subscribe(branchId => this.branchId = Number(branchId));
    }
  }

  inputChange(event) {
    this.selectedFile = event.target.files[0];
  }

  removeSelectedFile(fileInput) {
    this.selectedFile = null;
    this.summary = null;
    this.rows = [];
    this.step = 2;
    fileInput.value = '';
  }

  submit() {
    if (!this.branchId) {
      this.notifySer.notify('error', 'Vui lòng chọn chi nhánh.');
      return;
    }
    if (!this.selectedFile) {
      this.notifySer.notify('error', 'Vui lòng chọn file Excel.');
      return;
    }

    const payload = new FormData();
    payload.append('file', this.selectedFile);
    payload.append('branch_id', this.branchId);
    payload.append('auto_create_product', this.autoCreateProduct ? '1' : '0');
    if (this.closingDate) {
      payload.append('closing_date', this.closingDate);
    }

    this.submitted = true;

    this.service.upload(payload).subscribe(res => {
      this.submitted = false;
      this.summary = res.summary;
      this.rows = res.rows || [];
      this.step = 3;
    }, error => {
      this.submitted = false;
      const message = error && error.error && error.error.message
        ? error.error.message
        : 'Không đọc được file. Vui lòng dùng đúng file mẫu.';
      this.notifySer.notify('error', message);
    });
  }

  /** Số dòng sẽ được nạp: hợp lệ + cảnh báo. */
  get loadableCount(): number {
    return this.rows.filter(row => row.status !== 'error').length;
  }

  get errorRows(): any[] {
    return this.rows.filter(row => row.status === 'error');
  }

  messageText(row): string {
    return (row.messages || [])
      .filter(m => m.level !== 'info')
      .map(m => m.code + ' — ' + m.message)
      .join(' · ');
  }

  statusLabel(status: string): string {
    if (status === 'error') {
      return 'Lỗi';
    }
    if (status === 'warning') {
      return 'Cảnh báo';
    }
    return 'Hợp lệ';
  }

  /**
   * Xuất các dòng lỗi ra CSV để người dùng sửa rồi nạp lại. Dùng BOM để Excel
   * mở đúng tiếng Việt.
   */
  downloadErrorFile() {
    const header = ['Dòng', 'Mã hàng', 'Tên hàng', 'ĐVT', 'Số lô', 'Hạn dùng', 'Số lượng', 'Giá vốn', 'Lý do lỗi'];
    const lines = [header.join(',')];

    this.errorRows.forEach(row => {
      lines.push([
        row.row,
        this.csvCell(row.product_no),
        this.csvCell(row.product_name),
        this.csvCell(row.unit),
        this.csvCell(row.parcel_no),
        this.csvCell(row.expiration_date),
        row.quantity,
        row.price,
        this.csvCell(this.messageText(row)),
      ].join(','));
    });

    const blob = new Blob(['﻿' + lines.join('\n')], {type: 'text/csv;charset=utf-8;'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'dong-loi-ton-dau.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  csvCell(value): string {
    const text = (value === null || value === undefined) ? '' : String(value);
    return '"' + text.replace(/"/g, '""') + '"';
  }

  loadIntoForm() {
    const items = this.rows
      .filter(row => row.status !== 'error' && row.item)
      .map(row => row.item);

    if (items.length === 0) {
      this.notifySer.notify('error', 'Không có dòng nào hợp lệ để nạp.');
      return;
    }

    this.step = 4;
    this.dialogRef.close({items: items});
  }

  back() {
    this.step = 2;
    this.summary = null;
    this.rows = [];
  }
}
