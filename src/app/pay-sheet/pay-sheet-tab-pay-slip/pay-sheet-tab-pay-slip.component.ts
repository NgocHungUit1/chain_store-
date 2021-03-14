import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {PaySheet} from '../pay-sheet.model';
import {MatTable} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {PaySheetService} from '../pay-sheet.service';
import {MatDialog} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {PaySlipSalaryComponent} from '../pay-slip-salary/pay-slip-salary.component';
import {formatNumber} from '@angular/common';

@Component({
  selector: 'app-pay-sheet-tab-pay-slip',
  templateUrl: './pay-sheet-tab-pay-slip.component.html',
  styleUrls: ['./pay-sheet-tab-pay-slip.component.css']
})
export class PaySheetTabPaySlipComponent implements OnInit {

  @Input() paySheet: PaySheet;
  @ViewChild(MatTable, {static: true}) table: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = false;
  isRateLimitReached = false;

  dataSource = [];
  columnsHeader = {
    'employee': 'Tên nhân viên',
    'total_salary': 'Tổng lương',
    'total_payment_salary': 'Đã trả',
    'total_need_pay_salary': 'Cần trả',
    'actions': 'Hành động',
  };

  displayedColumns: string[] = [
    'employee',
    'total_salary',
    'total_payment_salary',
    'total_need_pay_salary',
    'actions',
  ];

  constructor(
    private paySheetService: PaySheetService,
    private dialog: MatDialog,
    private notifyService: NotifierService,
  ) {
  }

  ngOnInit(): void {
    this.dataSource = this.paySheet.listPaySlip.filter(item => item['status'] !== 0);
  }


  loadPaySheet() {
    this.paySheetService.getDetail(this.paySheet.id.toString()).subscribe(res => {
      this.dataSource = res.listPaySlip.filter(item => item['status'] !== 0);
    });
  }

  checkNotFinalPaySheet() {
    return this.dataSource.filter(item => item['status'] === 9).length > 0;
  }

  paySheetSalary(paySheet = null) {
    let obj;
    if (paySheet) {
      obj = {
        'paySlipList': [paySheet]
      };
    } else {
      obj = {
        'paySlipList': this.dataSource.filter(item => item['status'] === 9),
      };
    }
    const dialogRef = this.dialog.open(PaySlipSalaryComponent, {
      data: obj,
      width: '60%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadPaySheet();
    });
  }

