import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { ProductService } from '../../product/product.service';
import { ProductFilter, Product } from '../../product/product.model';
import { ActivatedRoute } from '@angular/router';
import { ListComponentBase } from '../../shared/base';
import { OrderService } from '../order.service';
import { PriceListProductService } from '../../price-book/price-list-product.service';
import { ItemInvoice } from '../order.model';
import { element } from 'protractor';
import { NotifierService } from 'angular-notifier';

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
    private notifySer: NotifierService,
  ) {
    super();
  }

  isLoadingResults = true;
  expandedElement: Product | null;

  apiFilter: ProductFilter;
  dataSource: Product[] = [];
  priceBookID: string = null;
  localItemInvoice: ItemInvoice;


  @ViewChild(MatTable, {static: true}) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  buildFilterFromParams(): ProductFilter {
    function write<K extends keyof ProductFilter>(arg: ProductFilter, key: K, value: ProductFilter[K]): void {
      arg[key] = value;
    }

    //
    let itemInvoice: ItemInvoice = null;
    const listInvoice = this.orderService.getListInvoiceLocalStorage();
    const listItemInvoice = listInvoice.itemInvoice;
    listItemInvoice.forEach(element => {
      if (element.active === true) {
        itemInvoice = element;
      }
    });

    const filter = new ProductFilter();
    const objectKeys = Object.keys(filter) as Array<keyof ProductFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['ProductSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.price_book_id = itemInvoice?.price_book_id;
    filter.expand = 'medicine,productPlacements,group,images,common,productUnits';
    return filter;
  }

  loadData(): void {
    this.isLoadingResults = true;

    this.productSer.getListCart(this.apiFilter).subscribe(res => {
      const data = res.body;
      // tslint:disable-next-line:no-shadowed-variable
      data.forEach(element => {
        // console.log(element);
        const productUnits = element.productUnits;
        let quantity_of_stock = 0;
        productUnits.forEach(unit => {
          quantity_of_stock = unit.quantity_of_stock;
        });
        element.quantity_of_stock = quantity_of_stock;
      });
      this.dataSource = data;

      this.reloadFilter(res);
      const url = this.productSer.getStateUrl(this.apiFilter);
      this.isLoadingResults = false;

    });
  }

  ngOnInit(): void {
    let mItemInvoice = new ItemInvoice();
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
    this.orderService.subscribeObjectListInvoice.subscribe(ListInvoice => {
      const listItemInvoice = ListInvoice.itemInvoice;
      // console.log(listItemInvoice);
      listItemInvoice.forEach(element => {
        if (element.active === true && this.priceBookID !== element?.price_book_id) {
          this.priceBookID = element?.price_book_id;
          this.apiFilter = this.buildFilterFromParams();
          this.loadData();
        }
      });
      this.localItemInvoice = this.getNewItemInvoice();

    });

  }

  getNewItemInvoice() {
    let mItemInvoice = new ItemInvoice();
    this.orderService.subscribeObjectListInvoice.subscribe(ListInvoice => {
      const listItemInvoice = ListInvoice.itemInvoice;
      listItemInvoice.forEach(element => {
        if (element.active === true) {
          mItemInvoice = element;
        }
      });
    });
    return mItemInvoice;
  }

  addProductToOrder(object) {
    const product = object;
    let units = object.productUnits;
    let unitOne = units.find(element => element.quantity_of_stock > 0);
    units = units.filter(element => element.quantity_of_stock > 0);
    if (unitOne == undefined) {
      this.notifySer.notify('warning', 'Sản phẩm hết hàng trong kho !');
      return;
    }
    object.productUnits = units;

    product.product_unit_id = unitOne?.id;
    product.product_unit_value = unitOne?.value;
    product.base_unit = unitOne?.name;
    product.product_no = unitOne?.no;
    product.sell_price = unitOne?.sell_price;

    if (product.quantity_of_stock === 0) {
      this.notifySer.notify('warning', product.product_name + ' có tồn kho là 0 !');
      return;
    }

    this.orderService.addProduct(product);
    // if (units == undefined) {
    //   this.notifySer.notify('warning', 'Vui lòng cập nhật đơn vị sản phẩm !');
    // } else {
    //   this.orderService.addProduct(product);
    // }
  }
}
