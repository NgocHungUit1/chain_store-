import { Component, Input, OnInit } from '@angular/core';
import { Branch } from '../../branch/branch.model';
import { CashFlow } from '../cash-flow.model';
import { BranchFormDialogComponent } from '../../branch/branch-form-dialog/branch-form-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CashFlowReceiptDialogComponent } from '../cash-flow-receipt-dialog/cash-flow-receipt-dialog.component';
import { CashFlowPaymentDialogComponent } from '../cash-flow-payment-dialog/cash-flow-payment-dialog.component';
import { CashFlowService } from '../cash-flow.service';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-cash-flow-tab-info',
  templateUrl: './cash-flow-tab-info.component.html',
  styleUrls: ['./cash-flow-tab-info.component.css']
})
export class CashFlowTabInfoComponent implements OnInit {

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

  constructor(
    private dialog: MatDialog,
    public notifySer: NotifierService,
    public cashFlowService: CashFlowService,
  ) {
  }

  ngOnInit(): void {
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
      this.notifySer.notify('success', 'Phiếu đã được liên kết với hóa đơn !');
    } else {
      this.cashFlowService.delete(this.cashFlow.id).subscribe(result => {
        if (result === true) {
          this.notifySer.notify('success', 'Xóa thành công!');
        }
      });
    }

  }

}
