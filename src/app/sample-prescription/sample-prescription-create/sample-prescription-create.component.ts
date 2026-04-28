import { Component, OnInit, ViewChild } from '@angular/core';
import { ListComponentBase } from '../../shared/base';
import { WarehouseService } from '../../warehouse/warehouse.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
import * as numeral from 'numeral';

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

  selectProduct = new FormControl();

  apiFilter: SamplePrescriptionItemFilter;
  updateModelId = null;
  model: SamplePrescription = null;

  statuses = [
    {
      id: '10',
      name: 'Áp dụng'
    },
    {
      id: '9',
      name: 'Chưa áp dụng'
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
  invalidQuantityItems = new Set<object>();
  quantityErrors = new Map<object, string>();

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
      name: [null, Validators.required],
      status: ['10'],
      note: [null],
      total_amount: [0],
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
          name: res['name'],
          status: res['status'] + '',
          note: res['note'],
          total_amount: numeral(res['total_amount']).format('0,0'),
        });

        this.form.controls['date'].disable();
        this.loadData();
      });
    } else {
      this.samplePrescriptionService.getRenderSamplePrescriptionNo().subscribe(res => {
        this.form.patchValue({
          no: 'DTM' + res,
          status: '10',
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
        sampleItem.productUnits = item.productUnits;
        sampleItem.amount = item.amount;
        sampleItem.note = item.note;

        newData.push(sampleItem);
      });
      this.data = newData;
      this.productDataSource = new MatTableDataSource<SamplePrescriptionItem>(this.data);
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
      filter.sample_prescription_id = this.updateModelId;
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
      sampleItem.amount = 1;
      sampleItem.productUnits = res['productUnits'];

      if (res['productUnits'].length > 0) {
        sampleItem.productUnits = res['productUnits'];
        res['productUnits'].sort((a, b) => (a.value > b.value) ? 1 : -1);
        sampleItem.product_unit_id = res['productUnits'][0]['id'];
      }

      const newData = this.data.concat([sampleItem]);
      this.data = newData;
      this.productDataSource = new MatTableDataSource<SamplePrescriptionItem>(this.data);
      this.selectProduct.patchValue(null);
    });
  }

  removeProduct(i) {
    const newData = this.data;
    newData.splice(i, 1);
    this.data = newData;
    this.productDataSource = new MatTableDataSource<SamplePrescriptionItem>(this.data);
  }

  /**
   * @param index
   * @param select
   */
  onUnitChange(index, select) {

  }

  validateAmountInput(i: number, event: Event) {
    const input = (event.target as HTMLInputElement).value.trim();
    const item = this.data[i];
    const num = Number(input);
    if (!input || isNaN(num) || !/^\d+(\.\d+)?$/.test(input)) {
      this.invalidQuantityItems.add(item);
      this.quantityErrors.set(item, 'Số lượng không hợp lệ');
      return;
    }
    if (num <= 0) {
      this.invalidQuantityItems.add(item);
      this.quantityErrors.set(item, 'Số lượng phải lớn hơn 0');
      return;
    }
    this.invalidQuantityItems.delete(item);
    this.quantityErrors.delete(item);
  }

  changeQuantity(index, value) {
    const newQty = Number(this.data[index]['amount']) + Number(value);
    if (newQty <= 0) { return; }
    this.data[index]['amount'] = newQty;
    const item = this.data[index];
    this.invalidQuantityItems.delete(item);
    this.quantityErrors.delete(item);
  }

  saveSample() {
    if (this.form.valid) {
      const data = this.form.getRawValue();
      data['total_amount'] = numeral(data['total_amount']).value();

      if (this.form.controls['date'].value !== null && typeof this.form.controls['date'].value === 'object') {
        const effDate = new Date(this.form.controls['date'].value.getTime() + (420 * 60 * 1000));
        data['date'] = effDate.toISOString().split('T')[0];
      }
      data['items'] = this.data;

      if (this.updateModelId !== null) {
        delete data['date'];
        this.samplePrescriptionService.update(this.updateModelId, data).subscribe(res => {
          // this.model = res;
          this.notifySer.notify('success', 'Lưu thành công.');
          this.router.navigate(['/store/sample-prescription']);

        });
      } else {
        this.samplePrescriptionService.create(data).subscribe(res => {
          // this.model = res;
          this.notifySer.notify('success', 'Lưu thành công.');
          this.router.navigate(['/store/sample-prescription']);

        });
      }


      //
    }
  }

  inputFormatNumber(event: any) {
    event.target.value = numeral(event.target.value).format('0,0');
  }

  /**
   * In don kiem kho
   * @param model
   */
  buttonPrintWarehouse(model) {
    console.log('print');
  }

}
