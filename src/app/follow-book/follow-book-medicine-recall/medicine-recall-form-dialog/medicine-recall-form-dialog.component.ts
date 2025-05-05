import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { MedicineRecallService } from '../../services/medicine-recall.service';

@Component({
  selector: 'app-medicine-recall-form-dialog',
  templateUrl: './medicine-recall-form-dialog.component.html',
  styleUrls: ['./medicine-recall-form-dialog.component.scss']
})
export class MedicineRecallFormDialogComponent implements OnInit {
  form: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MedicineRecallFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private medicineRecallService: MedicineRecallService,
    private notifier: NotifierService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.form = this.fb.group({
      document_number: [this.data?.document_number || '', Validators.required],
      date: [this.data?.date ? new Date(this.data.date) : new Date(), Validators.required],
      medicine_name: [this.data?.medicine_name || '', Validators.required],
      batch_number: [this.data?.batch_number || '', Validators.required],
      manufacturer: [this.data?.manufacturer || '', Validators.required],
      quantity: [this.data?.quantity || 0, [Validators.required, Validators.min(0)]],
      units_sold: [this.data?.units_sold || 0, [Validators.required, Validators.min(0)]],
      returned_amount: [this.data?.returned_amount || 0, [Validators.required, Validators.min(0)]],
      customer_info: [this.data?.customer_info || ''],
      receiver: [this.data?.receiver || '', Validators.required],
      notes: [this.data?.notes || '']
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      // Đánh dấu các trường để hiển thị lỗi
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    const formData = this.form.value;

    // Đảm bảo date là string theo format yyyy-MM-dd
    if (formData.date instanceof Date) {
      formData.date = this.formatDate(formData.date);
    }

    if (this.data?.isEdit) {
      this.medicineRecallService.updateMedicineRecall(this.data.id, formData).subscribe(
        response => {
          this.notifier.notify('success', 'Cập nhật thông tin thuốc thu hồi thành công');
          this.dialogRef.close(true);
          this.isSubmitting = false;
        },
        error => {
          this.notifier.notify('error', 'Có lỗi xảy ra khi cập nhật thông tin');
          this.isSubmitting = false;
        }
      );
    } else {
      this.medicineRecallService.createMedicineRecall(formData).subscribe(
        response => {
          this.notifier.notify('success', 'Thêm mới thông tin thuốc thu hồi thành công');
          this.dialogRef.close(true);
          this.isSubmitting = false;
        },
        error => {
          this.notifier.notify('error', 'Có lỗi xảy ra khi thêm mới thông tin');
          this.isSubmitting = false;
        }
      );
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
