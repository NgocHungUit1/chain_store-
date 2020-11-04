import { Component, OnInit, ViewChild } from '@angular/core';
import { ListComponentBase } from '../../shared/base';
import { WarehouseService } from '../../warehouse/warehouse.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ProductService } from '../../product/product.service';
import { NotifierService } from 'angular-notifier';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { Product } from '../../product/product.model';
import { catchError, debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { SamplePrescription, SamplePrescriptionItem, SamplePrescriptionItemFilter } from '../sample-prescription.model';
import { SamplePrescriptionService } from '../sample-prescription.service';
import { SamplePrescriptionItemService } from '../sample-prescription-item.service';

@Component({
  selector: 'app-sample-prescription-item-create',
  templateUrl: './sample-prescription-create.component.html',
  styleUrls: ['./sample-prescription-create.component.css']
})
export class SamplePrescriptionCreateComponent extends ListComponentBase implements OnInit {

  constructor(
    private mainService: WarehouseService,
    private samplePrescriptionService: SamplePrescriptionService, // samplePrescriptionService
    private samplePrescriptionItemService: SamplePrescriptionItemService, // samplePrescriptionService
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private productSer: ProductService,
    private notifySer: NotifierService
  ) {
    super();
  }


  @ViewChild(MatTable, {static: true}) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;

  selectProduct = new FormControl();

  apiFilter: SamplePrescriptionItemFilter;
  updateModelId = null;
  model: SamplePrescription = null;

  statuses = [
    {
      id: 'draft',
      name: 'Lưu nháp'
    },
    {
      id: 'done',
      name: 'Hoàn thành'
    },
    {
      id: 'cancel',
      name: 'Hủy bỏ'
    },
  ];

  columnsHeader = {
    '#': '#',
    'product_no': 'Mã hàng',
    'product_name': 'Tên hàng',
    'product_unit_id': 'Đơn vị',
    'amount': 'Số lượng',
    'note': 'Liều dùng',
  };

  displayedColumns: string[] = [];
  columnsToDisplay: string[] = [
    '#',
    'product_name',
    'product_unit_id',
    'amount',
    'note',
    'actions'
  ];

  data: SamplePrescriptionItem[] = [];
  productDataSource = new MatTableDataSource<SamplePrescriptionItem>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = false;
  isRateLimitReached = false;

  form: FormGroup;

  filteredProducts: Observable<Product[]>;

  ngOnInit() {
    const date = new FormControl(new Date());
    this.form = this.fb.group({
      date: date,
      no: [null],
      balance_status: ['draft'],
      note: [null],
      total_price: [0],
      actual_number: [0],
    });

    this.displayedColumns = this.columnsToDisplay;


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
      this.samplePrescriptionService.getDetail(this.updateModelId, '').subscribe(res => {
        let dateStr = null;
        if (res['date'] !== null) {
          dateStr = new Date(res['date']).toISOString();
        }
        this.model = res;

        this.form.patchValue({
          date: dateStr,
          no: res['no'],
          balance_status: res['balance_status'],
          total_price: res['total_price'],
          actual_number: res['actual_number'],
          note: res['note'],
        });

        this.form.controls['date'].disable();
        this.loadData();
      });
    } else {
      this.samplePrescriptionService.getRenderSamplePrescriptionNo().subscribe(res => {
        this.form.patchValue({
          no: 'KK0' + res,
          balance_status: 'draft',
        });
      });
      this.form.controls['date'].disable();
    }

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
    this.samplePrescriptionItemService.getList(this.apiFilter).subscribe(res => {
      const newData = [];
      res.body.forEach(item => {
        const sampleItem = new SamplePrescriptionItem();
        if (this.updateModelId !== null) {
          sampleItem.id = item.id;
        }
        sampleItem.product_id = item.product_id;
        sampleItem.product = item.product;
        sampleItem.product_unit_id = item.product_unit_id;

        const units = item.productUnits;
        // tslint:disable-next-line:no-shadowed-variable
        units.forEach(element => {
          element.quantity_of_stock = Math.floor(item.quantity_of_stock / element.value);
        });
        sampleItem.productUnits = units;
        newData.push(sampleItem);
      });
      this.data = newData;
      this.productDataSource = new MatTableDataSource<SamplePrescriptionItem>(this.data);
      this.recalculate();
      this.isLoadingResults = false;
    });
  }

  buildFilterFromParams(): SamplePrescriptionItemFilter {
    // tslint:disable-next-line:max-line-length
    function write<K extends keyof SamplePrescriptionItemFilter>(arg: SamplePrescriptionItemFilter, key: K, value: SamplePrescriptionItemFilter[K]): void {
      arg[key] = value;
    }

    const filter = new SamplePrescriptionItemFilter();
    const objectKeys = Object.keys(filter) as Array<keyof SamplePrescriptionItemFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['SamplePrescriptionItemSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = 50;
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'product,productUnits';
    if (this.updateModelId !== null) {
      // filter.stock_take_id = this.updateModelId;
    }
    return filter;
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
      const sampleItem = new SamplePrescriptionItem();
      sampleItem.product_id = res['id'];
      sampleItem.product = res;
      sampleItem.productUnits = res['productUnits'];

      if (res['productUnits'].length > 0) {

        const units = res['productUnits'];
        units.forEach(element => {
          element.quantity_of_stock = Math.floor(res['quantity_of_stock'] / element.value);
        });
        sampleItem.productUnits = units;

        res['productUnits'].sort((a, b) => (a.value > b.value) ? 1 : -1);
        sampleItem.product_unit_id = res['productUnits'][0]['id'];
        // sampleItem.view_quantity_of_stock = res['productUnits'][0]['quantity_of_stock'];
        // sampleItem.deviation_number = sampleItem.actual_number - sampleItem.view_quantity_of_stock;
        // sampleItem.price = res['productUnits'][0]['original_price'];
        // sampleItem.deviation_price = sampleItem.deviation_number * sampleItem.price;
      }

      const newData = this.data.concat([sampleItem]);
      this.data = newData;
      this.productDataSource = new MatTableDataSource<SamplePrescriptionItem>(this.data);
      this.recalculate();
      this.selectProduct.patchValue(null);
    });
  }

  recalculateItem(index) {
    this.data[index]['deviation_number'] = this.data[index]['actual_number'] - this.data[index]['view_quantity_of_stock'];
    this.data[index]['deviation_price'] = this.data[index]['deviation_number'] * this.data[index]['price'];
    this.recalculate();
  }

  recalculate() {

    let total_price = 0;
    let actual_number = 0;
    this.data.forEach(item => {
      total_price += Number(item['deviation_price']);
      actual_number += Number(item['actual_number']);
    });

    this.form.patchValue({
      total_price: total_price,
      actual_number: actual_number,
    });
  }

  removeProduct(i) {
    const newData = this.data;
    newData.splice(i, 1);
    this.data = newData;
    this.recalculate();
    this.productDataSource = new MatTableDataSource<SamplePrescriptionItem>(this.data);
  }

  /**
   * @param index
   * @param select
   */
  onUnitChange(index, select) {
    if (this.data[index] !== undefined) {
      const unit = this.data[index]['productUnits'].find(element => element['id'] === select.value);
      const unitBase = this.data[index]['productUnits'].find(element => element['is_base'] === 1);
      this.data[index]['view_quantity_of_stock'] = unit['quantity_of_stock'];
      this.data[index]['deviation_number'] = this.data[index]['actual_number'] - this.data[index]['view_quantity_of_stock'];
      this.data[index]['price'] = unitBase['original_price'] * unit['value'];
      this.data[index]['deviation_price'] = this.data[index]['deviation_number'] * this.data[index]['price'];
      this.recalculate();
    }
  }

  changeQuantity(index, value) {
    this.data[index]['actual_number'] = Number(this.data[index]['actual_number']) + Number(value);
    this.data[index]['deviation_number'] = this.data[index]['actual_number'] - this.data[index]['view_quantity_of_stock'];
    this.data[index]['deviation_price'] = this.data[index]['price'] * this.data[index]['deviation_number'];
    this.recalculate();
  }

  saveSample() {
    if (this.form.valid) {
      const data = this.form.getRawValue();

      if (this.form.controls['date'].value !== null && typeof this.form.controls['date'].value === 'object') {
        const effDate = new Date(this.form.controls['date'].value.getTime() + (420 * 60 * 1000));
        data['date'] = effDate.toISOString().split('T')[0];
      }
      data['items'] = this.data;

      if (this.updateModelId !== null) {
        delete data['date'];
        this.samplePrescriptionService.update(this.updateModelId, data).subscribe(res => {
          // this.model = res;
          // this.notifySer.notify('success', 'Lưu thành công.');
          // if (balance_status === 'done') {
          //   this.router.navigate(['/store/stock-take']);
          // } else {
          //   this.router.navigate(['/store/stock-take/update/' + res.id]);
          // }
        });
      } else {
        this.samplePrescriptionService.create(data).subscribe(res => {
          // this.model = res;
          // this.notifySer.notify('success', 'Lưu thành công.');
          // if (balance_status === 'done') {
          //   this.router.navigate(['/store/stock-take']);
          // } else {
          //   this.router.navigate(['/store/stock-take/update/' + res.id]);
          // }
        });
      }


      //
    }
  }

  /**
   * In don kiem kho
   * @param model
   */
  buttonPrintWarehouse(model) {
    console.log('print');
  }

}
