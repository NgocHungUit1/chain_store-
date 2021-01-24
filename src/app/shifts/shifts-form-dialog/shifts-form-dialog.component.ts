import {Component, Inject, OnInit, Optional} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ShiftsService} from '../shifts.service';
import {EmployeeTimesheetPopupDeleteDialogComponent} from '../../employee/employee-timesheet-popup-delete-dialog/employee-timesheet-popup-delete-dialog.component';
import {ShiftsPopupDeleteDialogComponent} from '../shifts-popup-delete-dialog/shifts-popup-delete-dialog.component';

@Component({
  selector: 'app-shifts-form-dialog',
  templateUrl: './shifts-form-dialog.component.html',
  styleUrls: ['./shifts-form-dialog.component.css']
})
export class ShiftsFormDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ShiftsFormDialogComponent>,
    public notifySer: NotifierService,
    private fb: FormBuilder,
    private shiftsService: ShiftsService,
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {

    this.local_data = {...data};
    if (this.local_data.shifts_id) {
      this.shifts_id = this.local_data.shifts_id;
    }
  }
  form: FormGroup;
  loading = false;
  local_data: any;
  shifts_id: string;
  totalTime = '4h';
  totalTimeShiftsDefault = 4;

  statusItems: any[] = [
    // {
    //   'id': 9,
    //   'title': 'Tạm khóa'
    // },
    {
      'id': 10,
      'title': 'Đang hoạt động'
    }
  ];

  onNoClick(): void {
    this.dialogRef.close();
  }

  initForm() {
    this.form = this.fb.group({
      name: [null, Validators.required],
      from_time: ['07:00', Validators.required],
      to_time: ['11:00', Validators.required],
      status: [10, Validators.required],
    });
  }

  ngOnInit(): void {

    this.initForm();

    if (this.shifts_id !== null && this.shifts_id !== undefined) {
      this.loadShifts(this.shifts_id);
    }

  }

  loadShifts(id) {
    this.shiftsService.getDetail(id).subscribe(shifts => {
      this.form.patchValue({
        name: shifts['name'],
        from_time: shifts['from_time'],
        to_time: shifts['to_time'],
        status: shifts['status'],
      });
      this.updateTotalTime();
    });
  }

  submit() {
    if (this.form.valid) {
      const data = this.form.getRawValue();

      if (this.shifts_id !== null && this.shifts_id !== undefined) {
        this.shiftsService.update(this.shifts_id, data).subscribe(res => {
          this.notifySer.notify('success', 'Cập nhật ca làm việc thành công!');
          this.dialogRef.close(res);
        }, (error) => {
          if (error.status === 422) {
            this.ajaxValidate(error);
          }
        });
      } else {
        this.shiftsService.create(data).subscribe(res => {
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

  updateTotalTime() {
    const fromTime = this.form.getRawValue()['from_time'];
    const toTime = this.form.getRawValue()['to_time'];
    if (fromTime && toTime) {
      console.log(toTime);
      console.log(fromTime);
      let h = toTime.substring(0, 2) - fromTime.substring(0, 2);
      const m = toTime.substring(3, 5) - fromTime.substring(3, 5);
      if (h <= 0) {
        h += 24;
      }
      this.totalTime = h + 'h' + (m > 0 ? (m + 'p') : '');
    }
  }

  updateToTime() {
    const fromTime = this.form.getRawValue()['from_time'];
    const toTime =  (Number(fromTime.substring(0, 2)) + this.totalTimeShiftsDefault) +  fromTime.substring(2);
    this.form.controls['to_time'].setValue(toTime);
    this.updateTotalTime();
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

  openDeleteShifts() {
    let obj = {
      action: 'Delete',
      title: 'Xóa ca làm việc',
      desc: 'Bạn có chắc chắn muốn xóa ca làm việc này?',
      shifts_id: this.shifts_id,

    };

    const dialogRef = this.dialog.open(ShiftsPopupDeleteDialogComponent, {
      data: obj,
      width: '30%',
      minHeight: '80%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.event === 'Delete') {
        this.dialogRef.close(true);
      }
    });
  }


}
