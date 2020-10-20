import {Component, Inject, OnInit, Optional} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {BranchService} from '../branch.service';

@Component({
  selector: 'app-branch-popup-delete-branch',
  templateUrl: './branch-popup-delete-branch.component.html',
  styleUrls: ['./branch-popup-delete-branch.component.css']
})
export class BranchPopupDeleteBranchComponent implements OnInit {

  action: string;
  title: string;
  local_data: any;
  branch_id: string;

  constructor(
    public dialogRef: MatDialogRef<BranchPopupDeleteBranchComponent>,
    private branchService: BranchService,
    public notifySer: NotifierService,
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    this.local_data = { ...data };
    this.action = this.local_data.action;
    this.title = this.local_data.title;
    this.branch_id = this.local_data.branch_id;
  }

  ngOnInit(): void {
  }

  closeDialog() {
    this.dialogRef.close({ event: 'Cancel' });
  }

  delete() {
    this.branchService.delete(this.branch_id).subscribe(res => {
      this.notifySer.notify('success', 'Xóa chi nhánh thành công!');
      this.branchService.setLoadBranch(true);
      this.dialogRef.close({ event: 'Delete' });
    });
  }


}
