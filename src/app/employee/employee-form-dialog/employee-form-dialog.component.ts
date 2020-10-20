import {Component, Inject, OnInit, Optional} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Location} from '../../location/location.model';
import {Observable} from 'rxjs/Observable';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {LocationService} from '../../location/location.service';
import {map, startWith} from 'rxjs/operators';
import * as moment from 'moment';
import {EmployeeService} from '../employee.service';
import {UserService} from '../../user/user.service';
import {UserFilter} from '../../user/user.model';
import {UserFormDialogComponent} from '../../user/user-form-dialog/user-form-dialog.component';
import {BranchService} from '../../branch/branch.service';
import {BranchFilter} from '../../branch/branch.model';

class ImageSnippet {
  pending = false;
  status = 'init';

  constructor(public src: string, public file: File) {}
}

@Component({
  selector: 'app-employee-form-dialog',
  templateUrl: './employee-form-dialog.component.html',
  styleUrls: ['./employee-form-dialog.component.css']
})
export class EmployeeFormDialogComponent implements OnInit {

  form: FormGroup;
  loading = false;
  provinces: Location[] = [];
  districts: Location[] = [];
  wards: Location[] = [];
  filteredProvinces: Observable<any[]>;
  filteredDistricts: Observable<any[]>;
  filteredWards: Observable<any[]>;
  local_data: any;
  employee_id: string;

  userFilter: UserFilter = new UserFilter();
  branchFilter: BranchFilter = new BranchFilter();
  users: any;
  branchList: any;

  selectedFile: ImageSnippet;
  url = '';

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
    public dialogRef: MatDialogRef<EmployeeFormDialogComponent>,
    public notifySer: NotifierService,
    public locationSer: LocationService,
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private userService: UserService,
    private branchService: BranchService,
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {

    this.local_data = { ...data };
    this.employee_id = this.local_data.employee_id;

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  initForm() {
    this.form = this.fb.group({
      name: [null, Validators.compose([
          Validators.required,
          Validators.maxLength(32)
      ])],
      image_url: [null, Validators.compose([
        Validators.maxLength(255)
      ])],
      id_card: [null, Validators.compose([
        Validators.maxLength(20)
      ])],
      birth_date: [null],
      user_id: [null, Validators.compose([
        Validators.required,
        Validators.maxLength(40)
      ])],
      phone_number: [null, Validators.compose([
        Validators.maxLength(20)
      ])],
      email: [null, Validators.compose([
        Validators.maxLength(60)
      ])],
      facebook: [null, Validators.compose([
        Validators.maxLength(60)
      ])],
      address: [null, Validators.compose([
        Validators.maxLength(100)
      ])],
      district: [null],
      ward: [null],
      province: [null],
      note: [null],
      sex: [null],
      branches: [null, Validators.required],
    });
  }

  ngOnInit(): void {

    this.initForm();

    this.getListUser();

    this.getListBranch();

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

    if (this.employee_id !== null && this.employee_id !== undefined) {
      this.loadEmployee(this.employee_id);
    }

  }

  getListUser() {
    if (this.employee_id !== null && this.employee_id !== undefined) {
      this.userFilter.employee_id = this.employee_id;
    }
    this.userFilter.pageSize = 100;
    this.userFilter.not_employee = 1;
    this.userService.getList(this.userFilter).subscribe(res => {
      this.users = res.body;
    });
  }

  getListBranch() {
    this.branchFilter.pageSize = 100;
    this.branchService.getList(this.branchFilter).subscribe(res => {
      this.branchList = res.body;
    });
  }

  updateForm(id) {
    const user = this.users.find(x => x.id === id);
    if (user) {
      this.form.controls['phone_number'].setValue(user.phone_number);
      this.form.controls['email'].setValue(user.email);
      console.log(this.form.getRawValue());
    }
  }

  loadEmployee(id) {
    this.employeeService.getDetail(id).subscribe(employee => {
      let birthDate = null;
      if (employee['birth_date'] !== null) {
        birthDate = new Date(employee['birth_date']).toISOString();
      }
      this.form.patchValue({
        user_id: employee['user_id'],
        name: employee['name'],
        phone_number: employee['phone_number'],
        email: employee['email'],
        id_card: employee['id_card'],
        image_url: employee['image_url'],
        address: employee['address'],
        district: employee['district'],
        ward: employee['ward'],
        province: employee['province'],
        note: employee['note'],
        facebook: employee['facebook'],
        birth_date: birthDate,
        sex: employee['sex'],
        branches: employee['branchList']['array'],
      });

      if (employee['province_id'] !== null) {
        this.locationSer.autocomplete('', 'district', employee['province_id']).subscribe(locations => {
          this.districts = locations;
        });
      }

      if (employee['district_id'] !== null) {
        this.locationSer.autocomplete('', 'ward', employee['district_id']).subscribe(locations => {
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

      if (data['birth_date'] !== null) {
        const momentDate = new Date(data['birth_date']); // Replace event.value with your date value
        data['birth_date'] = moment(momentDate).format('YYYY-MM-DD');
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
      if (this.employee_id !== null && this.employee_id !== undefined) {
        this.employeeService.update(this.employee_id, data).subscribe(res => {
          this.notifySer.notify('success', 'Cập nhật nhân viên thành công!');
          this.dialogRef.close(res);
        }, (error) => {
          if (error.status === 422) {
            this.ajaxValidate(error);
          }
        });
      } else {
        this.employeeService.create(data).subscribe(res => {
          this.notifySer.notify('success', 'Thêm nhân viên thành công!');
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

  openUserFormDialog() {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '50%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getListUser();
        this.form.controls['user_id'].setValue(result.id);
        this.form.controls['phone_number'].setValue(result.phone_number);
        this.form.controls['email'].setValue(result.email);
      }
    });
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


  onSuccess() {
    this.selectedFile.pending = false;
    this.selectedFile.status = 'ok';
  }

  onError() {
    this.selectedFile.pending = false;
    this.selectedFile.status = 'fail';
    this.selectedFile.src = '';
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

  test() {
    if (this.form.getRawValue()['branches'].length === 0) {
      console.log('ok');
    }
    console.log(this.form.getRawValue()['branches']);
  }
}
