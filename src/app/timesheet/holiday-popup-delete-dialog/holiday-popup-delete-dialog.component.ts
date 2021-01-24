import {Component, Inject, OnInit, Optional} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {HolidayService} from '../../holiday/holiday.service';

@Component({
  selector: 'app-holiday-popup-delete-dialog',
  templateUrl: './holiday-popup-delete-dialog.component.html',
  styleUrls: ['./holiday-popup-delete-dialog.component.css']
})
export class HolidayPopupDeleteDialogComponent implements OnInit {

  action: string;
  title: string;
  desc: string;
  local_data: any;
  holiday_id: string;

  constructor(
    public dialogRef: MatDialogRef<HolidayPopupDeleteDialogComponent>,
    private holidayService: HolidayService,
    public notifySer: NotifierService,
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    this.local_data = { ...data };
    this.action = this.local_data.action;
    this.title = this.local_data.title;
    this.desc = this.local_data.desc;
    this.holiday_id = this.local_data.holiday_id;
  }

  ngOnInit(): void {
  }

  closeDialog() {
    this.dialogRef.close({ event: 'Cancel' });
  }

  delete() {
    this.holidayService.delete(this.holiday_id).subscribe(res => {
      this.notifySer.notify('success', 'Xóa kỳ lễ tết thành công!');
      this.dialogRef.close({ event: 'Delete' });
    });
  }

}
