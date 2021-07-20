import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '../../location/location.model';
import { Observable } from 'rxjs/Observable';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { LocationService } from '../../location/location.service';
import { BranchService } from '../../branch/branch.service';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-cash-flow-payment-dialog',
  templateUrl: './cash-flow-payment-dialog.component.html',
  styleUrls: ['./cash-flow-payment-dialog.component.css']
})
export class CashFlowPaymentDialogComponent implements OnInit {

  form: FormGroup;
  loading = false;
  local_data: any;

  constructor(
    public dialogRef: MatDialogRef<CashFlowPaymentDialogComponent>,
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
