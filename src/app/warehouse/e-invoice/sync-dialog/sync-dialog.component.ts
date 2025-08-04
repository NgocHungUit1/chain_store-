import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { EInvoiceService } from '../e-invoice.service';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-sync-dialog',
  templateUrl: './sync-dialog.component.html',
  styleUrls: ['./sync-dialog.component.css']
})
export class SyncDialogComponent implements OnInit {
  syncForm: FormGroup;
  loading = false;
  endDateDisplay: string = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SyncDialogComponent>,
    private notifyService: NotifierService,
    private eInvoiceService: EInvoiceService
  ) {}

  ngOnInit() {
    this.syncForm = this.fb.group({
      Username: [null, [Validators.required]],
      Password: [null, [Validators.required]],
      FromInvoiceDate: [null, [Validators.required]]
    });

    // Lắng nghe sự thay đổi của ngày bắt đầu để tự động tính ngày kết thúc
    this.syncForm.get('FromInvoiceDate').valueChanges.subscribe(startDate => {
      if (startDate) {
        this.calculateEndDate(startDate);
      }
    });
  }

  calculateEndDate(startDate: Date) {
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    this.endDateDisplay = formatDate(endDate, 'dd/MM/yyyy', 'en-US');
  }

  onSubmit() {
    if (this.syncForm.invalid) {
      return;
    }

    const startDate = this.syncForm.value.FromInvoiceDate;
    if (!startDate) {
      this.notifyService.notify('error', 'Vui lòng chọn ngày bắt đầu');
      return;
    }

    // Tính ngày kết thúc (1 tháng sau)
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    this.loading = true;
    const formData = {
      Username: this.syncForm.value.Username,
      Password: this.syncForm.value.Password,
      FromInvoiceDate: formatDate(startDate, 'yyyy-MM-ddTHH:mm:ss', 'en-US'),
      ToInvoiceDate: formatDate(endDate, 'yyyy-MM-ddTHH:mm:ss', 'en-US')
    };

    this.eInvoiceService.syncInvoices(formData).subscribe({
      next: (response) => {
        this.notifyService.notify('success', 'Đồng bộ hóa đơn thành công');
        this.dialogRef.close(true);
        this.loading = false;
      },
      error: (error) => {
        console.error('Lỗi đồng bộ:', error);
        this.notifyService.notify('error', error.error?.message || 'Đồng bộ hóa đơn thất bại');
        this.loading = false;
      }
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
} 