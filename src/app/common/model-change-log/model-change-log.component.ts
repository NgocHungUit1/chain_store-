import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import {ActivatedRoute, Router} from '@angular/router';
import {BaseComponent} from '../../shared/base';
import {AuthService} from '../../authentication/auth.service';
import {MatDialog} from '@angular/material/dialog';
import {User, UserFilter} from '../../user/user.model';
import {ModelChangeLog, ModelChangeLogFilter} from './model-change-log.model';
import {ModelChangeLogService} from './model-change-log.service';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {UserService} from '../../user/user.service';

@Component({
  selector: 'app-model-change-log',
  templateUrl: './model-change-log.component.html',
  styleUrls: ['./model-change-log.component.css'],
  animations: [
    trigger('detailExpand', [
      state(
        'collapsed',
        style({ height: '0px', minHeight: '0', display: 'none' })
      ),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      )
    ])
  ]
})
export class ModelChangeLogComponent extends BaseComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private mainSer: ModelChangeLogService,
    public dialog: MatDialog,
    public userService: UserService,
    public authSer: AuthService
  ) {
    super(authSer);
  }
  loading = false;
  loadingUser = false;
  users: User[] = [];
  public expandedElement: ModelChangeLog;

  actionNames = [];

  apiFilter: ModelChangeLogFilter;

  @Input() model_name: string;
  @Input() model_id: string;
  @Input() pageSize = 10;
  @Input() attrLabels = {};
  @Input() actionNameObj = {'Update': 'Cập nhật', 'Create': 'Tạo mới'};
  @Input() valueLabels = {};
  @Input() showSearchBar = true;
  @Input() title = 'Lịch sử thay đổi';
  @Input() displayColumns = ['#', 'action_name', 'search_text', 'created_at', 'created_by', 'change_detail'];

  data: object[] = [];
  dataSource: MatTableDataSource<any> = new MatTableDataSource(this.data);

  pageTotalCount = 0;
  page = 1; // current page
  pageSizeOptions = [5, 10, 20, 30, 40, 50];

  ngOnInit() {
    this.apiFilter = this.buildFilterFromParams();
    this.actionNames = Object.keys(this.actionNameObj);

    if (this.model_id !== null) {
      this.loadData();
    }
  }

  buildFilterFromParams(): ModelChangeLogFilter {
    function write<K extends keyof ModelChangeLogFilter>(arg: ModelChangeLogFilter, key: K, value: ModelChangeLogFilter[K]): void {
      arg[key] = value;
    }

    const filter = new ModelChangeLogFilter();
    const objectKeys = Object.keys(filter) as Array<keyof ModelChangeLogFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['ModelChangeLogSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = '-created_at';

    filter.model_name = this.model_name;
    filter.model_id = this.model_id;

    return filter;
  }

  loadData() {
    this.loading = true;
    this.data = [];

    this.mainSer.getList(this.apiFilter).subscribe(res => {
      let response = res.body;

      response.forEach(function (item) {
        const changeDetail = JSON.parse(item['change_detail']);

        const subDataSource = [];

        const arrKeys = Object.keys(changeDetail);

        arrKeys.forEach(function (key) {
          subDataSource.push({key: key, old: changeDetail[key]['old'], new: changeDetail[key]['new']})
        });

        item['change_detail'] = subDataSource;
      });

      this.loadingUser = true;
      const userIds = Array.from(new Set(response.map(item => item.created_by)));
      if (userIds.length > 0) {
        const userFilter = new UserFilter();
        userFilter.id = userIds.join(',');
        this.userService.getListForRef(userFilter).subscribe(userRes => {
          const userData = [];
          userRes.body.forEach(function(item) {
            userData[item.id] = item;
          });
          this.users = userData;
          this.loadingUser = false;
        });
      } else {
        this.loadingUser = false;
      }

      this.data = response;

      this.dataSource = new MatTableDataSource<any>(this.data);

      this.reloadFilter(res);
      this.loading = false;
    });
  }

  onPageChange(page) {
    this.page = page;
    this.apiFilter.page = page;
    this.loadData();
  }

  onMatPageChange(event) {
    this.page = event.pageIndex + 1;
    this.apiFilter.page = event.pageIndex + 1;
    this.apiFilter.pageSize = event.pageSize;
    this.loadData();
  }

  onMatSortChange(event) {
    this.apiFilter.sort = event.active;
    if (event.direction === 'desc') {
      this.apiFilter.sort = '-' + event.active;
    }
    if (event.direction === '') {
      this.apiFilter.sort = '';
    }
    this.loadData();
  }

  /**
   * Reload pagination after load data
   * @param res
   */
  reloadFilter(res) {
    this.pageTotalCount = Number(res.headers.get('X-Pagination-Total-Count'));
    this.pageSize = Number(res.headers.get('X-Pagination-Per-Page'));
    this.page = Number(res.headers.get('X-Pagination-Current-Page'));
    this.apiFilter.pageSize = this.pageSize;
    this.apiFilter.page = this.page;
  }

  onKeyPress(event) {
    if (event.code === 'Enter' || event.keyCode === 13) {
      this.loadData();
    }
  }

}
