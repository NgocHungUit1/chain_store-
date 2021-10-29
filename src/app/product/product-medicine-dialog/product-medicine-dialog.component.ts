import { Component, ElementRef, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../product.service';
import { NotifierService } from 'angular-notifier';
import { ProductGroupFormDialogComponent } from '../product-group-form-dialog/product-group-form-dialog.component';
import { Group, GroupFilter } from '../group.model';
import { GroupService } from '../group.service';
import { ProductUsingFormDialogComponent } from '../product-using-form-dialog/product-using-form-dialog.component';
import { ProductPlacementFormDialogComponent } from '../product-placement-form-dialog/product-placement-form-dialog.component';
import { UsingFilter } from '../using.model';
import { PlacementService } from '../placement.service';
import { UsingService } from '../using.service';
import { PlacementFilter } from '../placement.model';
import { Medicine } from '../../medicine/medicine.model';
import { Observable } from 'rxjs';
import { catchError, debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { MedicineService } from '../../medicine/medicine.service';
import { of } from 'rxjs/internal/observable/of';
import { ManufacturerService } from '../manufacturer.service';
import { Manufacturer, ManufacturerFilter } from '../manufacturer.model';
import { ProductManufacturerFormDialogComponent } from '../product-manufacturer-form-dialog/product-manufacturer-form-dialog.component';
import * as numeral from 'numeral';
import { log } from 'util';
import { loadConfigurationFromPath } from 'tslint/lib/configuration';
import { MatRadioChange } from '@angular/material/radio';


class ImageSnippet {
  constructor(public src: string, public file: File, public id: string) {
  }
}

@Component({
  selector: 'app-product-medicine-dialog',
  templateUrl: './product-medicine-dialog.component.html',
  styleUrls: ['./product-medicine-dialog.component.css']
})
export class ProductMedicineDialogComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private productSer: ProductService,
    private groupSer: GroupService,
    private usingSer: UsingService,
    private placementSer: PlacementService,
    private manufacturerSer: ManufacturerService,
    private medicineSer: MedicineService,
    public dialogRef: MatDialogRef<ProductMedicineDialogComponent>,
    public notifySer: NotifierService,
    private dialog: MatDialog,
    // @Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    // console.log(data);
    this.local_data = {...data};
    this.action = this.local_data.action;
    this.title = this.local_data.title;
    this.copy_product_id = this.local_data.copy_product_id;
    this.product_id = this.local_data.product_id;
  }

  get units() {
    return this.form.get('units') as FormArray;
  }

  action: string;
  title: string;
  local_data: any;
  product_id: string;
  copy_product_id: string;
  public form: FormGroup;
  loading = false;
  made_in_old: string;

  groups: Group[] = [];
  usings = [];
  placements = [];
  manufacturers = [];

  filteredMedicines: Observable<Medicine[]>;

  fieldLabels = {
    product_no: 'Mã hàng',
    barcode: 'Mã vạch',
    product_type: 'Loại hàng',
    shortcut: 'Tên viết tắt',
    using_id: 'Đường dùng',
    group_id: 'Nhóm hàng',
    placements: 'Vị trí',
    product_name: 'Tên thuốc',
    sell_price: 'Giá bán',
    original_price: 'Giá vốn',
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
    unit_no: 'Mã đơn vị',
  };

  imageButtons = [
    {isShow: true},
    {isShow: true},
    {isShow: true},
    {isShow: true},
    {isShow: true},
  ];
  optionsMadeIn: string[] = ['Trung Quốc', 'Ấn Độ', 'Mỹ', 'Indonesia', 'Braxin', 'Pakistan', 'Nigeria',
    'Bangladesh', 'Mexico', 'Nhật Bản', 'Ethiopia', 'Philippines', 'Việt Nam',
    'Cộng hòa Dân chủ Congo', 'Nước Đức', 'Iran', 'Thổ Nhĩ Kì', 'Thái Lan', 'Nước Anh', 'Nước Pháp', 'Nước Ý',
    'Tanzania', 'Nam Phi', 'Myanmar', 'Nam Triều Tiên', 'Kenya', 'Colombia', 'Tây Ban Nha', 'Argentina', 'Uganda',
    'Ukraine', 'Algeria', 'Sudan', 'Iraq', 'Ba Lan', 'Canada', 'Afghanistan', 'Morocco', 'Ả Rập Xê Út', 'Peru', 'Venezuela',
    'Uzbekistan', 'Malaysia', 'Angola', 'Mozambique', 'Nepal', 'Ghana', 'Yemen', 'Madagascar', 'Bắc Triều Tiên',
    'Côte dIvoire', 'Châu Úc', 'Cameroon', 'Niger', 'Sri Lanka', 'Burkina Faso', 'Rumani', 'Malawi', 'Mali', 'Kazakhstan',
    'Syria', 'Chile', 'Zambia', 'Guatemala', 'nước Hà Lan', 'Zimbabwe', 'Ecuador', 'Senegal', 'Campuchia', 'Chad', 'Somalia',
    'Guinea', 'phía nam Sudan', 'Rwanda', 'Tunisia', 'nước Bỉ', 'Cuba', 'Benin', 'Burundi', 'Bolivia', 'Hy Lạp', 'Haiti',
    'Cộng hòa Dominica', 'Cộng hòa Séc', 'Bồ Đào Nha', 'Thụy Điển', 'Azerbaijan', 'Jordan', 'Hungary',
    'các Tiểu Vương Quốc Ả Rập Thống Nhất',
    'Belarus', 'Honduras', 'Tajikistan', 'Serbia', 'Áo', 'Thụy sĩ', 'Israel', 'Papua New Guinea', 'Đi', 'Sierra Leone',
    'Bungari', 'Lào', 'Paraguay', 'Libya', 'El Salvador', 'Nicaragua', 'Kyrgyzstan', 'Lebanon', 'Turkmenistan', 'Singapore',
    'Đan mạch', 'Phần Lan', 'Slovakia', 'Congo', 'Na Uy', 'Eritrea', 'Nhà nước Palestine', 'Costa Rica', 'Liberia',
    'Oman', 'Ireland', 'New Zealand', 'Cộng hòa trung phi', 'Mauritania', 'Kuwait', 'Croatia', 'Panama', 'Moldova',
    'Georgia', 'Bosnia & Herzegovina', 'Uruguay', 'Mông Cổ', 'Albania', 'Armenia', 'Jamaica', 'Lithuania', 'Qatar',
    'Namibia', 'Botswana', 'Lesotho',
    'Gambia', 'TFYR Macedonia',
    'Slovenia', 'Gabon', 'Latvia', 'Guinea - Bissau', 'Bahrain', 'Swaziland', 'Trinidad và Tobago', 'Đông Timor',
    'Equatorial Guinea', 'Estonia',
    'Mauritius', 'Síp', 'Djibouti', 'Fiji', 'Comoros', 'Bhutan', 'Guyana', 'Montenegro', 'Quần đảo Solomon', 'Luxembourg',
    'Suriname', 'Cabo Verde',
    'Maldives', 'Brunei', 'Malta', 'Bahamas', 'Belize', 'Iceland', 'Barbados', 'Vanuatu', 'Sao Tome & Principe', 'Samoa',
    'Saint Lucia', 'Kiribati'];
  filteredOptionsMadeIn: Observable<string[]>;

  optionsManufacturer: string[] = [];
  filteredOptionsManufacturer: Observable<string>[];

  optionsUnit: string[] = ['viên', 'vỉ', 'chai', 'cái'];
  filteredOptionsUnit: Observable<string[]>;
  filterUnit = [
    {name: 'viên', selelected: true},
    {name: 'vỉ', selelected: false},
    {name: 'chai', selelected: false},
    {name: 'cái', selelected: false},
  ];

  public _convertIndex = null;

  selectedFiles: ImageSnippet[] = [];

  initForm() {
    // console.log(this.local_data);
    this.form = this.fb.group({
      product_no: [
        null,
        Validators.compose([
          // Validators.required,
          Validators.minLength(5),
          Validators.maxLength(20)
        ])
      ],
      barcode: [null],
      product_type: ['medicine'],
      shortcut: [null],
      using_id: [null], // bỏ yêu cầu nhóm đường dùng
      group_id: [null],
      placements: [[]],
      product_name: [this.local_data && this.local_data['product_name'] ? this.local_data['product_name'] : null, Validators.required],
      sell_price: [null, Validators.required],
      original_price: [0],
      weight: [null],
      base_unit: ['viên', Validators.required],
      medicine_id: [null],
      typeSellPrice: ['price'], // update for customer
      // Medicine
      medicine: this.fb.group({
        registration_no: [null, Validators.required],
        main_active_substance: [null, Validators.required],
        content: [null, Validators.required],
        packing: [null, Validators.required],
        manufacturer: [null],
        made_in: [null]
      }),
      units: new FormArray([]),
      min_quantity: [0],
      max_quantity: [0],
      description: [null],
      note: [null],
      quantity_of_stock: [0],
    });
  }

  ngOnInit() {
    const groupFilter = new GroupFilter();
    groupFilter.pageSize = 50;
    // groupFilter.store_id = 1;
    this.groupSer.getList(groupFilter).subscribe(res => {
      this.groups = res.body;
    });

    const usingFilter = new UsingFilter();
    // usingFilter.store_id = 1;
    usingFilter.pageSize = 50;
    this.usingSer.getList(usingFilter).subscribe(res => {
      this.usings = res.body;
    });

    const placementFilter = new PlacementFilter();
    // placementFilter.store_id = 1;
    placementFilter.pageSize = 50;
    this.placementSer.getList(placementFilter).subscribe(res => {
      this.placements = res.body;
    });

    const manufacturerFilter = new ManufacturerFilter();
    manufacturerFilter.pageSize = 500;
    this.manufacturerSer.getList(manufacturerFilter).subscribe(res => {
      this.manufacturers = res.body;
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
          product_no: 'SP' + product_no
        });
      }
    });

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

    // tim kiem quoc gia
    this.filteredOptionsMadeIn = this.form.controls['medicine'].valueChanges.pipe(
      startWith(''),
      map(value =>
        this._filterMadeIn(value)
      )
    );

    if (sessionStorage.getItem('medicine') !== null) {
      const medicine = JSON.parse(sessionStorage.getItem('medicine'));
      this.selectedMedicine(medicine);
      sessionStorage.removeItem('medicine');
      this.notifySer.notify('info', 'Cập nhật thêm thông tin sản phẩm');
    }

    this.form.controls.sell_price.valueChanges.subscribe(value => {
      const val = numeral(value).value();
      this.units.controls.forEach(item => {
        // @ts-ignore
        item.controls.unit_price.patchValue(numeral(val * item.value.unit_value).format('0,0'), {
          emitEvent: false
        });
      });
    });
  }

  public _filterMadeIn(value: any): string[] {
    if (value.made_in !== this.made_in_old) {
      this.made_in_old = value.made_in;
      return this.optionsMadeIn.filter(option => option.toLowerCase().includes(value.made_in));
    }
    return [];
  }

  public _filterUnit(value: any): string[] {
    return this.optionsUnit.filter(option => option.toLowerCase().includes(value.unit_name));
  }

  /*changeUnitName(i) {
    this.filteredOptionsUnit = this.units.controls[i].valueChanges.pipe(
      startWith(''),
      map(value => this._filterUnit(value))
    );
  }*/

  changeUnitValue(event: any, i) {
    const value = event.target.value;
    this.units.controls[i].patchValue({
      unit_price: numeral(value * numeral(this.form.controls['sell_price'].value).value()).format('0,0'),
    });
  }

  selectBaseUnit(unit: any, i) {
    this.form.controls['base_unit'].patchValue(unit);
    this.filterUnit.forEach(item => {
      unit !== item.name ? item.selelected = false : item.selelected = true;
    });
  }

  changeBaseUnitValue(event: any, i) {
    const value = numeral(event.target.value).value();
    // console.log(this.units.controls[i].value);
    this.units.controls[i].patchValue({
      unit_price: numeral(value).format('0,0'),
    });
    // if (i === Number(this._convertIndex)) {
    //   this.form.controls.sell_price.patchValue(numeral(value / this.units.controls[i].value.unit_value).format('0,0'));
    // }
  }

  loadProduct(id, copy: any = null) {
    this.productSer.getDetail(id, 'medicine,images,productPlacements,productUnits,quantity').subscribe(product => {
      // console.log(product);
      const placements = [];
      product['productPlacements'].forEach(pPlacement => {
        placements.push(pPlacement.id);
      });

      const medicine = product['medicine'];
      if (medicine !== null) {
        medicine.made_in = product['made_in'];
        medicine.manufacturer = product['manufacturer'];
      }

      // console.log(product['quantity']);
      if (product['quantity']) {
        this.form.patchValue({
          quantity_of_stock: numeral(product['quantity'].number).format('0,0'),
        });
      }

      if (copy === null) {
        this.form.patchValue({
          product_no: product['product_no'],
          barcode: product['barcode'],
          product_type: product['product_type'],
          shortcut: product['shortcut'],
          using_id: product['using_id'],
          group_id: product['group_id'],
          product_name: product['product_name'],
          sell_price: numeral(product['sell_price']).format('0,0'),
          original_price: numeral(product['original_price']).format('0,0'),
          weight: product['weight'],
          base_unit: product['base_unit'],
          medicine_id: product['medicine_id'],
          medicine: medicine, // product['medicine'],
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
          sell_price: numeral(product['sell_price']).format('0,0'),
          original_price: numeral(product['original_price']).format('0,0'),
          weight: product['weight'],
          base_unit: product['base_unit'],
          medicine_id: product['medicine_id'],
          medicine: medicine, // product['medicine'],
          placements: placements,
          min_quantity: product['min_quantity'],
          max_quantity: product['max_quantity'],
          description: product['description'],
          note: product['note'],
        });

        this.productSer.getRenderProductNo().subscribe(product_no => {
          this.form.patchValue({
            product_no: 'SP' + product_no
          });
        });
      }

      product['productUnits'].forEach(pUnit => {
        /**
         * Chi hien thi unit is_base !== 1
         */
        if (pUnit['is_base'] !== 1) {
          const group = new FormGroup({
            unit_name: new FormControl(pUnit['name'], Validators.required),
            unit_value: new FormControl(pUnit['value'], Validators.required),
            unit_price: new FormControl(numeral(pUnit['sell_price']).format('0,0'), Validators.required),
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

  submit(action, connect = false) {
    if (this.form.valid) {
      this.loading = true;
      const data = this.form.getRawValue();
      // if (data.medicine_id == null) {
      //   this.notifySer.notify('info', 'Vui lòng nhập lại tên thuốc để xác định lại mã dược quốc gia');
      //   this.form.controls['product_name'].setValue('');
      //   this.loading = false;
      //   return;
      // }
      data.manufacturer = data.medicine.manufacturer;
      data.made_in = data.medicine.made_in;
      data.original_price = numeral(data.original_price).value();
      data.sell_price = numeral(data.sell_price).value();
      data.quantity_of_stock = numeral(data.quantity_of_stock).value();

      data.units.forEach(item => {
        item.unit_price = numeral(item.unit_price).value();
      });

      if (typeof data.manufacturer === 'string') {
        data.manufacturer = null;
      }
      if (this.product_id === null) {
        // Create New
        if (data.product_no === null || data.product_no === '') {
          this.productSer.getRenderProductNo().subscribe(product_no => {
            data.product_no = 'SP' + product_no;
            this.productSer.create(data).subscribe(product => {
              this.notifySer.notify('success', 'Thêm thuốc thành công!');
              this.uploadImage(product, action);
              this.dialogRef.close({event: action, data: product, connect: connect});
            });
          });
        } else {
          this.productSer.create(data).subscribe(product => {
            this.notifySer.notify('success', 'Thêm thuốc thành công!');
            this.uploadImage(product, action);
            this.dialogRef.close({event: action, data: product, connect: connect});
          });
        }

      } else if (this.product_id !== null) {
        // UPDATE
        this.productSer.update(this.product_id, data).subscribe(product => {
          this.notifySer.notify('success', 'Cập nhật thuốc thành công!');
          this.uploadImage(product, action);
          this.dialogRef.close({event: action, data: product, connect: connect});
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

  openUsingFormDialog() {
    const dialogRef = this.dialog.open(ProductUsingFormDialogComponent, {
      width: '30%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== false && result !== undefined) {
        this.usings.push(result);
        this.form.patchValue({using_id: result.id});
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

  openManufacturerFormDialog() {
    const dialogRef = this.dialog.open(ProductManufacturerFormDialogComponent, {
      width: '40%',
      minHeight: '60%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== false && result !== undefined) {
        this.manufacturers.push(result);
        this.form.patchValue({medicine: {manufacturer: result.id}});
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
    // this.units.removeAt(i);
    // if (this.units.length) {
    //
    // }
    const data = this.units.getRawValue();
    if (data[i].id) {
      // console.log(data[i].id);
      this.productSer.deleteUnit(data[i].id).subscribe(res => {
        if (res?.success === true) {
          this.notifySer.notify('success', res?.message);
          // this.reload.emit(null);
          this.units.removeAt(i);
        } else {
          this.notifySer.notify('warning', res?.message);
        }
      });
    } else {
      this.units.removeAt(i);
      this.notifySer.notify('success', 'Xóa đơn vị thành công');

    }
  }

  addUnit() {
    const index = this.units.length + 1;
    // let unitName: string;
    // const list = this.filterUnit.filter(item => item.selelected === false);
    // const newIndex = index - 1;
    // if (list.length > 0 && newIndex < list.length) {
    //   unitName = list[newIndex].name;
    // }

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
    this.manufacturerSer.save({'name': medicine['manufacturer']}).subscribe(res => {
      const result = <Manufacturer>res;
      medicine.manufacturer = result['id'];
      this.form.patchValue({
        medicine: medicine,
      });
      this.manufacturers.push(result);
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
