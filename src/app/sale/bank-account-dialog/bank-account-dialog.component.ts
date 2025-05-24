import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BankAccount } from '../../bank-account/bank-account.model';
import { BankAccountService } from '../../bank-account/bank-account.service';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-bank-account-dialog',
  templateUrl: './bank-account-dialog.component.html',
  styleUrls: ['./bank-account-dialog.component.scss']
})
export class BankAccountDialogComponent {
  bankAccountForm: FormGroup;
  bankCodes: string[] = [];
  bankCodesObj = {};
    constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<BankAccountDialogComponent>,
    private bankAccountService: BankAccountService,
    private notifySer: NotifierService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.bankAccountForm = this.fb.group({
      account_number: ['', [Validators.required]],
      bank_code: ['', [Validators.required]],
      account_name: ['', [Validators.required]],
      note: ['']
    });
  }

  ngOnInit(): void {
    this.bankCodesObj = BankAccount.getBankCodes();
    this.bankCodes = Object.keys(this.bankCodesObj)
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.bankAccountForm.valid) {
      const data = this.bankAccountForm.value;
      this.bankAccountService.create(data).subscribe(res => {
        this.notifySer.notify('success', 'Thêm tài khoản ngân hàng thành công!');
        this.dialogRef.close(res);
      });
      this.dialogRef.close(this.bankAccountForm.value);
    }
  }
}