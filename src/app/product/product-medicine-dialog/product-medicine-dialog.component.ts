import {Component, Inject, OnInit, Optional} from '@angular/core';
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

@Component({
  selector: 'app-product-medicine-dialog',
  templateUrl: './product-medicine-dialog.component.html',
  styleUrls: ['./product-medicine-dialog.component.css']
})
export class ProductMedicineDialogComponent implements OnInit {

  action: string;
  title: string;
  local_data: any;
  public form: FormGroup;
  loading = false;

  groups: Group[] = [];
  usings = [];
  placements = [];
  manufacturers = [];

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

  constructor(
    private fb: FormBuilder,
    private productSer: ProductService,
    private groupSer: GroupService,
    private usingSer: UsingService,
    private placementSer: PlacementService,
    public dialogRef: MatDialogRef<ProductMedicineDialogComponent>,
    public notifySer: NotifierService,
    private dialog: MatDialog,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    // console.log(data);
    this.local_data = {...data};
    this.action = this.local_data.action;
    this.title = this.local_data.title;
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
      using_id: [null],
      group_id: [null,],
      placements: [[]],
      product_name: [null, Validators.required],
      sell_price: [null],
      original_price: [null],
      weight: [null],
      base_unit: [null],
      // Medicine
      registration_no: [null],
      main_active_substance: [null],
      content: [null],
      packing: [null],
      manufacturer: [null],
      made_in: [null],
      units: new FormArray([])
    });
  }

  submit() {
    if (this.form.valid) {
      this.loading = true;
      const data = this.form.getRawValue();
      this.productSer.create(data).subscribe(res => {
        this.loading = false;
        this.notifySer.notify('success', 'Thêm thuốc thành công!');
        this.dialogRef.close({event: this.action, data: res});
      });
    } else {
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
      if (result !== false) {
        this.groups.push(result);
        this.form.patchValue({group_id: result.id});
      }
    });
  }

  openUsingFormDialog() {
    const dialogRef = this.dialog.open(ProductUsingFormDialogComponent, {});

    dialogRef.afterClosed().subscribe(result => {
      if (result !== false) {
        this.usings.push(result);
        this.form.patchValue({using_id: result.id});
      }
    });
  }

  openPlacementFormDialog() {
    const dialogRef = this.dialog.open(ProductPlacementFormDialogComponent, {});

    dialogRef.afterClosed().subscribe(result => {
      if (result !== false) {
        this.placements.push(result);

        let curSelects = this.form.controls['placements'].value;
        curSelects.push(result.id);

        this.form.patchValue({placements: curSelects});
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
    const group = new FormGroup({
      unit_name: new FormControl('', Validators.required),
      unit_value: new FormControl(0, Validators.required),
      unit_price: new FormControl(0, Validators.required),
      unit_no: new FormControl('')
    });

    this.units.push(group);
  }

}
