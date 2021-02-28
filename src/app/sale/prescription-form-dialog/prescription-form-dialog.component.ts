import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { LocationService } from '../../location/location.service';
import * as moment from 'moment';
import { PrescriptionService } from '../prescription.service';
import { UsingFilter } from '../../product/using.model';
import { DoctorService } from '../../doctor/doctor.service';
import { DoctorFilter } from '../../doctor/doctor.model';
import { DoctorFormDialogComponent } from '../../doctor/doctor-form-dialog/doctor-form-dialog.component';
import { MedicalFacilityFormDialogComponent } from '../medical-facility-form-dialog/medical-facility-form-dialog.component';
import { MedicalFacilityService } from '../medical-facility.service';
import { MedicalFacilityFilter } from '../medical-facility.model';

@Component({
  selector: 'app-prescription-form-dialog',
  templateUrl: './prescription-form-dialog.component.html',
  styleUrls: ['./prescription-form-dialog.component.css']
})
export class PrescriptionFormDialogComponent implements OnInit {

  form: FormGroup;
  loading = false;

  local_data: any;
  prescription_id: string;

  sexItems: any[] = [
    {
      'id': 1,
      'title': 'Nam'
    },
    {
      'id': 0,
      'title': 'Nữ'
    }
  ];

  doctors = [];
  medicalFacilitys = [];

  constructor(
    public dialogRef: MatDialogRef<PrescriptionFormDialogComponent>,
    public notifySer: NotifierService,
    public locationSer: LocationService,
    public doctorService: DoctorService,
    public medicalFacilityService: MedicalFacilityService,
    private fb: FormBuilder,
    private service: PrescriptionService,
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {

    this.local_data = {...data};
    this.prescription_id = this.local_data.prescription_id;

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  initForm() {
    this.form = this.fb.group({
      no: [null],
      name: [
        null,
        Validators.compose([
          Validators.maxLength(100)
        ])
      ],
      phone: [null],
      address: [null, Validators.compose([
        Validators.maxLength(200)
      ])],
      cmnd: [null],
      bhyt: [null],
      doctor_id: [null],
      note: [null],
      branch_id: [null],
      sex: [null],
      person: [null],
      weight: [null],
      age: [null],
      medical_facility_id: [null],
    });

  }

  ngOnInit(): void {

    const doctorFilter = new DoctorFilter();
    doctorFilter.pageSize = 50;
    this.doctorService.getList(doctorFilter).subscribe(res => {
      this.doctors = res.body;
    });

    const medicalFacilityFilter = new MedicalFacilityFilter();
    medicalFacilityFilter.pageSize = 50;
    this.medicalFacilityService.getList(medicalFacilityFilter).subscribe(res => {
      this.medicalFacilitys = res.body;
    });

    this.initForm();

    if (this.prescription_id !== null && this.prescription_id !== undefined) {
      this.loadDetail(this.prescription_id);
    } else {
      this.service.getRenderNo().subscribe(no => {
        if (this.form.controls['no'].value === null) {
          this.form.patchValue({
            no: 'DT' + no
          });
        }
      });
    }

  }


  loadDetail(id) {
    this.service.getDetail(id, '').subscribe(data => {

      this.form.patchValue({
        no: data['no'],
        name: data['name'],
        phone: data['phone'],
        email: data['email'],
        address: data['address'],
        note: data['note'],
        sex: data['sex'],
        branch_id: data['branch_id'],
        cmnd: data['cmnd'],
        bhyt: data['bhyt'],
        doctor_id: data['doctor_id'],
        person: data['person'],
        weight: data['weight'],
        age: data['age'],
        medical_facility_id: data['medical_facility_id'],
      });

    });
  }


  submit() {
    if (this.form.valid) {
      const data = this.form.getRawValue();

      if (data['dob'] !== null) {
        const momentDate = new Date(data['dob']); // Replace event.value with your date value
        const formattedDate = moment(momentDate).format('YYYY-MM-DD');
        data['dob'] = formattedDate;
      }

      if (this.prescription_id !== null && this.prescription_id !== undefined) {
        this.service.update(this.prescription_id, data).subscribe(res => {
          this.notifySer.notify('success', 'Cập nhật thành công!');
          this.dialogRef.close(res);
        });
      } else {
        this.service.create(data).subscribe(res => {
          this.notifySer.notify('success', 'Thêm đơn thuốc thành công!');
          this.dialogRef.close(res);
        });
      }
    }
  }

  openDoctorFormDialog() {
    const obj = {
      doctor_id: this.form.controls['doctor_id'].value,
    };
    const dialogRef = this.dialog.open(DoctorFormDialogComponent, {
      data: obj,
      width: '70%',
      minWidth: '600px',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== false && result !== undefined) {
        this.doctors.push(result);
        this.form.controls['doctor_id'].setValue(result.id);
      }
    });
  }

  openMedicalFacilityFormDialog() {
    const obj = {
      medical_facility_id: this.form.controls['medical_facility_id'].value,
    };
    const dialogRef = this.dialog.open(MedicalFacilityFormDialogComponent, {
      data: obj,
      width: '40%',
      // minWidth: '600px',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== false && result !== undefined) {
        this.medicalFacilitys.push(result);
        this.form.controls['medical_facility_id'].setValue(result.id);
      }
    });
  }



}
