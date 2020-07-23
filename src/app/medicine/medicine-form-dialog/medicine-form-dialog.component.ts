import {Component, Inject, OnInit, Optional} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NotifierService} from 'angular-notifier';
import {MedicineService} from '../medicine.service';

@Component({
  selector: 'app-medicine-form-dialog',
  templateUrl: './medicine-form-dialog.component.html',
  styleUrls: ['./medicine-form-dialog.component.css']
})
export class MedicineFormDialogComponent implements OnInit {
  form: FormGroup;
  loading = false;
  local_data: any;
  modelId = null;

  constructor(
    public dialogRef: MatDialogRef<MedicineFormDialogComponent>,
    public notifySer: NotifierService,
    private fb: FormBuilder,
    private mainSer: MedicineService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {

    this.local_data = { ...data };
    this.modelId = this.local_data.id;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  initForm() {
    this.form = this.fb.group({
      medicine_name: [
        null,
        Validators.compose([
          Validators.required,
          Validators.maxLength(50)
        ])
      ],
      registration_no: [null, Validators.compose([
        Validators.required,
        Validators.maxLength(20)
      ])],
      main_active_substance: [null, Validators.compose([
        Validators.required,
        Validators.maxLength(50)
      ])],
      content: [null, Validators.compose([
        Validators.required,
        Validators.maxLength(200)
      ])],
      packing: [null, Validators.compose([
        Validators.required,
        Validators.maxLength(200)
      ])],
      manufacturer: [null, Validators.compose([
        Validators.required,
        Validators.maxLength(50)
      ])],
      made_in: [null, Validators.compose([
        Validators.required,
        Validators.maxLength(30)
      ])],
      unit: [null, Validators.compose([
        Validators.required,
        Validators.maxLength(30)
      ])],
    });
  }

  ngOnInit(): void {
    this.initForm();

    if (this.modelId !== null && this.modelId !== undefined) {
      this.mainSer.getDetail(this.modelId).subscribe(medicine => {
        this.form.patchValue(medicine);
      });
    }
  }

  submit(connect = false) {
    if (this.form.valid) {
      const data = this.form.getRawValue();

      if (this.modelId !== null && this.modelId !== undefined) {
        this.mainSer.update(this.modelId, data).subscribe(res => {
          this.notifySer.notify('success', 'Cập nhật thuốc cơ sở thành công!');
          if (connect) {
            if (res['medicine_no'] !== null) {
              this.mainSer.reconnect(this.modelId).subscribe(ret => {
                if (ret['success']) {
                  this.notifySer.notify('success', 'Liên thông thuốc cơ sở thành công!');
                  this.dialogRef.close(res);
                }
              });
            } else {
              this.mainSer.connect(this.modelId).subscribe(ret => {
                if (ret['success']) {
                  this.notifySer.notify('success', 'Liên thông thuốc cơ sở thành công!');
                  this.dialogRef.close(res);
                }
              });
            }
          } else {
            this.dialogRef.close(res);
          }
        });
      } else {
        this.mainSer.create(data).subscribe(res => {
          this.notifySer.notify('success', 'Thêm thuốc cơ sở thành công!');
          if (connect) {
            if (res['medicine_no'] !== null) {
              this.mainSer.reconnect(this.modelId).subscribe(ret => {
                if (ret['success']) {
                  this.notifySer.notify('success', 'Liên thông thuốc cơ sở thành công!');
                  this.dialogRef.close(res);
                }
              });
            } else {
              this.mainSer.connect(this.modelId).subscribe(ret => {
                if (ret['success']) {
                  this.notifySer.notify('success', 'Liên thông thuốc cơ sở thành công!');
                  this.dialogRef.close(res);
                }
              });
            }
          } else {
            this.dialogRef.close(res);
          }
        });
      }
    }
  }

}
