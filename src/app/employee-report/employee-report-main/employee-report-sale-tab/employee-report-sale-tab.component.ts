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
import { GroupFilter } from '../../../product/group.model';
import { GroupService } from '../../../group/group.service';

@Component({
  selector: 'app-employee-report-sale-tab',
  templateUrl: './employee-report-sale-tab.component.html',
  styleUrls: ['./employee-report-sale-tab.component.css']
})
export class EmployeeReportSaleTabComponent extends ListComponentBase implements OnInit {
  @HostBinding('class.dv-tab-page') layout = false;
  @Input() apiFilter: EmployeeFilter;

  isLoadingResults = true;
  isRateLimitReached = false;

  columnsToDisplay = [
    'name',
    // 'province_name',
    // 'address',
    'total_sale_quantity',
    'total_sale',
    'total_return_quantity',
    'total_return',
    'total_revenue',
    'total_original_price',
    'total_profit',
  ];
  sumColumnsToDisplay = [
    'sum_total_sale_quantity',
    'sum_total_sale',
    'sum_total_return_quantity',
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
    'total_sale_quantity': 'Số lượng bán',
    'total_sale': 'Doanh số',
    'total_return_quantity': 'Số lượng trả',
    'total_return': 'Giá trị trả',
    'address': 'Địa chỉ',
    'advanced_commission': 'Hoa hồng',
    'status': 'Trạng trái',
    'actions': 'Hành động',
  };

  sumData = {};

  constructor(
    private service: EmployeeReportService,
    private route: ActivatedRoute,
    private location: Location,
    private dialog: MatDialog,
    private groupService: GroupService,
    public authSer: AuthService) {
    super();

  }

  ngOnInit() {
    this.loadData();
  }

  loadData(): void {
    this.isLoadingResults = true;
    console.log(this.apiFilter);
    this.service.getListReportSale(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      // this.groupData = res.body.groupData;
      // console.log(this.groupData);
      let stt = 0;
      this.dataSource.forEach(elementData => {
        stt++;
        elementData.stt = stt;
      });
      this.reloadFilter(res);

      this.service.getSummaryReportSale(this.apiFilter).subscribe(res => {
        this.isLoadingResults = false;
        this.sumData = res.body;
      });

      let url = '/report/employee/sale';
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
          'total_sale'
        ]
      },
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }
}
