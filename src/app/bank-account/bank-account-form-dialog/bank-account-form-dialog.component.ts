import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '../../location/location.model';
import { Observable } from 'rxjs/Observable';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { LocationService } from '../../location/location.service';
import { map, startWith } from 'rxjs/operators';
import * as moment from 'moment';
import { BankAccountService } from '../bank-account.service';
import { BranchFilter } from '../../branch/branch.model';
import { BranchService } from '../../branch/branch.service';
import {BankAccount} from '../bank-account.model';

class ImageSnippet {
  pending = false;
  status = 'init';

  constructor(public src: string, public file: File) {
  }
}


@Component({
  selector: 'app-bank-account-form-dialog',
  templateUrl: './bank-account-form-dialog.component.html',
  styleUrls: ['./bank-account-form-dialog.component.css']
})
export class BankAccountFormDialogComponent implements OnInit {

  form: FormGroup;
  loading = false;
  local_data: any;
  modelId: string;
  branchList: any;
  branchFilter: BranchFilter = new BranchFilter();

  bankCodesObj = {
  };
  bankCodes = [];

  selectedFile: ImageSnippet;
  url = '';

  constructor(
    public dialogRef: MatDialogRef<BankAccountFormDialogComponent>,
    public notifySer: NotifierService,
    public locationSer: LocationService,
    private fb: FormBuilder,
    private service: BankAccountService,
    private branchService: BranchService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {

    this.local_data = {...data};
    this.modelId = this.local_data.id;

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  initForm() {
    this.getListBranch();
    this.form = this.fb.group({
      account_number: [
        null,
        Validators.compose([
          Validators.required,
          Validators.maxLength(100)
        ])
      ],
      bank_code: [null, Validators.required],
      account_name: [null, Validators.required],
      note: [null],
    });
  }

  ngOnInit(): void {
    this.bankCodesObj = BankAccount.getBankCodes();
    this.bankCodes = Object.keys(this.bankCodesObj);
    this.initForm();

    if (this.modelId) {
      this.loadModel(this.modelId);
    }
  }

  getListBranch() {
    this.branchFilter.pageSize = 100;
    this.branchService.getList(this.branchFilter).subscribe(res => {
      this.branchList = res.body;
    });
  }

  loadModel(id) {
    this.service.getDetail(id).subscribe(data => {

      this.form.patchValue({
        account_number: data['account_number'],
        account_name: data['account_name'],
        bank_code: data['bank_code'],
        note: data['note'],
      });
    });
  }

  submit() {
    if (this.form.valid) {
      const data = this.form.getRawValue();

      if (this.modelId !== null && this.modelId !== undefined) {
        this.service.update(this.modelId, data).subscribe(res => {
          this.notifySer.notify('success', 'Cập nhật thành công!');
          this.dialogRef.close(res);
        });
      } else {
        this.service.create(data).subscribe(res => {
          this.notifySer.notify('success', 'Thêm thành công!');
          this.dialogRef.close(res);
        });
      }
    }
  }

}
