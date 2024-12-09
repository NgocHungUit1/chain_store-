import {Component, EventEmitter, HostBinding, Input, OnInit, Output} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {ListComponentBase} from '../../../shared/base';
import {AuthService} from '../../../authentication/auth.service';
import {EmployeeFilter} from '../../../employee/employee.model';
import {EmployeeReportService} from '../../employee-report.service';


@Component({
  selector: 'app-employee-report-revenue-tab',
  templateUrl: './employee-report-revenue-tab.component.html',
  styleUrls: ['./employee-report-revenue-tab.component.css']
})
export class EmployeeReportRevenueTabComponent extends ListComponentBase implements OnInit {
  @HostBinding('class.dv-tab-page') layout = false;
  @Input() apiFilter: EmployeeFilter;

  constructor(
    private service: EmployeeReportService,
    private route: ActivatedRoute,
    private location: Location,
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
  ];
  sumColumnsToDisplay = [
    'sum_total_sale',
    'sum_total_return',
    'sum_total_revenue',
  ];
  columnsHeader = {
    'code': 'Mã',
    'name': 'Tên nhân viên',
    // 'agent_name': 'Đại lý',
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
    this.service.getListReportRevenue(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      // this.groupData = res.body.groupData;
      // console.log(this.groupData);
      let stt = 0;
      this.dataSource.forEach(elementData => {
        stt++;
        elementData.stt = stt;
      });
      this.reloadFilter(res);

      this.service.getSummaryReportRevenue(this.apiFilter).subscribe(res => {
        this.isLoadingResults = false;
        this.sumData = res.body;
      });

      let url = '/report/employee/revenue';
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

}
