import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-popup-delete-dialog',
  templateUrl: './popup-delete-dialog.component.html',
  styleUrls: ['./popup-delete-dialog.component.css']
})
export class PopupDeleteDialogComponent implements OnInit {

  action: string;
  title: string;
  content: string;
  local_data: any;

  constructor(
    public dialogRef: MatDialogRef<PopupDeleteDialogComponent>,
    public notifySer: NotifierService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    this.local_data = { ...data };
    this.action = this.local_data.action;
    this.title = this.local_data.title;
    this.content = this.local_data.content;
  }

  ngOnInit(): void {
  }

  closeDialog() {
    this.dialogRef.close({ event: 'cancel' });
  }

  delete() {
    this.dialogRef.close({ event: 'delete' });
  }

}
