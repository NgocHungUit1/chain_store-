import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import {MedicineFilter} from '../medicine.model';
import {MatSort} from '@angular/material/sort';
import {ListComponentBase} from '../../shared/base';
import {MedicineService} from '../medicine.service';
import {ActivatedRoute} from '@angular/router';
import {NotifierService} from 'angular-notifier';
import {MatDialog} from '@angular/material/dialog';
import {MedicineFormDialogComponent} from '../medicine-form-dialog/medicine-form-dialog.component';

@Component({
  templateUrl: './medicine-list.component.html',
  styleUrls: ['./medicine-list.component.css']
})
export class MedicineListComponent extends ListComponentBase implements OnInit {

  constructor(
    private modelSer: MedicineService,
    private notifySer: NotifierService,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {
    super();
  }

  @ViewChild(MatTable, { static: true }) table: MatTable<any>;

  apiFilter: MedicineFilter;

  columnsHeader = {
    '#': '#',
    'medicine_no': 'Mã thuốc',
    'medicine_name': 'Tên thuốc',
    'registration_no': 'Số đăng ký',
    'main_active_substance': 'Hoạt chất chính',
    'content': 'Hàm lượng',
    'packing': 'Đóng gói',
    'manufacturer': 'Nhà sản xuất',
    'made_in': 'Nơi sản xuất',
    'unit': 'Đơn vị',
    'actions': '',
  };

  displayedColumns: string[] = [
    '#', 'medicine_no',
    'medicine_name', 'registration_no',
    'main_active_substance', 'manufacturer', 'made_in', 'unit', 'actions'];
  columnsToDisplay: string[] = [
    '#', 'medicine_no', 'medicine_name',
    'registration_no', 'main_active_substance', 'content', 'packing',
    'manufacturer', 'made_in', 'unit', 'actions'
  ];
  dataSource = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  buildFilterFromParams(): MedicineFilter {
    function write<K extends keyof MedicineFilter>(arg: MedicineFilter, key: K, value: MedicineFilter[K]): void {
      arg[key] = value;
    }

    const filter = new MedicineFilter();
    const objectKeys = Object.keys(filter) as Array<keyof MedicineFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['MedicineSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    return filter;
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.modelSer.getList(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      this.reloadFilter(res);
      const url = this.modelSer.getStateUrl(this.apiFilter);
      this.isLoadingResults = false;
    });
  }

  ngOnInit() {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  reconnect(item) {
    this.modelSer.reconnect(item.id).subscribe(res => {
      if (res['success']) {
        this.notifySer.notify('success', 'Cập nhật liên thông thành công.');
      }
    });
  }

  connect(item) {
    this.modelSer.connect(item.id).subscribe(res => {
      if (res['success']) {
        item.medicine_no = res['medicine_no'];
        this.notifySer.notify('success', 'Liên thông thành công.');
      }
    });
  }

  disconnect(item) {
    this.modelSer.disconnect(item.id).subscribe(res => {
      if (res['success']) {
        item.medicine_no = null;
        this.notifySer.notify('success', 'Gỡ liên thông thành công.');
      } else if (res['message'] !== undefined) {
        this.notifySer.notify('error', res['message']);
      }
    });
  }

  openMedicineFormDialog(id = null) {
    const dialogRef = this.dialog.open(MedicineFormDialogComponent, {
      width: '50%',
      data: {
        id: id
      }
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadData();
      }
    });
  }
}
