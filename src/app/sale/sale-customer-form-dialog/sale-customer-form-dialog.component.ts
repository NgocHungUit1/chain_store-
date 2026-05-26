import { Component, OnInit, Inject, Optional } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { CustomerService } from '../../customer/customer.service';
import { LocationService } from '../../location/location.service';
import { Location } from '../../location/location.model';
import { NotifierService } from 'angular-notifier';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { merge, Observable, Subject } from 'rxjs';
import * as moment from 'moment';
import { map, startWith } from 'rxjs/operators';
import { MatDateProviders } from '../../shared/providers/mat-date.provider';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';

const MY_FORMATS = {
  parse: { dateInput: 'DD/MM/YYYY' },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-sale-customer-form-dialog',
  templateUrl: './sale-customer-form-dialog.component.html',
  styleUrls: ['./sale-customer-form-dialog.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ...MatDateProviders
  ],
})
export class SaleCustomerFormDialogComponent implements OnInit {

  form: FormGroup;
  loading = false;
  today = new Date();
  provinces: Location[] = [];
  wards: Location[] = [];
  filteredProvinces: Observable<any[]>;
  filteredWards: Observable<any[]>;
  provinceFocus$ = new Subject<string>();
  wardFocus$ = new Subject<string>();
  local_data: any;
  customer_id: string;

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


  constructor(
    public dialogRef: MatDialogRef<SaleCustomerFormDialogComponent>,
    public notifySer: NotifierService,
    public locationSer: LocationService,
    private fb: FormBuilder,
    private customerSer: CustomerService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {
    this.local_data = { ...data };
    this.customer_id = this.local_data.customer_id;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  autoFormatDate(event: any) {
    const inputType = (event as InputEvent).inputType;
    if (inputType === 'deleteContentBackward' || inputType === 'deleteContentForward') {
      event.target.value = event.target.value.replace(/\/$/, '');
      return;
    }
    let digits = event.target.value.replace(/\D/g, '').slice(0, 8);
    if (digits.length >= 4) {
      digits = digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
    } else if (digits.length >= 2) {
      digits = digits.slice(0, 2) + '/' + digits.slice(2);
    }
    event.target.value = digits;
  }

  initForm() {
    this.form = this.fb.group({
      name: [
        null,
        Validators.compose([
          Validators.required,
          Validators.maxLength(32)
        ])
      ],
      phone: [null, Validators.compose([
        Validators.required,
        Validators.pattern(/^(0\d{9}|\+84\d{9})$/)
      ])],
      email: [null, Validators.compose([
        Validators.email,
        Validators.maxLength(20)
      ])],
      address: [null, Validators.compose([
        Validators.maxLength(200)
      ])],
      company_name: [null, Validators.compose([
        Validators.maxLength(64)
      ])],
      tax_code: [null, Validators.compose([
        Validators.maxLength(20)
      ])],
      id_card: [null, Validators.compose([
        Validators.maxLength(20)
      ])],
      ward: [null],
      province: [null],
      note: [null],
      facebook: [null, Validators.compose([
        Validators.maxLength(100)
      ])],
      dob: [null],
      sex: [null]
    });
  }

  ngOnInit(): void {
    this.initForm();

    this.locationSer.autocomplete('', 'province').subscribe(locations => {
      this.provinces = locations;
    });

    this.filteredProvinces = merge(
      this.form.controls['province'].valueChanges,
      this.provinceFocus$
    ).pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : ''),
      map(text => text ? this.filterProvince(text) : this.provinces.slice())
    );

    this.filteredWards = merge(
      this.form.controls['ward'].valueChanges,
      this.wardFocus$
    ).pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : ''),
      map(text => text ? this.filterWard(text) : this.wards.slice())
    );

    if (this.customer_id !== null && this.customer_id !== undefined) {
      this.loadCustomer(this.customer_id);
    }
  }

  loadCustomer(id) {
    this.customerSer.getDetail(id, 'province,ward').subscribe(customer => {
      let dobStr = null;
      if (customer['dob'] !== null) {
        dobStr = new Date(customer['dob']).toISOString();
      }
      this.form.patchValue({
        name: customer['name'],
        phone: customer['phone'],
        email: customer['email'],
        address: customer['address'],
        company_name: customer['company_name'],
        tax_code: customer['tax_code'],
        id_card: customer['id_card'],
        ward: customer['ward'],
        province: customer['province'],
        note: customer['note'],
        facebook: customer['facebook'],
        dob: dobStr,
        sex: customer['sex']
      });

      if (customer['province_id'] !== null) {
        this.locationSer.autocomplete('', 'ward', customer['province_id']).subscribe(locations => {
          this.wards = locations;
        });
      }
    });
  }

  filterProvince(name: string) {
    if (typeof name === 'string') {
      return this.provinces.filter(
        province => province.name.toLowerCase().indexOf(name.toLowerCase()) >= 0
      );
    }
  }


  filterWard(name: string) {
    if (typeof name === 'string') {
      return this.wards.filter(
        ward => ward.name.toLowerCase().indexOf(name.toLowerCase()) >= 0
      );
    }
  }

  displayLocation(location?: Location): string | undefined {
    return location ? location.name : undefined;
  }

  submit() {
    if (this.form.valid) {
      const data = this.form.getRawValue();

      if (data['dob'] !== null) {
        const momentDate = new Date(data['dob']); // Replace event.value with your date value
        const formattedDate = moment(momentDate).format('YYYY-MM-DD');
        data['dob'] = formattedDate;
      }
      if (data['province'] !== null) {
        data['province_id'] = data['province'].id;
      }

      if (data['ward'] !== null) {
        data['ward_id'] = data['ward'].id;
      }
      if (this.customer_id !== null && this.customer_id !== undefined) {
        this.customerSer.update(this.customer_id, data).subscribe(res => {
          this.notifySer.notify('success', 'Cập nhật khách hàng thành công!');
          this.dialogRef.close(res);
        });
      } else {
        this.customerSer.create(data).subscribe(res => {
          this.notifySer.notify('success', 'Thêm khách hàng thành công!');
          this.dialogRef.close(res);
        });
      }
    }
  }

  onProvinceChange(province) {
    this.form.controls['province'].setValue(province);
    this.form.patchValue({
      ward: null
    });
    this.wards = [];
    if (province !== null) {
      this.locationSer.autocomplete('', 'ward', province.id).subscribe(locations => {
        this.wards = locations;
      });
    }
  }


}
