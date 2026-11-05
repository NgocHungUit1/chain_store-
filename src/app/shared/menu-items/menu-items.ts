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
  /** Đường dẫn đầy đủ khi màn nằm ở module khác menu cha (giữ URL cũ), vd ['/transaction', 'invoice'] */
  link?: string[];
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
  /** Nút hành động ở cuối thanh menu (không phải menu): 'primary' tô màu, 'outline' viền */
  action?: 'primary' | 'outline';
  /** Ẩn tạm khỏi menu, giữ định nghĩa để bật lại; màn vẫn mở được bằng đường dẫn */
  hidden?: boolean;
}

/** Quyền của menu cha = gộp quyền các mục con: có quyền mục nào thì thấy menu cha */
function childPermissions(children: ChildrenItems[]): string[] {
  return Array.from(new Set([].concat(...children.map(c => c.permissions || []))));
}

/*
 * Menu nhà thuốc sắp xếp lại 03/11/2026 (pharma_chain/tools/de-xuat/sap-xep-menu.html, người dùng đã chốt):
 * gom theo việc người dùng làm; đường dẫn các màn giữ nguyên (link trong thông báo, link đã lưu vẫn chạy) nên mục con
 * nằm ở module khác ghi `link`. Sổ sách GPP và Sổ kế toán HKD ẩn tạm (PRD không có), giữ định nghĩa ở cuối.
 */
