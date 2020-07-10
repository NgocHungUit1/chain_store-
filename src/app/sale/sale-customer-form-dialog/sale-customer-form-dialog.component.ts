import { Component, OnInit, Inject, Optional } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { CustomerService } from '../../customer/customer.service';
import { LocationService } from '../../location/location.service';
import { Location } from '../../location/location.model';
import { NotifierService } from 'angular-notifier';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { map, startWith } from 'rxjs/operators';


@Component({
  selector: 'app-sale-customer-form-dialog',
  templateUrl: './sale-customer-form-dialog.component.html',
  styleUrls: ['./sale-customer-form-dialog.component.css']
})
export class SaleCustomerFormDialogComponent implements OnInit {

  form: FormGroup;
  loading = false;
  provinces: Location[] = [];
  districts: Location[] = [];
  wards: Location[] = [];
  filteredProvinces: Observable<any[]>;
  filteredDistricts: Observable<any[]>;
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
      district: [null],
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

    this.filteredProvinces = this.form.controls['province'].valueChanges.pipe(
      startWith(''),
      map(province => (province ? this.filterProvince(province) : this.provinces.slice()))
    );
    this.filteredDistricts = this.form.controls['district'].valueChanges.pipe(
      startWith(''),
      map(district => (district ? this.filterDistrict(district) : this.districts.slice()))
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
    this.customerSer.getDetail(id, 'province,district,ward').subscribe(customer => {
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
        district: customer['district'],
        ward: customer['ward'],
        province: customer['province'],
        note: customer['note'],
        facebook: customer['facebook'],
        dob: dobStr,
        sex: customer['sex']
      });

      if (customer['province_id'] !== null) {
        this.locationSer.autocomplete('', 'district', customer['province_id']).subscribe(locations => {
          this.districts = locations;
        });
      }

      if (customer['district_id'] !== null) {
        this.locationSer.autocomplete('', 'ward', customer['district_id']).subscribe(locations => {
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

  filterDistrict(name: string) {
    if (typeof name === 'string') {
      return this.districts.filter(
        district => district.name.toLowerCase().indexOf(name.toLowerCase()) >= 0
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
      if (data['district'] !== null) {
        data['district_id'] = data['district'].id;
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
    this.form.patchValue({
      district: null
    });
    this.districts = [];
    if (province !== null) {
      this.locationSer.autocomplete('', 'district', province.id).subscribe(locations => {
        this.districts = locations;
      });
    }
  }

  onDistrictChange(district) {
    this.form.patchValue({
      ward: null
    });
    this.wards = [];
    if (district !== null) {
      this.locationSer.autocomplete('', 'ward', district.id).subscribe(locations => {
        this.wards = locations;
      });
    }
  }

}
