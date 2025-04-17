import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { TraineeService } from '../../services/trainee.service';

@Component({
  selector: 'app-trainee-form-dialog',
  templateUrl: './trainee-form-dialog.component.html',
  styleUrls: ['./trainee-form-dialog.component.scss']
})
export class TraineeFormDialogComponent implements OnInit {
  traineeForm: FormGroup;
  isSubmitting = false;
  today = new Date();
  statusOptions = [
    { value: 1, viewValue: 'Đang làm việc' },
    { value: 0, viewValue: 'Đã nghỉ việc' }
  ];
  genderOptions = [
    { value: 0, viewValue: 'Nam' },
    { value: 1, viewValue: 'Nữ' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TraineeFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private notifyService: NotifierService,
    private traineeService: TraineeService
  ) { }

  ngOnInit(): void {
    this.initForm();

    // Nếu ở chế độ xem chi tiết, disable form
    if (this.data.isDetail) {
      this.traineeForm.disable();
    }
  }

  initForm(): void {
    if (this.data.isEdit) {
      const trainee = this.data.trainee;

      // Đảm bảo rằng các trường ngày tháng đều ở định dạng YYYY-MM-DD
      const birth_date = trainee.birth_date ? this.formatDateForApi(trainee.birth_date) : '';
      const join_date = trainee.join_date ? this.formatDateForApi(trainee.join_date) : '';

      this.traineeForm = this.fb.group({
        id: [trainee.id],
        name: [trainee.name, Validators.required],
        gender: [trainee.gender, Validators.required], // Sử dụng giá trị số trực tiếp từ API
        birth_date: [birth_date, Validators.required],
        education_level: [trainee.education_level, Validators.required],
        join_date: [join_date, Validators.required],
        phone: [trainee.phone || ''],
        email: [trainee.email || '', [Validators.email]],
        address: [trainee.address || ''],
        status: [trainee.status, Validators.required],
        details: this.fb.array([])
      });

      // Clear và tạo mới form array details
      while (this.detailsFormArray.length !== 0) {
        this.detailsFormArray.removeAt(0);
      }

      // Thêm các chi tiết đào tạo nếu có
      if (trainee.details && trainee.details.length > 0) {
        trainee.details.forEach(detail => {
          this.addDetail(detail);
        });
      } else {
        this.addDetail();
      }
    } else {
      // Format ngày hiện tại thành YYYY-MM-DD
      const today = this.formatDateForApi(new Date());

      this.traineeForm = this.fb.group({
        name: ['', Validators.required],
        gender: [0, Validators.required],
        birth_date: ['', Validators.required],
        education_level: ['', Validators.required],
        join_date: [today, Validators.required],
        phone: [''],
        email: ['', [Validators.email]],
        address: [''],
        status: [1, Validators.required],
        details: this.fb.array([])
      });

      this.addDetail();
    }
  }

  get detailsFormArray() {
    return this.traineeForm.get('details') as FormArray;
  }

  addDetail(detail: any = null): void {
    // Format ngày trong detail nếu có
    const detailDate = detail ? this.formatDateForApi(detail.date) : this.formatDateForApi(new Date());

    // Tạo form group cơ bản không có trainee_id khi thêm mới
    const detailForm = this.fb.group({
      id: [detail ? detail.id : null],
      date: [detailDate, Validators.required],
      content: [detail ? detail.content : '', Validators.required],
      instructor_name: [detail ? detail.instructor_name : '', Validators.required],
      instructor_signature: [detail ? detail.instructor_signature : null],
      result: [detail ? detail.result : ''],
      note: [detail ? detail.note : '']
    });

    // Chỉ thêm trainee_id nếu đây là thao tác sửa và detail có trainee_id
    if (this.data.isEdit && detail && detail.trainee_id) {
      detailForm.addControl('trainee_id', this.fb.control(detail.trainee_id));
    }

    this.detailsFormArray.push(detailForm);
  }

  removeDetail(index: number): void {
    this.detailsFormArray.removeAt(index);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDateForApi(date: any): string {
    if (!date) return '';

    if (typeof date === 'string' && date.includes('T')) {
      return date.split('T')[0];
    }

    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }

    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    return '';
  }

  onSubmit(): void {
    if (this.traineeForm.invalid) {
      this.markFormGroupTouched(this.traineeForm);
      return;
    }

    this.isSubmitting = true;
    const formValue = this.traineeForm.value;

    // Chuẩn bị dữ liệu cơ bản với ngày đã định dạng
    const formattedData: any = {
      ...formValue,
      birth_date: this.formatDateForApi(formValue.birth_date),
      join_date: this.formatDateForApi(formValue.join_date),
    };

    // Xử lý các chi tiết khác nhau cho thêm mới và cập nhật
    if (this.data.isEdit) {
      // Đối với cập nhật, giữ nguyên cấu trúc details
      formattedData.details = formValue.details.map(detail => ({
        ...detail,
        date: this.formatDateForApi(detail.date)
      }));
    } else {
      // Đối với thêm mới, loại bỏ trainee_id khỏi chi tiết
      formattedData.details = formValue.details.map(detail => {
        const formattedDetail = {
          date: this.formatDateForApi(detail.date),
          content: detail.content,
          instructor_name: detail.instructor_name,
          result: detail.result || '',
          note: detail.note || ''
        };

        // Nếu có ID, giữ lại (trường hợp cập nhật chi tiết)
        if (detail.id) {
          formattedDetail['id'] = detail.id;
        }

        return formattedDetail;
      });
    }

    console.log('Dữ liệu trước khi gửi:', JSON.stringify(formattedData));

    if (this.data.isEdit) {
      this.traineeService.updateTrainee(formattedData.id, formattedData).subscribe(
        response => {
          this.notifyService.notify('success', 'Cập nhật học viên thành công');
          this.dialogRef.close(true);
          this.isSubmitting = false;
        },
        error => {
          console.error('Error updating trainee:', error);
          this.notifyService.notify('error', 'Có lỗi xảy ra khi cập nhật học viên: ' + error);
          this.isSubmitting = false;
        }
      );
    } else {
      this.traineeService.createTrainee(formattedData).subscribe(
        response => {
          this.notifyService.notify('success', 'Tạo học viên thành công');
          this.dialogRef.close(true);
          this.isSubmitting = false;
        },
        error => {
          console.error('Error creating trainee:', error);
          this.notifyService.notify('error', 'Có lỗi xảy ra khi tạo học viên: ' + error);
          this.isSubmitting = false;
        }
      );
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control: any) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        (control as FormArray).controls.forEach(item => {
          if (item instanceof FormGroup) {
            this.markFormGroupTouched(item as FormGroup);
          }
        });
      }
    });
  }

  birthDateChanged(event: any): void {
    const date = event.value;
    if (date) {
      const formattedDate = this.formatDateForApi(date);
      this.traineeForm.get('birth_date').setValue(formattedDate);
    }
  }

  joinDateChanged(event: any): void {
    const date = event.value;
    if (date) {
      const formattedDate = this.formatDateForApi(date);
      this.traineeForm.get('join_date').setValue(formattedDate);
    }
  }

  detailDateChanged(event: any, index: number): void {
    const date = event.value;
    if (date) {
      const formattedDate = this.formatDateForApi(date);
      const detailsArray = this.traineeForm.get('details') as FormArray;
      detailsArray.at(index).get('date').setValue(formattedDate);
    }
  }
}
