import {Component, EventEmitter, HostBinding, Input, OnInit, Output} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {ListComponentBase} from '../../../shared/base';
import {AuthService} from '../../../authentication/auth.service';
import * as moment from 'moment';
import {EmployeeFilter} from '../../../employee/employee.model';
import {EmployeeService} from '../../../employee/employee.service';


@Component({
  selector: 'app-employee-report-revenue-tab',
  templateUrl: './employee-report-revenue-tab.component.html',
  styleUrls: ['./employee-report-revenue-tab.component.css']
})
export class EmployeeReportRevenueTabComponent extends ListComponentBase implements OnInit {
  @HostBinding('class.dv-tab-page') layout = false;
  @Input() apiFilter: EmployeeFilter;

  constructor(
    private service: EmployeeService,
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
    // 'phone_number',
    'revenue_amount',
  ];
  columnsHeader = {
    'code': 'Mã',
    'name': 'Tên nhân viên',
    // 'agent_name': 'Đại lý',
    'revenue_amount': 'Doanh thu',
    'address': 'Địa chỉ',
    'advanced_commission': 'Hoa hồng',
    'status': 'Trạng trái',
    'actions': 'Hành động',
  };

  ngOnInit() {
    this.loadData();
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.service.getList(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      // this.groupData = res.body.groupData;
      // console.log(this.groupData);
      let stt = 0;
      this.dataSource.forEach(elementData => {
        stt++;
        elementData.stt = stt;
      });
      this.reloadFilter(res);
      // const url = this.service.getApiUrlReportSale(this.apiFilter);
      this.isLoadingResults = false;

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
