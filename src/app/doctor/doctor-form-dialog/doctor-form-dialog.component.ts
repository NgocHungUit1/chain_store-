import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '../../location/location.model';
import { Observable } from 'rxjs/Observable';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { LocationService } from '../../location/location.service';
import { CustomerService } from '../../customer/customer.service';
import { map, startWith } from 'rxjs/operators';
import * as moment from 'moment';
import { DoctorService } from '../doctor.service';
import { BranchFilter } from '../../branch/branch.model';
import { BranchService } from '../../branch/branch.service';

class ImageSnippet {
  pending = false;
  status = 'init';

  constructor(public src: string, public file: File) {
  }
}


@Component({
  selector: 'app-doctor-form-dialog',
  templateUrl: './doctor-form-dialog.component.html',
  styleUrls: ['./doctor-form-dialog.component.css']
})
export class DoctorFormDialogComponent implements OnInit {

  form: FormGroup;
  loading = false;
  provinces: Location[] = [];
  districts: Location[] = [];
  wards: Location[] = [];
  filteredProvinces: Observable<any[]>;
  filteredDistricts: Observable<any[]>;
  filteredWards: Observable<any[]>;
  local_data: any;
  doctor_id: string;
  branchList: any;
  branchFilter: BranchFilter = new BranchFilter();

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
  selectedFile: ImageSnippet;
  url = '';

  constructor(
    public dialogRef: MatDialogRef<DoctorFormDialogComponent>,
    public notifySer: NotifierService,
    public locationSer: LocationService,
    private fb: FormBuilder,
    private service: DoctorService,
    private branchService: BranchService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {

    this.local_data = {...data};
    this.doctor_id = this.local_data.doctor_id;

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  initForm() {
    this.getListBranch();
    this.form = this.fb.group({
      no: [null],
      name: [
        null,
        Validators.compose([
          Validators.required,
          Validators.maxLength(100)
        ])
      ],
      phone: [null],
      email: [null, Validators.compose([
        Validators.maxLength(25)
      ])],
      address: [null, Validators.compose([
        Validators.maxLength(200)
      ])],
      district: [null],
      ward: [null],
      province: [null],
      note: [null],
      branch_id: [null],
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

    if (this.doctor_id !== null && this.doctor_id !== undefined) {
      this.loadCustomer(this.doctor_id);
    }

    this.service.getRenderNo().subscribe(no => {
      if (this.form.controls['no'].value === null) {
        this.form.patchValue({
          no: 'BS' + no
        });
      }
    });

  }

  getListBranch() {
    this.branchFilter.pageSize = 100;
    this.branchService.getList(this.branchFilter).subscribe(res => {
      this.branchList = res.body;
    });
  }

  loadCustomer(id) {
    this.service.getDetail(id, 'province,district,ward').subscribe(data => {

      this.form.patchValue({
        name: data['name'],
        phone: data['phone'],
        email: data['email'],
        address: data['address'],
        district: data['district'],
        ward: data['ward'],
        province: data['province'],
        note: data['note'],
        sex: data['sex'],
        branch_id: data['branch_id']
      });

      if (data['province_id'] !== null) {
        this.locationSer.autocomplete('', 'district', data['province_id']).subscribe(locations => {
          this.districts = locations;
        });
      }

      if (data['district_id'] !== null) {
        this.locationSer.autocomplete('', 'ward', data['district_id']).subscribe(locations => {
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
      if (this.doctor_id !== null && this.doctor_id !== undefined) {
        this.service.update(this.doctor_id, data).subscribe(res => {
          this.notifySer.notify('success', 'Cập nhật bác sĩ thành công!');
          this.dialogRef.close(res);
        });
      } else {
        this.service.create(data).subscribe(res => {
          this.notifySer.notify('success', 'Thêm bác sĩ thành công!');
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

  processFile(imageInput: any) {
    const file: File = imageInput.files[0];
    const reader = new FileReader();

    reader.addEventListener('load', (event: any) => {
      this.selectedFile = new ImageSnippet(event.target.result, file);
      this.onSuccess();
      this.url = event.target.result;
      // this.selectedFile.pending = true;
      // this.imageService.uploadImage(this.selectedFile.file).subscribe(
      //   (res) => {
      //     this.onSuccess();
      //   },
      //   (err) => {
      //     this.onError();
      //   })
    });
    if (file) {
      reader.readAsDataURL(file);
    }
  }

  onSuccess() {
    this.selectedFile.pending = false;
    this.selectedFile.status = 'ok';
  }

  onError() {
    this.selectedFile.pending = false;
    this.selectedFile.status = 'fail';
    this.selectedFile.src = '';
  }

}
