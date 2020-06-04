import { Component,Optional ,Inject, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Observable} from 'rxjs';
import {Group, GroupFilter} from "../group.model";
import {ProductGroupFormDialogComponent} from "../product-group-form-dialog/product-group-form-dialog.component";


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
    store_id: 'Cửa hàng',
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

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProductMerchandiseFormDialogComponent>,
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
      this.local_data = {...data};
      this.action = this.local_data.action;
      this.title = this.local_data.title;
      this.copy_product_id = this.local_data.copy_product_id;
      this.product_id = this.local_data.product_id;
  }


  initForm(){
    this.form = this.fb.group({
      name : [null, Validators.required],
      product_no: [null, Validators.required],
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
    })
  }


  ngOnInit() {

    this.initForm();
  }

  closeDialog() {
    this.dialogRef.close({event: 'Cancel'});
  }
  submit(action){
    console.log("ahihi");

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

}
