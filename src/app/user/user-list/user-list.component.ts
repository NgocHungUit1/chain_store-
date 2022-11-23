import {Component, OnInit, ViewChild} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute} from '@angular/router';
import {NotifierService} from 'angular-notifier';
import {MatTable} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {ListComponentBase} from '../../shared/base';
import {UserService} from '../user.service';
import {User, UserFilter} from '../user.model';
import {UserFormDialogComponent} from '../user-form-dialog/user-form-dialog.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class UserListComponent extends ListComponentBase implements OnInit {

  constructor(
    private service: UserService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private notifyService: NotifierService
  ) {
    super();
  }

  @ViewChild(MatTable, { static: true }) table: MatTable<any>;

  apiFilter: UserFilter;

  columnsHeader = {
    '#': '#',
    'username': 'Tên tài khoản',
    'phone_number': 'Số điện thoại',
    'email': 'Email',
    'status': 'Trạng thái',
  };

  displayedColumns: string[] = [
    '#',
    'username',
    'phone_number',
    'email',
    'status'
  ];
  columnsToDisplay: string[] = [
    '#',
    'username',
    'phone_number',
    'email',
    'status'
  ];

  dataSource = [];
  expandedElement: User | null;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;

  buildFilterFromParams(): UserFilter {
    function write<K extends keyof UserFilter>(arg: UserFilter, key: K, value: UserFilter[K]): void {
      arg[key] = value;
    }

    const filter = new UserFilter();
    const objectKeys = Object.keys(filter) as Array<keyof UserFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['UserSearch[' + attr + ']']);
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
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();

    this.service.subscribeLoadUser.subscribe(action => {
      if (action === true) {
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
        this.service.setLoadUser(false);
      }
    });
  }

  openUserFormDialog() {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '50%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

}
