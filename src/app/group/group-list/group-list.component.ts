import { Component, OnInit, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {BaseComponent, ListComponentBase} from '../../shared/base';
import { GroupService } from '../../product/group.service';
import { Group, GroupFilter } from '../group.model';
import { GroupFormDialogComponent } from '../group-form-dialog/group-form-dialog.component';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import {PopupConfirmDialogComponent} from '../../common/popup-confirm-dialog/popup-confirm-dialog.component';
import {AuthService} from '../../authentication/auth.service';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class GroupListComponent extends ListComponentBase implements OnInit {

  constructor(
      private service: GroupService,
      private dialog: MatDialog,
      private route: ActivatedRoute,
      private notifyService: NotifierService,
      private authSer: AuthService,
  ) {
    super();
  }

  @ViewChild(MatTable, {static: true}) table: MatTable<any>;

  apiFilter: GroupFilter;
  searchKeyWord = new FormControl();

  columnsHeader = {
    '#': '#',
    // 'no': 'Mã nhóm hàng',
    'name': 'Tên nhóm hàng',
    // 'alias': 'alias',
    // 'description': 'Mô tả',
  };


  displayedColumns: string[] = [
    '#',
    // 'no',
    'name',
    // 'alias',
    'actions',
  ];
  columnsToDisplay: string[] = [
    '#',
    // 'no',
    'name',
    // 'alias',
    'actions',
  ];

  dataSource = [];

  expandedElement: Group | null;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;


  buildFilterFromParams(): GroupFilter {
    function write<K extends keyof GroupFilter>(arg: GroupFilter, key: K, value: GroupFilter[K]): void {
      arg[key] = value;
    }

    const filter = new GroupFilter();
    const objectKeys = Object.keys(filter) as Array<keyof GroupFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['GroupFilterSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'branch';
    return filter;
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.service.getList(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      let stt = 0;
      this.dataSource.forEach(elementData => {
        stt++;
        elementData.stt = this.pageSize * (this.page - 1) + stt;
      });
      this.reloadFilter(res);
      this.isLoadingResults = false;
    });
  }

  ngOnInit(): void {
    this.refreshData();
    this.searchKeyWord.valueChanges.pipe(debounceTime(800)).subscribe(res => {
      if (res !== '') {
        this.apiFilter = this.buildFilterFromParams();
        this.apiFilter.keyword = res;
        this.loadData();
      } else {
        this.refreshData();
      }
    });
  }

  refreshData() {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  openGroupFormDialog() {
    const dialogRef = this.dialog.open(GroupFormDialogComponent, {
      width: '600px',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  openGroupFormDialogUpdate(id) {
    const obj = {
      action: 'Update',
      title: 'Cập nhật khách hàng',
      group_id: id,
    };

    const dialogRef = this.dialog.open(GroupFormDialogComponent, {
      data: obj,
      width: '600px',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  clickDelete(id) {
    const obj = {
      action: 'Connect',
      title: 'Xác nhận xóa nhóm hàng?',
      content: '',
    };

    const dialogRef = this.dialog.open(PopupConfirmDialogComponent, {
      data: obj,
      width: '30%',
      minHeight: '60%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.event === 'confirm') {
        this.service.delete(id).subscribe(res => {
          if (res?.success === true) {
            this.notifyService.notify('success', res?.message);
            this.loadData();
          } else {
            this.notifyService.notify('warning', res?.message);
          }
        });
      }
    });
  }

  canDo(permissionName: string): boolean {
    const allPermissions = this.authSer.getPermissionsFromLocalStorage();

    return allPermissions.indexOf(permissionName) !== -1;
  }

}
