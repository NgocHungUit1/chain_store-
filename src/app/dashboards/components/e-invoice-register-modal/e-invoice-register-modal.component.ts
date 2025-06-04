import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EInvoiceService } from '../../services/e-invoice.service';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-e-invoice-register-modal',
  templateUrl: './e-invoice-register-modal.component.html',
  styleUrls: ['./e-invoice-register-modal.component.scss']
})
export class EInvoiceRegisterModalComponent implements OnInit {
  registerForm: FormGroup;
  isSubmitting = false;

  constructor(
    public dialogRef: MatDialogRef<EInvoiceRegisterModalComponent>,
    private fb: FormBuilder,
    private eInvoiceService: EInvoiceService,
    private notifier: NotifierService
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      store_name: ['', Validators.required],
      tax_code: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.isSubmitting = true;
    this.eInvoiceService.registerEInvoice(this.registerForm.value).subscribe({
      next: (response) => {
        this.notifier.notify('success', 'Đăng ký thành công!');
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.notifier.notify('error', 'Có lỗi xảy ra, vui lòng thử lại!');
        this.isSubmitting = false;
      }
    });
  }
}
