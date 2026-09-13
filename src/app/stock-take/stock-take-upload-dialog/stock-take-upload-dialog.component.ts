import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { GroupService } from '../../group/group.service';
import { StockTakeService } from '../stock-take.service';

/**
 * Popup nạp kết quả kiểm kho từ Excel — cùng luồng với Import tồn đầu: tải file (mẫu trống
 * hoặc danh sách hàng đang tồn), tải lên, xem kết quả kiểm tra, nạp dòng hợp lệ vào phiếu.
 *
 * API chỉ đọc và kiểm tra file, KHÔNG tạo phiếu. Người dùng xem lại trên lưới rồi mới
 * Lưu tạm / Hoàn thành.
 */
@Component({
  selector: 'app-stock-take-upload-dialog',
  templateUrl: './stock-take-upload-dialog.component.html',
  styleUrls: ['./stock-take-upload-dialog.component.css'],
})
export class StockTakeUploadDialogComponent implements OnInit {

  constructor(
    public service: StockTakeService,
    private groupService: GroupService,
    public dialogRef: MatDialogRef<StockTakeUploadDialogComponent>,
    public notifySer: NotifierService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
  }

  /** 1: tải file · 2: chọn file · 3: kết quả kiểm tra · 4: nạp vào phiếu */
  step = 2;
  steps = [
    {index: 1, label: 'Tải file'},
    {index: 2, label: 'Tải file lên'},
    {index: 3, label: 'Kiểm tra dữ liệu'},
    {index: 4, label: 'Nạp vào phiếu'},
  ];

  templateLink: string = null;
  groups: any[] = [];
  groupIds: any[] = [];
  includeZero = false;

  selectedFile: File = null;
  submitted = false;

  summary: any = null;
  rows: any[] = [];

  ngOnInit(): void {
    this.templateLink = this.service.getDownloadTemplateLink();
    this.groupService.getListShort().subscribe(res => {
      this.groups = (res.body as any) || [];
    });
  }

  /** Tạo link lúc bấm để lấy đúng nhóm hàng / tuỳ chọn đang chọn. */
  downloadStock() {
    window.open(this.service.getDownloadStockLink(this.groupIds, this.includeZero), '_blank');
  }

  inputChange(event) {
    this.selectedFile = event.target.files[0] || null;
  }

  removeSelectedFile(fileInput) {
    this.selectedFile = null;
    this.summary = null;
    this.rows = [];
    this.step = 2;
    fileInput.value = '';
  }

  submit() {
    if (!this.selectedFile) {
      this.notifySer.notify('error', 'Vui lòng chọn file Excel.');
      return;
    }

    const payload = new FormData();
    payload.append('file', this.selectedFile);

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
    return (row.messages || []).map(m => m.message).join(' · ');
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

  /** Xuất các dòng lỗi ra CSV để sửa rồi nạp lại. BOM để Excel mở đúng tiếng Việt. */
  downloadErrorFile() {
    const header = ['Dòng', 'Mã hàng', 'Tên hàng', 'Số lô', 'Hạn dùng', 'Tồn hệ thống', 'Thực tế', 'Lý do lỗi'];
    const lines = [header.join(',')];

    this.errorRows.forEach(row => {
      lines.push([
        row.row,
        this.csvCell(row.product_no),
        this.csvCell(row.product_name),
        this.csvCell(row.parcel_no),
        this.csvCell(row.expiration_date),
        this.csvCell(row.system_stock),
        this.csvCell(row.actual),
        this.csvCell(this.messageText(row)),
      ].join(','));
    });

    const blob = new Blob(['﻿' + lines.join('\n')], {type: 'text/csv;charset=utf-8;'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'dong-loi-kiem-kho.csv';
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
