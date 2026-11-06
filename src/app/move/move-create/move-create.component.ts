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
import { Move, MoveDetail, MoveDetailFilter, MoveLot, MOVE_STATUS } from '../move.model';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { MoveService } from '../move.service';
import { MoveDetailService } from '../move-detail.service';
import { UserService } from '../../user/user.service';
import { MatDateProviders } from '../../shared/providers/mat-date.provider';

@Component({
  selector: 'app-move-create',
  templateUrl: './move-create.component.html',
  styleUrls: ['./move-create.component.css'],
  providers: [...MatDateProviders]
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


  /** Đang gửi yêu cầu lưu: khoá 2 nút để không bấm hai lần */
  saving = false;

  columnsHeader = {
    '#': '#',
    'product_no': 'Mã hàng',
    'product_name': 'Tên hàng',
    'product_unit_id': 'Đơn vị',
    'amount': 'Số lượng',
    'lots': 'Lô chuyển (đơn vị cơ bản)',
  };

  displayedColumns: string[] = [];
  columnsToDisplay: string[] = [
    '#',
    'product_name',
    'product_unit_id',
    'amount',
    'lots',
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
        });
      });

      this.userService.getBranchLogin().subscribe(branchLogin => {
        this.form.controls['branch_from'].setValue(branchLogin);
      });
    }
    this.form.controls['date'].disable();
    this.form.controls['branch_from'].disable();

    const product_id = localStorage.getItem('product_id');
    if (product_id !== null) {
      this.handleAddProductToList(product_id);
      localStorage.removeItem('product_id');
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
        sampleItem.parcels = (item.parcels || []).map(p => ({parcel_no: p.parcel_no, expiration_date: p.expiration_date, quantity: p.quantity}));

        newData.push(sampleItem);
      });
      this.data = newData;
      this.productDataSource = new MatTableDataSource<MoveDetail>(this.data);
      this.isLoadingResults = false;
      // Phiếu lưu tạm: nạp tồn lô hiện tại để thấy còn bao nhiêu (không tự chia lại lô đã chọn)
      this.data.filter(item => this.isBatch(item)).forEach(item => this.loadLots(item, false));
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
    filter.expand = 'product,productUnits,parcels';
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
      if (this.isBatch(item)) {
        this.loadLots(item, true);
      }
    });
  }

  /** Thuốc quản lý theo lô: phải chọn lô khi chuyển */
  isBatch(item: MoveDetail): boolean {
    return !!(item.product && (item.product['batch_tracking_enabled'] === true || item.product['batch_tracking_enabled'] == 1));
  }

  unitValue(item: MoveDetail): number {
    const unit = (item.productUnits || []).find(u => u['id'] == item.product_unit_id);
    return unit ? Number(unit['value']) || 1 : 1;
  }

  baseUnitName(item: MoveDetail): string {
    const unit = (item.productUnits || []).find(u => Number(u['value']) === 1);
    return unit ? unit['name'] : '';
  }

  /** Số cần chuyển theo đơn vị cơ bản */
  need(item: MoveDetail): number {
    return (Number(item.amount) || 0) * this.unitValue(item);
  }

  chosen(item: MoveDetail): number {
    return (item.parcels || []).reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
  }

  lotStock(item: MoveDetail, parcelNo: string, exp: string): number {
    const lot = (item.lots || []).find(l => l.parcel_no === parcelNo && l.expiration_date === exp);
    return lot ? lot.stock : 0;
  }

  /** Lô còn tồn chưa chọn (để thêm), bỏ lô đã hết hạn */
  remainingLots(item: MoveDetail): MoveLot[] {
    return (item.lots || []).filter(l => !l.expired
      && !(item.parcels || []).some(p => p.parcel_no === l.parcel_no && p.expiration_date === l.expiration_date));
  }

  loadLots(item: MoveDetail, allocate: boolean) {
    this.moveService.lots(item.product_id).subscribe(lots => {
      item.lots = lots;
      if (allocate) {
        this.allocate(item);
      }
    });
  }

  /** Tự chọn lô: lấy lô hết hạn trước (FEFO), bỏ lô đã hết hạn, đến khi đủ số cần chuyển */
  allocate(item: MoveDetail) {
    if (!this.isBatch(item) || !item.lots) {
      return;
    }
    let left = this.need(item);
    const parcels = [];
    for (const lot of item.lots) {
      if (left <= 0) {
        break;
      }
      if (lot.expired || lot.stock <= 0) {
        continue;
      }
      const take = Math.min(left, lot.stock);
      parcels.push({parcel_no: lot.parcel_no, expiration_date: lot.expiration_date, quantity: take});
      left -= take;
    }
    item.parcels = parcels;
  }

  addLot(item: MoveDetail, lot: MoveLot) {
    const missing = Math.max(this.need(item) - this.chosen(item), 0);
    item.parcels = (item.parcels || []).concat([{parcel_no: lot.parcel_no, expiration_date: lot.expiration_date,
      quantity: Math.min(missing || 1, lot.stock)}]);
  }

  removeLot(item: MoveDetail, index: number) {
    item.parcels.splice(index, 1);
  }

  /** Câu báo lô của dòng chưa hợp lệ (để hiện đỏ và chặn Xuất chuyển); null = đúng */
  lotError(item: MoveDetail): string {
    if (!this.isBatch(item)) {
      return null;
    }
    if (item.lots && item.lots.filter(l => !l.expired).length === 0) {
      return 'Chi nhánh này không còn lô nào của thuốc.';
    }
    for (const p of item.parcels || []) {
      const q = Number(p.quantity);
      if (!Number.isInteger(q) || q <= 0) {
        return 'Số lượng lô ' + p.parcel_no + ' phải là số nguyên > 0.';
      }
      if (item.lots && q > this.lotStock(item, p.parcel_no, p.expiration_date)) {
        return 'Lô ' + p.parcel_no + ' chỉ còn ' + this.lotStock(item, p.parcel_no, p.expiration_date) + '.';
      }
    }
    if (this.chosen(item) !== this.need(item)) {
      return 'Đã chọn ' + this.chosen(item) + ' / cần ' + this.need(item) + ' ' + this.baseUnitName(item) + '.';
    }
    return null;
  }

  hasLotError(): boolean {
    return this.data.some(item => this.lotError(item) !== null);
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
    this.allocate(this.data[index]);
  }

  changeQuantity(index, value) {
    this.data[index]['amount'] = Number(this.data[index]['amount']) + Number(value);
    this.allocate(this.data[index]);
  }

  onAmountChange(index) {
    this.allocate(this.data[index]);
  }

  /** Lưu tạm (sửa / xoá được, chưa đổi tồn) hoặc Xuất chuyển (trừ tồn + lô chi nhánh gửi, chờ chi nhánh nhận xác nhận) */
  save(send: boolean) {
    if (!this.form.valid || this.saving) {
      return;
    }
    if (this.data.length === 0) {
      this.notifySer.notify('warning', 'Phiếu chuyển chưa có hàng.');
      return;
    }
    const data = this.form.getRawValue();
    delete data['date'];
    data['status'] = send ? MOVE_STATUS.SENT : MOVE_STATUS.DRAFT;
    data['items'] = this.data.map(item => ({
      id: item.id,
      product_id: item.product_id,
      product_unit_id: item.product_unit_id,
      amount: Number(item.amount),
      parcels: this.isBatch(item) ? (item.parcels || []).map(p => ({
        parcel_no: p.parcel_no, expiration_date: p.expiration_date, quantity: Number(p.quantity),
      })) : [],
    }));
    if (!send) {
      this.submit(data, 'Đã lưu tạm phiếu chuyển.');
      return;
    }
    if (this.hasLotError()) {
      this.notifySer.notify('warning', 'Chọn đủ lô cho các thuốc theo lô trước khi xuất chuyển.');
      return;
    }
    this.moveService.validate(data).subscribe(res => {
      if (res !== true) {
        this.notifySer.notify('warning', typeof res === 'string' ? res : 'Phiếu chuyển chưa hợp lệ.');
        return;
      }
      const branchTo = (this.branchList || []).find(b => b.id == data['branch_to']);
      this.dialog.open(ConfirmationDialogComponent, {
        width: '460px',
        data: {
          title: 'Xuất chuyển hàng',
          message: 'Xuất chuyển sẽ trừ tồn và lô ở chi nhánh này ngay. Hàng chỉ vào kho '
            + (branchTo ? branchTo.name : 'chi nhánh nhận') + ' khi bên đó bấm "Nhận hàng". Sau khi xuất không sửa được phiếu, chỉ huỷ được khi bên nhận chưa nhận.',
          confirmButtonText: 'Xuất chuyển',
          cancelButtonText: 'Quay lại',
        },
      }).afterClosed().subscribe(ok => {
        if (ok) {
          this.submit(data, 'Đã xuất chuyển. Chờ chi nhánh nhận xác nhận.');
        }
      });
    });
  }

  private submit(data, message: string) {
    this.saving = true;
    const request = this.updateModelId !== null ? this.moveService.update(this.updateModelId, data) : this.moveService.create(data);
    request.subscribe(() => {
      this.saving = false;
      this.notifySer.notify('success', message);
      this.router.navigate(['/transaction/move']);
    }, () => {
      this.saving = false;
    });
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
