import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { NotifierService } from 'angular-notifier';
import { CustomerComplaintService } from '../../services/customer-complaint.service';

@Component({
  selector: 'app-customer-complaint-form-dialog',
  templateUrl: './customer-complaint-form-dialog.component.html',
  styleUrls: ['./customer-complaint-form-dialog.component.scss']
})
export class CustomerComplaintFormDialogComponent implements OnInit {
  complaintForm: FormGroup;
  isSubmitting = false;
  customers: any[] = [];
  filteredCustomers: Observable<any[]>;
  today = new Date();
  isExistingCustomer = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CustomerComplaintFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private notifyService: NotifierService,
    private customerComplaintService: CustomerComplaintService
  ) { }

  ngOnInit(): void {
    this.initForm();

    // Thiết lập auto-complete cho tìm kiếm khách hàng
    this.filteredCustomers = this.complaintForm.get('customerInput').valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(value => {
          if (typeof value === 'string' && value.length > 2) {
            return this.customerComplaintService.searchCustomers(value);
          }
          return [];
        })
      );

    // Lắng nghe sự thay đổi của customerInput để cập nhật trạng thái khách hàng
    this.complaintForm.get('customerInput').valueChanges.subscribe(value => {
      if (typeof value === 'object' && value && value.id) {
        this.isExistingCustomer = true;
      } else {
        this.isExistingCustomer = false;
      }
    });
  }

  initForm(): void {
    if (this.data.isEdit) {
      const complaint = this.data.complaint;
      this.isExistingCustomer = !!complaint.customer_id;

      this.complaintForm = this.fb.group({
        id: [complaint.id],
        complaint_date: [new Date(complaint.complaint_date), Validators.required],
        customer_id: [complaint.customer_id],
        customerInput: [complaint.customer_name],
        customer_name: [complaint.customer_name, Validators.required],
        phone: [complaint.customer_phone || complaint.phone || ''],
        address: [complaint.address || ''],
        complaint_content: [complaint.complaint_content, Validators.required],
        recipient: [complaint.recipient, Validators.required],
        resolution: [complaint.resolution],
        status: [complaint.status, Validators.required]
      });
    } else {
      this.complaintForm = this.fb.group({
        complaint_date: [this.today, Validators.required],
        customer_id: [null],
        customerInput: [''],
        customer_name: ['', Validators.required],
        phone: [''],
        address: [''],
        complaint_content: ['', Validators.required],
        recipient: ['', Validators.required],
        resolution: [''],
        status: [9, Validators.required]
      });
    }
  }

  displayCustomerFn(customer: any): string {
    return customer && customer.name ? `${customer.name} - ${customer.phone || 'Không có SĐT'}` : '';
  }

  onCustomerSelected(event: any): void {
    const customer = event.option.value;
    this.isExistingCustomer = true;

    this.complaintForm.patchValue({
      customer_id: customer.id,
      customer_name: customer.name,
      phone: customer.phone || '',
      address: customer.address || ''
    });
  }

  clearSelectedCustomer(): void {
    this.isExistingCustomer = false;

    this.complaintForm.patchValue({
      customer_id: null,
      customerInput: '',
      customer_name: '',
      phone: '',
      address: ''
    });
  }

  onSubmit(): void {
    if (this.complaintForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const formValue = this.complaintForm.value;

    // Chuyển đổi thành định dạng yyyy-MM-dd
    const complaintDate = formValue.complaint_date;
    const formattedDate = complaintDate.toISOString().split('T')[0];

    const payload: any = {
      complaint_date: formattedDate,
      complaint_content: formValue.complaint_content,
      recipient: formValue.recipient,
      resolution: formValue.resolution,
      status: formValue.status
    };

    // Nếu đã chọn khách hàng có sẵn
    if (this.isExistingCustomer && formValue.customer_id) {
      payload.customer_id = formValue.customer_id;
    } else {
      // Nếu đây là khách hàng mới, gửi thêm thông tin tên và số điện thoại
      payload.customer_id = null;
      payload.customer_name = formValue.customer_name;
      payload.phone = formValue.phone;
      payload.address = formValue.address;
    }

    if (this.data.isEdit) {
      this.customerComplaintService.updateCustomerComplaint(formValue.id, payload).subscribe(
        response => {
          this.notifyService.notify('success', 'Cập nhật khiếu nại thành công');
          this.dialogRef.close(true);
          this.isSubmitting = false;
        },
        error => {
          console.error('Error updating complaint:', error);
          this.notifyService.notify('error', 'Có lỗi xảy ra khi cập nhật khiếu nại');
          this.isSubmitting = false;
        }
      );
    } else {
      this.customerComplaintService.createCustomerComplaint(payload).subscribe(
        response => {
          this.notifyService.notify('success', 'Tạo khiếu nại thành công');
          this.dialogRef.close(true);
          this.isSubmitting = false;
        },
        error => {
          console.error('Error creating complaint:', error);
          this.notifyService.notify('error', 'Có lỗi xảy ra khi tạo khiếu nại');
          this.isSubmitting = false;
        }
      );
    }
  }
}
