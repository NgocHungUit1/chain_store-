import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Supplier } from '../supplier.model';
import { SupplierService } from '../supplier.service';
import { SupplierFormDialogComponent } from '../supplier-form-dialog/supplier-form-dialog.component';
import { NotifierService } from 'angular-notifier';
import {BaseComponent} from '../../shared/base';
import {AuthService} from '../../authentication/auth.service';
import {PopupConfirmDialogComponent} from '../../common/popup-confirm-dialog/popup-confirm-dialog.component';


@Component({
  selector: 'app-supplier-tab-info',
  templateUrl: './supplier-tab-info.component.html',
  styleUrls: ['./supplier-tab-info.component.css']
})
export class SupplierTabInfoComponent extends BaseComponent implements OnInit {

  @Input() supplier: Supplier;
  @Output() reload: EventEmitter<any> = new EventEmitter();

  constructor(
    private supplierSer: SupplierService,
    private dialog: MatDialog,
    private notifyService: NotifierService,
    public authSer: AuthService
  ) {
    super(authSer);
  }

  ngOnInit(): void {
    //
  }

  loadSupplier(id) {
    this.supplierSer.getDetail(id, 'province,district,ward').subscribe(res => {
      this.supplier = res;
    });
  }

  openSupplierFormDialog(id) {
    const obj = {
      action: 'Update',
      title: 'Cập nhật nhà cung cấp',
      supplier_id: id,
    };

    const dialogRef = this.dialog.open(SupplierFormDialogComponent, {
      data: obj,
      width: '60%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSupplier(result.id);
      }
    });
  }

  lock() {
    this.supplierSer.lock(this.supplier.id).subscribe(x => {
      this.supplier.status = '9';
      this.notifyService.notify('success', 'Đã khóa thành công!');
    });
  }

  activate() {
    this.supplierSer.activate(this.supplier.id).subscribe(x => {
      this.supplier.status = '10';
      this.notifyService.notify('success', 'Đã kích hoạt thành công!');
    });
  }

  clickDelete() {
    const obj = {
      action: 'Connect',
      title: 'Xác nhận xóa nhà cung cấp?',
      content: '',
    };

    const dialogRef = this.dialog.open(PopupConfirmDialogComponent, {
      data: obj,
      width: '30%',
      minHeight: '60%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.event === 'confirm') {
        this.supplierSer.delete(this.supplier.id).subscribe(res => {
          if (res?.success === true) {
            this.notifyService.notify('success', res?.message);
            this.reload.emit(null);
          } else {
            this.notifyService.notify('warning', res?.message);
          }
        });
      }
    });
  }

}
