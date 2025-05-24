import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SupplierService } from '../supplier.service';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { LocationService } from '../../location/location.service';
import { Location } from '../../location/location.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-supplier-form-dialog',
  templateUrl: './supplier-form-dialog.component.html',
  styleUrls: ['./supplier-form-dialog.component.css']
})
export class SupplierFormDialogComponent implements OnInit {

  form: FormGroup;
  loading = false;
  provinces: Location[] = [];
  districts: Location[] = [];
  wards: Location[] = [];
  filteredProvinces: Observable<any[]>;
  filteredDistricts: Observable<any[]>;
  filteredWards: Observable<any[]>;
  local_data: any;
  supplier_id: string;

  public parentList = [];

  constructor(
    public dialogRef: MatDialogRef<SupplierFormDialogComponent>,
    public notifySer: NotifierService,
    public locationSer: LocationService,
    private fb: FormBuilder,
    private supplierSer: SupplierService,
    private http: HttpClient,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {
    this.local_data = {...data};
    this.supplier_id = this.local_data.supplier_id;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [
        null,
        Validators.compose([
          Validators.required,
          Validators.maxLength(60)
        ])
      ],
      phone_number: [null, Validators.required],
      email: [null],
      address: [null],
      company_name: [null],
      tax_code: [null],
      district: [null],
      ward: [null],
      province: [null],
      note: [null],
    });

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

    if (this.supplier_id !== null && this.supplier_id !== undefined) {
      this.loadSupplier(this.supplier_id);
    }
  }

  lookupBusinessInfo() {
    const taxCode = this.form.get('tax_code').value;
    if (!taxCode) {
      this.notifySer.notify('warning', 'Vui lòng nhập mã số thuế để tra cứu');
      return;
    }

    this.loading = true;
    this.supplierSer.lookupBusinessInfo(taxCode).subscribe(
      response => {
        this.loading = false;
          if (response.success && response.business_info) {
            const businessInfo = response.business_info;

            this.form.patchValue({
              name: businessInfo.name,
              address: businessInfo.address,
              company_name: businessInfo.name,
            });

            this.parseAddress(businessInfo.address);

            this.notifySer.notify('success', 'Đã cập nhật thông tin doanh nghiệp');
          } else {
            this.notifySer.notify('error', 'Không tìm thấy thông tin doanh nghiệp với mã số thuế này');
          }
        },
        error => {
          this.loading = false;
          this.notifySer.notify('error', 'Lỗi khi tra cứu thông tin doanh nghiệp');
          console.error('Error looking up business info:', error);
        }
        );
  }

  parseAddress(address: string) {
    if (!address) return;

    const parts = address.split(',').map(part => part.trim());

    const cityPart = parts.find(part =>
      part.includes('Thành phố') ||
      part.includes('Tỉnh') ||
      part.includes('TP.')
    );

    if (cityPart) {
      this.locationSer.autocomplete(cityPart, 'province').subscribe(locations => {
        if (locations && locations.length > 0) {
          const province = locations[0];
          this.form.patchValue({ province: province });
          this.onProvinceChange(province);
        }
      });
    }
  }

  loadSupplier(id) {
    this.supplierSer.getDetail(id, 'province,district,ward').subscribe(supplier => {
      this.form.patchValue({
        name: supplier['name'],
        phone_number: supplier['phone_number'],
        email: supplier['email'],
        address: supplier['address'],
        company_name: supplier['company_name'],
        tax_code: supplier['tax_code'],
        district: supplier['district'],
        ward: supplier['ward'],
        province: supplier['province'],
        note: supplier['note'],
      });
      if (supplier['province_id'] !== null) {
        this.locationSer.autocomplete('', 'district', supplier['province_id']).subscribe(locations => {
          this.districts = locations;
        });
      }
      if (supplier['district_id'] !== null) {
        this.locationSer.autocomplete('', 'ward', supplier['district_id']).subscribe(locations => {
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
      if (data['province'] !== null) {
        data['province_id'] = data['province'].id;
      }
      if (data['district'] !== null) {
        data['district_id'] = data['district'].id;
      }
      if (data['ward'] !== null) {
        data['ward_id'] = data['ward'].id;
      }
      if (this.supplier_id !== null && this.supplier_id !== undefined) {
        this.supplierSer.update(this.supplier_id, data).subscribe(res => {
          this.notifySer.notify('success', 'Cập nhật nhà cung cấp thành công!');
          this.dialogRef.close(res);
        });
      } else {
        this.supplierSer.create(data).subscribe(res => {
          this.notifySer.notify('success', 'Thêm nhà cung cấp thành công!');
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
