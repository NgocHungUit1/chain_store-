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
      FromInvoiceDate: [null, [Validators.required]],
      ToInvoiceDate: [null, [Validators.required]]
    });
  }

  onSubmit() {
    if (this.syncForm.invalid) {
      return;
    }

    this.loading = true;
    const formData = {
      ...this.syncForm.value,
      FromInvoiceDate: formatDate(this.syncForm.value.FromInvoiceDate, 'yyyy-MM-ddTHH:mm:ss', 'en-US'),
      ToInvoiceDate: formatDate(this.syncForm.value.ToInvoiceDate, 'yyyy-MM-ddTHH:mm:ss', 'en-US')
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