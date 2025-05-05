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
  permissions?: string[];
  optionKeys?: string[];
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
  permissions?: string[];
  optionKeys?: string[];
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
    permissions: ['Report.Dash-Board', 'Report.Data-Bar-Chart', 'Warehouse-Product-Parcel.Summary-Expiration'],
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
    permissions: ['Product.List', 'Group.List', 'Sample-Prescription.List', 'Price-List.List', 'Stock-Take.List'],
    // badge: [{type: 'red', value: '17'}],
    children: [
      // {state: 'medicine', name: 'Danh mục thuốc', type: 'link', roles: ['ADMIN', 'WAREHOUSE', 'SALE']},
      { state: 'product', name: 'Sản phẩm', type: 'link', icon: 'local_pharmacy', permissions: ['Product.List'] },
      { state: 'group', name: 'Nhóm hàng', type: 'link', icon: 'local_pharmacy', permissions: ['Group.List'] },
      { state: 'sample-prescription', name: 'Đơn thuốc mẫu', type: 'link', icon: 'list_alt', permissions: ['Sample-Prescription.List'] },
      { state: 'price-book', name: 'Thiết lập giá', type: 'link', icon: 'loyalty', permissions: ['Price-List.List'] },
      { state: 'stock-take', name: 'Kiểm kho', type: 'link', icon: 'check_circle_outline', permissions: ['Stock-Take.List'] },
    ]
  },
  {
    state: 'transaction',
    name: 'Giao dịch',
    type: 'sub',
    icon: 'sync_alt',
    permissions: ['Invoice.List', 'Warehouse.List', 'Returns.List', 'Move.List'],
    // badge: [{type: 'red', value: '17'}],
    children: [
      { state: 'invoice', name: 'Hóa đơn bán', type: 'link', icon: 'receipt', permissions: ['Invoice.List'] },
      { state: 'warehouse', name: 'Hóa đơn nhập', type: 'link', icon: 'local_grocery_store', permissions: ['Warehouse.List'] },
      { state: 'returns', name: 'Trả hàng', type: 'link', icon: 'keyboard_return', permissions: ['Returns.List'] },
      { state: 'warehouse-return', name: 'Trả hàng nhập', type: 'link', 'icon': 'assignment_return', permissions: ['Warehouse.List'] },
      { state: 'move', name: 'Chuyển hàng', type: 'link', icon: 'local_shipping', permissions: ['Move.List'] },
    ]
  },
  {
    state: 'partner',
    name: 'Đối tác',
    type: 'sub',
    icon: 'contacts',
    permissions: ['Customer.List', 'Supplier.List', 'Doctor.List'],
    // badge: [{type: 'red', value: '17'}],
    children: [
      { state: 'customer', name: 'Khách hàng', type: 'link', icon: 'person', permissions: ['Customer.List'] },
      { state: 'supplier', name: 'Nhà cung cấp', type: 'link', icon: 'people', permissions: ['Supplier.List'] },
      { state: 'doctor', name: 'Bác sĩ', type: 'link', icon: 'local_hospital', permissions: ['Doctor.List'] },
    ]
  },
  {
    state: 'transaction/warehouse/create',
    name: 'Nhập hàng',
    type: 'extLink',
    icon: 'local_grocery_store',
    permissions: ['Warehouse.Create'],
  },
  {
    state: 'sale',
    name: 'Bán hàng',
    type: 'link',
    icon: 'shopping_basket',
    permissions: ['Invoice.Create'],
  },
  {
    state: 'setting',
    name: 'Cửa hàng',
    type: 'sub',
    icon: 'assignment_ind',
    permissions: ['User.List', 'Employee.List', 'Branch.List', 'Timesheet.List',
      'Pay-Sheet.List', 'Option-Store.Update',
      'Store.Upload-Logo', 'Branch.Update-Connect',
      'Store.Update-Info'
    ],
    children: [
      { state: 'user', name: 'Tài khoản', type: 'link', icon: 'person', permissions: ['User.List'] },
      { state: 'employee', name: 'Nhân viên', type: 'link', icon: 'assignment_ind', permissions: ['Employee.List'] },
      { state: 'branch', name: 'Chi nhánh', type: 'link', icon: 'business', permissions: ['Branch.List'] },
      { state: 'timesheet', name: 'Chấm công', type: 'link', icon: 'calendar_today', permissions: ['Timesheet.List'] },
      { state: 'pay-sheet', name: 'Bảng tính lương', type: 'link', icon: 'assessment', permissions: ['Pay-Sheet.List'] },
      {
        state: 'common', name: 'Thiết lập chung', type: 'link', icon: 'settings', permissions: [
          'Option-Store.Update',
          'Store.Upload-Logo', 'Branch.Update-Connect',
          'Store.Update-Info']
      },
      {
        state: 'expenses-order', name: 'Thu khác Bán hàng', type: 'link',
        icon: 'price_change',
        permissions: ['Expenses-Order.List'],
        optionKeys: ['transaction_expenses_order']
      },
      {
        state: 'expenses-transaction', name: 'Chi phí Nhập hàng',
        type: 'link', icon: 'paid', permissions: ['Expenses-Transaction.List'],
        optionKeys: ['transaction_expenses_transaction']
      },
    ]
  },
  {
    state: 'cash-flow',
    name: 'Sổ quỹ',
    type: 'link',
    icon: 'currency_exchange',
    permissions: ['Cash-Flow.List'],
  },
  {
    state: 'report',
    name: 'Báo cáo',
    type: 'sub',
    icon: 'bar_chart',
    permissions: ['Report.Stock', 'Report.Product-Sale',
      'Warehouse-Product-Parcel.Expiration', 'Option-Store.Update',
      'Store.Upload-Logo', 'Branch.Update-Connect',
      'Store.Update-Info'
      , 'Report.Export-Import-Detail'
      , 'Group.Report'
      , 'Report.Customers-Debt'
      , 'Invoice.End-Day-Report'
    ],
    children: [
      { state: 'day-report', name: 'Cuối ngày', type: 'link', icon: 'pie_chart', permissions: ['Invoice.End-Day-Report'] },
      {
        state: 'product-report', name: 'Hàng hóa', type: 'link', icon: 'inventory', permissions: [
          'Report.Product-Sale',
          'Report.Stock',
          'Warehouse-Product-Parcel.Expiration',
          'Report.Export-Import-Detail'
          , 'Report.Supplier'
        ]
      },
      //{state: 'stock-report', name: 'Tồn kho', type: 'link', icon: 'store', roles: ['ADMIN']},
      { state: 'group-report', name: 'Nhóm hàng', type: 'link', icon: 'category', permissions: ['Group.Report'] },
      { state: 'employee', name: 'Nhân viên', type: 'extLink', icon: 'account_box', permissions: ['Employee-Report.Revenue', 'Employee-Report.Profit', 'Employee-Report.Commission'] },
      //{state: 'sale-report', name: 'Bán hàng', type: 'link', icon: 'table_chart', roles: ['ADMIN']},
      // {state: 'debt-report', name: 'Công nợ', type: 'link', icon: 'money', roles: ['ADMIN']},
      { state: 'debt-customers', name: 'Công nợ thu', type: 'link', icon: 'price_check', permissions: ['Report.Customers-Debt'] },
      { state: 'debt-suppliers', name: 'Công nợ trả', type: 'link', icon: 'money_off', permissions: ['Report.Supplier-Debt'] },
    ]
  },
  {
    state: 'follow-book',
    name: 'Sổ sách',
    type: 'sub',
    icon: 'library_books',
    permissions: [
      'Quality-Check.All',
      'Quality-Check.Create-With-Details',
      'Quality-Check.Delete',
      'Quality-Check.List',
      'Quality-Check.Update',
      'Quality-Check.View',
      'Invoice.Medicine-Tracking',
      'Warehouse-Product-Parcel.Tracking',
      'Customer-Complaint.ALL',
      'Customer-Complaint.List',
      'Customer-Complaint.Create',
      'Customer-Complaint.Update',
      'Customer-Complaint.Delete',
      'Customer-Complaint.View',
      'Supplier.List',
      'Trainee.All',
      'Trainee.List',
      'Trainee.Create',
      'Trainee.Update',
      'Trainee.Delete',
      'Trainee.View',
      'Hygiene-Logbook.All',
      'Medicine-Recall.All',
      'Adverse-Drug-Reaction.All',
    ],
    children: [
      {
        state: 'quanlity-control',
        name: 'Kiểm soát chất lượng',
        type: 'link',
        icon: 'fact_check',
        permissions: [
          'Quality-Check.All',
          'Quality-Check.Create-With-Details',
          'Quality-Check.Delete',
          'Quality-Check.List',
          'Quality-Check.Update',
          'Quality-Check.View',
        ]
      },
      {
        state: 'medicine-tracking',
        name: 'Bán thuốc theo đơn',
        type: 'link',
        icon: 'medication',
        permissions: [
          'Invoice.Medicine-Tracking',
        ]
      },
      {
        state: 'inventory-tracking',
        name: 'Xuất nhập tồn thuốc KSĐB',
        type: 'link',
        icon: 'inventory',
        permissions: [
          'Warehouse-Product-Parcel.Tracking',
        ]
      },
      {
        state: 'customer-transaction',
        name: 'Theo dõi khách hàng',
        type: 'link',
        icon: 'person',
        permissions: ['Quality-Check.List']
      },
      {
        state: 'customer-complaint',
        name: 'Theo dõi khiếu nại',
        type: 'link',
        icon: 'feedback',
        permissions: ['Customer-Complaint.List']
      },
      { state: 'supplier-tracking', name: 'Nhà cung cấp', type: 'link', icon: 'people', permissions: ['Supplier.List'] },
      { state: 'trainee', name: 'Đào tạo học viên', type: 'link', icon: 'person', permissions: ['Trainee.List'] },
      { state: 'medicine-recall', name: 'Thuốc bị thu hồi', type: 'link', icon: 'medication', permissions: ['Medicine-Recall.List'] },
      { state: 'drug-reaction', name: 'Tác dụng phụ thuốc', type: 'link', icon: 'medication', permissions: ['Adverse-Drug-Reaction.List'] },

      //{ state: 'hygiene', name: 'Vệ sinh', type: 'link', icon: 'person', permissions: ['Hygiene-Logbook.All'] },
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
  // menuItems = MENUITEMS;

  // getMenuitem(): Menu[] {
  //   return this.menuItems;
  // }

  getMenuitem(): Menu[] {
    return MENUITEMS;
  }
}
