import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import * as moment from 'moment';
import { InvalidPrescriptionService } from '../../services/invalid-prescription.service';

@Component({
  selector: 'app-invalid-prescription-form-dialog',
  templateUrl: './invalid-prescription-form-dialog.component.html',
  styleUrls: ['./invalid-prescription-form-dialog.component.scss']
})
export class InvalidPrescriptionFormDialogComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  isLoading = false;
  maxDate = new Date();

  constructor(
    private dialogRef: MatDialogRef<InvalidPrescriptionFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private notifyService: NotifierService,
    private invalidPrescriptionService: InvalidPrescriptionService
  ) {}

  ngOnInit(): void {
    this.initForm();

    if (this.data && this.data.isEdit) {
      this.isEdit = true;
      this.populateForm();
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      date: [new Date(), Validators.required],
      patient_name: ['', Validators.required],
      patient_address: ['', Validators.required],
      doctor_name: ['', Validators.required],
      doctor_info: ['', Validators.required],
      diagnosis: ['', Validators.required],
      not_follow_template: [false],
      expired: [false],
      missing_drug_info: [false],
      unclear_dosage: [false],
      missing_doctor_info: [false],
      other_prescription_issues: [''],
      contact_doctor: [false],
      notify_customer: [false],
      refuse_sale: [false],
      other_resolution_methods: [''],
      notes: ['']
    });
  }

  populateForm(): void {
    // Parse JSON strings if needed
    const prescription_issues_json = this.data.prescription_issues_json || {};
    const resolution_methods_json = this.data.resolution_methods_json || {};

    this.form.patchValue({
      date: new Date(this.data.date),
      patient_name: this.data.patient_name,
      patient_address: this.data.patient_address,
      doctor_name: this.data.doctor_name,
      doctor_info: this.data.doctor_info,
      diagnosis: this.data.diagnosis,
      not_follow_template: prescription_issues_json.not_follow_template || false,
      expired: prescription_issues_json.expired || false,
      missing_drug_info: prescription_issues_json.missing_drug_info || false,
      unclear_dosage: prescription_issues_json.unclear_dosage || false,
      missing_doctor_info: prescription_issues_json.missing_doctor_info || false,
      other_prescription_issues: prescription_issues_json.other || '',
      contact_doctor: resolution_methods_json.contact_doctor || false,
      notify_customer: resolution_methods_json.notify_customer || false,
      refuse_sale: resolution_methods_json.refuse_sale || false,
      other_resolution_methods: resolution_methods_json.other || '',
      notes: this.data.notes || ''
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.isLoading = true;
    const formValue = this.form.value;

    // Prepare JSON objects for API
    const prescription_issues = {
      not_follow_template: formValue.not_follow_template,
      expired: formValue.expired,
      missing_drug_info: formValue.missing_drug_info,
      unclear_dosage: formValue.unclear_dosage,
      missing_doctor_info: formValue.missing_doctor_info,
      other: formValue.other_prescription_issues
    };

    const resolution_methods = {
      contact_doctor: formValue.contact_doctor,
      notify_customer: formValue.notify_customer,
      refuse_sale: formValue.refuse_sale,
      other: formValue.other_resolution_methods
    };

    const payload = {
      date: moment(formValue.date).format('YYYY-MM-DD'),
      patient_name: formValue.patient_name,
      patient_address: formValue.patient_address,
      doctor_name: formValue.doctor_name,
      doctor_info: formValue.doctor_info,
      diagnosis: formValue.diagnosis,
      prescription_issues: JSON.stringify(prescription_issues),
      resolution_methods: JSON.stringify(resolution_methods),
      notes: formValue.notes
    };

    if (this.isEdit) {
      this.updateRecord(payload);
    } else {
      this.createRecord(payload);
    }
  }

  createRecord(payload: any): void {
    this.invalidPrescriptionService.createInvalidPrescription(payload).subscribe({
      next: () => {
        this.notifyService.notify('success', 'Thêm đơn thuốc không hợp lệ thành công');
        this.isLoading = false;
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error creating record:', error);
        this.notifyService.notify('error', 'Có lỗi xảy ra khi thêm đơn thuốc không hợp lệ');
        this.isLoading = false;
      }
    });
  }

  updateRecord(payload: any): void {
    payload.id = this.data.id;

    this.invalidPrescriptionService.updateInvalidPrescription(this.data.id, payload).subscribe({
      next: () => {
        this.notifyService.notify('success', 'Cập nhật đơn thuốc không hợp lệ thành công');
        this.isLoading = false;
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error updating record:', error);
        this.notifyService.notify('error', 'Có lỗi xảy ra khi cập nhật đơn thuốc không hợp lệ');
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
