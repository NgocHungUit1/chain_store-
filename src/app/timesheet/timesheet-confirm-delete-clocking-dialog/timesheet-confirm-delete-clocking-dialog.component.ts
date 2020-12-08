import {Component, Inject, OnInit, Optional} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {TimesheetService} from '../timesheet.service';
import {NotifierService} from 'angular-notifier';

@Component({
  selector: 'app-timesheet-confirm-delete-clocking-dialog',
  templateUrl: './timesheet-confirm-delete-clocking-dialog.component.html',
  styleUrls: ['./timesheet-confirm-delete-clocking-dialog.component.css']
})
export class TimesheetConfirmDeleteClockingDialogComponent implements OnInit {
  title: string;
  desc: string;
  local_data: any;
  timesheet_id: string;

  constructor(
    public dialogRef: MatDialogRef<TimesheetConfirmDeleteClockingDialogComponent>,
    public notifySer: NotifierService,
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    this.local_data = { ...data };
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
    this.dialogRef.close({ event: 'Delete' });
  }
}
