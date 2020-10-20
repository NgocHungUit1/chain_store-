import {Component, Input, OnInit} from '@angular/core';
import {Branch} from '../branch.model';
import {BranchService} from '../branch.service';
import {MatDialog} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {BranchPopupDeleteBranchComponent} from '../branch-popup-delete-branch/branch-popup-delete-branch.component';
import {BranchFormDialogComponent} from '../branch-form-dialog/branch-form-dialog.component';

@Component({
  selector: 'app-branch-tab-info',
  templateUrl: './branch-tab-info.component.html',
  styleUrls: ['./branch-tab-info.component.css']
})
export class BranchTabInfoComponent implements OnInit {

  @Input() branch: Branch;

  sexHeader = {
    '1': 'Nam',
    '0': 'Nữ',
  };

  constructor(
    private branchService: BranchService,
    private dialog: MatDialog,
    private notifyService: NotifierService
  ) {
  }

  ngOnInit(): void {
  }

  loadBranch(id) {
    this.branchService.getDetail(id).subscribe(res => {
      this.branch = res;
    });
  }

  openBranchFormDialog(id) {
    const obj = {
      action: 'Update',
      title: 'Cập nhật chi nhánh',
      branch_id: id,
    };

    const dialogRef = this.dialog.open(BranchFormDialogComponent, {
      data: obj,
      width: '80%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBranch(result.id);
      }
    });
  }

  openDeleteBranch(id) {

    let obj = {
      action: 'Delete',
      title: 'Xóa chi nhánh',
      branch_id: id,
    };

    const dialogRef = this.dialog.open(BranchPopupDeleteBranchComponent, {
      data: obj,
      width: '20%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

}
