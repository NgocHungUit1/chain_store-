import {Component, EventEmitter, HostBinding, Input, OnInit, Output} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {ListComponentBase} from '../../../shared/base';
import {AuthService} from '../../../authentication/auth.service';
import * as moment from 'moment';
import {EmployeeFilter} from '../../../employee/employee.model';
import {EmployeeService} from '../../../employee/employee.service';


@Component({
  selector: 'app-employee-report-commission-tab',
  templateUrl: './employee-report-commission-tab.component.html',
  styleUrls: ['./employee-report-commission-tab.component.css']
})
export class EmployeeReportCommissionTabComponent extends ListComponentBase implements OnInit {
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
    'commission_amount',
  ];
  columnsHeader = {
    'code': 'Mã',
    'name': 'Tên nhân viên',
    // 'agent_name': 'Đại lý',
    'profit_amount': 'Lợi nhuận',
    'address': 'Địa chỉ',
    'commission_amount': 'Hoa hồng',
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

      let url = '/report/employee/commission';
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
