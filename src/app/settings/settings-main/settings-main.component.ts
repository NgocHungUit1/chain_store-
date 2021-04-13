import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { OptionStoreService } from '../../common/option-store.service';
import { OptionStore } from '../../common/option-store.model';

@Component({
  selector: 'app-settings-main',
  templateUrl: './settings-main.component.html',
  styleUrls: ['./settings-main.component.css']
})
export class SettingsMainComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private notifySer: NotifierService,
    private fb: FormBuilder,
    public optionStoreService: OptionStoreService
  ) {
  }

  settingsType: string;

  printType: string;

  settingsTypeName = {
    'transaction': 'Giao dịch',
    'store': 'Hàng hóa',
    'partner': 'Đối tác',
    'print': 'Cài đặt khổ mẫu giấy in',
  };

  isLoadingResults = true;
  isRateLimitReached = false;

  optionStore_transaction_expenses_order: OptionStore;
  optionStore_transaction_expenses_transaction: OptionStore;
  optionStore_print_type: OptionStore; // print_type

  ngOnInit(): void {
    this.settingsType = 'transaction';
    this.printType = 'K58';
    this.isLoadingResults = false;

    this.optionStoreService.getValue('transaction_expenses_order').subscribe(res => {
      this.optionStore_transaction_expenses_order = res;
    });

    this.optionStoreService.getValue('transaction_expenses_transaction').subscribe(res => {
      this.optionStore_transaction_expenses_transaction = res;
    });

    this.optionStoreService.getValue('print_type').subscribe(res => {
      this.optionStore_print_type = res;
      this.printType = this.optionStore_print_type.value;
    });
  }

  changeSlideToggle(name: string) {

    if (name === 'transaction_expenses_order') {
      this.optionStore_transaction_expenses_order.value = (this.optionStore_transaction_expenses_order.value === 'no') ? 'yes' : 'no';
      this.optionStoreService.update(this.optionStore_transaction_expenses_order.id,
        this.optionStore_transaction_expenses_order).subscribe(res => {
        // console.log(res);
      });
    }
    if (name === 'transaction_expenses_transaction') {
      this.optionStore_transaction_expenses_transaction.value = (this.optionStore_transaction_expenses_transaction.value === 'no') ? 'yes' : 'no';
      this.optionStoreService.update(this.optionStore_transaction_expenses_transaction.id,
        this.optionStore_transaction_expenses_transaction).subscribe(res => {
        // console.log(res);
      });
    }
  }

  changePrintType() {
    // console.log(this.printType);
    this.optionStore_print_type.value = this.printType;
    this.optionStoreService.update(this.optionStore_print_type.id, this.optionStore_print_type).subscribe(res => {
      // console.log(res);
    });
  }

}
