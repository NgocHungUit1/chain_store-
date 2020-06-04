import {Component, ElementRef, Inject, OnInit, Optional, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ProductService} from "../product.service";
import {NotifierService} from "angular-notifier";
import {ProductGroupFormDialogComponent} from "../product-group-form-dialog/product-group-form-dialog.component";
import {Group, GroupFilter} from "../group.model";
import {GroupService} from "../group.service";
import {ProductUsingFormDialogComponent} from "../product-using-form-dialog/product-using-form-dialog.component";
import {ProductPlacementFormDialogComponent} from "../product-placement-form-dialog/product-placement-form-dialog.component";
import {UsingFilter} from "../using.model";
import {PlacementService} from "../placement.service";
import {UsingService} from "../using.service";
import {PlacementFilter} from "../placement.model";
import {Medicine} from "../../medicine/medicine.model";
import {Observable} from 'rxjs';
import {catchError, debounceTime, map, startWith, switchMap} from 'rxjs/operators';
import {MedicineService} from "../../medicine/medicine.service";
import {of} from "rxjs/internal/observable/of";
import { ManufacturerService } from '../manufacturer.service';
import { ManufacturerFilter } from '../manufacturer.model';
import { ProductManufacturerFormDialogComponent } from '../product-manufacturer-form-dialog/product-manufacturer-form-dialog.component';


class ImageSnippet {
  constructor(public src: string, public file: File, public id: string) {}
}

@Component({
  selector: 'app-product-medicine-dialog',
  templateUrl: './product-medicine-dialog.component.html',
  styleUrls: ['./product-medicine-dialog.component.css']
})
export class ProductMedicineDialogComponent implements OnInit {

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

  filteredMedicines: Observable<Medicine[]>;

  fieldLabels = {
    product_no: 'Mã hàng',
    barcode: 'Mã vạch',
    product_type: 'Loại hàng',
    store_id: 'Cửa hàng',
    shortcut: 'Tên viết tắt',
    using_id: 'Đường dùng',
    group_id: 'Nhóm hàng',
    placements: 'Mã hàng',
    product_name: 'Tên thuốc',
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
    private fb: FormBuilder,
    private productSer: ProductService,
    private groupSer: GroupService,
    private usingSer: UsingService,
    private placementSer: PlacementService,
    private manufacturerSer : ManufacturerService,
    private medicineSer: MedicineService,
    public dialogRef: MatDialogRef<ProductMedicineDialogComponent>,
    public notifySer: NotifierService,
    private dialog: MatDialog,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    // console.log(data);
    this.local_data = {...data};
    this.action = this.local_data.action;
    this.title = this.local_data.title;
    this.copy_product_id = this.local_data.copy_product_id;
    this.product_id = this.local_data.product_id;
  }

  initForm() {
    this.form = this.fb.group({
      product_no: [
        null,
        Validators.compose([
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(10)
        ])
      ],
      barcode: [null],
      product_type: ['medicine'],
      store_id: [1],
      shortcut: [null],
      using_id: [null, Validators.required],
      group_id: [null, Validators.required],
      placements: [[]],
      product_name: [null, Validators.required],
      sell_price: [null],
      original_price: [null],
      weight: [null],
      base_unit: [null],
      medicine_id: [null],
      // Medicine
      medicine: this.fb.group({
        registration_no: [null, Validators.required],
        main_active_substance: [null, Validators.required],
        content: [null, Validators.required],
        packing: [null, Validators.required],
        manufacturer: [null, Validators.required],
        made_in: [null]
      }),

      units: new FormArray([]),
      min_quantity: [0],
      max_quantity: [0],
      description: [null],
      note: [null],
    });
  }

  ngOnInit() {
    let groupFilter = new GroupFilter();
    // groupFilter.store_id = 1;
    this.groupSer.getList(groupFilter).subscribe(res => {
      this.groups = res.body;
    });

    let usingFilter = new UsingFilter();
    // usingFilter.store_id = 1;
    this.usingSer.getList(usingFilter).subscribe(res => {
      this.usings = res.body;
    });

    let placementFilter = new PlacementFilter();
    // placementFilter.store_id = 1;
    this.placementSer.getList(placementFilter).subscribe(res => {
      this.placements = res.body;
    });

    let manufacturerFilter = new ManufacturerFilter();
    this.manufacturerSer.getList(manufacturerFilter).subscribe(res => {
      this.manufacturers =  res.body;
    })


    this.initForm();

    if (this.product_id !== null || this.copy_product_id !== null) {
      const id = this.product_id !== null ? this.product_id : this.copy_product_id;
      this.loadProduct(id);
    }

    this.filteredMedicines = this.form.controls['product_name'].valueChanges.pipe(
      startWith(''),
      // delay emits
      debounceTime(300),
      // use switch map so as to cancel previous subscribed events, before creating new once
      switchMap(value => {
        if (value !== '') {
          // lookup from github
          return this.lookup(value);
        } else {
          // if no value is present, return null
          return of(null);
        }
      })
    );
  }

