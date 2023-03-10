import { Component, OnInit } from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { OptionStoreService } from '../../common/option-store.service';
import { OptionStore } from '../../common/option-store.model';
import {StoreService} from '../../store/store.service';

class ImageSnippet {
  constructor(public src: string, public file: File, public id: string) {
  }
}

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
    public storeSer: StoreService,
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
    'logo': 'Logo cửa hàng',
  };

  isLoadingResults = true;
  isRateLimitReached = false;

  optionStore_transaction_expenses_order: OptionStore;
  optionStore_transaction_expenses_transaction: OptionStore;
  optionStore_print_type: OptionStore; // print_type

  needToSaveLogo = false;
  selectedFiles: ImageSnippet[] = [];
  imageButtons = [
    {isShow: true}
  ];
  storeFeatures = [];

  ngOnInit(): void {
    this.settingsType = 'transaction';
    this.printType = 'K58';
    this.isLoadingResults = false;

    this.storeSer.getDetail().subscribe(res => {
      this.selectedFiles.push(new ImageSnippet(res['logo'], null, ''));
      this.imageButtons[0]['isShow'] = false;

      this.storeFeatures = res['features'];
    });

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

  processFile(imageInput) {
    const file: File = imageInput.files[0];
    const reader = new FileReader();

    reader.addEventListener('load', (event: any) => {
      this.selectedFiles.push(new ImageSnippet(event.target.result, file, ''));

      this.selectedFiles.forEach((value, index) => {
        this.imageButtons[index]['isShow'] = false;
      });
    });
    this.needToSaveLogo = true;
    reader.readAsDataURL(file);
  }

  reloadImageButtons() {
    this.imageButtons.forEach(img => {
      img.isShow = true;
    });
    this.selectedFiles.forEach((value, index) => {
      this.imageButtons[index]['isShow'] = false;
    });
  }

  removeSelectedImage(index) {
    const removeImage = this.selectedFiles[index];
    this.selectedFiles.splice(index, 1);
    if (removeImage['id'].length > 0) {
      // this.productSer.removeImage(this.product_id, removeImage['id']).subscribe(res => {
      //   this.notifySer.notify('warning', 'Đã xóa hình ảnh!');
        this.reloadImageButtons();
      // });
    } else {
      this.reloadImageButtons();
    }

  }

  saveLogo() {
    if (this.selectedFiles.length > 0) {
      /**
       * Upload product images
       */
      const formData = new FormData();

      formData.append('file', this.selectedFiles[0].file);

      this.storeSer.uploadLogo(formData).subscribe(res => {
        this.isLoadingResults = false;
        if (res['success'] === false) {
          this.notifySer.notify('error', 'Lưu không thành công!');
        } else {
          this.notifySer.notify('success', 'Lưu thành công!');
        }
        this.reloadImageButtons();
      });
    } else {
      this.isLoadingResults = false;
    }
  }

}
