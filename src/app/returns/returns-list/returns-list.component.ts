import { Component, OnInit, ViewChild } from '@angular/core';
import { ListComponentBase } from '../../shared/base';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { animate, state, style, transition, trigger } from "@angular/animations";
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Returns, ReturnsFilter } from '../returns.model';
import { ReturnsService } from '../returns.service';

@Component({
  selector: 'app-returns-list',
  templateUrl: './returns-list.component.html',
  styleUrls: ['./returns-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class ReturnsListComponent extends ListComponentBase implements OnInit {

  constructor(
    private service: ReturnsService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private notifySer: NotifierService,
    private fb: FormBuilder,
    private router: Router
  ) {
    super();
   }

   @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;

  apiFilter: ReturnsFilter;
  expandedElement: Returns | null;
  timeFilter: FormGroup;

  searchInvoiceForm = new FormControl();

  columnsHeader = {
    '#': '#',
    'return_no': 'Mã trả hàng',
    'created_at': 'Thời gian',
    'customer': 'Khách hàng',
    'total_price': 'Tổng tiền hàng',
    // 'discount': 'Giảm giá',
  };

  displayedColumns: string[] = ['#', 'return_no', 'created_at', 'customer', 'total_price'];
  columnsToDisplay: string[] = ['#', 'return_no', 'created_at', 'customer', 'total_price'];
  dataSource: Returns[] = [];

  buildFilterFromParams(): ReturnsFilter {
    function write<K extends keyof ReturnsFilter>(arg: ReturnsFilter, key: K, value: ReturnsFilter[K]): void {
      arg[key] = value;
    }
    const filter = new ReturnsFilter();

    const objectKeys = Object.keys(filter) as Array<keyof ReturnsFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['ReturnsSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'customer,priceBook,store,user,detailInfo';

    return filter;
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.service.getList(this.apiFilter).subscribe(res => {
      let data = res.body;
      let stt = 0;
      data.forEach(elementData => {
        stt++; elementData.stt = stt; // tinh STT

        // const date = new Date(1000 * elementData.created_at).toJSON().slice(0, 16);
        // elementData.created_at = date.slice(8, 10) + '/'
        //   + date.slice(5, 7) + '/'
        //   + date.slice(0, 4) + ' '
        //   + date.slice(11, 16);

        // // tong tien khach hang da tra, tien giam gia
        // let total_payment = 0;
        // let discount_price = 0;
        // elementData.payment.forEach(ele => {
        //   total_payment = total_payment + ele.total_price;

        // });
        // elementData.total_payment = total_payment;
        // // End - tong tien khach hang da tra, tien giam gia

        // if (elementData.discount_type === 'price') {
        //   discount_price = elementData.discount;
        // } else {
        //   discount_price = elementData.total_price * elementData.discount / 100;
        // }
        // elementData.discount_price = discount_price;

      });
      this.dataSource = data;

      this.reloadFilter(res);
      // const url = this.service.getStateUrl(this.apiFilter);
      this.isLoadingResults = false;
    });

  }

  ngOnInit(): void {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

}
