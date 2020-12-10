import { Component, OnInit, ViewChild } from '@angular/core';
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
import { ListComponentBase } from '../../shared/base';
import { Move, MoveDetail, MoveDetailFilter } from '../move.model';
import { MoveService } from '../move.service';
import { MoveDetailService } from '../move-detail.service';
import { UserService } from '../../user/user.service';

@Component({
  selector: 'app-move-create',
  templateUrl: './move-create.component.html',
  styleUrls: ['./move-create.component.css']
})
export class MoveCreateComponent extends ListComponentBase implements OnInit {

  constructor(
    private mainService: WarehouseService,
    private moveDetailService: MoveDetailService,
    private moveService: MoveService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private productSer: ProductService,
    private notifySer: NotifierService,
    private userService: UserService,
  ) {
    super();
  }


  @ViewChild(MatTable, {static: true}) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;

  selectProduct = new FormControl();

  apiFilter: MoveDetailFilter;
  updateModelId = null;
  model: Move = null;

  branchList: any;


  statuses = [
    {
      id: '10',
      name: 'Hoàn thành'
    },
    {
      id: '9',
      name: 'Khởi tạo'
    },
  ];

  columnsHeader = {
    '#': '#',
    'product_no': 'Mã hàng',
    'product_name': 'Tên hàng',
    'product_unit_id': 'Đơn vị',
    'amount': 'Số lượng',
  };

  displayedColumns: string[] = [];
  columnsToDisplay: string[] = [
    '#',
    'product_name',
    'product_unit_id',
    'amount',
    'actions'
  ];

  data: MoveDetail[] = [];
  productDataSource = new MatTableDataSource<MoveDetail>([]);

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
      status: ['9'],
      branch_from: [null],
      branch_to: [null, Validators.required]
    });

    this.userService.getStoreBranchList().subscribe(res => {
      this.branchList = res.body;
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
      this.moveService.getDetail(this.updateModelId, '').subscribe(res => {
        let dateStr = null;
        if (res['date'] !== null) {
          dateStr = new Date(res['date']).toISOString();
        }
        this.model = res;

        this.form.patchValue({
          date: dateStr,
          no: res['no'],
          status: res['status'] + '',
          branch_from: res['branch_from'],
          branch_to: res['branch_to'],
        });
        // this.form.controls['branch_to'].disable();
        this.loadData();
      });
    } else {
      this.moveService.getRenderNo().subscribe(res => {
        this.form.patchValue({
          no: 'CK' + res,
          status: '9',
        });
      });

      this.userService.getBranchLogin().subscribe(branchLogin => {
        this.form.controls['branch_from'].setValue(branchLogin);
      });
    }
    this.form.controls['date'].disable();
    this.form.controls['branch_from'].disable();

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
    this.moveDetailService.getList(this.apiFilter).subscribe(res => {
      const newData = [];
      res.body.forEach(item => {
        const sampleItem = new MoveDetail();
        if (this.updateModelId !== null) {
          sampleItem.id = item.id;
        }
        sampleItem.product_id = item.product_id;
        sampleItem.product = item.product;
        sampleItem.product_unit_id = item.product_unit_id;
        sampleItem.productUnits = item.productUnits;
        sampleItem.amount = item.amount;

        newData.push(sampleItem);
      });
      this.data = newData;
      this.productDataSource = new MatTableDataSource<MoveDetail>(this.data);
      this.isLoadingResults = false;
    });
  }

  buildFilterFromParams(): MoveDetailFilter {
    // tslint:disable-next-line:max-line-length
    function write<K extends keyof MoveDetailFilter>(arg: MoveDetailFilter, key: K, value: MoveDetailFilter[K]): void {
      arg[key] = value;
    }

    const filter = new MoveDetailFilter();
    const objectKeys = Object.keys(filter) as Array<keyof MoveDetailFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['MoveDetailSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = 50;
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'product,productUnits';
    if (this.updateModelId !== null) {
      filter.move_id = this.updateModelId;
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
      const item = new MoveDetail();
      item.product_id = res['id'];
      item.product = res;
      item.amount = 1;
      item.productUnits = res['productUnits'];

      if (res['productUnits'].length > 0) {
        item.productUnits = res['productUnits'];
        res['productUnits'].sort((a, b) => (a.value > b.value) ? 1 : -1);
        item.product_unit_id = res['productUnits'][0]['id'];
      }

      const newData = this.data.concat([item]);
      this.data = newData;
      this.productDataSource = new MatTableDataSource<MoveDetail>(this.data);
      this.selectProduct.patchValue(null);
    });
  }

  removeProduct(i) {
    const newData = this.data;
    newData.splice(i, 1);
    this.data = newData;
    this.productDataSource = new MatTableDataSource<MoveDetail>(this.data);
  }

  /**
   * @param index
   * @param select
   */
  onUnitChange(index, select) {

  }

  changeQuantity(index, value) {
    this.data[index]['amount'] = Number(this.data[index]['amount']) + Number(value);
  }

  saveSample() {
    if (this.form.valid) {
      const data = this.form.getRawValue();

      if (this.form.controls['date'].value !== null && typeof this.form.controls['date'].value === 'object') {
        const effDate = new Date(this.form.controls['date'].value.getTime() + (420 * 60 * 1000));
        data['date'] = effDate.toISOString().split('T')[0];
      }
      data['items'] = this.data;

      if (data['status'] === '10') {
        // console.log();
        // return;
        this.moveService.validate(data).subscribe(res => {
          if (res !== true) {
            if (typeof res === 'string') {
              this.notifySer.notify('warning', res);
              return;
            }
          } else {
            if (this.updateModelId !== null) {
              delete data['date'];
              this.moveService.update(this.updateModelId, data).subscribe(res => {
                this.notifySer.notify('success', 'Lưu thành công.');
                this.router.navigate(['/transaction/move']);
              });
            } else {
              this.moveService.create(data).subscribe(res => {
                this.notifySer.notify('success', 'Lưu thành công.');
                this.router.navigate(['/transaction/move']);
              });
            }
          }
        });
      }

      if (data['status'] === '9') {
        if (this.updateModelId !== null) {
          delete data['date'];
          this.moveService.update(this.updateModelId, data).subscribe(res => {
            this.notifySer.notify('success', 'Lưu thành công.');
            this.router.navigate(['/transaction/move']);
          });
        } else {
          this.moveService.create(data).subscribe(res => {
            this.notifySer.notify('success', 'Lưu thành công.');
            this.router.navigate(['/transaction/move']);
          });
        }
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

  public changeBranchFrom(event) {
    this.form.controls['branch_from'].setValue(event.value);
  }

  public changeBranchTo(event) {
    this.form.controls['branch_to'].setValue(event.value);
  }


  public changeBranch(event) {
    const data = {'branch_store_id': event.value};
    // this.userService.updateBranchLogin(data).subscribe(res => {
    //   if (res === true) {
    //     this.notifySer.notify('success', 'Chuyển chi nhánh thành công.');
    //     this.resetDataSiderBar();
    //     this.orderService.initListInvoice();
    //     setTimeout(function () {
    //       location.reload();
    //     }, 500);
    //   } else {
    //     this.notifySer.notify('error', 'Đã có lỗi xảy ra, vui lòng kiểm tra lại.');
    //   }
    // }, (error) => {
    // });
  }

}
