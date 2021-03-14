import {Component, Inject, OnInit, Optional} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HolidayService} from '../../holiday/holiday.service';
import * as moment from 'moment';
import {HolidayPopupDeleteDialogComponent} from '../holiday-popup-delete-dialog/holiday-popup-delete-dialog.component';

@Component({
  selector: 'app-holiday-form-dialog',
  templateUrl: './holiday-form-dialog.component.html',
  styleUrls: ['./holiday-form-dialog.component.css']
})
export class HolidayFormDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<HolidayFormDialogComponent>,
    public notifySer: NotifierService,
    private fb: FormBuilder,
    private holidayService: HolidayService,
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {

    this.local_data = {...data};
    if (this.local_data.holiday_id) {
      this.holiday_id = this.local_data.holiday_id;
    } else {
      this.day = this.local_data.day;
    }
  }
  form: FormGroup;
  loading = false;
  local_data: any;
  holiday_id: string;
  day;

  totalDay = 1;

  onNoClick(): void {
    this.dialogRef.close();
  }

  initForm() {
    this.form = this.fb.group({
      name: [null, Validators.required],
      from_date: [this.day ? moment(this.day).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'), Validators.required],
      to_date: [this.day ? moment(this.day).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'), Validators.required],
    });
  }

  ngOnInit(): void {

    this.initForm();

    if (this.holiday_id !== null && this.holiday_id !== undefined) {
      this.loadHoliday(this.holiday_id);
    }

  }

  loadHoliday(id) {
    this.holidayService.getDetail(id).subscribe(holiday => {
      this.form.patchValue({
        name: holiday['name'],
      });
      this.form.controls['from_date'].setValue(holiday['from_date']);
      this.form.controls['to_date'].setValue(holiday['to_date']);
      this.updateTotalDay();
    });
  }

  submit() {
    if (this.form.valid) {
      const data = this.form.getRawValue();
      data['from_date'] = moment(data['from_date']).format('YYYY-MM-DD');
      data['to_date'] = moment(data['to_date']).format('YYYY-MM-DD');
      if (data['to_date'] <  data['from_date']) {
        this.notifySer.notify('error', 'Ngày kết thúc không hợp lệ');
        return;
      }

      if (this.holiday_id !== null && this.holiday_id !== undefined) {
        this.holidayService.update(this.holiday_id, data).subscribe(res => {
          this.notifySer.notify('success', 'Cập nhật ca làm việc thành công!');
          this.dialogRef.close(res);
        }, (error) => {
          if (error.status === 422) {
            this.ajaxValidate(error);
          }
        });
      } else {
        this.holidayService.create(data).subscribe(res => {
          this.notifySer.notify('success', 'Thêm ca làm việc thành công!');
          this.dialogRef.close(res);
        }, (error) => {
          if (error.status === 422) {
            this.ajaxValidate(error);
          }
        });
      }
    }
  }

  public ajaxValidate(error) {
    if (error.error) {
      if (this.form instanceof FormGroup) {
        const _fields = this.form.controls;
        Object.keys(_fields).forEach(key => {
          const errorField = error.error.find(x => x.field === key);
          if (errorField) {
            this.form.controls[key].setErrors({
              ajaxValidator: {
                value: errorField.message,
              }
            });
          }
        });
      }
    }
  }

  updateTotalDay() {
    const toDate =  moment(this.form.controls['to_date'].value).format('YYYY-MM-DD');
    const fromDate =  moment(this.form.controls['from_date'].value).format('YYYY-MM-DD');
    // @ts-ignore
    this.totalDay = (moment(toDate) -  moment(fromDate)) / (1000 * 60 * 60 * 24) + 1;
  }

  openDeleteHoliday() {
    let obj = {
      action: 'Delete',
      title: 'Xác nhận',
      desc: 'Bạn có chắc chắn muốn xóa kỳ lễ tết này?',
      holiday_id: this.holiday_id,
    };

    const dialogRef = this.dialog.open(HolidayPopupDeleteDialogComponent, {
      data: obj,
      width: '30%',
      minHeight: '50%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.event === 'Delete') {
        this.dialogRef.close(true);
      }
    });
  }

}
