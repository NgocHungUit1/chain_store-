import { Component, OnInit, Inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { HygieneLogbookService } from '../../services/hygiene-logbook.service';
import * as moment from 'moment';

@Component({
  selector: 'app-hygiene-logbook-create-modal',
  templateUrl: './hygiene-logbook-create-modal.component.html',
  styleUrls: ['./hygiene-logbook-create-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HygieneLogbookCreateModalComponent implements OnInit {
  logbookForm: FormGroup;
  isSubmitting = false;
  statusOptions = [
    { value: 0, viewValue: 'Chưa hoàn thành' },
    { value: 1, viewValue: 'Hoàn thành' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<HygieneLogbookCreateModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private notifier: NotifierService,
    private hygieneLogbookService: HygieneLogbookService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cdr.detectChanges();
  }

  initForm(): void {
    const currentDate = this.data?.month ? moment(this.data.month, 'YYYY-MM') : moment();
    const monthYear = currentDate.format('YYYY-MM');

    this.logbookForm = this.fb.group({
      month: [monthYear, Validators.required],
      status: [this.data?.status ?? 0, Validators.required],
      details: this.fb.array([])
    });

    if (this.data?.isEdit) {
      // Kiểm tra chi tiết
      if (!this.data.details || this.data.details.length === 0) {
        // Nếu không có chi tiết, gọi API để lấy
        this.hygieneLogbookService.getHygieneLogbookDetail(this.data.id).subscribe(
          (fullData) => {
            if (fullData && fullData.details && fullData.details.length > 0) {
              // Cập nhật lại data
              this.data.details = fullData.details;

              // Khởi tạo lại form
              this.initFormDetails();
              this.cdr.detectChanges();
            } else {
              // Nếu vẫn không có chi tiết, tạo mới dựa trên tháng
              this.generateDetailsForMonth(monthYear);
              this.cdr.detectChanges();
            }
          },
          (error) => {
            console.error('Error fetching details:', error);
            this.notifier.notify('error', 'Không thể tải chi tiết phiếu vệ sinh');

            // Fallback: tạo mới dựa trên tháng
            this.generateDetailsForMonth(monthYear);
            this.cdr.detectChanges();
          }
        );
      } else {
        // Nếu đã có chi tiết, khởi tạo form
        this.initFormDetails();
      }
    } else {
      // Nếu tạo mới, tạo các hàng cho tất cả ngày trong tháng
      this.generateDetailsForMonth(monthYear);
    }
  }

  // Tách phương thức khởi tạo chi tiết form ra riêng
  initFormDetails(): void {
    if (this.data.details && this.data.details.length > 0) {
      this.data.details.forEach((detail: any) => {
        this.addDetailFromData(detail);
      });
    }
  }

  get detailsFormArray(): FormArray {
    return this.logbookForm.get('details') as FormArray;
  }

  addDetailFromData(detail: any): void {
    // Đảm bảo các giá trị là số nguyên
    const detailGroup = this.fb.group({
      date: [detail.date],
      clean_floor: [Number(detail.clean_floor)],
      clean_cabinet: [Number(detail.clean_cabinet)],
      clean_furniture: [Number(detail.clean_furniture)],
      clean_fan_ac: [Number(detail.clean_fan_ac)],
      clean_shelf: [Number(detail.clean_shelf)],
      clean_wall_ceiling: [Number(detail.clean_wall_ceiling)],
      arrange_medicine: [Number(detail.arrange_medicine)],
      implementer: [detail.implementer || ''],
      inspector: [detail.inspector || '']
    });

    this.detailsFormArray.push(detailGroup);
  }

  // Tạo các hàng cho tất cả ngày trong tháng
  generateDetailsForMonth(monthStr: string): void {
    const month = moment(monthStr, 'YYYY-MM');
    const daysInMonth = month.daysInMonth();

    this.detailsFormArray.clear();

    for (let i = 1; i <= daysInMonth; i++) {
      const date = month.clone().date(i).format('YYYY-MM-DD');
      this.detailsFormArray.push(
        this.fb.group({
          date: [date],
          clean_floor: [0],
          clean_cabinet: [0],
          clean_furniture: [0],
          clean_fan_ac: [0],
          clean_shelf: [0],
          clean_wall_ceiling: [0],
          arrange_medicine: [0],
          implementer: [''],
          inspector: ['']
        })
      );
    }
  }

  // Phương thức khi thay đổi tháng
  onMonthChange(): void {
    const monthStr = this.logbookForm.get('month')?.value;
    this.generateDetailsForMonth(monthStr);
  }

  // Toggle một checkbox đơn lẻ
  toggleCheckbox(field: string, rowIndex: number): void {
    const control = this.detailsFormArray.at(rowIndex).get(field);
    const currentValue = control?.value;
    control?.setValue(currentValue == 1 ? 0 : 1);
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (this.logbookForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const formData = this.logbookForm.value;

    if (this.data?.isEdit) {
      this.hygieneLogbookService.updateHygieneLogbook(this.data.id, formData).subscribe(
        response => {
          this.notifier.notify('success', 'Cập nhật phiếu theo dõi vệ sinh thành công!');
          this.dialogRef.close(true);
          this.isSubmitting = false;
        },
        error => {
          this.notifier.notify('error', 'Có lỗi xảy ra khi cập nhật phiếu!');
          this.isSubmitting = false;
        }
      );
    } else {
      this.hygieneLogbookService.createHygieneLogbook(formData).subscribe(
        response => {
          this.notifier.notify('success', 'Tạo mới phiếu theo dõi vệ sinh thành công!');
          this.dialogRef.close(true);
          this.isSubmitting = false;
        },
        error => {
          this.notifier.notify('error', 'Có lỗi xảy ra khi tạo phiếu!');
          this.isSubmitting = false;
        }
      );
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  // Phương thức để toggle toàn bộ cột
  toggleColumnCheckbox(controlName: string): void {
    // Xác định trạng thái của checkbox
    let shouldCheck = false;

    // Kiểm tra xem có ít nhất một checkbox chưa được check
    for (let i = 0; i < this.detailsFormArray.length; i++) {
      const control = this.detailsFormArray.at(i).get(controlName);
      if (control && control.value != 1) {
        shouldCheck = true;
        break;
      }
    }

    // Toggle tất cả các checkbox trong cột
    for (let i = 0; i < this.detailsFormArray.length; i++) {
      const control = this.detailsFormArray.at(i).get(controlName);
      if (control) {
        control.setValue(shouldCheck ? 1 : 0);
      }
    }
    this.cdr.detectChanges();
  }

  // Phương thức để toggle toàn bộ hàng
  toggleRowCheckbox(rowIndex: number): void {
    const row = this.detailsFormArray.at(rowIndex);
    const checkboxFields = [
      'clean_floor',
      'clean_cabinet',
      'clean_furniture',
      'clean_fan_ac',
      'clean_shelf',
      'clean_wall_ceiling',
      'arrange_medicine'
    ];

    // Xác định trạng thái của checkbox
    let shouldCheck = false;

    // Kiểm tra xem có ít nhất một checkbox chưa được check
    for (const field of checkboxFields) {
      const control = row.get(field);
      if (control && control.value != 1) {
        shouldCheck = true;
        break;
      }
    }

    // Toggle tất cả các checkbox trong hàng
    for (const field of checkboxFields) {
      const control = row.get(field);
      if (control) {
        control.setValue(shouldCheck ? 1 : 0);
      }
    }
    this.cdr.detectChanges();
  }
}
