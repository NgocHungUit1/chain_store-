import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from "@angular/material/paginator";
import { MatTable } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { PriceBookProduct, PriceBookProductFilter } from "../price-book-product.model";
import { ActivatedRoute } from "@angular/router";
import { PriceBookProductService } from "../price-book-product.service";
import { ListComponentBase } from "../../shared/base";
import { MatDialog } from "@angular/material/dialog";
import { NotifierService } from "angular-notifier";
import { animate, state, style, transition, trigger } from "@angular/animations";
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CreatePriceListFormDialogComponent } from '../create-price-list-form-dialog/create-price-list-form-dialog.component';




@Component({
  selector: 'app-price-book-list',
  templateUrl: './price-book-list.component.html',
  styleUrls: ['./price-book-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class PriceBookListComponent extends ListComponentBase implements OnInit {

  public priceListForm: FormGroup;
  priceLists: [];


  constructor(
    private fb: FormBuilder,
    private service: PriceBookProductService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private notifySer: NotifierService
  ) {
    super();
  }

  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;

  apiFilter: PriceBookProductFilter;
  expandedElement: PriceBookProduct | null;


  columnsHeader = {
    '#': '#',
    'product_type': 'Phân loại',
    'product_no': 'Mã hàng',
    'product_name': 'Tên hàng',
    'original_price': 'Giá gốc',
    'sell_price': 'Giá bán',
    'common_price': 'Giá chung'
  };

  productTypeLable = {
    'medicine': 'Thuốc',
    'merchandise': 'Hàng hóa',
  };

  displayedColumns: string[] = ['#', 'product_type', 'product_no', 'product_name', 'original_price', 'sell_price', 'common_price'];
  columnsToDisplay: string[] = ['#', 'product_type', 'product_no', 'product_name', 'original_price', 'sell_price', 'common_price'];
  dataSource: PriceBookProduct[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;


  buildFilterFromParams(): PriceBookProductFilter {
    function write<K extends keyof PriceBookProductFilter>(arg: PriceBookProductFilter, key: K, value: PriceBookProductFilter[K]): void {
      arg[key] = value;
    }

    const filter = new PriceBookProductFilter();
    const objectKeys = Object.keys(filter) as Array<keyof PriceBookProductFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['ProductSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'medicine,productPlacements,group,images';
    return filter;
  }

  initPriceListForm() {
    this.priceListForm = this.fb.group({
      price_list_id: [
        null
      ],
    });
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.service.getList(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      this.reloadFilter(res);
      const url = this.service.getStateUrl(this.apiFilter);
      this.isLoadingResults = false;
    });
  }


  ngOnInit() {

    this.apiFilter = this.buildFilterFromParams();
    this.loadData();

    this.service.subscribeLoadProduct.subscribe(action => {
      if (action === true) {
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
        this.service.setLoadProduct(false);
      }
    });
  }

  openCreatePriceListFormDialog() {
    const dialogRef = this.dialog.open(CreatePriceListFormDialogComponent, {});

    dialogRef.afterClosed().subscribe(result => {
      if (result !== false && result !== undefined) {
        // this.placements.push(result);

        // const curSelects = this.form.controls['placements'].value;
        // curSelects.push(result.id);

        // this.form.patchValue({placements: curSelects});
      }
    });
  }

  // inputSearch(event: any) {
  //   this.key_work = event.target.value;
  //   this.apiFilter = this.buildFilterFromParams();
  //   this.loadData();
  // }

}
