import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { BankAccountService } from '../bank-account.service';
import {BankAccount} from '../bank-account.model';
import {BankAccountFormDialogComponent} from '../bank-account-form-dialog/bank-account-form-dialog.component';

@Component({
  selector: 'app-bank-account-tab-info',
  templateUrl: './bank-account-tab-info.component.html',
  styleUrls: ['./bank-account-tab-info.component.css']
})
export class BankAccountTabInfoComponent implements OnInit {

  @Input() model: BankAccount;

  bankCodesObj = {
  };

  constructor(
    private modelService: BankAccountService,
    private dialog: MatDialog,
    private notifyService: NotifierService
  ) { }

  ngOnInit(): void {

    this.bankCodesObj = BankAccount.getBankCodes();
  }

  loadDoctor(id) {
    this.modelService.getDetail(id).subscribe(res => {
      this.model = res;
    });
  }

  openFormDialog(id) {
    const obj = {
      action: 'Update',
      title: 'Cập nhật tài khoản',
      id: id,
    };

    const dialogRef = this.dialog.open(BankAccountFormDialogComponent, {
      data: obj,
      width: '60%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDoctor(result.id);
      }
    });
  }

  lock() {
    this.modelService.lock(this.model.id).subscribe(x => {
      this.model.status = '9';
      this.notifyService.notify('success', 'Đã khóa thành công!');
    });
  }

  activate() {
    this.modelService.activate(this.model.id).subscribe(x => {
      this.model.status = '10';
      this.notifyService.notify('success', 'Đã kích hoạt thành công!');
    });
  }

}
