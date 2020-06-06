import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {ListComponentBase} from '../../shared/base';
import {SupplierService} from '../supplier.service';
import {ActivatedRoute} from '@angular/router';
import {SupplierFilter} from '../supplier.model';
import {MatDialog} from '@angular/material/dialog';
import {SupplierFormDialogComponent} from '../supplier-form-dialog/supplier-form-dialog.component';

@Component({
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.css']
})
export class SupplierListComponent extends ListComponentBase implements OnInit {

  constructor(
    private service: SupplierService,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {
    super();
  }

  @ViewChild(MatTable, { static: true }) table: MatTable<any>;

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

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;

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
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    return filter;
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.service.getList(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      this.reloadFilter(res);
      this.isLoadingResults = false;
    });
  }

  ngOnInit() {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  openSupplierFormDialog() {
    const dialogRef = this.dialog.open(SupplierFormDialogComponent, {
      width: '50%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadData();
    });
  }
}
