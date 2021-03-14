import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {NotifierService} from 'angular-notifier';
import {MatTable} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {PaySheetService} from '../pay-sheet.service';
import {PaySheet} from '../pay-sheet.model';
import moment from 'moment';
import {PaySlipFormMainSalaryComponent} from '../pay-slip-form-main-salary/pay-slip-form-main-salary.component';
import {PaySlipService} from '../../pay-slip/pay-slip.service';

@Component({
  selector: 'app-pay-sheet-form-detail',
  templateUrl: './pay-sheet-form-detail.component.html',
  styleUrls: ['./pay-sheet-form-detail.component.css']
})
export class PaySheetFormDetailComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private notifySer: NotifierService,
    private paySheetService: PaySheetService,
    private paySlipService: PaySlipService,
  ) {
    this.id = this.route.snapshot.paramMap.get('id');
  }

  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  id = null;
  paySheet: PaySheet = null;

  columnsHeader = {
    '#': '#',
    'employee': 'Nhân viên',
    'salary_type': 'Loại lương',
    'main_salary': 'Lương chính',
    'reward': 'Thưởng',
    'total_need_pay_salary': 'Còn cần trả',
  };

  displayedColumns: string[] = [
    '#',
    'employee',
    'salary_type',
    'main_salary',
    'reward',
    'total_need_pay_salary',
  ];
  paySlipDataSource = [];

  isLoadingResults = false;
  isRateLimitReached = false;

  salaryPeriods: any[] = [
    {
      'id': 1,
      'title': 'Hàng tháng'
    },
    // {
    //   'id': 2,
    //   'title': '2 lần 1 tháng'
    // },
    // {
    //   'id': 3,
    //   'title': 'Hàng tuần'
    // },
    // {
    //   'id': 4,
    //   'title': '2 tuần 1 lần'
    // },
    // {
    //   'id': 5,
    //   'title': '2 Tủy chọn'
    // }
  ];

  salaryTypes: any[] = [
    {
      'id': 1,
      'title': 'Theo ca làm việc'
    },
    // {
    //   'id': 2,
    //   'title': 'Theo giờ làm việc'
    // },
    {
      'id': 3,
      'title': 'Theo ngày làm việc'
    },
    {
      'id': 4,
      'title': 'Cố định'
    },
  ];



  form: FormGroup;

  ngOnInit() {
    const date = new FormControl(new Date());
    this.form = this.fb.group({
      name: [null, Validators.required],
      working_day_number: [null, Validators.required],
      salary_period: [null, Validators.required],
      salary_period_name: [null, Validators.required],
      status: [null, Validators.required],
      note: [null],
    });

    this.loadPaySheet();
  }

  loadPaySheet() {
    this.paySheetService.getDetail(this.id).subscribe(res => {
      this.paySheet = res;
      this.paySlipDataSource = this.paySheet.listPaySlip;
      this.form.patchValue({
        name: res['name'],
        salary_period: res['salary_period'],
        working_day_number: Number(res['working_day_number']),
        salary_period_name: moment(res['start_time']).format('DD/MM/YYYY') + ' - ' +  moment(res['end_time']).format('DD/MM/YYYY'),
        status: res['status'],
        note: res['note'],
      });

    });
  }

  submit(status: number) {
    if (this.form.valid) {
      const data = this.form.getRawValue();
      data['status'] = status;
      this.paySheetService.update(this.id, data).subscribe(res => {
        this.notifySer.notify('success', 'Cập nhật thành công.');
        if (status === 9) {
          this.paySheet = res;
        } else {
          this.router.navigate(['/partner/pay-sheet/']);
        }
      });
    }
  }

  getNameSalaryType(type) {
    if (!type) {
      return '';
    }
    const salaryType = this.salaryTypes.find(item => item.id === type);
    if (salaryType) {
      return salaryType.title;
    }
    return '';
  }

  paySlipMainSalaryForm(paySlip) {
    if (this.paySheet.status !== 9) {
      this.notifySer.notify('error', 'Bảng lương đã chốt hoặc đã hủy. Không thể cập nhật lương !!!');
      return;
    }
    if (paySlip['salary_type'] === 4) {
      this.notifySer.notify('warning', 'Không thể cập nhật lương cố định.');
      return;
    }
    const obj = {
      'paySlip': paySlip,
      'working_day_number': this.form.controls['working_day_number'].value
    };
    const dialogRef = this.dialog.open(PaySlipFormMainSalaryComponent, {
      data: obj,
      width: '60%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadPaySheet();
    });
  }

  updatePaySlip(paySlip) {
    if (this.paySheet.status !== 9) {
      return;
    }
    const data = {
      'reward': paySlip.reward,
      'total_net_salary': paySlip.main_salary + paySlip.reward,
    };

    this.paySlipService.update(paySlip.id, data).subscribe(res => {
      this.notifySer.notify('success', 'Cập nhật thanh toán lương thành công!');
      paySlip.total_net_salary = res.total_net_salary;
    }, (error) => {
      this.notifySer.notify('error', 'Lỗi bất thường xảy ra.');
    });
  }

}