  printPaySlipEmployee(paySlip) {
    const needToPaySalary = paySlip.total_net_salary - paySlip.total_payment;

    let textSalary = '';
    let totalSalary = 0;
    let textTitleTotalSalary = '';
    const mainSalary = JSON.parse(paySlip.salary_detail) ? JSON.parse(paySlip.salary_detail)?.mainSalary : [];

    switch (paySlip.salary_type) {
      case 1: // theo ca
        textTitleTotalSalary = 'Ca làm việc thực tế:';
        mainSalary.forEach((item, index) => {
          if (item.shifts_id != null && index !== 0 && item.total_apply > 0) {
            textSalary += ', ';
          }
          if (item.total_apply > 0) {
            textSalary +=  this.formatNumberPaySlip(item.salary) + '/ ca';
            totalSalary += item.total_apply;
          }
        });
        break;
      case 2: // theo giờ
        break;
      case 3:
        textTitleTotalSalary = 'Ngày làm việc thực tế:';
        textSalary = this.formatNumberPaySlip(mainSalary[0].salary) + '/ ' + mainSalary[0].total + ' ngày';
        totalSalary = mainSalary[0].total_apply;
        break;
      case 4:
        textSalary = this.formatNumberPaySlip(paySlip.main_salary) + '/ ' + 'tháng';
        break;

    }

    let content = '<style>\n' +
      'td {\n' +
      '\tpadding: 8px;\n' +
      '}\n' +
      '</style>\n' +
      '<table style="border-collapse: collapse; width: 100%; ">\n' +
      '<tbody>\n' +
      '<tr>\n' +
      '  <td style="width: 50%; border: none;">' + this.paySheet.branch?.name + '</td>\n' +
      '  <td style="width: 50%; text-align: right; border: none;">\n' +
       this.paySheet.branch?.fullAddress +
      '  </td>\n' +
      '</tr>\n' +
      '</tbody>\n' +
      '</table>\n' +
      '<p style="text-align: center;">&nbsp;</p>\n' +
      '<p style="text-align: center;"><b><span style="font-size: 16pt;">PHIẾU LƯƠNG NHÂN VIÊN</span></b></p>\n' +
      '<p style="text-align: center;"><b>' + this.paySheet.name + '</b></p>\n' +
      '<p>&nbsp;</p>\n' +
      '<table style="border-collapse: collapse; width: 100%; ">\n' +
      '  <tbody>\n' +
      '  <tr>\n' +
      '    <td style="width: 25%; border: none;">Nhân viên:</td>\n' +
      '    <td style="width: 75%; border: none;">' + paySlip.employee?.name + '</td>\n' +
      '  </tr>\n' +
      '  <tr>\n' +
      '    <td style="width: 25%; border: none;">Chức vụ:</td>\n' +
      '    <td style="width: 75%; border: none;"></td>\n' +
      '  </tr>\n' +
      '  <tr>\n' +
      '    <td style="width: 25%; border: none;">Mức lương:</td>\n' +
      '    <td style="width: 75%; border: none;">' + textSalary + '</td>\n' +
      '  </tr>\n';
      if (paySlip.salary_type === 1 || paySlip.salary_type === 3) {
        content += '  <tr>\n' +
          '    <td style="width: 25%; border: none;">' + textTitleTotalSalary + '</td>\n' +
          '    <td style="width: 75%; border: none;">' + totalSalary + '</td>\n' +
          '  </tr>\n';
      }

      content += '  </tbody>\n' +
      '</table>\n' +
      '<p>&nbsp;</p>\n' +
      '<table style="border-collapse: collapse; width: 100%; border-color: #dddddd !important; border-style: solid;" border="1">\n' +
      '  <tbody>\n' +
      '  <tr>\n' +
      '    <td style="width: 50%;"><strong>I. Các khoản thu nhập</strong></td>\n' +
      '    <td style="width: 50%; text-align: right;">&nbsp;</td>\n' +
      '  </tr>\n' +
      '  <tr>\n' +
      '    <td style="width: 50%;">Lương chính:</td>\n' +
      '    <td style="width: 50%; text-align: right;">' + this.formatNumberPaySlip(paySlip.main_salary) + '</td>\n' +
      '  </tr>\n' +
      '  <tr>\n' +
      '    <td style="width: 50%;">Thưởng:</td>\n' +
      '    <td style="width: 50%; text-align: right;">' + this.formatNumberPaySlip(paySlip.reward) + '</td>\n' +
      '  </tr>\n' +
      '  <tr>\n' +
      '    <td style="width: 50%;"><strong>II. Tổng lương</strong></td>\n' +
      '    <td style="width: 50%; text-align: right;"><strong>' +  this.formatNumberPaySlip(paySlip.total_net_salary) + '</strong></td>\n' +
      '  </tr>\n' +
      '  <tr>\n' +
      '    <td style="width: 50%;"><strong>III. Thanh toán lương</strong></td>\n' +
      '    <td style="width: 50%; text-align: right;">&nbsp;</td>\n' +
      '  </tr>\n' +
      '  <tr>\n' +
      '    <td style="width: 50%;">Đã trả nhân viên:</td>\n' +
      '    <td style="width: 50%; text-align: right;">' + this.formatNumberPaySlip(paySlip.total_payment) + '</td>\n' +
      '  </tr>\n' +
      '  <tr>\n' +
      '    <td style="width: 50%;">Còn cần trả:</td>\n' +
      '    <td style="width: 50%; text-align: right;">' + this.formatNumberPaySlip(needToPaySalary) + '</td>\n' +
      '  </tr>\n' +
      '  </tbody>\n' +
      '</table>\n' +
      '<p>&nbsp;</p>\n' +
      '<div>\n' +
      '  <p style="text-align: right;">&nbsp;</p>\n' +
      '  <table style="border-collapse: collapse; width: 100%;">\n' +
      '    <tbody>\n' +
      '    <tr>\n' +
      '      <td style="width: 50%; text-align: center; border: none;">\n' +
      '        <p>&nbsp;</p>\n' +
      '        <p style="line-height: 0.8;"><strong>Nhân viên</strong></p>\n' +
      '        <p style="line-height: 0.8;">(Ký, họ tên)</p>\n' +
      '      </td>\n' +
      '      <td style="width: 50%; text-align: center; border: none;">\n' +
      '        <p>.......................,ngày ..... tháng ..... năm ........</p>\n' +
      '        <p style="line-height: 0.8;"><strong>Người lập phiếu</strong></p>\n' +
      '        <p style="line-height: 0.8;">(Ký, họ tên)</p>\n' +
      '      </td>\n' +
      '    </tr>\n' +
      '    </tbody>\n' +
      '  </table>\n' +
      '</div>\n';

    const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
    WindowPrt.document.write(content);
    WindowPrt.document.close();
    WindowPrt.focus();
    WindowPrt.print();
    WindowPrt.close();
  }

  formatNumberPaySlip(value) {
    return formatNumber(Number(value), 'en-US', '1.0-0');
  }

}
