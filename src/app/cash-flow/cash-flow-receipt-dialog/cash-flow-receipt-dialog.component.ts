import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { Observable } from 'rxjs';
import { Supplier } from '../../supplier/supplier.model';
import { catchError, debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { SupplierService } from '../../supplier/supplier.service';
import { CashFlowService } from '../cash-flow.service';
import * as numeral from 'numeral';

@Component({
  selector: 'app-cash-flow-receipt-dialog',
  templateUrl: './cash-flow-receipt-dialog.component.html',
  styleUrls: ['./cash-flow-receipt-dialog.component.css']
})
export class CashFlowReceiptDialogComponent implements OnInit {

  form: FormGroup;
  loading = false;
  local_data: any;
  cash_flow_id: string = null;

  doi_tuong_nop_value: string[] = [
    'customer',
    'employee',
    'supplier',
    'orther'
  ];

  doi_tuong_nop_label = {
    'customer': 'Khách hàng',
    'employee': 'Nhân viên',
    'supplier': 'Nhà cung cấp',
    'orther': 'Khác',
  };

  fieldLabels = {
    no: 'Mã phiếu',
    phone: 'Điện thoại',
    type_money: 'Loại tiền',
    method: 'Phương thức',
    doi_tuong_nop: 'Đối tượng nộp',
    nguoi_nop_id: 'Người nộp',
    ten_nguoi_nop: 'Tên người nộp',
    tai_khoan_nhan_id: 'Tài khoản nhận',
    tai_khoan_gui_id: 'Tài khoản gửi',
    value: 'Giá trị'
  };

  constructor(
    public dialogRef: MatDialogRef<CashFlowReceiptDialogComponent>,
    public notifySer: NotifierService,
    public supplierService: SupplierService,
    public cashFlowService: CashFlowService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {
    this.local_data = {...data};
    this.cash_flow_id = this.local_data.id;
  }


  onNoClick(): void {
    this.dialogRef.close();
  }


  initForm() {
    let time = null;
    const today = new Date();
    time = ('0' + today.getHours()).slice(-2) + ':' + ('0' + today.getMinutes()).slice(-2);
    this.form = this.fb.group({
      no: [null, [Validators.required, Validators.maxLength(50)]],
      type: ['receipt'],
      phone: [null],
      type_money: ['money'],
      doi_tuong_nop: [null, [Validators.required]],
      nguoi_nop_id: [null],
      ten_nguoi_nop: [null],
      parent_table: [null],
      value: [null],
      note: [null],
      today: [today],
      time: [time]
    });


    this.cashFlowService.getRenderNo().subscribe(cash_flow_no => {
      if (this.form.controls['no'].value === null) {
        this.form.patchValue({no: cash_flow_no});
      }
    });

    if (this.cash_flow_id !== null && this.cash_flow_id !== undefined) {
      this.loadCashFlow(this.cash_flow_id);
    }
  }


  ngOnInit(): void {
    this.initForm();

  }

  loadCashFlow(id) {
    this.cashFlowService.getDetail(id).subscribe(cashFlow => {
      // @ts-ignore
      const today = new Date(1000 * cashFlow['created_at']);
      const time = ('0' + today.getHours()).slice(-2) + ':' + ('0' + today.getMinutes()).slice(-2);

      this.form.patchValue({
        no: cashFlow['no'],
        type: cashFlow['type'],
        type_money: cashFlow['type_money'],
        doi_tuong_nop: cashFlow['doi_tuong_nop'],
        nguoi_nop_id: cashFlow['nguoi_nop_id'],
        ten_nguoi_nop: cashFlow['ten_nguoi_nop'],
        value: numeral(cashFlow['value']).format('0,0'),
        note: cashFlow['note'],
        today: today,
        time: time,
        parent_table: cashFlow['parent_table']
      });

    });
  }

  submit() {
    let date_created = '';
    if (this.form.valid) {
      const data = this.form.getRawValue();

      if (data['today'] !== null && typeof data['today'] === 'object') {
        let effDate;
        if (!(data['today'] instanceof Date)) {
          effDate = data['today']._d;
        } else {
          effDate = new Date(data['today'].getTime() + (420 * 60 * 1000));
        }
        // @ts-ignore
        date_created = data['time'] + ' ' + effDate.toISOString().split('T')[0];
      }

      data.value = numeral(data.value).value();
      data.date_created = date_created;

      if (this.cash_flow_id === null || this.cash_flow_id === undefined) {
        this.cashFlowService.create(data).subscribe(cashFlow => {
          this.notifySer.notify('success', 'Thêm thành công!');
          this.dialogRef.close({event: 'save', data: cashFlow});
        });
      } else {
        this.cashFlowService.update(this.cash_flow_id, data).subscribe(cashFlow => {
          this.notifySer.notify('success', 'Cập nhật thành công!');
          this.dialogRef.close({event: 'save', data: cashFlow});
        });
      }

    } else {
      // Form errors
      const controls = Object.entries(this.form.controls);
      const hasError = this.checkToShowControlError(controls);
    }
  }

  lookupSupplier(value: string): Observable<Supplier[]> {
    return this.supplierService.autocomplete(value).pipe(
      // map the item property of the github results as our return object
      map(results => results),
      // catch errors
      catchError(_ => {
        return of(null);
      })
    );
  }

  checkToShowControlError(controls) {
    const count = controls.length;
    let hasError = false;
    for (let i = 0; i < count; i++) {
      const fieldName = controls[i][0];
      const fieldControl = controls[i][1];
      if (fieldControl['errors'] !== null) {
        this.notifySer.notify('error', 'Lỗi thông tin trường ' + this.fieldLabels[fieldName]);
        hasError = true;
        break;
      }
    }

    return hasError;
  }

  /**
   * Format input number
   * @Nghia
   */
  inputformatNumber(event: any) {
    event.target.value = numeral(event.target.value).format('0,0');
  }


}
