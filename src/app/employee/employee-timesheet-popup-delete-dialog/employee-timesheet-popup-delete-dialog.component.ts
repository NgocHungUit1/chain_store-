import {Component, Inject, OnInit, Optional} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {TimesheetService} from '../../timesheet/timesheet.service';


@Component({
  selector: 'app-employee-timesheet-popup-delete-dialog',
  templateUrl: './employee-timesheet-popup-delete-dialog.component.html',
  styleUrls: ['./employee-timesheet-popup-delete-dialog.component.css']
})
export class EmployeeTimesheetPopupDeleteDialogComponent implements OnInit {

  action: string;
  title: string;
  desc: string;
  local_data: any;
  timesheet_id: string;

  constructor(
    public dialogRef: MatDialogRef<EmployeeTimesheetPopupDeleteDialogComponent>,
    private timesheetService: TimesheetService,
    public notifySer: NotifierService,
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    this.local_data = { ...data };
    this.action = this.local_data.action;
    this.title = this.local_data.title;
    this.desc = this.local_data.desc;
    this.timesheet_id = this.local_data.timesheet_id;
  }

  ngOnInit(): void {
  }

  closeDialog() {
    this.dialogRef.close({ event: 'Cancel' });
  }

  delete() {
    this.timesheetService.delete(this.timesheet_id).subscribe(res => {
      this.notifySer.notify('success', 'Xóa lịch làm việc thành công!');
      this.timesheetService.setLoadTimesheet(true);
      this.dialogRef.close({ event: 'Delete' });
    });
  }
}
