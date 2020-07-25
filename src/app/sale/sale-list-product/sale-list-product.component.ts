import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from "@angular/material/paginator";
import { MatTable } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { MatDialog } from '@angular/material/dialog';
import { ProductService } from '../../product/product.service';
import { ProductFilter, Product } from '../../product/product.model';
import { ActivatedRoute } from '@angular/router';
import { ListComponentBase } from '../../shared/base';
import { OrderService } from '../order.service';
import { PriceListProductService } from '../../price-book/price-list-product.service';
import { ItemInvoice } from '../order.model';

@Component({
  selector: 'app-sale-list-product',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './sale-list-product.component.html',
  styleUrls: ['./sale-list-product.component.css']
})
export class SaleListProductComponent extends ListComponentBase implements OnInit {

  constructor(
    private orderService: OrderService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private productSer: ProductService,
    private priceListProductSer: PriceListProductService,

  ) {
    super();
  }

  isLoadingResults = true;
  expandedElement: Product | null;

  apiFilter: ProductFilter;
  dataSource: Product[] = [];
  priceBookID: string = null;

  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  buildFilterFromParams(): ProductFilter {
    function write<K extends keyof ProductFilter>(arg: ProductFilter, key: K, value: ProductFilter[K]): void {
      arg[key] = value;
    }

    const filter = new ProductFilter();
    const objectKeys = Object.keys(filter) as Array<keyof ProductFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['ProductSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];

    filter.expand = 'medicine,productPlacements,group,images';
    return filter;
  }

  loadData(): void {
    this.isLoadingResults = true;

    this.productSer.getList(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      const list = res.body;
      if (this.priceBookID !== null && Array.isArray(list)) {
        const listProductChoose = list.map(obj => obj.id);
        const common_id = this.priceBookID;
        // tien hanh xu ly add common vao list
        this.priceListProductSer.getListProductCommon(common_id, listProductChoose).subscribe(resCommon => {
          if (Array.isArray(resCommon)) {
            const priceListProductCommonExist = resCommon;
            this.dataSource = res.body;
            // code group array by key
            const group = priceListProductCommonExist.reduce((r, a) => {
              r[a.product_id] = [...r[a.product_id] || [], a];
              return r;
            }, {});
            // add common || null
            this.dataSource.forEach(elementData => {
              if (group[elementData.id] !== undefined) {
                elementData.common = group[elementData.id][0];
              } else {
                elementData.common = null;
              }
            });
          }
        });
      }
      this.reloadFilter(res);
      const url = this.productSer.getStateUrl(this.apiFilter);
      this.isLoadingResults = false;

    });
  }

  ngOnInit(): void {
    this.apiFilter = this.buildFilterFromParams();

    this.orderService.subscribeObjectListInvoice.subscribe(ListInvoice => {
      const listItemInvoice = ListInvoice.itemInvoice;
      let isNew = 0;
      listItemInvoice.forEach(element => {
        if (element.active === true && this.priceBookID !== element?.price_book_id) {
          this.priceBookID = element?.price_book_id;
          isNew = 1;
        }
      });

      if (isNew === 1) {
        this.loadData();
      }

    });

    // this.orderService.subscribePriceBookID.subscribe(priceBookID => {
    //   if (priceBookID !== null) {
    //     this.loadData();
    //   }
    // });

  }

  addProductToOrder(object) {
    this.orderService.addProduct(object);
  }
}
