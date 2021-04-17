import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Route, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface BadgeItem {
  type: string;
  value: string;
}

export interface Saperator {
  name: string;
  type?: string;
}

export interface ChildrenItems {
  state: string;
  name: string;
  type?: string;
  icon?: string;
  roles?: string[];
}

export interface Menu {
  state: string;
  name: string;
  type: string;
  icon: string;
  badge?: BadgeItem[];
  saperator?: Saperator[];
  children?: ChildrenItems[];
  roles?: string[];
}

const MENUITEMS = [
  {
    state: '',
    name: 'Personal',
    type: 'saperator',
    icon: 'av_timer'
  },
  {
    state: 'dashboard',
    name: 'Tổng quan',
    type: 'link',
    icon: 'av_timer',
    roles: ['ADMIN', 'WAREHOUSE', 'SALE']
    // children: [
    //     { state: 'dashboard1', name: 'Dashboard 1', type: 'link' },
    //     { state: 'dashboard2', name: 'Dashboard 2', type: 'link' }
    // ]
  },
  {
    state: 'store',
    name: 'Hàng hóa',
    type: 'sub',
    icon: 'web_asset',
    roles: ['ADMIN', 'WAREHOUSE', 'SALE'],
    // badge: [{type: 'red', value: '17'}],
    children: [
      {state: 'medicine', name: 'Danh mục thuốc', type: 'link', icon: 'list', roles: ['ADMIN', 'WAREHOUSE', 'SALE']},
      {state: 'product', name: 'Sản phẩm', type: 'link', icon: 'local_pharmacy', roles: ['ADMIN', 'WAREHOUSE']},
      {state: 'sample-prescription', name: 'Đơn thuốc mẫu', type: 'link', icon: 'list_alt', roles: ['ADMIN', 'SALE']},
      {state: 'price-book', name: 'Thiết lập giá', type: 'link', icon: 'loyalty', roles: ['ADMIN', 'WAREHOUSE']},
      {state: 'stock-take', name: 'Kiểm kho', type: 'link', icon: 'check_circle_outline', roles: ['ADMIN', 'WAREHOUSE']},
    ]
  },
  {
    state: 'transaction',
    name: 'Giao dịch',
    type: 'sub',
    icon: 'sync_alt',
    roles: ['ADMIN', 'WAREHOUSE', 'SALE'],
    // badge: [{type: 'red', value: '17'}],
    children: [
      {state: 'invoice', name: 'Hóa đơn bán', type: 'link', icon: 'receipt', roles: ['ADMIN', 'SALE']},
      {state: 'warehouse', name: 'Hóa đơn nhập', type: 'link', icon: 'local_grocery_store', roles: ['ADMIN', 'WAREHOUSE']},
      {state: 'returns', name: 'Trả hàng', type: 'link', icon: 'keyboard_return', roles: ['ADMIN', 'SALE']},
      {state: 'warehouse-return', name: 'Trả hàng nhập', type: 'link', 'icon': 'assignment_return', roles: ['ADMIN', 'WAREHOUSE']},
      {state: 'move', name: 'Chuyển hàng', type: 'link', icon: 'local_shipping', roles: ['ADMIN', 'WAREHOUSE']},
    ]
  },
  {
    state: 'partner',
    name: 'Đối tác',
    type: 'sub',
    icon: 'contacts',
    roles: ['ADMIN', 'WAREHOUSE', 'SALE'],
    // badge: [{type: 'red', value: '17'}],
    children: [
      {state: 'customer', name: 'Khách hàng', type: 'link', icon: 'person', roles: ['ADMIN', 'SALE']},
      {state: 'supplier', name: 'Nhà cung cấp', type: 'link', icon: 'people', roles: ['ADMIN', 'WAREHOUSE']},
      {state: 'doctor', name: 'Bác sĩ', type: 'link', icon: 'local_hospital', roles: ['ADMIN', 'SALE']},
    ]
  },
  {
    state: 'transaction/warehouse/create',
    name: 'Nhập hàng',
    type: 'extLink',
    icon: 'local_grocery_store',
    roles: ['ADMIN', 'WAREHOUSE'],
  },
  {
    state: 'sale',
    name: 'Bán hàng',
    type: 'link',
    icon: 'shopping_basket',
    roles: ['ADMIN', 'SALE'],
  },
  {
    state: 'partner',
    name: 'Cửa hàng',
    type: 'sub',
    icon: 'assignment_ind',
    roles: ['ADMIN'],
    children: [
      {state: 'user', name: 'Tài khoản', type: 'link', icon: 'person', roles: ['ADMIN']},
      {state: 'employee', name: 'Nhân viên', type: 'link', icon: 'assignment_ind', roles: ['ADMIN']},
      {state: 'branch', name: 'Chi nhánh', type: 'link', icon: 'business', roles: ['ADMIN']},
      {state: 'timesheet', name: 'Chấm công', type: 'link', icon: 'calendar_today', roles: ['ADMIN']},
      // {state: 'expenses-other', name: 'Quản lý chi phí nhập hàng', type: 'link', icon: 'attach_money', roles: ['ADMIN']},
      {state: 'pay-sheet', name: 'Bảng tính lương', type: 'link', icon: 'assessment', roles: ['ADMIN']},
      {state: 'settings', name: 'Thiết lập', type: 'link', icon: 'settings', roles: ['ADMIN']},
    ]
  },
  {
    state: 'report',
    name: 'Báo cáo',
    type: 'sub',
    icon: 'bar_chart',
    roles: ['ADMIN'],
    children: [
      {state: 'day-report', name: 'Cuối ngày', type: 'link', icon: 'pie_chart', roles: ['ADMIN']},
      {state: 'product-report', name: 'Hàng hóa', type: 'link', icon: 'store', roles: ['ADMIN']},
      {state: 'sale-report', name: 'Bán hàng', type: 'link', icon: 'table_chart', roles: ['ADMIN']},
    ]
  },
  // {
  //     state: 'material',
  //     name: 'Ui',
  //     type: 'sub',
  //     icon: 'bubble_chart',
  //     badge: [{ type: 'red', value: '17' }],
  //     children: [
  //         { state: 'badge', name: 'Badge', type: 'link' },
  //         { state: 'button', name: 'Buttons', type: 'link' },
  //         { state: 'cards', name: 'Cards', type: 'link' },
  //         { state: 'grid', name: 'Grid List', type: 'link' },
  //         { state: 'lists', name: 'Lists', type: 'link' },
  //         { state: 'menu', name: 'Menu', type: 'link' },
  //         { state: 'tabs', name: 'Tabs', type: 'link' },
  //         { state: 'stepper', name: 'Stepper', type: 'link' },
  //         { state: 'ripples', name: 'Ripples', type: 'link' },
  //         { state: 'expansion', name: 'Expansion Panel', type: 'link' },
  //         { state: 'chips', name: 'Chips', type: 'link' },
  //         { state: 'toolbar', name: 'Toolbar', type: 'link' },
  //         { state: 'progress-snipper', name: 'Progress snipper', type: 'link' },
  //         { state: 'progress', name: 'Progress Bar', type: 'link' },
  //         { state: 'dialog', name: 'Dialog', type: 'link' },
  //         { state: 'tooltip', name: 'Tooltip', type: 'link' },
  //         { state: 'snackbar', name: 'Snackbar', type: 'link' },
  //         { state: 'slider', name: 'Slider', type: 'link' },
  //         { state: 'slide-toggle', name: 'Slide Toggle', type: 'link' }
  //     ]
  // },
  // {
  //     state: 'tree',
  //     name: 'Tree',
  //     type: 'sub',
  //     icon: 'brightness_7',
  //     children: [
  //         { state: 'check-tree', name: 'Checkbox tree', type: 'link' },
  //         { state: 'dynamic-tree', name: 'Dynamic data tree', type: 'link' },
  //         { state: 'flat-tree', name: 'Flat Tree', type: 'link' },
  //         { state: 'load-tree', name: 'Loaded Data tree', type: 'link' },
  //         { state: 'nested-tree', name: 'Nested tree', type: 'link' }
  //     ]
  // },
  // {
  //     state: 'apps',
  //     name: 'Apps',
  //     type: 'sub',
  //     icon: 'apps',
  //     children: [
  //         { state: 'calendar', name: 'Calendar', type: 'link' },
  //         { state: 'messages', name: 'Mail box', type: 'link' },
  //         { state: 'chat', name: 'Chat', type: 'link' },
  //         { state: 'taskboard', name: 'Taskboard', type: 'link' },
  //         { state: 'notes', name: 'Notes', type: 'link' },
  //         { state: 'employeelist', name: 'Employees', type: 'link' },
  //         { state: 'courses', name: 'Courses', type: 'link' },
  //         { state: 'contact', name: 'Contact', type: 'link' },
  //         { state: 'ticketlist', name: 'Ticket List', type: 'link' },
  //         { state: 'ticketdetails', name: 'Ticket Details', type: 'link' }
  //     ]
  // },
  // {
  //     state: '',
  //     name: 'Forms, Table & Widgets',
  //     type: 'saperator',
  //     icon: 'av_timer'
  // },
  // {
  //     state: 'forms',
  //     name: 'Forms',
  //     type: 'sub',
  //     icon: 'insert_drive_file',
  //
  //     children: [
  //         { state: 'form-layout', name: 'Form-Layout', type: 'link' },
  //         { state: 'autocomplete', name: 'Autocomplete', type: 'link' },
  //         { state: 'checkbox', name: 'Checkbox', type: 'link' },
  //         { state: 'radiobutton', name: 'Radio Button', type: 'link' },
  //         { state: 'datepicker', name: 'Datepicker', type: 'link' },
  //         { state: 'select', name: 'Select', type: 'link' },
  //         { state: 'formfield', name: 'Form Field', type: 'link' },
  //         { state: 'input', name: 'Inputs', type: 'link' },
  //         { state: 'tree', name: 'Tree', type: 'link' },
  //         { state: 'editor', name: 'Editor', type: 'link' },
  //         { state: 'form-validation', name: 'Form Validation', type: 'link' },
  //         { state: 'wizard', name: 'Wizard', type: 'link' },
  //         { state: 'paginator', name: 'Paginator', type: 'link' },
  //         { state: 'shortheader', name: 'Short Header', type: 'link' },
  //         { state: 'multiselect', name: 'Multiselect', type: 'link' }
  //     ]
  // },
  // {
  //     state: 'tables',
  //     name: 'Tables',
  //     type: 'sub',
  //     icon: 'web',
  //
  //     children: [
  //         { state: 'basictable', name: 'Basic Table', type: 'link' },
  //         { state: 'filterable', name: 'Filterable Table', type: 'link' },
  //         { state: 'pagination', name: 'Pagination Table', type: 'link' },
  //         { state: 'sortable', name: 'Sortable Table', type: 'link' },
  //         { state: 'mix', name: 'Mix Table', type: 'link' },
  //         { state: 'dynamic-table', name: 'Dynamic Table', type: 'link' },
  //         { state: 'expand-table', name: 'Expand Table', type: 'link' },
  //         { state: 'footerrow-table', name: 'Footer row Table', type: 'link' },
  //         { state: 'multiple-header-footer', name: 'Multiple Header Footer', type: 'link' },
  //         { state: 'http-table', name: 'HTTP Table', type: 'link' },
  //         { state: 'row-context-table', name: 'Row Context Table', type: 'link' },
  //         { state: 'selection-table', name: 'Selection Table', type: 'link' },
  //         { state: 'sticky-column-table', name: 'Sticky Column Table', type: 'link' },
  //         { state: 'sticky-footer-table', name: 'Sticky Footer Table', type: 'link' },
  //     ]
  // },
  // {
  //     state: 'datatables',
  //     name: 'Data Tables',
  //     type: 'sub',
  //     icon: 'border_all',
  //
  //     children: [
  //         { state: 'basicdatatable', name: 'Basic Data Table', type: 'link' },
  //         { state: 'filter', name: 'Filterable', type: 'link' },
  //         { state: 'editing', name: 'Editing', type: 'link' },
  //         { state: 'materialtable', name: 'Material Table', type: 'link' }
  //     ]
  // },
  // {
  //     state: 'widgets',
  //     name: 'Widgets',
  //     type: 'link',
  //     icon: 'widgets'
  // },
  // {
  //     state: '',
  //     name: 'Extra Component',
  //     type: 'saperator',
  //     icon: 'av_timer'
  // },
  // {
  //     state: 'authentication',
  //     name: 'Auth',
  //     type: 'sub',
  //     icon: 'perm_contact_calendar',
  //
  //     children: [
  //         { state: 'login', name: 'Login', type: 'link' },
  //         { state: 'register', name: 'Register', type: 'link' },
  //         { state: 'forgot', name: 'Forgot', type: 'link' },
  //         { state: 'lockscreen', name: 'Lockscreen', type: 'link' },
  //         { state: '404', name: 'Error', type: 'link' }
  //     ]
  // },
  // {
  //     state: 'charts',
  //     name: 'Charts',
  //     type: 'sub',
  //     icon: 'insert_chart',
  //
  //     children: [
  //         { state: 'chartjs', name: 'Chart Js', type: 'link' },
  //         { state: 'chartistjs', name: 'Chartist Js', type: 'link' },
  //         { state: 'ngxchart', name: 'Ngx Charts', type: 'link' }
  //     ]
  // // },
  // {
  //     state: 'pages',
  //     name: 'Pages',
  //     type: 'sub',
  //     icon: 'content_copy',
  //
  //     children: [
  //         { state: 'icons', name: 'Material Icons', type: 'link' },
  //         { state: 'timeline', name: 'Timeline', type: 'link' },
  //         { state: 'invoice', name: 'Invoice', type: 'link' },
  //         { state: 'pricing', name: 'Pricing', type: 'link' },
  //         { state: 'helper', name: 'Helper Classes', type: 'link' }
  //     ]
  // }
];

