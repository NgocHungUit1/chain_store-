import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-bank-account-dialog',
  templateUrl: './bank-account-dialog.component.html',
  styleUrls: ['./bank-account-dialog.component.scss']
})
export class BankAccountDialogComponent {
  bankAccountForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<BankAccountDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.bankAccountForm = this.fb.group({
      accountNumber: ['', [Validators.required]],
      bankName: ['', [Validators.required]],
      accountHolder: ['', [Validators.required]],
      note: ['']
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