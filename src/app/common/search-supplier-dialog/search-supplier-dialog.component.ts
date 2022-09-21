import {Component, Inject, OnInit, Optional, ViewChild} from '@angular/core';
import {ListComponentBase} from '../../shared/base';
import {MedicineService} from '../../medicine/medicine.service';
import {ProductService} from '../../product/product.service';
import {ActivatedRoute} from '@angular/router';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {GroupService} from '../../product/group.service';
import {MatTable} from '@angular/material/table';
import {Product, ProductFilter} from '../../product/product.model';
import {Group, GroupFilter} from '../../product/group.model';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {debounceTime} from 'rxjs/operators';
import {ProductMedicineDialogComponent} from '../../product/product-medicine-dialog/product-medicine-dialog.component';
import {
  ProductMerchandiseFormDialogComponent
} from '../../product/product-merchandise-form-dialog/product-merchandise-form-dialog.component';
import {ProductUploadDialogComponent} from '../../product/product-upload-dialog/product-upload-dialog.component';
import {Supplier, SupplierFilter} from '../../supplier/supplier.model';
import {SupplierService} from '../../supplier/supplier.service';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {SupplierFormDialogComponent} from '../../supplier/supplier-form-dialog/supplier-form-dialog.component';

@Component({
  selector: 'app-search-supplier-dialog',
  templateUrl: './search-supplier-dialog.component.html',
  styleUrls: ['./search-supplier-dialog.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class SearchSupplierDialogComponent extends ListComponentBase implements OnInit {

  constructor(
    private medicineService: MedicineService,
    private service: SupplierService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private notifySer: NotifierService,
    private fb: FormBuilder,
    private groupSer: GroupService,
    public dialogRef: MatDialogRef<SearchSupplierDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {
    super();
  }

  apiFilter: SupplierFilter;

  columnsHeader = {
    '#': '#',
    'name': 'Tên đối tác',
    'phone_number': 'Số điện thoại',
    'email': 'Email',
    'company_name': 'Tên công ty',
    'tax_code': 'Mã số thuế',
    'status': 'Trạng thái',
  };

  displayedColumns: string[] = [
    '#',
    'name',
    'phone_number',
    'email',
    'tax_code',
    'company_name',
    'status'
  ];
  columnsToDisplay: string[] = [
    '#',
    'name',
    'company_name',
    'phone_number',
    'email',
    'tax_code',
    'status'
  ];
  dataSource = [];
  expandedElement: Supplier | null;

  @ViewChild(MatTable, {static: true}) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;

  productFilter: FormGroup;

  typeProductFilterList = [
    {
      'value': 'medicine',
      'name': 'Thuốc',
    },
    {
      'value': 'merchandise',
      'name': 'Hàng hóa',
    },
  ];


  statusProductFilter: FormGroup;
  groupProductFilter: FormGroup;
  groups: Group[] = [];

  statusProductFilterList = [
    {
      'value': 10,
      'name': 'Kinh doanh',
    },
    {
      'value': 9,
      'name': 'Ngừng kinh doanh',
    },
  ];

  stockFilterList = [
    {
      'value': 'empty',
      'name': 'Hết hàng',
    },
    {
      'value': 'have',
      'name': 'Còn hàng',
    },
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;

  searchForm = new FormControl();
  codeSearch = null;

  buildFilterFromParams(): SupplierFilter {
    function write<K extends keyof SupplierFilter>(arg: SupplierFilter, key: K, value: SupplierFilter[K]): void {
      arg[key] = value;
    }

    const filter = new SupplierFilter();
    const objectKeys = Object.keys(filter) as Array<keyof SupplierFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['SupplierSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = 10//this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'province,district,ward';
    return filter;
  }


  clickChoose(element) {
    this.dialogRef.close({
      event: 'Choose',
      supplier: element,
    });
  }

  // loadData(): void {
  //   const code = this.route.snapshot.paramMap.get('code');
  //   if (code !== null && code !== undefined) {
  //     if (this.codeSearch == null) {
  //       this.apiFilter.product_no = code;
  //       this.codeSearch = code;
  //     } else {
  //       this.apiFilter.product_no = '';
  //     }
  //   }
  //
  //   this.isLoadingResults = true;
  //   this.service.getList(this.apiFilter).subscribe(res => {
  //     this.dataSource = res.body;
  //     let stt = 0;
  //     if (this.dataSource.length === 1) {
  //       const arr = this.dataSource;
  //       this.expandedElement = arr[0];
  //     }
  //     this.dataSource.forEach(elementData => {
  //       stt++;
  //       elementData.stt = stt;
  //     });
  //     this.reloadFilter(res);
  //     const url = this.service.getStateUrl(this.apiFilter);
  //     this.isLoadingResults = false;
  //   });
  // }

  openSupplierFormDialog() {
    const dialogRef = this.dialog.open(SupplierFormDialogComponent, {
      width: '50%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadData();
    });
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.service.getList(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      let stt = 0;
      this.dataSource.forEach(elementData => {
        stt++;
        elementData.stt = stt;
      });
      this.reloadFilter(res);
      this.isLoadingResults = false;
    });
  }


  /**
   * Tim kiem theo phan loai sản phẩm
   */
  typeProductFilterChange() {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  /**
   * Tim kiem theo trang thai sản phẩm
   */
  statusProductFilterChange() {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  ngOnInit() {

    this.productFilter = this.fb.group({
      type: [
        ['medicine', 'merchandise']
      ],
      status: [
        [10, 9]
      ],
      group: [null],
      stock: [
        ['empty', 'have']
      ],
    });

    const groupFilter = new GroupFilter();
    groupFilter.pageSize = 100;
    // groupFilter.store_id = 1;
    this.groupSer.getList(groupFilter).subscribe(res => {
      this.groups = res.body;
    });

    this.apiFilter = this.buildFilterFromParams();
    this.loadData();

    // this.service.subscribeLoadProduct.subscribe(action => {
    //   if (action === true) {
    //     this.apiFilter = this.buildFilterFromParams();
    //     this.loadData();
    //     this.service.setLoadProduct(false);
    //   }
    // });
    //
    this.searchForm.valueChanges.pipe(debounceTime(800)).subscribe(res => {
      if (res !== '') {
        this.apiFilter = this.buildFilterFromParams();
        this.apiFilter.keyword = res;
        this.loadData();
      } else {
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
      }
    });
  }

}