@Injectable()
export class MenuItems {
  menuItems = [];

  private static _generateUrl() {
    return environment.apiUrl + '/user/roles';
  }

  private static _hasRole(userRoles, menuRoles) {
    if (userRoles && userRoles.indexOf('*') >= 0) {
      return true;
    }
    if (menuRoles && menuRoles.indexOf('*') >= 0) {
      return true;
    }
    if (!menuRoles || !userRoles) {
      return false;
    }

    return userRoles.filter(item => menuRoles.indexOf(item) >= 0).length > 0;
  }


  constructor(
    private httpClient: HttpClient,
    private router: Router,
  ) {
  }

  public refreshMenuItem() {
    const requestUrl = MenuItems._generateUrl();
    this.menuItems = [];

    return this.httpClient.get<any>(requestUrl).subscribe(res => {
      const roles: string[] = res.roles;
      const self = this;
      MENUITEMS.forEach(function (menu: Menu, index, array) {
        const _menu = menu;
        if (menu.type === 'sub') {
          const _children = [];
          const children = menu.children;
          children.forEach(function (child: ChildrenItems, _index, _array) {
            if (MenuItems._hasRole(roles, child.roles)) {
              _children.push(child);
            }
          });
          _menu.children = _children;
        }
        if (MenuItems._hasRole(roles, menu.roles)) {
          self.menuItems.push(_menu);
        }
      });
    });
  }

  getMenuitem(): Menu[] {
    return this.menuItems;
  }

  // getMenuitem(): Menu[] {
  //   return MENUITEMS;
  // }
}