const SALES_CHILDREN: ChildrenItems[] = [
  {state: 'invoice', link: ['/transaction', 'invoice'], name: 'Hóa đơn bán', icon: 'receipt', permissions: ['Invoice.List']},
  {state: 'returns', link: ['/transaction', 'returns'], name: 'Trả hàng', icon: 'keyboard_return', permissions: ['Returns.List']},
  {state: 'prescription-order', link: ['/transaction', 'prescription-order'], name: 'Đơn đặt thuốc', icon: 'medical_services', permissions: ['Prescription-Order.List']},
  {state: 'shipper', link: ['/shipper'], name: 'Giao hàng (shipper)', icon: 'local_shipping', permissions: ['Shipper.List']},
  {state: 'customer', link: ['/partner', 'customer'], name: 'Khách hàng', icon: 'person', permissions: ['Customer.List']},
  {state: 'doctor', link: ['/partner', 'doctor'], name: 'Bác sĩ', icon: 'local_hospital', permissions: ['Doctor.List']},
  {state: 'sample-prescription', link: ['/store', 'sample-prescription'], name: 'Đơn thuốc mẫu', icon: 'list_alt', permissions: ['Sample-Prescription.List']},
];
const STOCK_CHILDREN: ChildrenItems[] = [
  {state: 'product', name: 'Sản phẩm', icon: 'local_pharmacy', permissions: ['Product.List']},
  {state: 'group', name: 'Nhóm hàng', icon: 'category', permissions: ['Group.List']},
  {state: 'price-book', name: 'Thiết lập giá', icon: 'loyalty', permissions: ['Price-List.List']},
  {state: 'stock-take', name: 'Kiểm kho', icon: 'check_circle_outline', permissions: ['Stock-Take.List']},
  {state: 'warehouse-destroy', link: ['/transaction', 'warehouse-destroy'], name: 'Xuất huỷ', icon: 'delete_sweep', permissions: ['Warehouse.List']},
  {state: 'move', link: ['/transaction', 'move'], name: 'Chuyển hàng', icon: 'local_shipping', permissions: ['Move.List']},
  {state: 'opening-balance', name: 'Nhập tồn đầu', icon: 'inventory', permissions: ['Opening-Balance.List']},
  // PRD: tra cứu lô bị thu hồi, nhà thuốc nào đang giữ, đã bán cho ai (màn nằm ở module Sổ sách)
  {state: 'medicine-recall', link: ['/follow-book', 'medicine-recall'], name: 'Thu hồi thuốc', icon: 'report', permissions: ['Medicine-Recall.List']},
];
const PURCHASE_CHILDREN: ChildrenItems[] = [
  {state: 'warehouse', link: ['/transaction', 'warehouse'], name: 'Hóa đơn nhập', icon: 'local_grocery_store', permissions: ['Warehouse.List']},
  {state: 'warehouse-return', link: ['/transaction', 'warehouse-return'], name: 'Trả hàng nhập', icon: 'assignment_return', permissions: ['Warehouse.List']},
  {state: 'e-invoice', link: ['/transaction', 'e-invoice'], name: 'Hóa đơn đầu vào', icon: 'description', permissions: ['Warehouse.List']},
  {state: 'supplier', link: ['/partner', 'supplier'], name: 'Nhà cung cấp', icon: 'people', permissions: ['Supplier.List']},
];
const FINANCE_CHILDREN: ChildrenItems[] = [
  {state: 'cash-flow', link: ['/cash-flow'], name: 'Sổ quỹ', icon: 'currency_exchange', permissions: ['Cash-Flow.List']},
  {state: 'shipper-cash', link: ['/transaction', 'shipper-cash'], name: 'Tiền shipper đang giữ', icon: 'payments', permissions: ['Shipper-Cash.List']},
  {state: 'debt-customers', link: ['/report', 'debt-customers'], name: 'Công nợ khách hàng', icon: 'price_check', permissions: ['Report.Customers-Debt']},
  {state: 'debt-suppliers', link: ['/report', 'debt-suppliers'], name: 'Công nợ nhà cung cấp', icon: 'money_off', permissions: ['Report.Suppliers-Debt']},
  {state: 'bank-account', link: ['/setting', 'bank-account'], name: 'Tài khoản ngân hàng', icon: 'account_balance_wallet', permissions: ['Bank-Account.List']},
];
const CHAIN_CHILDREN: ChildrenItems[] = [
  {state: 'clinic-partner', name: 'Phòng khám đối tác', icon: 'handshake', permissions: ['Clinic-Partner.List']},
  {state: 'clinic-reconciliation', name: 'Đối soát phòng khám', icon: 'fact_check', permissions: ['Report.Clinic-Reconciliation']},
];
const REPORT_CHILDREN: ChildrenItems[] = [
  {state: 'day-report', name: 'Cuối ngày', icon: 'pie_chart', permissions: ['Invoice.End-Day-Report']},
  {state: 'product-report', name: 'Hàng hóa', icon: 'inventory',
    permissions: ['Report.Product-Sale', 'Report.Stock', 'Warehouse-Product-Parcel.Expiration', 'Report.Export-Import-Detail', 'Report.Supplier']},
  {state: 'group-report', name: 'Nhóm hàng', icon: 'category', permissions: ['Group.Report']},
  {state: 'inventory-turnover', name: 'Vòng quay tồn kho', icon: 'autorenew', permissions: ['Report.Inventory-Turnover']},
  {state: 'employee', name: 'Nhân viên', icon: 'account_box', permissions: ['Employee-Report.Revenue', 'Employee-Report.Profit', 'Employee-Report.Commission']},
];
const SETTING_CHILDREN: ChildrenItems[] = [
  {state: 'common', name: 'Thiết lập chung', icon: 'settings',
    permissions: ['Option-Store.Update', 'Store.Upload-Logo', 'Branch.Update-Connect', 'Store.Update-Info']},
  {state: 'branch', name: 'Chi nhánh', icon: 'business', permissions: ['Branch.List']},
  {state: 'user', name: 'Tài khoản & phân quyền', icon: 'manage_accounts', permissions: ['User.List']},
  {state: 'expenses-order', name: 'Khoản thu khác khi bán', icon: 'price_change', permissions: ['Expenses-Order.List'],
    optionKeys: ['transaction_expenses_order']},
  {state: 'expenses-transaction', name: 'Khoản chi phí khi nhập', icon: 'paid', permissions: ['Expenses-Transaction.List'],
    optionKeys: ['transaction_expenses_transaction']},
  {state: 'employee', name: 'Nhân viên', icon: 'assignment_ind', permissions: ['Employee.List']},
  {state: 'timesheet', name: 'Chấm công', icon: 'calendar_today', permissions: ['Timesheet.List']},
  {state: 'pay-sheet', name: 'Bảng tính lương', icon: 'assessment', permissions: ['Pay-Sheet.List']},
];

