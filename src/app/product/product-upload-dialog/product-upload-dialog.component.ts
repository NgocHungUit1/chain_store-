import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {ProductService} from '../product.service';


@Component({
  selector: 'app-product-upload-dialog',
  templateUrl: './product-upload-dialog.component.html',
  styleUrls: ['./product-upload-dialog.component.css'],
})
export class ProductUploadDialogComponent implements OnInit {
  submitted = false;

  @ViewChild('fileInput') fileInput: any;
  selectedFile: File = null;

  templateLink = null;

  constructor(
    public mainSer: ProductService,
    public dialogRef: MatDialogRef<ProductUploadDialogComponent>,
    public notifierSer: NotifierService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.templateLink = this.mainSer.getDownloadTemplateLink();
  }

  submit(e) {
    const data = new FormData();
    data.append('file', this.selectedFile);

    this.submitted = true;
    this.mainSer.upload(data).subscribe(uploadRes => {
      this.submitted = false;
      if (uploadRes['success']) {
        this.notifierSer.notify('success', 'Tải dữ liệu thành công!');
        this.dialogRef.close(true);
      }
      // } else {
      //   this.notifierSer.notify('error', 'Tải dữ liệu không thành công!');
      // }

      if (!Array.isArray(uploadRes['errors'])) {
        this.notifierSer.notify('error', uploadRes['errors']);
      }

      if (Array.isArray(uploadRes['errors'])) {
        uploadRes['errors'].forEach(error => {
          this.notifierSer.notify('error', error);
        });
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
