import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { NotifierService } from 'angular-notifier';
import { MatDialog } from '@angular/material/dialog';
import { ListComponentBase } from '../../shared/base';
import { WarehouseProductService } from '../warehouse-product.service';
import { Warehouse, WarehouseProduct, WarehouseProductFilter } from '../warehouse.model';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/index';
import { Supplier } from '../../supplier/supplier.model';
import { catchError, debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { SupplierService } from '../../supplier/supplier.service';
import { WarehouseService } from '../warehouse.service';
import { Product } from '../../product/product.model';
import { ProductService } from '../../product/product.service';
import { WarehouseParcelFormDialogComponent } from '../warehouse-parcel-form-dialog/warehouse-parcel-form-dialog.component';
import { WarehouseDiscountDialogComponent } from '../warehouse-discount-dialog/warehouse-discount-dialog.component';
import { SupplierFormDialogComponent } from '../../supplier/supplier-form-dialog/supplier-form-dialog.component';
import { ProductMedicineDialogComponent } from '../../product/product-medicine-dialog/product-medicine-dialog.component';
import { ProductMerchandiseFormDialogComponent } from '../../product/product-merchandise-form-dialog/product-merchandise-form-dialog.component';

@Component({
  selector: 'app-warehouse-import-form',
  templateUrl: './warehouse-import-form.component.html',
  styleUrls: ['./warehouse-import-form.component.css']
})
export class WarehouseImportFormComponent extends ListComponentBase implements OnInit {

  constructor(
    private mainService: WarehouseService,
    private warehouseProductService: WarehouseProductService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private supplierSer: SupplierService,
    private productSer: ProductService,
    private notifySer: NotifierService
  ) {
    super();
  }

  @ViewChild(MatTable, {static: true}) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;

  selectProduct = new FormControl();

  apiFilter: WarehouseProductFilter;
  updateModelId = null;
  model: Warehouse = null;

  statuses = [
    {id: '10', name: 'Hoàn thành'},
    {id: '9', name: 'Lưu tạm'},
  ];

  parcels: object[] = [];

  columnsHeader = {
    '#': '#',
    'product_no': 'Mã hàng',
    'product_name': 'Tên hàng',
    // 'product_parcel': 'Lô',
    'product_unit_id': 'Đơn vị',
    'quantity': 'Số lượng',
    'price': 'Đơn giá',
    'discount': 'Giảm giá',
    'amount': 'Thành tiền',
  };

  displayedColumns: string[] = [];
  columnsToDisplay: string[] = [
    '#',
    // 'product_no',
    'product_name',
    // 'product_parcel',
    'product_unit_id',
    'quantity',
    'price',
    'discount',
    'amount',
    'actions'
  ];
  data: WarehouseProduct[] = [];
  productDataSource = new MatTableDataSource<WarehouseProduct>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = false;
  isRateLimitReached = false;

  form: FormGroup;

  filteredSuppliers: Observable<Supplier[]>;
  filteredProducts: Observable<Product[]>;

  ngOnInit() {
    const date = new FormControl(new Date());
    this.form = this.fb.group({
      date: date,
      no: [null],
      supplier: [null, Validators.required],
      status: [null],
      type: ['import'],
      quantity: [null],
      total_price: [null],
      total_amount: [null],
      discount_amount: [null],
      discount_type: [null],
      paid_amount: [null],
      remain_amount: [null],
      note: [null],
    });

    this.displayedColumns = this.columnsToDisplay;

    this.filteredSuppliers = this.form.controls['supplier'].valueChanges.pipe(
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
    this.filteredProducts = this.selectProduct.valueChanges.pipe(
      startWith(''),
      // delay emits
      debounceTime(300),
      // use switch map so as to cancel previous subscribed events, before creating new once
      switchMap(value => {
        if (value !== '') {
          // lookup from github
          return this.lookupProduct(value);
        } else {
          // if no value is present, return null
          return of(null);
        }
      })
    );

    const id = this.route.snapshot.paramMap.get('id');
    if (id !== null && id !== undefined) {
      this.updateModelId = id;
      this.mainService.getDetail(this.updateModelId, 'supplier').subscribe(res => {
        let dateStr = null;
        if (res['date'] !== null) {
          dateStr = new Date(res['date']).toISOString();
        }
        this.model = res;

        this.form.patchValue({
          date: dateStr,
          no: res['no'],
          supplier: res['supplier'],
          status: res['status'] + '',
          quantity: Number(res['total_quantity']),
          total_price: (res['total_price'] !== undefined) ? Number(res['total_price']) : 0,
          total_amount: Number(res['total_amount']),
          discount_amount: (res['discount_amount'] !== undefined && res['discount_amount'] !== null) ? Number(res['discount_amount']) : 0,
          discount_type: (res['discount_type'] !== undefined && res['discount_type'] !== null) ? res['discount_type'] : 'price',
          paid_amount: Number(res['paid_amount']),
          remain_amount: Number(res['remain_amount']),
          note: res['note'],
        });

        // console.log(res['discount_amount']);


        this.form.controls['date'].disable();
        // this.form.controls['supplier'].disable();
        this.form.controls['no'].disable();
        this.form.controls['status'].disable();
        this.form.controls['quantity'].disable();
        this.form.controls['total_price'].disable();
        this.form.controls['remain_amount'].disable();

        this.loadData();
      });
    } else {
      this.mainService.getRenderWarehouseNo().subscribe(res => {
        this.form.patchValue({
          no: 'PN0' + res,
          total_price: 0,
          discount_amount: 0,
          discount_type: 'price'
        });
      });
    }

  }

  displaySupplier(supplier?: Supplier): string | undefined {
    return (supplier === undefined || supplier === null) ? undefined : supplier.name;
  }

  lookup(value: string): Observable<Supplier[]> {
    return this.supplierSer.autocomplete(value).pipe(
      // map the item property of the github results as our return object
      map(results => results),
      // catch errors
      catchError(_ => {
        return of(null);
      })
    );
  }

  lookupProduct(value: string): Observable<Product[]> {
    return this.productSer.autocomplete(value).pipe(
      // map the item property of the github results as our return object
      map(results => results),
      // catch errors
      catchError(_ => {
        return of(null);
      })
    );
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.apiFilter = this.buildFilterFromParams();
    this.warehouseProductService.getList(this.apiFilter).subscribe(res => {
      const newData = [];
      res.body.forEach(item => {
        const warehouseProduct = new WarehouseProduct();
        if (this.updateModelId !== null) {
          warehouseProduct.id = item.id;
        }
        warehouseProduct.product_id = item.product_id;
        warehouseProduct.product = item.product;
        warehouseProduct.quantity = item.quantity;
        warehouseProduct.price = (item.price !== null) ? item.price : 0;
        warehouseProduct.discount = (item.discount !== null) ? item.discount : 0;
        warehouseProduct.discount_type = (item.discount_type !== null) ? item.discount_type : 'price';
        warehouseProduct.amount = (item.amount !== null) ? item.amount : 0;
        warehouseProduct.product_unit_id = item.product_unit_id;
        warehouseProduct.productUnits = item.productUnits !== undefined ? item.productUnits : [];
        warehouseProduct.product_parcels = item.productParcels !== undefined ? item.productParcels : [];

        if (item.productParcels !== undefined && item.productParcels.length > 0) {
          this.parcels = this.parcels.concat(item.productParcels);
        }

        newData.push(warehouseProduct);
      });
      this.data = newData;
      this.productDataSource = new MatTableDataSource<WarehouseProduct>(this.data);
      this.recalculateWarehouse();
      this.isLoadingResults = false;
    });
  }

  buildFilterFromParams(): WarehouseProductFilter {
    function write<K extends keyof WarehouseProductFilter>(arg: WarehouseProductFilter, key: K, value: WarehouseProductFilter[K]): void {
      arg[key] = value;
    }

    const filter = new WarehouseProductFilter();
    const objectKeys = Object.keys(filter) as Array<keyof WarehouseProductFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['WarehouseProductSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = 50;//this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'product,productParcels,productUnits';
    if (this.updateModelId !== null) {
      filter.warehouse_id = this.updateModelId;
    }
    return filter;
  }

  submit(status) {
    if (this.form.valid) {
      const data = this.form.getRawValue();
      data['supplier_id'] = data['supplier']['id'];
      if (this.form.controls['date'].value !== null && typeof this.form.controls['date'].value === 'object') {
        const effDate = new Date(this.form.controls['date'].value.getTime() + (420 * 60 * 1000));

        data['date'] = effDate.toISOString().split('T')[0];
      }
      data['items'] = this.data;
      data['status'] = status;

      if (this.updateModelId !== null) {
        delete data['date'];
        delete data['supplier'];
        this.mainService.update(this.updateModelId, data).subscribe(res => {
          this.model = res;
          this.notifySer.notify('success', 'Lưu thành công.');
        });
      } else {
        this.mainService.create(data).subscribe(res => {
          this.model = res;
          this.notifySer.notify('success', 'Lưu thành công.');
          this.router.navigate(['/transaction/warehouse/update/' + res['id']]);
        });
      }
    }
  }

  /**
   * Event choice search
   * @param product
   */
  onSelectedProduct(product) {
    this.handleAddProductToList(product.id);
  }

  /**
   * Handle add product to list
   * @param product_id
   */
  handleAddProductToList(product_id) {
    this.productSer.getDetail(product_id, 'productUnits').subscribe(res => {
      // console.log(res);
      const warehouseProduct = new WarehouseProduct();
      warehouseProduct.product_id = res['id'];
      warehouseProduct.product = res;
      warehouseProduct.quantity = 1;
      warehouseProduct.price = (res['original_price'] !== null) ? res['original_price'] : 0;
      warehouseProduct.discount = 0;
      warehouseProduct.discount_type = 'price';
      warehouseProduct.amount = (res['original_price'] !== null) ? res['original_price'] : 0;
      warehouseProduct.productUnits = res['productUnits'];
      warehouseProduct.product_parcels = [];

      if (res['productUnits'].length > 0) {
        res['productUnits'].sort((a, b) => (a.value > b.value) ? 1 : -1);
        warehouseProduct.product_unit_id = res['productUnits'][0]['id'];
        warehouseProduct.price = res['productUnits'][0]['original_price'];
      }

      const newData = this.data.concat([warehouseProduct]);
      this.data = newData;
      this.productDataSource = new MatTableDataSource<WarehouseProduct>(this.data);
      this.recalculateWarehouse();
      this.selectProduct.patchValue(null);
    });
  }

  recalculateItem(i) {
    if (this.data[i] !== undefined) {
      if (this.data[i]['discount_type'] === 'price') {
        this.data[i]['amount'] = Math.round((this.data[i]['price'] - this.data[i]['discount']) * this.data[i]['quantity']);
      } else {
        this.data[i]['amount'] =
          Math.round((this.data[i]['price'] - (this.data[i]['price'] * this.data[i]['discount']) / 100) * this.data[i]['quantity']);
      }
      this.recalculateWarehouse();
    }
  }

  recalculateWarehouse() {
    let quantity: number = 0;
    let price: number = 0;
    let remainAmount: number = 0;
    let totalAmount: number = 0;
    const paidAmount = this.form.controls['paid_amount'].value;
    const discount = this.form.controls['discount_amount'].value;
    const discount_type = this.form.controls['discount_type'].value;


    this.data.forEach(item => {
      quantity = Number(quantity) + item['quantity'];
      if (item['discount_type'] === 'price') {
        price = Number(price) + Number(item['quantity']) * ((Number(item['price'] - Number(item['discount']))));
      } else {
        let money = Number(item['quantity']) * Number(item['price']) * (1 - (Number(item['discount']) / 100));
        price = Number(price) + money;
      }
    });
    // Tinh vao cong no
    if (discount_type === 'price') {
      remainAmount = Number(paidAmount) - (Number(price) - Number(discount));
      totalAmount = Number(price) - Number(discount);
    } else {
      remainAmount = Math.round(Number(paidAmount) - (Number(price) - Number(price) * Number(discount) / 100));
      totalAmount = Math.round(Number(price) - Number(price) * Number(discount) / 100);
    }

    this.form.patchValue({
      quantity: quantity,
      total_price: price,
      remain_amount: remainAmount,
      total_amount: totalAmount
    });
  }

  removeProduct(i) {
    const newData = this.data;
    newData.splice(i, 1);

    this.data = newData;

    this.recalculateWarehouse();
    this.productDataSource = new MatTableDataSource<WarehouseProduct>(this.data);
  }

  /**
   * - Nhập hàng đơn vị giá đơn vị  = giá vôn đơn vị cơ bản * số lượng quy đổi
   * @param index
   * @param select
   */
  onUnitChange(index, select) {
    if (this.data[index] !== undefined) {
      const unit = this.data[index]['productUnits'].find(element => element['id'] === select.value);
      const unitBase = this.data[index]['productUnits'].find(element => element['is_base'] === 1);
      this.data[index]['price'] = unitBase['original_price'] * unit['value'];
      // this.data[index]['price'] = (unit['original_price'] !== 0) ? unit['original_price'] : unit['sell_price']; //unit['original_price'];
      this.data[index]['amount'] = (this.data[index]['price'] - this.data[index]['discount']) * this.data[index]['quantity'];
      this.recalculateWarehouse();
    }
  }

  openParcelFormDialog(index) {
    const dialogRef = this.dialog.open(WarehouseParcelFormDialogComponent, {
      width: '20%',
      data: {parcels: this.parcels}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== false && result !== undefined) {
        this.parcels.push(result);
        this.data[index]['product_parcels'].push(result);
        let quantity = 0;
        this.data[index]['product_parcels'].forEach(parcel => {
          quantity = quantity + parcel['quantity'];
        });
        this.data[index]['quantity'] = quantity;
        this.data[index]['amount'] = (this.data[index]['price'] - this.data[index]['discount']) * this.data[index]['quantity'];
        this.recalculateWarehouse();
      }
    });
  }

  changeQuantity(index, value) {
    this.data[index]['quantity'] = Number(this.data[index]['quantity']) + Number(value);
    if (this.data[index]['product_parcels'].length === 1) {
      this.data[index]['product_parcels'][0]['quantity'] = this.data[index]['quantity'];
    }
    this.recalculateItem(index);
  }

  onParcelSelectedChange(index, value) {
    let quantity = 0;
    this.data[index]['product_parcels'].forEach(parcel => {
      quantity = quantity + parcel['quantity'];
    });
    this.data[index]['quantity'] = quantity;
    this.data[index]['amount'] = (this.data[index]['price'] - this.data[index]['discount']) * this.data[index]['quantity'];
    this.recalculateWarehouse();
  }

  openDiscountDialogWarehouse() {
    const dialogRef = this.dialog.open(WarehouseDiscountDialogComponent, {
      width: '30%',
      minHeight: '80%',
      data: {
        discount_amount: this.form.controls['discount_amount'].value,
        discount_type: this.form.controls['discount_type'].value,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== null) {
        this.form.patchValue({
          discount_amount: result.number,
          discount_type: result.type,
        });
        this.recalculateWarehouse();
      }
    });
  }

  openDiscountDialogWarehouseProduct(i) {
    if (this.data[i] !== undefined) {

      const dialogRef = this.dialog.open(WarehouseDiscountDialogComponent, {
        width: '30%',
        minHeight: '80%',
        data: {
          discount_amount: this.data[i]['discount'],
          discount_type: this.data[i]['discount_type'],
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result !== null) {
          this.data[i]['discount'] = result.number;
          this.data[i]['discount_type'] = result.type;
          this.recalculateItem(i);
        }
      });
    }

  }

  openSupplierFormDialog() {
    const dialogRef = this.dialog.open(SupplierFormDialogComponent, {
      width: '50%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.form.patchValue({'supplier': result});
    });
  }

  /**
   * In don nhap hang
   * @param model
   */
  buttonPrintWarehouse(model) {
    this.printWarehouse(model.id);
  }

  /**
   * Main handel print
   * @param id
   */
  printWarehouse(id: string) {
    this.mainService.getDataWarehouseToPrint(id).subscribe(res => {

      let printContent = '<title>' + res.no + '</title>';
      printContent += '<style>table {' +
        'border-collapse: collapse;' +
        'width: 100%;' +
        '}' +
        'td, th {' +
        'border: 1px solid #dddddd;' +
        'text-align: left;' +
        'padding: 8px;' +
        '}</style>' +
        '<section style="padding: -5px;">' +
        '<p style="text-align:center;">Địa chỉ : ' + res?.store?.name + '</p>' +
        '<p style="text-align:center; font-weight:600;">HÓA ĐƠN NHẬP HÀNG</p>' +
        '<p style="text-align:center; font-weight:600;">Mã phiếu nhập: ' + res?.no + '</p> ' +
        '<p style="text-align:left;">Ngày nhập: ' + res?.date + ' </p>' +
        '<p style="text-align:left;">Người nhập: ' + res?.created_by + ' </p>' +
        '<table>' +
        '<tr>' +
        '<td style="font-weight: 600;"> Nhà cung cấp </td>' +
        '<td>' + res?.supplier?.name + '</td>' +
        '<td style="font-weight: 600;"> Tổng tiền hàng </td>' +
        '<td style="text-align:right;">' + res?.total_price + '</td>' +
        '</tr>' +
        '<tr>' +
        '<td style="font-weight: 600;">Trạng thái </td>' +
        '<td>' + res?.status + '</td>' +
        '<td style="font-weight: 600;">Giảm giá </td>' +
        '<td style="text-align:right;">' + res?.discount_amount + '</td>' +
        '</tr>' +
        '<tr>' +
        '<td style="font-weight: 600;">Số lượng</td>' +
        '<td style="text-align:right;">' + res?.total_quantity + '</td>' +
        '<td style="font-weight: 600;">Tiền trả nhà cung cấp </td>' +
        '<td style="text-align:right;">' + res?.paid_amount + '</td>' +
        '</tr>' +
        '<tr>' +
        '<td style="font-weight: 600;">Ghi chú</td>' +
        '<td>' + res?.note + '</td>' +
        '<td style="font-weight: 600;">Tính vào công nợ </td>' +
        '<td style="text-align:right;">' + res?.remain_amount + '</td>' +
        '</tr>' +
        '</table>';

      printContent += '<p style="text-align:left;">Chi tiết nhập hàng :</p>';

      const detail = res.warehoureItems;
      printContent += '<table>';
      printContent += '<tr style="text-align:center; font-size: 13px">';
      printContent += '<th>' + 'Mã hàng' + '</th>';
      printContent += '<th>' + 'Tên hàng' + '</th>';
      printContent += '<th>' + 'Đơn gía' + '</th>';
      printContent += '<th>' + 'Giảm giá' + '</th>';
      printContent += '<th>' + 'Thành tiền' + '</th>';
      printContent += '</tr>';

      detail.forEach(element => {
        printContent += '<tr>';
        printContent += '<td style="text-align:left;">' + element?.product?.product_no + '</td>';
        printContent += '<td style="text-align:left;">' + element?.product?.product_name + '<br>' +
          'Đơn vị : ' + element?.product_unit?.name + '<br>' +
          'Số lượng : ' + element.quantity + '<br>';
        const parcels = element.parcels;
        if (parcels[0] !== undefined) {
          printContent += 'Lô: ' + parcels[0]['parcel_no'] + '-';
          printContent += parcels[0]['expiration_date'] + '-SL:';
          printContent += parcels[0]['quantity'];
        }
        printContent += '</td>';
        printContent += '<td style="text-align:right;">' + element.price + '</td>';
        printContent += '<td style="text-align:right;">' + element.discount + '</td>';
        printContent += '<td style="text-align:right;">' + element.amount + '</td>';
        printContent += '</tr>';
      });
      printContent += '</table>';

      printContent += '<p style="text-align:center;font-style: italic;" >---</p>';
      printContent += '</section>';

      const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
      WindowPrt.document.write(printContent);
      WindowPrt.document.close();
      WindowPrt.focus();
      WindowPrt.print();
      WindowPrt.close();
    });
  }

  openProductMedicineDialog(action, obj) {
    obj.action = action;
    obj.title = 'Thêm thuốc';
    obj.product_id = null;
    obj.copy_product_id = null;
    const dialogRef = this.dialog.open(ProductMedicineDialogComponent, {
      data: obj,
      width: '60%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log(result);
      if (result['event'] === 'Save') {
        this.handleAddProductToList(result['data']['id']);
      }
    });
  }

  openProductMerchandiseFormDialog(action, obj) {
    obj.action = action;
    obj.title = 'Thêm hàng hóa';
    obj.product_id = null;
    obj.copy_product_id = null;
    const dialogRef = this.dialog.open(ProductMerchandiseFormDialogComponent, {
      data: obj,
      width: '60%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      // this.loadData();
      // console.log(result);
      if (result['event'] === 'Save') {
        this.handleAddProductToList(result['data']['id']);
      }
    });
  }

}
