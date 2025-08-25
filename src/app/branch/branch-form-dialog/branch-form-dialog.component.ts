import {Component, Inject, OnInit, Optional} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Location} from '../../location/location.model';
import {Observable} from 'rxjs/Observable';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {LocationService} from '../../location/location.service';
import {map, startWith} from 'rxjs/operators';
import {BranchService} from '../branch.service';

@Component({
  selector: 'app-branch-form-dialog',
  templateUrl: './branch-form-dialog.component.html',
  styleUrls: ['./branch-form-dialog.component.css']
})
export class BranchFormDialogComponent implements OnInit {

  form: FormGroup;
  loading = false;
  provinces: Location[] = [];
  wards: Location[] = [];
  filteredProvinces: Observable<any[]>;
  filteredWards: Observable<any[]>;
  local_data: any;
  branch_id: string;

  nationalPharmacyLoginUsername: string;
  nationalPharmacyLoginPassword: string;
  hidePassword = true;

  statusItems: any[] = [
    {
      'id': 9,
      'title': 'Tạm khóa'
    },
    {
      'id': 10,
      'title': 'Đang hoạt động'
    }
  ];

  constructor(
    public dialogRef: MatDialogRef<BranchFormDialogComponent>,
    public notifySer: NotifierService,
    public locationSer: LocationService,
    private fb: FormBuilder,
    private branchService: BranchService,
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {

    this.local_data = { ...data };
    this.branch_id = this.local_data.branch_id;

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  initForm() {
    this.form = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(50)]],
      phone_number: [null, [Validators.required, Validators.maxLength(20)]],
      email: [null, Validators.maxLength(50)],
      address: [null, [Validators.required, Validators.maxLength(200)]],
      ward: [null, Validators.required],
      province: [null, Validators.required],
      pharmacy_registration_number: [null, Validators.maxLength(100)],
      business_registration_certificate: [null, Validators.maxLength(100)],
      pharmacy_type: [null, Validators.maxLength(100)],
      representative_name: [null, Validators.maxLength(100)],
      representative_certificate_number: [null, Validators.maxLength(20)],
      representative_phone: [null, Validators.maxLength(20)],
      responsible_person_name: [null, Validators.maxLength(100)],
      practicing_certificate_no: [null, Validators.maxLength(100)],
      professional_qualification: [null, Validators.maxLength(100)],
      responsible_person_phone_number: [null, Validators.maxLength(20)],
      responsible_person_email: [null, Validators.maxLength(100)],
      status: [10, Validators.required],
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

    if (this.branch_id !== null && this.branch_id !== undefined) {
      this.loadBranch(this.branch_id);
    }

  }

  loadBranch(id) {
    this.branchService.getDetail(id).subscribe(branch => {
      this.form.patchValue({
        name: branch['name'],
        phone_number: branch['phone_number'],
        sub_phone_number: branch['sub_phone_number'],
        email: branch['email'],
        pharmacy_registration_number: branch['pharmacy_registration_number'],
          business_registration_certificate: branch['business_registration_certificate'],
        pharmacy_type: branch['pharmacy_type'],
        representative_name: branch['representative_name'],
        representative_certificate_number: branch['representative_certificate_number'],
        representative_phone: branch['representative_phone'],
        responsible_person_name: branch['responsible_person_name'],
        practicing_certificate_no: branch['practicing_certificate_no'],
        professional_qualification: branch['professional_qualification'],
        responsible_person_phone_number: branch['responsible_person_phone_number'],
        responsible_person_email: branch['responsible_person_email'],
        status: branch['status'],
        address: branch['address'],
        ward: branch['ward'],
        province: branch['province'],
      });

      this.nationalPharmacyLoginUsername =  branch['national_pharmacy_login_username'];
      // @ts-ignore
      this.nationalPharmacyLoginPassword = branch['national_pharmacy_login_password'];

      if (branch['province_id'] !== null) {
        this.locationSer.autocomplete('', 'ward', branch['province_id']).subscribe(locations => {
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
      if (data['province'] !== null) {
        data['province_id'] = data['province'].id;
      }
      if (data['ward'] !== null) {
        data['ward_id'] = data['ward'].id;
      }
      if (this.branch_id !== null && this.branch_id !== undefined) {
        this.branchService.update(this.branch_id, data).subscribe(res => {
          this.notifySer.notify('success', 'Cập nhật chi nhánh thành công!');
          this.dialogRef.close(res);
        }, (error) => {
          if (error.status === 422) {
            this.ajaxValidate(error);
          }
        });
      } else {
        this.branchService.create(data).subscribe(res => {
          this.notifySer.notify('success', 'Thêm chi nhánh thành công!');
          this.dialogRef.close(res);
        }, (error) => {
          if (error.status === 422) {
            this.ajaxValidate(error);
          }
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

  public ajaxValidate(error) {
    if (error.error) {
      if (this.form instanceof FormGroup) {
        const _fields = this.form.controls;
        Object.keys(_fields).forEach(key => {
          const errorField = error.error.find(x => x.field === key);
          if (errorField) {
            this.form.controls[key].setErrors({
              ajaxValidator: {
                value: errorField.message,
              }
            });
          }
        });
      }
    }
  }
}
