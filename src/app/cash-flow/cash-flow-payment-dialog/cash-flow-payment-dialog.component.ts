import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { catchError, debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { SupplierService } from '../../supplier/supplier.service';
import { CashFlowService } from '../cash-flow.service';
import { of } from 'rxjs/internal/observable/of';
import * as numeral from 'numeral';
import {Supplier} from '../../supplier/supplier.model';
import {Warehouse, WarehouseFilter} from '../../warehouse/warehouse.model';
import {WarehouseService} from '../../warehouse/warehouse.service';
import {InvoiceFilter} from '../../invoice/invoice.model';

@Component({
  selector: 'app-cash-flow-payment-dialog',
  templateUrl: './cash-flow-payment-dialog.component.html',
  styleUrls: ['./cash-flow-payment-dialog.component.css']
})
export class CashFlowPaymentDialogComponent implements OnInit {

  form: FormGroup;
  loading = false;
  isLoadingResults = false;
  isSelectedSupplier = false;
  local_data: any;
  cash_flow_id: string = null;
  public filteredSuppliers: Observable<Supplier[]>;

  supplier: Supplier;

  needToPayWarehouses: Warehouse[] = [];

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

  methodValues: string[] = [
    'supplier',
    'other'
  ];
  methodLabels = {
    'supplier': 'Chi nợ NCC',
    'other': 'Chi khác',
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
    public dialogRef: MatDialogRef<CashFlowPaymentDialogComponent>,
    public notifySer: NotifierService,
    public supplierService: SupplierService,
    public warehouseService: WarehouseService,
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
      type: ['payment'],
      method: ['supplier'],
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

    /**
     * Tim kiem khach hang
     */
    this.filteredSuppliers = this.form.controls['ten_nguoi_nop'].valueChanges.pipe(
      startWith(''),
      // delay emits
      debounceTime(300),
      // use switch map so as to cancel previous subscribed events, before creating new once
      switchMap(value => {
        if (value !== '') {
          // lookup from github
          return this.lookupSupplier(value);
        } else {
          // if no value is present, return null
          return of(null);
        }
      })
    );
  }

  loadCashFlow(id) {
    this.cashFlowService.getDetail(id, 'items').subscribe(cashFlow => {
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

      let ids = [];
      let itemsData = {};
      cashFlow.items.forEach((item, index) => {
        ids.push(item.warehouse_id);
        itemsData[item.warehouse_id] = item;
      });

      const filter = new WarehouseFilter();
      filter.id = ids.join(',');
      filter.pageSize = 200;
      this.isLoadingResults = true;

      let data = [];

      this.warehouseService.getList(filter).subscribe(res => {
        this.isLoadingResults = false;

        res.body.forEach( (item, index) => {
          let newItem = item;
          newItem.need_to_pay_amount = itemsData[item.id]['need_to_process_amount'];
          data.push(newItem);

          this.form.addControl('needToPayWarehouses[' + index + ']', new FormControl(numeral(itemsData[item.id]['processed_amount']).format('0,0'), Validators.required));
        });

        this.needToPayWarehouses = data;
      });

    });
  }

  submit() {
    let date_created = '';
    if (this.form.valid) {
      const data = this.form.getRawValue();

      let needToPayData = [];

      this.needToPayWarehouses.forEach((item, index) => {
        let needToPayItem = {
          warehouse_id: item.id,
          processed_amount: numeral(this.form.controls['needToPayWarehouses[' + index + ']'].value).value(),
          need_to_process_amount: item['need_to_pay_amount']
        };
        needToPayData.push(needToPayItem);
      });

      data['warehouse_items'] = needToPayData;

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

  onSelectedSupplier(supplier) {
    // loadWarehouse need to pay
    const filter = new WarehouseFilter();
    filter.supplier_id = supplier.id;
    filter.needToPay = 1;
    filter.sort = 'created_at';
    this.isLoadingResults = true;

    let totalPaid = numeral(this.form.controls['value'].value ? this.form.controls['value'].value : 0).value();

    this.warehouseService.getList(filter).subscribe(res => {
      this.isLoadingResults = false;
      let data = [];

      res.body.forEach( (item, index) => {
        let newItem = item;
        let payItemAmount = item.remain_amount * -1;
        newItem['need_to_pay_amount'] = payItemAmount;
        data.push(newItem);

        if (totalPaid >= payItemAmount) {
          totalPaid -= payItemAmount;
        } else {
          payItemAmount = totalPaid;
          totalPaid = 0;
        }
        this.form.addControl('needToPayWarehouses[' + index + ']', new FormControl(numeral(payItemAmount).format('0,0'), Validators.required));
      });

      this.needToPayWarehouses = data;
    });
    this.isSelectedSupplier = true;
    this.form.controls['nguoi_nop_id'].patchValue(supplier.id);
    this.form.controls['ten_nguoi_nop'].patchValue(supplier.name);
  }

  removeSupplier() {
    this.form.controls['ten_nguoi_nop'].patchValue('');
    this.form.controls['nguoi_nop_id'].patchValue(null);
    this.isSelectedSupplier = false;
    this.needToPayWarehouses.forEach((item, index) => {
      this.form.removeControl('needToPayWarehouses[' + index + ']');
    });
    this.needToPayWarehouses = [];
    this.supplier = null;
  }

  formatMoney(event: any, index) {
    event.target.value = numeral(event.target.value).format('0,0');
  }

  shareItemAmount() {
    let totalPaid = numeral(this.form.controls['value'].value ? this.form.controls['value'].value : 0).value();

    this.needToPayWarehouses.forEach( (item, index) => {
      let payItemAmount = item['need_to_pay_amount'];
      if (totalPaid >= payItemAmount) {
        totalPaid -= payItemAmount;
      } else {
        payItemAmount = totalPaid;
        totalPaid = 0;
      }
      this.form.controls['needToPayWarehouses[' + index + ']'].patchValue(numeral(payItemAmount).format('0,0'));
    });
  }

  sumTotalAmount() {
    let totalAmount = 0;

    this.needToPayWarehouses.forEach( (item, index) => {
      totalAmount += numeral(this.form.controls['needToPayWarehouses[' + index + ']'].value).value();
    });

    this.form.controls['value'].patchValue(numeral(totalAmount).format('0,0'));
  }


}
