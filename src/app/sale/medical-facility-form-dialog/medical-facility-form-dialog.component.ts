import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlacementService } from '../../product/placement.service';
import { MedicalFacilityService } from '../medical-facility.service';

@Component({
  selector: 'app-medical-facility-form-dialog',
  templateUrl: './medical-facility-form-dialog.component.html',
  styleUrls: ['./medical-facility-form-dialog.component.css']
})
export class MedicalFacilityFormDialogComponent implements OnInit {

  local_data: any;
  medical_facility_id: null;

  constructor(
    public dialogRef: MatDialogRef<MedicalFacilityFormDialogComponent>,
    public notifySer: NotifierService,
    private fb: FormBuilder,
    private mainSer: MedicalFacilityService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {

    this.local_data = {...data};
    this.medical_facility_id = this.local_data.medical_facility_id;

  }

  public form: FormGroup;
  loading = false;

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      store_id: [null],
      name: [
        null,
        Validators.compose([
          Validators.required,
          Validators.maxLength(32)
        ])
      ],
    });
    if (this.medical_facility_id !== null) {
      this.mainSer.getDetail(this.medical_facility_id, '').subscribe(res => {
        this.form.patchValue(res);
      });
    }
  }

  submit() {
    if (this.form.valid) {
      const data = this.form.getRawValue();
      this.mainSer.create(data).subscribe(res => {
        this.notifySer.notify('success', 'Thêm Cơ sở y tế thành công!');
        this.dialogRef.close(res);
      });
    }
  }
}
