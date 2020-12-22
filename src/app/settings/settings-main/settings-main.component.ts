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

  settingsTypeName = {
    'transaction': 'Giao dịch',
    'store': 'Hàng hóa',
    'partner': 'Đối tác'
  };

  isLoadingResults = true;
  isRateLimitReached = false;

  optionStore_transaction_expenses_order: OptionStore;

  ngOnInit(): void {
    this.settingsType = 'transaction';
    this.isLoadingResults = false;

    this.optionStoreService.getValue('transaction_expenses_order').subscribe(res => {
      // console.log(res);
      this.optionStore_transaction_expenses_order = res;
    });
  }

  changeSlideToggle(name: string) {

    if (name === 'transaction_expenses_order') {
      this.optionStore_transaction_expenses_order.value = (this.optionStore_transaction_expenses_order.value === 'no') ? 'yes' : 'no';
      this.optionStoreService.update(this.optionStore_transaction_expenses_order.id,
        this.optionStore_transaction_expenses_order).subscribe(res => {
        console.log(res);
      });
    }
  }

}
