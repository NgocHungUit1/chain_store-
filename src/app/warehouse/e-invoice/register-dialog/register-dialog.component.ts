import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { EInvoiceService } from '../e-invoice.service';

@Component({
  selector: 'app-register-dialog',
  templateUrl: './register-dialog.component.html',
  styleUrls: ['./register-dialog.component.scss']
})
export class RegisterDialogComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RegisterDialogComponent>,
    private notifyService: NotifierService,
    private eInvoiceService: EInvoiceService
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      Username: ['', Validators.required],
      Password: ['', Validators.required],
      SyncFromDate: [null]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    const formData = this.registerForm.value;

    this.eInvoiceService.registerPartner(formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.notifyService.notify('success', 'Đăng ký thành công');
          this.dialogRef.close(true);
        } else {
          this.notifyService.notify('error', response.data?.message || 'Đăng ký thất bại');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Lỗi đăng ký:', error);
        const errorMessage = error.error?.data?.message || 'Đăng ký thất bại';
        this.notifyService.notify('error', errorMessage);
        this.loading = false;
      }
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
} 