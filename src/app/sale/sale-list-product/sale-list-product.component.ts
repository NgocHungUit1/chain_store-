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
  ) {
    super();
  }

  isLoadingResults = true;
  expandedElement: Product | null;

  apiFilter: ProductFilter;
  dataSource: Product[] = [];

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
      this.reloadFilter(res);
      const url = this.productSer.getStateUrl(this.apiFilter);
      this.isLoadingResults = false;
    });
  }

  ngOnInit(): void {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  addProductToOrder(object){
    // console.log(object); //@NGHIA
    this.orderService.addProduct(object);
    
    
  }
}
