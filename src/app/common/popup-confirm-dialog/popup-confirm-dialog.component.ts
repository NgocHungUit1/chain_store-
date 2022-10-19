import {Component, Inject, OnInit, Optional} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
@Component({
  selector: 'app-popup-confirm-dialog',
  templateUrl: './popup-confirm-dialog.component.html',
  styleUrls: ['./popup-confirm-dialog.component.css']
})
export class PopupConfirmDialogComponent implements OnInit {

  action: string;
  title: string;
  content: string;
  local_data: any;

  constructor(
    public dialogRef: MatDialogRef<PopupConfirmDialogComponent>,
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

  confirm() {
    this.dialogRef.close({ event: 'confirm' });
  }

}

