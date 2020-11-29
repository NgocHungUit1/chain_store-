import {Component, Inject, OnInit, Optional} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {TimesheetService} from '../../timesheet/timesheet.service';
import {NotifierService} from 'angular-notifier';
import {ShiftsService} from '../shifts.service';

@Component({
  selector: 'app-shifts-popup-delete-dialog',
  templateUrl: './shifts-popup-delete-dialog.component.html',
  styleUrls: ['./shifts-popup-delete-dialog.component.css']
})
export class ShiftsPopupDeleteDialogComponent implements OnInit {

  action: string;
  title: string;
  desc: string;
  local_data: any;
  shifts_id: string;

  constructor(
    public dialogRef: MatDialogRef<ShiftsPopupDeleteDialogComponent>,
    private shiftsService: ShiftsService,
    public notifySer: NotifierService,
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    this.local_data = { ...data };
    this.action = this.local_data.action;
    this.title = this.local_data.title;
    this.desc = this.local_data.desc;
    this.shifts_id = this.local_data.shifts_id;
  }

  ngOnInit(): void {
  }

  closeDialog() {
    this.dialogRef.close({ event: 'Cancel' });
  }

  delete() {
    this.shiftsService.delete(this.shifts_id).subscribe(res => {
      this.notifySer.notify('success', 'Xóa ca làm việc thành công!');
      this.dialogRef.close({ event: 'Delete' });
    });
  }

}
