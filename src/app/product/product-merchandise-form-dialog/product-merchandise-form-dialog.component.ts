import { Component, Optional, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { NotifierService } from 'angular-notifier';
import { ProductService } from '../product.service';
import { GroupService } from '../group.service';
import { Group, GroupFilter } from '../group.model';
import { PlacementService } from '../placement.service';
import { PlacementFilter } from '../placement.model';
import { ProductGroupFormDialogComponent } from '../product-group-form-dialog/product-group-form-dialog.component';
import { ProductPlacementFormDialogComponent } from '../product-placement-form-dialog/product-placement-form-dialog.component';
import * as numeral from 'numeral';

class ImageSnippet {
  constructor(public src: string, public file: File, public id: string) {
  }
}

@Component({
  selector: 'app-product-merchandise-form-dialog',
  templateUrl: './product-merchandise-form-dialog.component.html',
  styleUrls: ['./product-merchandise-form-dialog.component.css']
})
export class ProductMerchandiseFormDialogComponent implements OnInit {

  action: string;
  title: string;
  local_data: any;
  product_id: string;
  copy_product_id: string;
  public form: FormGroup;
  loading = false;

  groups: Group[] = [];
  usings = [];
  placements = [];
  manufacturers = [];

  // filteredMedicines: Observable<Medicine[]>;

  fieldLabels = {
    product_no: 'Mã hàng',
    barcode: 'Mã vạch',
    product_type: 'Loại hàng',
    shortcut: 'Tên viết tắt',
    using_id: 'Đường dùng',
    group_id: 'Nhóm hàng',
    placements: 'Mã hàng',
    product_name: 'Tên hàng',
    sell_price: 'Giá bán',
    original_price: 'Giá gốc',
    weight: 'Trọng lượng',
    base_unit: 'Đơn vị cơ bản',
    // Medicine
    registration_no: 'Số đăng ký',
    main_active_substance: 'Hoạt chất',
    content: 'Hàm lượng',
    packing: 'Quy cách đóng gói',
    manufacturer: 'Hãng sản xuất',
    made_in: 'Nước sản xuất',
    unit_name: 'Tên đơn vị',
    unit_value: 'Giá trị quy đổi',
    unit_price: 'Giá bán',
    unit_no: 'Mã hàng',
  };

  imageButtons = [
    {isShow: true},
    {isShow: true},
    {isShow: true},
    {isShow: true},
    {isShow: true},
  ];

  selectedFiles: ImageSnippet[] = [];

  constructor(
    public dialogRef: MatDialogRef<ProductMerchandiseFormDialogComponent>,
    private fb: FormBuilder,
    private productSer: ProductService,
    private groupSer: GroupService,
    public notifySer: NotifierService,
    private placementSer: PlacementService,
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    this.local_data = {...data};
    this.action = this.local_data.action;
    this.title = this.local_data.title;
    this.copy_product_id = this.local_data.copy_product_id;
    this.product_id = this.local_data.product_id;
  }


  initForm() {
    this.form = this.fb.group({
      // name : [null, Validators.required],
      product_no: [
        null,
        Validators.required
      ],
      barcode: [null],
      product_type: ['merchandise'],
      shortcut: [null],
      using_id: [-1],
      group_id: [null],
      placements: [[]],
      product_name: [null, Validators.required],
      sell_price: [null, Validators.required],
      original_price: [null, Validators.required],
      weight: [null],
      base_unit: [null, Validators.required],
      medicine_id: [null],
      quantity_of_stock: [null],
      // Medicine
      // medicine: this.fb.group({
      //   registration_no: [null, Validators.required],
      //   main_active_substance: [null, Validators.required],
      //   content: [null, Validators.required],
      //   packing: [null, Validators.required],
      //   manufacturer: [null, Validators.required],
      //   made_in: [null]
      // }),

      units: new FormArray([]),
      min_quantity: [0],
      max_quantity: [0],
      description: [null],
      note: [null],
    });
  }


  ngOnInit() {

    const groupFilter = new GroupFilter();
    // groupFilter.store_id = 1;
    this.groupSer.getList(groupFilter).subscribe(res => {
      this.groups = res.body;
    });

    const placementFilter = new PlacementFilter();
    this.placementSer.getList(placementFilter).subscribe(res => {
      this.placements = res.body;
    });

    this.initForm();

    if (this.product_id !== null) {
      const id = this.product_id !== null ? this.product_id : this.copy_product_id;
      this.loadProduct(id, null);
    }

    if (this.copy_product_id !== null) {
      const id = this.product_id !== null ? this.product_id : this.copy_product_id;
      this.loadProduct(id, true);
    }

    this.productSer.getRenderProductNo().subscribe(product_no => {
      if (this.form.controls['product_no'].value === null) {
        this.form.patchValue({
          product_no: 'HH' + product_no
        });
      }
    });
  }

  closeDialog() {
    this.dialogRef.close({event: 'Cancel'});
  }

  removeUnit(i) {
    this.units.removeAt(i);
  }

  get units() {
    return this.form.get('units') as FormArray;
  }

  addUnit() {
    const index = this.units.length + 1;

    const group = new FormGroup({
      unit_name: new FormControl('', Validators.required),
      unit_value: new FormControl(0, Validators.required),
      unit_price: new FormControl(0, Validators.required),
      unit_no: new FormControl(this.form.controls['product_no'].value + '-' + index)
    });

    this.units.push(group);
  }

  submit(action) {
    if (this.form.valid) {
      this.loading = true;
      const data = this.form.getRawValue();

      data.original_price = numeral(data.original_price).value();
      data.sell_price = numeral(data.sell_price).value();

      if (this.product_id === null) {
        // Create New
        if (data.product_no === null || data.product_no === '') {
          this.productSer.getRenderProductNo().subscribe(product_no => {
            data.product_no = 'HH' + product_no;
            this.productSer.create(data).subscribe(product => {
              this.notifySer.notify('success', 'Thêm hàng hóa thành công!');
              this.uploadImage(product, action);
              this.dialogRef.close({event: action, data: product});
            });
          });
        } else {
          this.productSer.create(data).subscribe(product => {
            this.notifySer.notify('success', 'Thêm hàng hóa thành công!');
            this.uploadImage(product, action);
            this.dialogRef.close({event: action, data: product});
          });
        }

      } else if (this.product_id !== null) {
        // UPDATE
        this.productSer.update(this.product_id, data).subscribe(product => {
          this.notifySer.notify('success', 'Cập nhật hàng hóa thành công!');
          this.uploadImage(product, action);
          this.dialogRef.close({event: action, data: product});
        });
      }

    } else {

      // Form errors
      let controls = Object.entries(this.form.controls);
      let hasError = this.checkToShowControlError(controls);

      if (!hasError) {
        controls = Object.entries(this.units.controls);

        for (let i = 0; i < controls.length; i++) {
          const childControls = Object.entries(controls[i][1]['controls']);

          hasError = this.checkToShowControlError(childControls);
          if (hasError) {
            break;
          }
        }
      }
    }
  }

  uploadImage(product, action) {
    if (this.selectedFiles.length > 0) {
      /**
       * Upload product images
       */
      const formData = new FormData();
      formData.append('product_id', product['id']);

      this.selectedFiles.forEach(imageSnip => {
        if (imageSnip.id.length === 0) {
          formData.append('files[]', imageSnip.file);
        } else {
          formData.append('ids[]', imageSnip.id);
        }
      });

      this.productSer.uploadImage(formData).subscribe(res => {
        this.loading = false;
        if (res['success'] === false) {
          this.notifySer.notify('error', 'Không thể tải hình ảnh!');
        }
        if (action === 'Save') {
          this.dialogRef.close({event: this.action, data: product});
        } else if (action === 'SaveAndMore') {
          this.form.reset({
            product_type: 'merchandise'
          });
          this.selectedFiles = [];
          this.form.controls['units'] = new FormArray([]);
          this.reloadImageButtons();
        } else if (action === 'SaveAndCopy') {
          this.product_id = null;
          this.copy_product_id = product.id;
          this.selectedFiles = [];
          this.reloadImageButtons();
          this.form.controls['units'] = new FormArray([]);
          this.loadProduct(product.id, true);
        }
      });
    } else {
      this.loading = false;
      this.dialogRef.close({event: this.action, data: product});
    }
  }

  checkToShowControlError(controls) {

    const count = controls.length;
    let hasError = false;

    for (let i = 0; i < count; i++) {
      const fieldName = controls[i][0];
      const fieldControl = controls[i][1];

      if (fieldControl['errors'] !== null) {

        this.notifySer.notify('error', 'Lỗi thông tin trường ' + this.fieldLabels[fieldName]);
        hasError = true;
        break;
      }
    }

    return hasError;
  }

  loadProduct(id, copy: any = null) {
    this.productSer.getDetail(id, 'medicine,images,productPlacements,productUnits').subscribe(product => {
      const placements = [];
      product['productPlacements'].forEach(pPlacement => {
        placements.push(pPlacement.id);
      });

      if (copy == null) {
        this.form.patchValue({
          product_no: product['product_no'],
          barcode: product['barcode'],
          product_type: product['product_type'],
          shortcut: product['shortcut'],
          using_id: product['using_id'],
          group_id: product['group_id'],
          product_name: product['product_name'],
          sell_price: product['sell_price'],
          original_price: product['original_price'],
          weight: product['weight'],
          base_unit: product['base_unit'],
          medicine_id: product['medicine_id'],
          medicine: product['medicine'],
          placements: placements,
          min_quantity: product['min_quantity'],
          max_quantity: product['max_quantity'],
          description: product['description'],
          note: product['note'],
        });
      } else {
        this.form.patchValue({
          product_no: '',
          barcode: product['barcode'],
          product_type: product['product_type'],
          shortcut: product['shortcut'],
          using_id: product['using_id'],
          group_id: product['group_id'],
          product_name: product['product_name'],
          sell_price: product['sell_price'],
          original_price: product['original_price'],
          weight: product['weight'],
          base_unit: product['base_unit'],
          medicine_id: product['medicine_id'],
          medicine: product['medicine'],
          placements: placements,
          min_quantity: product['min_quantity'],
          max_quantity: product['max_quantity'],
          description: product['description'],
          note: product['note'],
        });
        this.productSer.getRenderProductNo().subscribe(product_no => {
          this.form.patchValue({
            product_no: 'HH' + product_no
          });
        });
      }


      product['productUnits'].forEach(pUnit => {
        if (pUnit['is_base'] !== 1) {
          const group = new FormGroup({
            unit_name: new FormControl(pUnit['name'], Validators.required),
            unit_value: new FormControl(pUnit['value'], Validators.required),
            unit_price: new FormControl(pUnit['sell_price'], Validators.required),
            unit_no: new FormControl(pUnit['no']),
            id: new FormControl(pUnit['id'])
          });
          this.units.push(group);
        }

      });

      product['images'].forEach((pImage, index) => {
        this.selectedFiles.push(new ImageSnippet(pImage['link'], null, pImage['id'] + ''));

        this.imageButtons[index]['isShow'] = false;
      });
    });
  }

  openGroupFormDialog() {
    const dialogRef = this.dialog.open(ProductGroupFormDialogComponent, {
      width: '30%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== false && result !== undefined) {
        this.groups.push(result);
        this.form.patchValue({group_id: result.id});
      }
    });
  }

  openPlacementFormDialog() {
    const dialogRef = this.dialog.open(ProductPlacementFormDialogComponent, {
      width: '30%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== false && result !== undefined) {
        this.placements.push(result);
        const curSelects = this.form.controls['placements'].value;
        curSelects.push(result.id);
        this.form.patchValue({placements: curSelects});
      }
    });
  }

  processFile(imageInput) {
    const file: File = imageInput.files[0];
    const reader = new FileReader();

    reader.addEventListener('load', (event: any) => {
      this.selectedFiles.push(new ImageSnippet(event.target.result, file, ''));
      this.selectedFiles.forEach((value, index) => {
        this.imageButtons[index]['isShow'] = false;
      });
    });

    reader.readAsDataURL(file);
  }

  reloadImageButtons() {
    this.imageButtons.forEach(img => {
      img.isShow = true;
    });
    this.selectedFiles.forEach((value, index) => {
      this.imageButtons[index]['isShow'] = false;
    });
  }

  removeSelectedImage(index) {
    const removeImage = this.selectedFiles[index];
    this.selectedFiles.splice(index, 1);
    if (removeImage['id'].length > 0) {
      this.productSer.removeImage(this.product_id, removeImage['id']).subscribe(res => {
        this.notifySer.notify('warning', 'Đã xóa hình ảnh!');
        this.reloadImageButtons();
      });
    } else {
      this.reloadImageButtons();
    }
  }

  onProductNoChange() {
    const productNo = this.form.controls['product_no'].value;
    for (let i = 0; i < this.units.controls.length; i++) {
      const index = i + 1;
      this.units.controls[i].patchValue({
        unit_no: productNo + '-' + index
      });
    }
  }

  /**
   * Format input number
   * @Nghia
   */
  inputformatNumber(event: any) {
    event.target.value = numeral(event.target.value).format('0,0');
  }


}
