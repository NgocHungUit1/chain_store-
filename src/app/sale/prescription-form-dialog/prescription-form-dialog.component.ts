import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { LocationService } from '../../location/location.service';
import * as moment from 'moment';
import { PrescriptionService } from '../prescription.service';
import { DoctorService } from '../../doctor/doctor.service';
import { DoctorFilter } from '../../doctor/doctor.model';
import { DoctorFormDialogComponent } from '../../doctor/doctor-form-dialog/doctor-form-dialog.component';
import { MedicalFacilityFormDialogComponent } from '../medical-facility-form-dialog/medical-facility-form-dialog.component';
import { MedicalFacilityService } from '../medical-facility.service';
import { MedicalFacilityFilter } from '../medical-facility.model';
import { environment } from '../../../environments/environment';
import { INationalProduct } from './prescription-form-dialog.interface';
import { Prescription } from '../prescription.model';
import { Observable, of } from 'rxjs';
import { NationalPrescription } from '../order.model';
import { NationalPrescriptionService } from '../../national-prescription/national-prescription.service';
import { catchError, debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { OrderService } from '../order.service';
import { Product } from '../../product/product.model';

// Định nghĩa class ImageSnippet tương tự product-medicine-dialog
class ImageSnippet {
  constructor(public src: string, public file: File, public id: string) {
  }
}

@Component({
  selector: 'app-prescription-form-dialog',
  templateUrl: './prescription-form-dialog.component.html',
  styleUrls: ['./prescription-form-dialog.component.css']
})
export class PrescriptionFormDialogComponent implements OnInit {

  form: FormGroup;

  selectProduct = new FormControl();

  filteredProducts: Observable<any[]>;

  loading = false;

  local_data: any;
  prescription_id: string;

  prescriptionDetail: Prescription;
  nationPrescriptionIdSelect = null;
  prescriptionIdSelect = null;

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

  doctors = [];
  medicalFacilitys = [];


  nationalProductDataSource: INationalProduct[] = [];
  nationalProductDisplayedColumns: string[] = ['id', 'name', 'main_active_substance', 'unit', 'amount', 'usage'];

  // Các biến cho upload ảnh - dùng cách tương tự product-medicine-dialog
  imageButtons = [
    {isShow: true},
    {isShow: true},
    {isShow: true},
    {isShow: true},
  ];
  selectedFiles: ImageSnippet[] = [];

  constructor(
    public dialogRef: MatDialogRef<PrescriptionFormDialogComponent>,

    public notifySer: NotifierService,
    public locationSer: LocationService,
    public doctorService: DoctorService,
    public medicalFacilityService: MedicalFacilityService,
    private fb: FormBuilder,
    private service: PrescriptionService,
    private nationalPrescriptionService: NationalPrescriptionService,
    private orderService: OrderService,

    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {
    this.local_data = {...data};
    this.prescription_id = this.local_data.prescription_id;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  initForm() {
    this.form = this.fb.group({
      no: [null],
      name: [
        null,
        Validators.compose([
          Validators.maxLength(100)
        ])
      ],
      phone: [null],
      address: [null, Validators.compose([
        Validators.maxLength(200)
      ])],
      cmnd: [null],
      bhyt: [null],
      doctor_id: [null],
      note: [null],
      branch_id: [null],
      sex: [null],
      person: [null],
      weight: [null],
      age: [null],
      medical_facility_id: [null],
      image_1: [null],
      image_2: [null],
      image_3: [null],
      image_4: [null],
      medical_facility_phone_number: [null],
      prescription_type: [null],
      prescription_date: [null],
      doctor_note: [null],
      doctor_advice: [null],
    });
  }

  ngOnInit(): void {
    const doctorFilter = new DoctorFilter();
    doctorFilter.pageSize = 50;
    this.doctorService.getList(doctorFilter).subscribe(res => {
      this.doctors = res.body;
    });

    const medicalFacilityFilter = new MedicalFacilityFilter();
    medicalFacilityFilter.pageSize = 50;
    this.medicalFacilityService.getList(medicalFacilityFilter).subscribe(res => {
      this.medicalFacilitys = res.body;
    });

    this.initForm();
    this.filteredProducts = this.selectProduct.valueChanges.pipe(
      startWith(''),
      // delay emits
      debounceTime(300),
      // use switch map so as to cancel previous subscribed events, before creating new once
      switchMap(value => {
        if(typeof value == 'object') value = '';
        value = (value || '').trim();
        if (value !== '') {
            return this.lookupNationalPrescription(value);
        } else {
          // if no value is present, return null
          return of(null);
        }
      })
    );
    if (this.prescription_id !== null && this.prescription_id !== undefined) {
      console.log('Load: ' + this.prescription_id);
      this.loadDetail(this.prescription_id);
    } else {
      this.service.getRenderNo().subscribe(no => {
        if (this.form.controls['no'].value === null) {
          this.form.patchValue({
            no: 'DT' + no
          });
          // this is duplicated set value for autocomplete input
          this.selectProduct.setValue({nationalPrescriptionId: no});
        }
      });
    }

    this.onFormControlMedicalFacilityChange();
  }

  loadDetail(id) {
    this.service.getDetail(id, 'medicalFacility,nationalProducts').subscribe(data => {
      this.prescriptionDetail = data;

      // this is duplicated set value for autocomplete input
      this.selectProduct.setValue({nationalPrescriptionId: data['no']});

      this.form.patchValue({
        no: data['no'],
        name: data['name'],
        phone: data['phone'],
        email: data['email'],
        address: data['address'],
        note: data['note'],
        sex: data['sex'],
        branch_id: data['branch_id'],
        cmnd: data['cmnd'],
        bhyt: data['bhyt'],
        doctor_id: data['doctor_id'],
        person: data['person'],
        weight: data['weight'],
        age: data['age'],
        medical_facility_id: data['medical_facility_id'],
        medical_facility_phone_number: data['medicalFacility'] ? data['medicalFacility']['phone_number'] : null,
        prescription_type: data['prescription_type'],
        prescription_date: data['prescription_date'],
        doctor_note: data['doctor_note'],
        doctor_advice: data['doctor_advice'],
      });

      this.nationalProductDataSource = data['nationalProducts'];

      // Lấy thông tin host từ environment
      const apiUrlParts = environment.apiUrl.split('/');
      const baseUrl = apiUrlParts[0] + '//' + apiUrlParts[2]; // http://localhost:31080

      // Kiểm tra và xử lý đường dẫn ảnh
      if (data['image_1']) {
        let imagePath = data['image_1'];
        // Nếu ảnh không phải là base64 và không bắt đầu bằng http, thêm baseUrl + /upload/
        if (!imagePath.startsWith('data:') && !imagePath.startsWith('http')) {
          imagePath = `${baseUrl}/upload/${imagePath}`;
        }
        this.selectedFiles.push(new ImageSnippet(imagePath, null, '1'));
        this.imageButtons[0]['isShow'] = false;
      }

      if (data['image_2']) {
        let imagePath = data['image_2'];
        if (!imagePath.startsWith('data:') && !imagePath.startsWith('http')) {
          imagePath = `${baseUrl}/upload/${imagePath}`;
        }
        this.selectedFiles.push(new ImageSnippet(imagePath, null, '2'));
        this.imageButtons[1]['isShow'] = false;
      }

      if (data['image_3']) {
        let imagePath = data['image_3'];
        if (!imagePath.startsWith('data:') && !imagePath.startsWith('http')) {
          imagePath = `${baseUrl}/upload/${imagePath}`;
        }
        this.selectedFiles.push(new ImageSnippet(imagePath, null, '3'));
        this.imageButtons[2]['isShow'] = false;
      }

      if (data['image_4']) {
        let imagePath = data['image_4'];
        if (!imagePath.startsWith('data:') && !imagePath.startsWith('http')) {
          imagePath = `${baseUrl}/upload/${imagePath}`;
        }
        this.selectedFiles.push(new ImageSnippet(imagePath, null, '4'));
        this.imageButtons[3]['isShow'] = false;
      }

      this.reloadImageButtons();
    });
  }

  processFile(imageInput) {
    const file: File = imageInput.files[0];
    if (!file) { return; }

    // Kiểm tra kích thước file (5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.notifySer.notify('error', 'Kích thước file không được vượt quá 5MB');
      return;
    }

    // Kiểm tra loại file
    if (!file.type.match('image/jpeg') && !file.type.match('image/png') && !file.type.match('image/jpg')) {
      this.notifySer.notify('error', 'Chỉ chấp nhận file ảnh .jpg, .jpeg, .png');
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', (event: any) => {
      this.selectedFiles.push(new ImageSnippet(event.target.result, file, ''));
      this.reloadImageButtons();
    });

    reader.readAsDataURL(file);
    imageInput.value = '';

  }

  reloadImageButtons() {
    // Reset tất cả isShow về true
    this.imageButtons.forEach(img => {
      img.isShow = true;
    });

    // Đánh dấu các ô hình ảnh đã có ảnh
    this.selectedFiles.forEach((value, index) => {
      if (index < this.imageButtons.length) {
        this.imageButtons[index]['isShow'] = false;
      }
    });
  }

  removeSelectedImage(index) {
    const removeImage = this.selectedFiles[index];
    this.selectedFiles.splice(index, 1);
    this.reloadImageButtons();
  }
  validateForm(){
    const weightValue = this.form.controls['weight'].value;
    if (weightValue !== null && weightValue !== '') {
      const weightPattern = /^([1-9]\d*(\.\d+)?|0\.\d*[1-9]\d*)$/;
      if (!weightPattern.test(weightValue)) {
        this.notifySer.notify('error', 'Cân nặng phải là số lớn hơn 0');
        return false;
      }
    }
    const phoneValue = this.form.controls['phone'].value;
    if (phoneValue !== null && phoneValue !== '') {
      const phonePattern = /^(0\d{9}|\+84\d{9})$/;
      if (!phonePattern.test(phoneValue)) {
        this.notifySer.notify('error', 'Số điện thoại không hợp lệ (VD: 0xxxxxxxxx hoặc +84xxxxxxxxx)');
        return false;
      }
    }
    return true;
  }

  submit() {
    if(!this.validateForm()) return;
    if (this.form.valid) {
      this.loading = true;
      const data = this.form.getRawValue();

      // Xử lý ngày tháng nếu có
      if (data['dob'] !== null && data['dob'] !== undefined) {
        const momentDate = new Date(data['dob']);
        const formattedDate = moment(momentDate).format('YYYY-MM-DD');
        data['dob'] = formattedDate;
      }

      // Lấy thông tin host từ environment
      const apiUrlParts = environment.apiUrl.split('/');
      const baseUrl = apiUrlParts[0] + '//' + apiUrlParts[2]; // http://localhost:31080
      const uploadPath = `${baseUrl}/upload/`;

      // Lưu hình ảnh vào data, loại bỏ phần đường dẫn không cần thiết
      for (let i = 0; i < 4; i++) {
        if (i < this.selectedFiles.length) {
          const imageSrc = this.selectedFiles[i].src;

          // Nếu là URL đầy đủ, cắt bỏ phần đầu để chỉ lấy phần đường dẫn tương đối
          if (imageSrc.startsWith('http') && imageSrc.includes(uploadPath)) {
            data[`image_${i+1}`] = imageSrc.replace(uploadPath, '');
          } else {
            data[`image_${i+1}`] = imageSrc;
          }
        } else {
          data[`image_${i+1}`] = null;
        }
      }

      if (this.prescription_id !== null && this.prescription_id !== undefined) {
        // Update
        this.service.update(this.prescription_id, data).subscribe(res => {
          this.loading = false;
          this.notifySer.notify('success', 'Cập nhật thành công!');
          this.dialogRef.close(res);
        }, error => {
          this.loading = false;
          this.notifySer.notify('error', 'Cập nhật thất bại: ' + (error.message || 'Lỗi không xác định'));
          console.error('Error updating prescription:', error);
        });
      } else {
        // Create
        this.service.create(data).subscribe(res => {
          this.loading = false;
          this.notifySer.notify('success', 'Thêm đơn thuốc thành công!');
          if (this.nationPrescriptionIdSelect && this.prescriptionIdSelect) {
            this.nationalPrescriptionService
              .addToCart(this.nationPrescriptionIdSelect)
              .subscribe(res => {
                this.orderService.addNationalPrescriptionInvoice(this.prescriptionIdSelect, this.nationPrescriptionIdSelect);
                res.forEach(element => {
                  this.handlePriceListProduct(element);
                });

                this.dialogRef.close(res);
              });
          } else {
            this.dialogRef.close(res);
          }
        }, error => {
          this.loading = false;
          this.notifySer.notify('error', 'Thêm đơn thuốc thất bại: ' + (error.message || 'Lỗi không xác định'));
          console.error('Error creating prescription:', error);
        });
      }
    }
  }

  openDoctorFormDialog(doctorId: string | null = null) {
    const obj = {
      doctor_id: doctorId,
    };
    const dialogRef = this.dialog.open(DoctorFormDialogComponent, {
      data: obj,
      width: '70%',
      minWidth: '600px',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== false && result !== undefined) {
        if (doctorId !== null) {
          // Cập nhật: thay thế thông tin bác sĩ trong danh sách, không thêm mới
          const index = this.doctors.findIndex(d => d.id === doctorId);
          if (index !== -1) {
            this.doctors[index] = result;
            this.doctors = [...this.doctors]; // trigger re-render mat-select
          }
          this.form.controls['doctor_id'].setValue(result.id);
        } else {
          // Thêm mới
          this.doctors.push(result);
          this.form.controls['doctor_id'].setValue(result.id);
        }
      }
    });
  }

  openMedicalFacilityFormDialog() {
    const obj = {
      medical_facility_id: this.form.controls['medical_facility_id'].value,
    };
    const dialogRef = this.dialog.open(MedicalFacilityFormDialogComponent, {
      data: obj,
      width: '40%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== false && result !== undefined) {
        this.medicalFacilitys.push(result);
        this.form.controls['medical_facility_id'].setValue(result.id);
      }
    });
  }

  private onFormControlMedicalFacilityChange(): void {
    this.form.controls['medical_facility_id'].valueChanges.subscribe(value => {
      if (value !== null && value !== undefined) {
        this.form.controls['medical_facility_phone_number'].setValue(
          this.medicalFacilitys.find(x => x.id === value)?.phone_number
        );
      }
    });
  }

  public calculateDayByPrescriptionDate(): number {
    const now = new Date();
    const prescriptionDate = new Date(this.prescriptionDetail.prescription_date);
    const diffTime = now.getTime() - prescriptionDate.getTime();

    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  lookupNationalPrescription(value: string): Observable<NationalPrescription[]> {
    return this.nationalPrescriptionService.autocomplete(value).pipe(
      debounceTime(300),
      // map the item property of the github results as our return object
      map(results => {
        return results;
      }),
      // catch errors
      catchError(_ => {
        return of(null);
      })
    );
  }

  displayProductFn(product: any): string {
    if (!product) return ''; // Handle null/undefined
    return product.nationalPrescriptionId; // Show only the product name
  }

  onSelectedProduct(product) {
    this.nationPrescriptionIdSelect = product.nationalPrescriptionId;
    this.prescriptionIdSelect = product.prescriptionId;
    this.loadDetail(product.prescriptionId);
  }

  handlePriceListProduct(product: Product, samplePrescriptionId = null) {
    product.amount = parseInt(String(product.amount), 10);
    if (!Number.isInteger(product.amount)) {
      product.amount = 1;
    }

    // Default vat
    product.vat_percent = 0;

    let units = product.productUnits;
    // tslint:disable-next-line:no-shadowed-variable
    units.forEach(element => {
      element.quantity_of_stock = Math.floor(
        product.quantity_of_stock / element.value
      );
    });
    product.productUnits = units;
    this.orderService.addProduct(product, product.amount, samplePrescriptionId);
  }
}
