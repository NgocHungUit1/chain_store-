import {Component, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Supplier} from '../supplier.model';
import {SupplierService} from '../supplier.service';
import {SupplierFormDialogComponent} from '../supplier-form-dialog/supplier-form-dialog.component';
import {NotifierService} from 'angular-notifier';


@Component({
  selector: 'app-supplier-tab-info',
  templateUrl: './supplier-tab-info.component.html',
  styleUrls: ['./supplier-tab-info.component.css']
})
export class SupplierTabInfoComponent implements OnInit {

  @Input() supplier: Supplier;

  constructor(
    private supplierSer: SupplierService,
    private dialog: MatDialog,
    private notifyService: NotifierService
  ) { }

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
      this.supplier.status = '10';
      this.notifyService.notify('success', 'Đã khóa thành công!');
    });
  }

  activate() {
    this.supplierSer.activate(this.supplier.id).subscribe(x => {
      this.supplier.status = '1';
      this.notifyService.notify('success', 'Đã kích hoạt thành công!');
    });
  }

}
