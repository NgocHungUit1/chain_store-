import { Component, Inject, OnInit, Optional, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { LocationService } from '../../location/location.service';
import * as moment from 'moment';
import { PrescriptionService } from '../prescription.service';
import { UsingFilter } from '../../product/using.model';
import { DoctorService } from '../../doctor/doctor.service';
import { DoctorFilter } from '../../doctor/doctor.model';
import { DoctorFormDialogComponent } from '../../doctor/doctor-form-dialog/doctor-form-dialog.component';
import { MedicalFacilityFormDialogComponent } from '../medical-facility-form-dialog/medical-facility-form-dialog.component';
import { MedicalFacilityService } from '../medical-facility.service';
import { MedicalFacilityFilter } from '../medical-facility.model';
import { environment } from '../../../environments/environment';

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
  loading = false;

  local_data: any;
  prescription_id: string;

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

    if (this.prescription_id !== null && this.prescription_id !== undefined) {
      console.log('Load: ' + this.prescription_id);
      this.loadDetail(this.prescription_id);
    } else {
      this.service.getRenderNo().subscribe(no => {
        if (this.form.controls['no'].value === null) {
          this.form.patchValue({
            no: 'DT' + no
          });
        }
      });
    }
  }

  loadDetail(id) {
    this.service.getDetail(id, '').subscribe(data => {
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
      });

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
    if (!file) return;

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

  submit() {
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
          this.dialogRef.close(res);
        }, error => {
          this.loading = false;
          this.notifySer.notify('error', 'Thêm đơn thuốc thất bại: ' + (error.message || 'Lỗi không xác định'));
          console.error('Error creating prescription:', error);
        });
      }
    }
  }

  openDoctorFormDialog() {
    const obj = {
      doctor_id: this.form.controls['doctor_id'].value,
    };
    const dialogRef = this.dialog.open(DoctorFormDialogComponent, {
      data: obj,
      width: '70%',
      minWidth: '600px',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== false && result !== undefined) {
        this.doctors.push(result);
        this.form.controls['doctor_id'].setValue(result.id);
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
}
