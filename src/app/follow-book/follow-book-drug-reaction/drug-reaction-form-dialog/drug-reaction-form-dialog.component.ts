import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { DrugReactionService } from '../../services/drug-reaction.service';

@Component({
  selector: 'app-drug-reaction-form-dialog',
  templateUrl: './drug-reaction-form-dialog.component.html',
  styleUrls: ['./drug-reaction-form-dialog.component.scss']
})
export class DrugReactionFormDialogComponent implements OnInit {
  drugReactionForm: FormGroup;
  isLoading = false;
  dialogTitle = 'Thêm mới tác dụng phụ của thuốc';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DrugReactionFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private notifyService: NotifierService,
    private drugReactionService: DrugReactionService
  ) {}

  ngOnInit(): void {
    this.initForm();

    if (this.data.isEdit) {
      this.dialogTitle = 'Cập nhật thông tin tác dụng phụ của thuốc';
      this.patchFormValues();
    }
  }

  initForm(): void {
    this.drugReactionForm = this.fb.group({
      report_date: [new Date(), Validators.required],
      patient_name: ['', Validators.required],
      patient_contact: ['', Validators.required],
      drug_name: ['', Validators.required],
      batch_number: ['', Validators.required],
      expiry_date: [null, Validators.required],
      reaction_description: ['', Validators.required],
      recipient: ['', Validators.required],
      resolution: ['']
    });
  }

  patchFormValues(): void {
    const formData = {
      ...this.data,
      report_date: this.data.report_date ? new Date(this.data.report_date) : null,
      expiry_date: this.data.expiry_date ? new Date(this.data.expiry_date) : null
    };

    this.drugReactionForm.patchValue(formData);
  }

  onSubmit(): void {
    if (this.drugReactionForm.invalid) {
      return;
    }

    this.isLoading = true;
    const formValue = this.drugReactionForm.value;

    // Format dates for API
    const drugReactionData = {
      ...formValue,
      report_date: this.formatDate(formValue.report_date),
      expiry_date: this.formatDate(formValue.expiry_date)
    };

    console.log('Sending data to API:', drugReactionData);

    if (this.data.isEdit) {
      this.drugReactionService.updateDrugReaction(this.data.id, drugReactionData).subscribe({
        next: (response) => {
          console.log('Update response:', response);
          this.isLoading = false;
          this.notifyService.notify('success', 'Cập nhật thông tin tác dụng phụ thuốc thành công');
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error updating drug reaction:', error);
          this.isLoading = false;
          this.notifyService.notify('error', 'Có lỗi xảy ra khi cập nhật thông tin tác dụng phụ thuốc: ' + (error.message || JSON.stringify(error)));
        }
      });
    } else {
      this.drugReactionService.createDrugReaction(drugReactionData).subscribe({
        next: (response) => {
          console.log('Create response:', response);
          this.isLoading = false;
          this.notifyService.notify('success', 'Thêm thông tin tác dụng phụ thuốc thành công');
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error creating drug reaction:', error);
          this.isLoading = false;
          this.notifyService.notify('error', 'Có lỗi xảy ra khi thêm thông tin tác dụng phụ thuốc: ' + (error.message || JSON.stringify(error)));
        }
      });
    }
  }

  formatDate(date: Date): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
