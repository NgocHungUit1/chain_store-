import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { Observable } from 'rxjs';
import { Supplier } from '../../supplier/supplier.model';
import { catchError, debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { SupplierService } from '../../supplier/supplier.service';

@Component({
  selector: 'app-cash-flow-receipt-dialog',
  templateUrl: './cash-flow-receipt-dialog.component.html',
  styleUrls: ['./cash-flow-receipt-dialog.component.css']
})
export class CashFlowReceiptDialogComponent implements OnInit {

  form: FormGroup;
  loading = false;
  local_data: any;

  filteredSuppliers: Observable<Supplier[]>;

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


  constructor(
    public dialogRef: MatDialogRef<CashFlowReceiptDialogComponent>,
    public notifySer: NotifierService,
    public supplierService: SupplierService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {
    this.local_data = { ...data };
  }


  onNoClick(): void {
    this.dialogRef.close();
  }


  initForm() {

    // id	int Auto Increment
    // no	varchar(30) NULL
    // type	varchar(10) NULL	loai chung tu phieu thu phieu chi
    // value	int NULL	giá trị
    // phone	varchar(20) NULL
    // type_money	varchar(10) NULL	tiền mặt, ngân hàng
    // method	varchar(10) NULL	phương thức: chuyển khoản, thẻ
    // doi_tuong_nop	varchar(10) NULL	đối tượng nộp: khách hàng, nhà cung cấp, nhân viên, khác
    // nguoi_nop_id	int NULL	 id người nộp
    // tai_khoan_nhan_id	int NULL	id tai khoan nhan
    // tai_khoan_gui_id	int NULL	id tai khoan gui
    // parent_id	int NULL	id hóa đơn
    // parent_table	int NULL	table hóa đơn
    // note	varchar(200) NULL
    // address	varchar(200) NULL	địa chỉ
    // status
    //
    this.form = this.fb.group({
      no: [null, [Validators.required, Validators.maxLength(50)]],
      status: [10, Validators.required],
      phone: [null],
      type_money: [null],
      method: [null],
      doi_tuong_nop: [null],
      nguoi_nop_id: [null],
      tai_khoan_nhan_id: [null],
      tai_khoan_gui_id: [null],
      note: [null],
    });
  }

  displaySupplier(supplier?: Supplier): string | undefined {
    return (supplier === undefined || supplier === null) ? undefined : supplier.name;
  }

  ngOnInit(): void {
    this.initForm();
    
    this.filteredSuppliers = this.form.controls['nguoi_nop_id'].valueChanges.pipe(
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

  submit() {
    if (this.form.valid) {

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




}
