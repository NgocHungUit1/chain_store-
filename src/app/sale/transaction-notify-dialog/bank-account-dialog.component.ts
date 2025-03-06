import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-bank-account-dialog',
  templateUrl: './bank-account-dialog.component.html',
  styleUrls: ['./bank-account-dialog.component.scss']
})
export class TransactionNotifyDialogComponent {
  bankAccountForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TransactionNotifyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    console.log('Constructor called');
    console.log('Data received:', data);
  
    // Check if data is defined
    if (data) {
      console.log('Data exists');
    } else {
      console.log('Data is undefined or null');
      // Initialize empty data to prevent errors
      data = {};
    }
    this.bankAccountForm = this.fb.group({
      accountNumber: [data.accountNumber || '', [Validators.required]],
      bankName: [data.bankName || '', [Validators.required]],
      accountHolder: [data.accountHolder || '', [Validators.required]],
      phone: [data.phone || '']
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.bankAccountForm.valid) {
      this.dialogRef.close(this.bankAccountForm.value);
    }
  }
}