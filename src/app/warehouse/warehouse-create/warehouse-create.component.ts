import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTable} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {NotifierService} from 'angular-notifier';
import {MatDialog} from '@angular/material/dialog';
import {ListComponentBase} from '../../shared/base';
import {WarehouseProductService} from '../warehouse-product.service';
import {WarehouseProduct, WarehouseProductFilter} from '../warehouse.model';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs/index';
import {Supplier} from '../../supplier/supplier.model';
import {catchError, debounceTime, map, startWith, switchMap} from 'rxjs/operators';
import {of} from 'rxjs/internal/observable/of';
import {SupplierService} from '../../supplier/supplier.service';
import {WarehouseService} from '../warehouse.service';

@Component({
  selector: 'app-warehouse-create',
  templateUrl: './warehouse-create.component.html',
  styleUrls: ['./warehouse-create.component.css']
})
export class WarehouseCreateComponent extends ListComponentBase implements OnInit {

  constructor(
    private mainService: WarehouseService,
    private warehourProductService: WarehouseProductService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private supplierSer: SupplierService,
    private notifySer: NotifierService
  ) {
    super();
  }

  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;

  apiFilter: WarehouseProductFilter;

  columnsHeader = {
    '#': '#',
    'product_no': 'Mã hàng',
    'product_name': 'Tên hàng',
    'quantity': 'Số lượng',
    'price': 'Đơn giá',
    'discount': 'Giảm giá',
    'amount': 'Thành tiền',
  };

  displayedColumns: string[] = [];
  columnsToDisplay: string[] = [
    '#',
    'product_no',
    'product_name',
    'quantity',
    'price',
    'discount',
    'amount',
  ];
  dataSource: WarehouseProduct[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;

  form: FormGroup;

  filteredSuppliers: Observable<Supplier[]>;

  ngOnInit() {
    const date = new FormControl(new Date());
    this.form = this.fb.group({
      date: date,
      no: [null],
      supplier: [null, Validators.required],
      status: [null],
      quantity: [null],
      total_amount: [null],
      total_discount: [null],
      paid_amount: [null],
      remain_amount: [null],
      note: [null],
    });
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();

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
  }

  displaySupplier(supplier?: Supplier): string | undefined {
    return supplier ? supplier.name : undefined;
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

  loadData(): void {
    this.isLoadingResults = true;
    this.warehourProductService.getList(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      this.reloadFilter(res);
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
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'medicine,productPlacements,group,images';
    return filter;
  }

  submitDraft() {
    console.log('draft');
  }

  submit() {
    if (this.form.valid) {
      const data = this.form.getRawValue();
      data['supplier_id'] = data['supplier']['id'];
      if (this.form.controls['date'].value !== null && typeof this.form.controls['date'].value === 'object') {
        const effDate = new Date(this.form.controls['date'].value.getTime() + (420 * 60 * 1000));

        data['date'] = effDate.toISOString().split('T')[0];
      }
      this.mainService.create(data).subscribe(res => {
        this.notifySer.notify('success', 'Lưu thành công.');
        this.router.navigate(['/transaction/warehouse/update/' + res['id']]);
      });
    }
  }

}
