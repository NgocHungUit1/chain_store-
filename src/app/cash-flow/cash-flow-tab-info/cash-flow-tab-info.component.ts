import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import { Branch } from '../../branch/branch.model';
import { CashFlow } from '../cash-flow.model';
import { BranchFormDialogComponent } from '../../branch/branch-form-dialog/branch-form-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CashFlowReceiptDialogComponent } from '../cash-flow-receipt-dialog/cash-flow-receipt-dialog.component';
import { CashFlowPaymentDialogComponent } from '../cash-flow-payment-dialog/cash-flow-payment-dialog.component';
import { CashFlowService } from '../cash-flow.service';
import { NotifierService } from 'angular-notifier';
import {PopupDeleteDialogComponent} from '../../common/popup-delete-dialog/popup-delete-dialog.component';
import {InvoiceFilter} from '../../invoice/invoice.model';
import {InvoiceService} from '../../invoice/invoice.service';

@Component({
  selector: 'app-cash-flow-tab-info',
  templateUrl: './cash-flow-tab-info.component.html',
  styleUrls: ['./cash-flow-tab-info.component.css']
})
export class CashFlowTabInfoComponent implements OnChanges {

  @Output() reload: EventEmitter<any> = new EventEmitter();
  @Input() expandedElement: boolean;

  typeHeader = {
    'receipt': 'Phiếu thu',
    'payment': 'Phiếu chi',
  };

  doi_tuong_nop_label = {
    'customer': 'Khách hàng',
    'employee': 'Nhân viên',
    'supplier': 'Nhà cung cấp',
    'orther': 'Khác',
  };

  typeMoneyHeader = {
    'money': 'Tiền mặt',
    'bank': 'Ngân hàng',
  };

  parentTableHeader = {
    'payment': 'thanh toán hóa đơn',
    'warehouse': 'nhập hàng'
  };

  @Input() cashFlow: CashFlow;

  isLoadingResults = false;
  invoiceData = {};

  constructor(
    private dialog: MatDialog,
    public notifySer: NotifierService,
    public invoiceService: InvoiceService,
    public cashFlowService: CashFlowService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.expandedElement) {
      this.loadData();
    }
  }

  loadData() {
    let ids = [];
    this.cashFlow.items.forEach((item, index) => {
      ids.push(item.invoice_id);
    });

    const invoiceFilter = new InvoiceFilter();
    invoiceFilter.id = ids.join(',');
    invoiceFilter.pageSize = 200;
    this.isLoadingResults = true;

    this.invoiceService.getList(invoiceFilter).subscribe(res => {
      this.isLoadingResults = false;

      let data = [];

      res.body.forEach( (item, index) => {
        data[item.id] = item;
      });

      this.invoiceData = data;
    });
  }

  openCashFlowReceiptDialog() {
    if (this.cashFlow.type === 'receipt') {
      const obj = {
        action: 'Update',
        id: this.cashFlow.id,
      };

      const dialogRef = this.dialog.open(CashFlowReceiptDialogComponent, {
        data: obj,
        width: '60%',
        minHeight: '70%',
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.cashFlow = result.data;
        }
      });
    } else {
      const obj = {
        action: 'Update',
        id: this.cashFlow.id,
      };

      const dialogRef = this.dialog.open(CashFlowPaymentDialogComponent, {
        data: obj,
        width: '60%',
        minHeight: '70%',
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.cashFlow = result.data;
        }
      });
    }
  }

  clickDelete() {

    if (this.cashFlow.parent_id !== null && this.cashFlow.parent_id !== undefined) {

      const obj = {
        action: 'Delete',
        title: 'Xóa Phiếu đã được liên kết với hóa đơn !',
        content: 'Bạn có chắc chắn muốn phiếu đã được liên kết với hóa đơn ' + this.cashFlow.code + ' này không?',
      };
      const dialogRef = this.dialog.open(PopupDeleteDialogComponent, {
        data: obj,
        width: '30%',
        minHeight: '80%',
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result?.event === 'delete') {
          this.cashFlowService.delete(this.cashFlow.id).subscribe(res => {
            if (res === true) {
              this.notifySer.notify('success', 'Xóa thành công!');
              this.reload.emit(null);
            }
          });
        }
      });

      // this.notifySer.notify('success', 'Phiếu đã được liên kết với hóa đơn !');
    } else {
      this.cashFlowService.delete(this.cashFlow.id).subscribe(result => {
        if (result === true) {
          this.notifySer.notify('success', 'Xóa thành công!');
          this.reload.emit(null);
        }
      });
    }

  }

}
