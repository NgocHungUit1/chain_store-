import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomerService } from '../customer.service';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { LocationService } from '../../location/location.service';
import { Location } from '../../location/location.model';
import * as moment from 'moment';
import { MatDateProviders } from '../../shared/providers/mat-date.provider';
import { ENTER, SEMICOLON } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-customer-form-dialog',
  templateUrl: './customer-form-dialog.component.html',
  styleUrls: ['./customer-form-dialog.component.css'],
  providers: [...MatDateProviders]
})
export class CustomerFormDialogComponent implements OnInit {

  form: FormGroup;
  loading = false;
  provinces: Location[] = [];
  wards: Location[] = [];
  filteredProvinces: Observable<any[]>;
  filteredWards: Observable<any[]>;
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

  // Dị ứng / bệnh nền nhập dạng thẻ; lưu xuống vẫn là chuỗi phân cách ";"
  readonly separatorKeys = [ENTER, SEMICOLON, 59]; // 59: phím ; trên Firefox
  allergyList: string[] = [];
  historyList: string[] = [];
  allergySuggestions = ['Penicillin', 'Aspirin', 'Sulfamid', 'NSAID', 'Cephalosporin'];
  historySuggestions = ['Tăng huyết áp', 'Đái tháo đường', 'Hen phế quản', 'Suy thận', 'Viêm dạ dày'];

  get isEdit(): boolean {
    return this.customer_id !== null && this.customer_id !== undefined;
  }


  constructor(
    public dialogRef: MatDialogRef<CustomerFormDialogComponent>,
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
        Validators.maxLength(20)
      ])],
      email: [null, Validators.compose([
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
      drug_allergy: [null],
      medical_history: [null],
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

    this.filteredProvinces = this.form.controls['province'].valueChanges.pipe(
      startWith(''),
      map(province => (province ? this.filterProvince(province) : this.provinces.slice()))
    );

    this.filteredWards = this.form.controls['ward'].valueChanges.pipe(
      startWith(''),
      map(ward => (ward ? this.filterWard(ward) : this.wards.slice()))
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
        drug_allergy: customer['drug_allergy'],
        medical_history: customer['medical_history'],
        facebook: customer['facebook'],
        dob: dobStr,
        sex: customer['sex']
      });
      this.allergyList = this.splitList(customer['drug_allergy']);
      this.historyList = this.splitList(customer['medical_history']);

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

  splitList(value: string): string[] {
    if (!value) {
      return [];
    }
    return value.split(';').map(s => s.trim()).filter(s => s.length > 0);
  }

  private listOf(field: string): string[] {
    return field === 'drug_allergy' ? this.allergyList : this.historyList;
  }

  private syncList(field: string) {
    const list = this.listOf(field);
    this.form.controls[field].setValue(list.length ? list.join('; ') : null);
    this.form.controls[field].markAsDirty();
  }

  addItem(field: string, event: MatChipInputEvent) {
    (event.value || '').split(';').forEach(v => this.pushItem(field, v, false));
    this.syncList(field);
    if (event.input) {
      event.input.value = '';
    }
  }

  pushItem(field: string, value: string, sync = true) {
    const item = (value || '').trim();
    const list = this.listOf(field);
    if (item && !list.some(x => x.toLowerCase() === item.toLowerCase())) {
      list.push(item);
    }
    if (sync) {
      this.syncList(field);
    }
  }

  removeItem(field: string, item: string) {
    const list = this.listOf(field);
    const i = list.indexOf(item);
    if (i >= 0) {
      list.splice(i, 1);
    }
    this.syncList(field);
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
