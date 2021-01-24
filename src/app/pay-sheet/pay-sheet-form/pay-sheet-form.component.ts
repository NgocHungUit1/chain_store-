import {Component, Inject, OnInit, Optional} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import * as moment from 'moment';
import {PaySheetService} from '../pay-sheet.service';

@Component({
  selector: 'app-pay-sheet-form',
  templateUrl: './pay-sheet-form.component.html',
  styleUrls: ['./pay-sheet-form.component.css']
})
export class PaySheetFormComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PaySheetFormComponent>,
    public notifySer: NotifierService,
    private fb: FormBuilder,
    private paySheetService: PaySheetService,
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {
    this.local_data = {...data};
  }
  form: FormGroup;
  loading = false;
  local_data: any;

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

  fromToDateList = [];

  ngOnInit(): void {
    this.initListDate();
    this.initForm();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  initListDate() {
    const date = moment().add(1, 'month').format('YYYY-MM-DD');
    for (let i = 0; i < 20; i++) {
      this.fromToDateList.push({
        'id': i,
        'start_time': moment(date).subtract(i, 'month').startOf('month').format('YYYY-MM-DD'),
        'end_time': moment(date).subtract(i, 'month').endOf('month').format('YYYY-MM-DD'),
        'working_day_number': moment(date).subtract(i, 'month').daysInMonth(),
      });
    }
  }

  initForm() {
    this.form = this.fb.group({
      salary_period: [1, Validators.required],
      from_to_date: [2, Validators.required],
    });
  }

  submit() {
    if (this.form.valid) {
      const dataForm = this.form.getRawValue();
      const dataTime = this.fromToDateList.find(item => item.id === dataForm['from_to_date']);
      if (!dataTime) {
        this.notifySer.notify('success', 'Lỗi bất thường xảy ra. Vui lòng reload lại');
        return;
      }
      const data = {
        'start_time': dataTime['start_time'],
        'end_time': dataTime['end_time'],
        'working_day_number': dataTime['working_day_number'],
        'salary_period': dataForm['salary_period'],
        'name': 'Bảng lương ' + moment(dataTime['start_time']).format('DD/MM/YYYY').toString() + ' - ' +
          moment(dataTime['end_time']).format('DD/MM/YYYY').toString(),
      };
      this.paySheetService.create(data).subscribe(res => {
        this.notifySer.notify('success', 'Thêm lịch làm việc thành công!');
        this.dialogRef.close(res);
      }, (error) => {
        this.notifySer.notify('error', 'Lỗi bất thường xảy ra. Vui lòng reload lại');
      });
    }
  }
}