  loadProduct(id) {
    this.productSer.getDetail(id, 'medicine,images,productPlacements,productUnits').subscribe(product => {
      let placements = [];
      product['productPlacements'].forEach(pPlacement => {
        placements.push(pPlacement.id)
      });

      this.form.patchValue({
        product_no: product['product_no'],
        barcode: product['barcode'],
        product_type: product['product_type'],
        store_id: product['store_id'],
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

      product['productUnits'].forEach(pUnit => {
        const group = new FormGroup({
          unit_name: new FormControl(pUnit['name'], Validators.required),
          unit_value: new FormControl(pUnit['value'], Validators.required),
          unit_price: new FormControl(pUnit['sell_price'], Validators.required),
          unit_no: new FormControl(pUnit['no']),
          id: new FormControl(pUnit['id'])
        });

        this.units.push(group);
      });

      product['images'].forEach((pImage, index) => {
        this.selectedFiles.push(new ImageSnippet(pImage['link'], null, pImage['id'] + ''));

        this.imageButtons[index]['isShow'] = false;
      });
    });
  }

  lookup(value: string): Observable<Medicine[]> {
    return this.medicineSer.autocomplete(value).pipe(
      // map the item property of the github results as our return object
      map(results => results),
      // catch errors
      catchError(_ => {
        return of(null);
      })
    );
  }

  submit(action) {
    if (this.form.valid) {
      this.loading = true;
      const data = this.form.getRawValue();
      if (this.product_id === null) {
        // Create New
        this.productSer.create(data).subscribe(product => {
          this.notifySer.notify('success', 'Thêm thuốc thành công!');
          this.uploadImage(product, action);
        });
      } else if (this.product_id !== null) {
        // UPDATE
        this.productSer.update(this.product_id, data).subscribe(product => {
          this.notifySer.notify('success', 'Cập nhật thuốc thành công!');
          this.uploadImage(product, action);
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
      let formData = new FormData();
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
            store_id: 1,
            product_type: 'medicine'
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
          this.loadProduct(product.id);
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

  openGroupFormDialog() {
    const dialogRef = this.dialog.open(ProductGroupFormDialogComponent, {});
    dialogRef.afterClosed().subscribe(result => {

      if (result !== false && result !== undefined) {
        this.groups.push(result);
        this.form.patchValue({group_id: result.id});
      }
    });
  }

  openUsingFormDialog() {
    const dialogRef = this.dialog.open(ProductUsingFormDialogComponent, {});

    dialogRef.afterClosed().subscribe(result => {
      if (result !== false && result !== undefined) {
        this.usings.push(result);
        this.form.patchValue({using_id: result.id});
      }
    });
  }

  openPlacementFormDialog() {
    const dialogRef = this.dialog.open(ProductPlacementFormDialogComponent, {});

    dialogRef.afterClosed().subscribe(result => {
      if (result !== false && result !== undefined) {
        this.placements.push(result);

        let curSelects = this.form.controls['placements'].value;
        curSelects.push(result.id);

        this.form.patchValue({placements: curSelects});
      }
    });
  }

  openManufacturerFormDialog(){
    const dialogRef = this.dialog.open(ProductManufacturerFormDialogComponent, {});
    dialogRef.afterClosed().subscribe(result => {
      if (result !== false && result !== undefined) {
        this.manufacturers.push(result);
        this.form.patchValue({ medicine : {manufacturer : result.id} });
      }
    });
  }

  doAction() {
    this.dialogRef.close({event: this.action, data: this.local_data});
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
    let index = this.units.length + 1;

    const group = new FormGroup({
      unit_name: new FormControl('', Validators.required),
      unit_value: new FormControl(0, Validators.required),
      unit_price: new FormControl(0, Validators.required),
      unit_no: new FormControl(this.form.controls['product_no'].value + '-' + index)
    });

    this.units.push(group);
  }

  removeMedicine() {
    this.form.patchValue({
      medicine_id: null,
      product_name: null,
      medicine: {
        registration_no: null,
        main_active_substance: null,
        content: null,
        packing: null,
        manufacturer: null,
        made_in: null
      }
    });
  }

  selectedMedicine(medicine) {
    this.form.patchValue({
      medicine_id: medicine['id'],
      product_name: medicine['medicine_name'],
      medicine: medicine,
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
    let removeImage = this.selectedFiles[index];
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
    let productNo = this.form.controls['product_no'].value;
    for (let i = 0; i < this.units.controls.length; i++) {
      let index = i + 1;
      this.units.controls[i].patchValue({
        unit_no: productNo + '-' + index
      });
    }
  }

}