const MENUITEMS: Menu[] = [
  {
    state: 'dashboard',
    name: 'Tổng quan',
    type: 'link',
    icon: 'dashboard',
    permissions: ['Report.Dash-Board', 'Report.Data-Bar-Chart', 'Warehouse-Product-Parcel.Summary-Expiration'],
  },
  {state: 'sales', name: 'Bán hàng', type: 'sub', icon: 'receipt_long', permissions: childPermissions(SALES_CHILDREN), children: SALES_CHILDREN},
  {state: 'store', name: 'Hàng hóa & kho', type: 'sub', icon: 'inventory_2', permissions: childPermissions(STOCK_CHILDREN), children: STOCK_CHILDREN},
  {state: 'purchase', name: 'Mua hàng', type: 'sub', icon: 'local_shipping', permissions: childPermissions(PURCHASE_CHILDREN), children: PURCHASE_CHILDREN},
  {state: 'finance', name: 'Tài chính', type: 'sub', icon: 'account_balance_wallet', permissions: childPermissions(FINANCE_CHILDREN), children: FINANCE_CHILDREN},
  {state: 'chain', name: 'Chuỗi', type: 'sub', icon: 'hub', permissions: childPermissions(CHAIN_CHILDREN), children: CHAIN_CHILDREN},
  {state: 'report', name: 'Báo cáo', type: 'sub', icon: 'bar_chart', permissions: childPermissions(REPORT_CHILDREN), children: REPORT_CHILDREN},
  {state: 'setting', name: 'Thiết lập', type: 'sub', icon: 'settings', permissions: childPermissions(SETTING_CHILDREN), children: SETTING_CHILDREN},
  // Hai nút thao tác dùng nhiều nhất, nằm cuối bên phải thanh menu
  {state: 'transaction/warehouse/create', name: 'Nhập hàng', type: 'extLink', icon: 'add_shopping_cart', action: 'outline', permissions: ['Warehouse.Create']},
  {state: 'sale', name: 'Quầy bán', type: 'link', icon: 'point_of_sale', action: 'primary', permissions: ['Invoice.Create']},
  {
    state: 'follow-book',
    name: 'Sổ sách',
    type: 'sub',
    hidden: true, // PRD không có, ẩn tạm 03/11/2026; Thu hồi thuốc đã đưa sang Hàng hóa & kho
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
      'Invalid-Prescription.All',
    ],
    children: [
      {
        state: 'quanlity-control',
        name: 'Kiểm soát chất lượng định kỳ',
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
        name: 'Theo dõi bán thuốc theo đơn',
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
        name: 'Thông tin chi tiết khách hàng KSĐB',
        type: 'link',
        icon: 'person',
        permissions: ['Quality-Check.List']
      },
      {
        state: 'customer-complaint',
        name: 'Theo dõi khách hàng khiếu nại',
        type: 'link',
        icon: 'feedback',
        permissions: ['Customer-Complaint.List']
      },
      { state: 'supplier-tracking', name: ' Sổ theo doi nhà cung cấp', type: 'link', icon: 'people', permissions: ['Supplier.List'] },
      { state: 'trainee', name: 'Sổ theo dõi đào tạo', type: 'link', icon: 'person', permissions: ['Trainee.List'] },
      { state: 'medicine-recall', name: 'Sổ theo dõi thuốc bị thu hồi', type: 'link', icon: 'medication', permissions: ['Medicine-Recall.List'] },
      { state: 'drug-reaction', name: 'Sổ theo dõi tác dụng phụ thuốc', type: 'link', icon: 'medication', permissions: ['Adverse-Drug-Reaction.List'] },
      { state: 'invalid-prescription', name: 'Sổ theo dõi đơn thuốc không hợp lệ', type: 'link', icon: 'medication', permissions: ['Invalid-Prescription.List'] },
      { state: 'hygiene', name: 'Sổ theo dõi vệ sinh', type: 'link', icon: 'person', permissions: ['Hygiene-Logbook.List'] },
    ]
  },
  {
    state: 'accounting-book',
    name: 'Sổ kế toán HKD',
    type: 'sub',
    hidden: true, // PRD không có (chuỗi là công ty, kế toán qua phần mềm riêng ở GĐ4), ẩn tạm 03/11/2026
    icon: 'account_balance',
    permissions: ['Report.Stock', 'Warehouse-Product-Parcel.Tracking', 'Cash-Flow.List', 'Invoice.List'],
    children: [
      {
        state: 'stock-detail',
        name: 'Sổ chi tiết VTDCSP, hàng hóa',
        type: 'link',
        icon: 'description',
        permissions: ['Report.Stock']
      },
      {
        state: 'sale-revenue-book',
        name: 'Sổ doanh thu BH, HH (S1a)',
        type: 'link',
        icon: 'receipt_long',
        permissions: ['Invoice.List']
      },
      {
        state: 'sale-revenue-book-s2a',
        name: 'Sổ doanh thu BH, HH (S2a)',
        type: 'link',
        icon: 'receipt_long',
        permissions: ['Invoice.List']
      },
      {
        state: 'cash-book',
        name: 'S6-HKD: Sổ quỹ tiền mặt',
        type: 'link',
        icon: 'account_balance_wallet',
        permissions: ['Cash-Flow.List']
      },
      {
        state: 'bank-book',
        name: 'S7-HKD: Sổ tiền gửi ngân hàng',
        type: 'link',
        icon: 'account_balance',
        permissions: ['Cash-Flow.List']
      }
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
    return MENUITEMS.filter(m => !m.hidden);
  }
}
