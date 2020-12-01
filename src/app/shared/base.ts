import {HostBinding} from "@angular/core";
import * as moment from "moment";


export class ApiFilterBase {
  search_string;
  page = 1;
  pageSize = 15;
  sort = '';
  expand = '';

  getModelSearch() {
    return '';
  }

  toFilterString(): string {
    let res = '';
    for (const key of Object.keys(this)) {
      if (this[key]) {
        if (key !== 'page' && key !== 'pageSize' && key !== 'sort' && key !== 'expand') {
          if (key !== 'date_ranger') {
            res += '&' + this.getModelSearch() + '[' + key + ']=' + this[key];
          } else {
            if (this[key].startDate !== null) {
              res += '&' + this.getModelSearch() + '[start_date]=' + this[key].startDate.unix();
            }
            if (this[key].endDate !== null) {
              res += '&' + this.getModelSearch() + '[end_date]=' + this[key].endDate.unix();
            }
          }

        } else {
          res += '&' + key + '=' + this[key];
        }

      }
    }
    return res.substr(1);
  }
}

export class ListComponentBase {
  @HostBinding('class.dv-list-page') layout = true;
  /**
   * Selected columns of data table
   * @type {any[]}
   */
  selectedColumns = [];

  /**
   * Column headers config
   * @type {{}}
   */
  columnsToDisplay = [];

  apiFilter: ApiFilterBase;

  loading = true;
  dataSource = [];
  pageSize = 0;
  pageTotalCount = 0;
  page = 1; // current page
  pageSizeOptions = [5, 10, 20, 30, 40, 50];

  banks = [
    {
      'code': 'VietBank',
      'name': 'VietBank',
    },
    {
      'code': 'LienVietPostBank',
      'name': 'LienVietPostBank',
    },
    {
      'code': 'VietinBank',
      'name': 'VietinBank',
    }
  ];

  ranges: any = {
    'Hôm nay': [moment(), moment()],
    'Hôm qua': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    '7 ngày trước': [moment().subtract(6, 'days'), moment()],
    '30 ngày trước': [moment().subtract(29, 'days'), moment()],
    'Tháng này': [moment().startOf('month'), moment().endOf('month')],
    'Tháng trước': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
  };

  /**
   * Function to call api for loading data
   */
  loadData() {

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

  /**
   * Filter data table submit event
   */
  onFilterSubmit() {
    this.loadData();
  }

  buildFilterFromParams() {
    return new ApiFilterBase();
  }

  /**
   * Filter form reset event
   */
  onFilterClear() {
    this.apiFilter = this.buildFilterFromParams();
  }

  /**
   * Return columns for data table display
   * @returns {any[]}
   */
  get displayColumns() {
    return this.selectedColumns;
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
    console.log(this.apiFilter);
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
}
