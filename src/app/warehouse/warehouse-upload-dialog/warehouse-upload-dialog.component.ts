import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ProductService } from '../../product/product.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { WarehouseService } from '../warehouse.service';
import {UserService} from '../../user/user.service';

@Component({
  selector: 'app-warehouse-upload-dialog',
  templateUrl: './warehouse-upload-dialog.component.html',
  styleUrls: ['./warehouse-upload-dialog.component.css']
})
export class WarehouseUploadDialogComponent implements OnInit {

  submitted = false;

  @ViewChild('fileInput') fileInput: any;
  selectedFile: File = null;
  branchList: any;
  branchId: string;

  templateLink = null;

  constructor(
    public mainSer: WarehouseService,
    public userService: UserService,
    public dialogRef: MatDialogRef<WarehouseUploadDialogComponent>,
    public notifierSer: NotifierService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
  }

  ngOnInit() {
    this.templateLink = this.mainSer.getDownloadTemplateLink();

    this.userService.getStoreBranchList().subscribe(res => {
      this.branchList = res.body;
    });

    this.userService.getBranchLogin().subscribe(branchLogin => {
      this.branchId = branchLogin.toString();
    });
  }

  submit(e) {
    if (!this.branchId) {
      this.notifierSer.notify('success', 'Chi nhánh không được bỏ trống.');
      return;
    }
    const data = new FormData();
    data.append('file', this.selectedFile);
    data.append('branch_id', this.branchId);

    this.submitted = true;
    this.mainSer.upload(data).subscribe(uploadRes => {
      this.submitted = false;
      if (uploadRes['success']) {
        this.notifierSer.notify('success', 'Tải dữ liệu thành công!');
        this.dialogRef.close(true);
      } else {
        this.notifierSer.notify('error', 'Tải dữ liệu không thành công!');
      }
      console.log(uploadRes);
      if (uploadRes['errors']) {
        this.notifierSer.notify('error', uploadRes['errors'][0]);
        // uploadRes['errors'].forEach(error => {
        //   this.notifierSer.notify('error', error);
        // });
      }
    }, error1 => {
      this.submitted = false;
    });
  }

  inputChange(fileInputEvent) {
    this.selectedFile = fileInputEvent.target.files[0];
  }

  removeSelectedFile(fileInput) {
    this.selectedFile = null;
    fileInput.value = '';
  }

}
