import {Component, EventEmitter, HostBinding, Input, OnInit, Output} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {ListComponentBase} from '../../../shared/base';
import {AuthService} from '../../../authentication/auth.service';
import {EmployeeFilter} from '../../../employee/employee.model';
import {EmployeeReportService} from '../../employee-report.service';
import {
  EmployeeReportInvoiceListDialogComponent
} from '../../employee-report-invoice-list-dialog/employee-report-invoice-list-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-employee-report-profit-tab',
  templateUrl: './employee-report-profit-tab.component.html',
  styleUrls: ['./employee-report-profit-tab.component.css']
})
export class EmployeeReportProfitTabComponent extends ListComponentBase implements OnInit {
  @HostBinding('class.dv-tab-page') layout = false;
  @Input() apiFilter: EmployeeFilter;

  constructor(
    private service: EmployeeReportService,
    private route: ActivatedRoute,
    private location: Location,
    private dialog: MatDialog,
    public authSer: AuthService) {
    super();

  }

  isLoadingResults = true;
  isRateLimitReached = false;

  columnsToDisplay = [
    'name',
    // 'district_name',
    // 'province_name',
    // 'address',
    'total_sale',
    'total_return',
    'total_revenue',
    'total_original_price',
    'total_profit',
  ];
  sumColumnsToDisplay = [
    'sum_total_sale',
    'sum_total_return',
    'sum_total_revenue',
    'sum_total_original_price',
    'sum_total_profit',
  ];
  columnsHeader = {
    'code': 'Mã',
    'name': 'Tên nhân viên',
    'total_original_price': 'Giá vốn',
    'total_profit': 'Lợi nhuận',
    'total_revenue': 'Doanh thu thuần',
    'total_sale': 'Doanh số',
    'total_return': 'Trả hàng',
    'address': 'Địa chỉ',
    'advanced_commission': 'Hoa hồng',
    'status': 'Trạng trái',
    'actions': 'Hành động',
  };

  sumData = {};

  ngOnInit() {
    this.loadData();
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.service.getListReportProfit(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      // this.groupData = res.body.groupData;
      // console.log(this.groupData);
      let stt = 0;
      this.dataSource.forEach(elementData => {
        stt++;
        elementData.stt = stt;
      });
      this.reloadFilter(res);

      this.service.getSummaryReportProfit(this.apiFilter).subscribe(res => {
        this.isLoadingResults = false;
        this.sumData = res.body;
      });

      let url = '/report/employee/profit';
      if (!this.apiFilter.page) {
        this.apiFilter.page = 1;
      }
      if (!this.apiFilter.pageSize) {
        this.apiFilter.pageSize = 20;
      }
      url += '?' + this.apiFilter.toFilterString();
      this.location.go(url);
    });
  }

  openInvoiceDialog(userId) {
    const filterData = {
      date_from: this.apiFilter.date_from,
      date_to: this.apiFilter.date_to,
    };

    const dialogRef = this.dialog.open(EmployeeReportInvoiceListDialogComponent, {
      width: '80%',
      minHeight: '80%',
      data: {
        created_by: userId,
        filterData: filterData,
        title: 'Danh sách hóa đơn',
        valueColumns: [
          'total_sale',
          'total_return',
          'total_revenue',
          'total_original_price',
          'total_profit'
        ]
      },
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

}
