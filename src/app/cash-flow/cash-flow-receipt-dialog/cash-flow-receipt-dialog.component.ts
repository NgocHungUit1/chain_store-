import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-cash-flow-receipt-dialog',
  templateUrl: './cash-flow-receipt-dialog.component.html',
  styleUrls: ['./cash-flow-receipt-dialog.component.css']
})
export class CashFlowReceiptDialogComponent implements OnInit {

  form: FormGroup;
  loading = false;
  local_data: any;

  constructor(
    public dialogRef: MatDialogRef<CashFlowReceiptDialogComponent>,
    public notifySer: NotifierService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {

    this.local_data = { ...data };

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  initForm() {
    this.form = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(50)]],
      status: [10, Validators.required],
    });
  }

  ngOnInit(): void {
    this.initForm();


  }

  submit() {
    if (this.form.valid) {

    }
  }


}
