import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { NotifierService } from 'angular-notifier';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import * as moment from 'moment';
import { ListComponentBase } from '../../shared/base';
import { AuthService } from '../../authentication/auth.service';
import { UserService } from '../../user/user.service';
import { PopupConfirmDialogComponent } from '../../common/popup-confirm-dialog/popup-confirm-dialog.component';
import { DateFilter } from '../../invoice/invoice.model';
import { OpeningBalanceService } from '../opening-balance.service';
import { DatetimeDefaultFilterDialogComponent } from '../datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import { DatetimeChooseFilterDialogComponent } from '../datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import { OpeningBalanceExportDialogComponent } from '../opening-balance-export-dialog/opening-balance-export-dialog.component';
import {
  OpeningBalance,
  OpeningBalanceFilter,
  OPENING_BALANCE_STATUS,
  OPENING_BALANCE_STATUS_CLASS,
  OPENING_BALANCE_STATUS_LABEL,
} from '../opening-balance.model';

@Component({
  selector: 'app-opening-balance-list',
  templateUrl: './opening-balance-list.component.html',
  styleUrls: ['./opening-balance-list.component.css'],
})
export class OpeningBalanceListComponent extends ListComponentBase implements OnInit {

  constructor(
    private service: OpeningBalanceService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private notifySer: NotifierService,
    private fb: FormBuilder,
    private userSer: UserService,
    public authSer: AuthService,
  ) {
    super();
  }

  @ViewChild(MatTable, {static: true}) table: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('selectColumn') selectColumn;

  isLoadingResults = true;
  apiFilter: OpeningBalanceFilter;
  dataSource: OpeningBalance[] = [];

  searchForm = new FormControl();
  timeFilter: FormGroup;
  statusFilter: FormGroup;
  branchFilter: FormGroup;

  branchList: any[] = [];
  branchNames: object = {};

  downloadLink = '';

  statusLabels = OPENING_BALANCE_STATUS_LABEL;
  statusClasses = OPENING_BALANCE_STATUS_CLASS;

  statusFilterList = [
    {value: OPENING_BALANCE_STATUS.DRAFT, name: 'Lưu tạm'},
    {value: OPENING_BALANCE_STATUS.DONE, name: 'Hoàn thành'},
  ];

  // Bộ lọc thời gian dùng chung của app: 1 nút mở danh sách khoảng dựng sẵn,
  // 1 nút mở lịch chọn khoảng tuỳ ý.
  titleTimeDefault = 'Toàn thời gian';
  titleTimeChoose = 'Lựa chọn khác';
  currentDateFilter: DateFilter;

  columnsHeader = {
    'no': 'Mã phiếu',
    'date': 'Ngày chốt',
    'branch_id': 'Chi nhánh',
    'product_count': 'Số mặt hàng',
    'total_quantity': 'Tổng số lượng',
    'total_amount': 'Tổng giá trị',
    'created_user': 'Người tạo',
    'note': 'Ghi chú',
    'status': 'Trạng thái',
    'actions': '',
  };

  columnsToDisplay: string[] = [
    'no', 'date', 'branch_id', 'product_count', 'total_quantity', 'total_amount',
    'created_user', 'note', 'status', 'actions',
  ];
  displayedColumns: string[] = [...this.columnsToDisplay];

  ngOnInit(): void {
    this.initDateFilter();
    this.buildForm();

    this.userSer.getStoreBranchList().subscribe(res => {
      this.branchList = (res.body as any) || [];
      this.branchList.forEach(branch => this.branchNames[branch.id] = branch.name);
    });

    this.apiFilter = this.buildFilterFromParams();
    this.loadData();

    this.service.subscribeDateFilter.subscribe(obj => {
      if (JSON.stringify(this.currentDateFilter) !== JSON.stringify(obj)) {
        this.currentDateFilter = obj;
        this.onFilterChange();
      }
    });

    this.searchForm.valueChanges.pipe(debounceTime(600)).subscribe(value => {
      this.apiFilter = this.buildFilterFromParams();
      this.apiFilter.keyword = value || '';
      this.loadData();
    });
  }

  buildForm() {
    this.timeFilter = this.fb.group({typeTime: ['default']});
    this.statusFilter = this.fb.group({
      status: [[OPENING_BALANCE_STATUS.DRAFT, OPENING_BALANCE_STATUS.DONE]],
    });
    this.branchFilter = this.fb.group({branch_id: ['']});
  }

  buildFilterFromParams(): OpeningBalanceFilter {
    const filter = new OpeningBalanceFilter();

    filter.expand = 'created_user,product_count,total_quantity';
    filter.page = this.page;
    filter.pageSize = this.pageSize || 20;

    const range = this.service.getDateFilter();
    filter.date_from = range && range.date_from ? range.date_from : '';
    // date_to lọc theo cột datetime nên phải kéo tới cuối ngày, nếu không phiếu
    // chốt đúng ngày cuối kỳ sẽ bị bỏ sót.
    filter.date_to = range && range.date_to ? range.date_to + ' 23:59:59' : '';

    filter.status = (this.statusFilter.controls['status'].value || []).join(',');
    filter.branch_id = this.branchFilter.controls['branch_id'].value || '';

    const code = this.route.snapshot.paramMap.get('code');
    if (code) {
      filter.no = code;
    }

    return filter;
  }

  /**
   * Mặc định "Toàn thời gian": phiếu tồn đầu thường được lập một lần lúc khai
   * trương rồi không đụng nữa, mặc định theo tháng sẽ làm người dùng tưởng mất phiếu.
   */
  /** Xuất phiếu tồn đầu kỳ để nộp lên cổng Dược Quốc Gia — hỏi ngày chốt trước. */
  exportNationalPharmacyOpeningStock() {
    const dialogRef = this.dialog.open(OpeningBalanceExportDialogComponent, {
      width: '400px',
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((date: string) => {
      if (date) {
        this.downloadNationalPharmacyOpeningStock(date);
      }
    });
  }

  downloadNationalPharmacyOpeningStock(date: string) {
    this.isLoadingResults = true;
    this.service.exportNationalPharmacyOpeningStock(date).subscribe(
      (response: any) => {
        const blob = new Blob([response.body], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = 'Phieu-nhap-ton-dau-ky-' + date.replace(/-/g, '') + '.xlsx';
        a.click();
        URL.revokeObjectURL(objectUrl);
        this.notifySer.notify('success', 'Xuất file thành công!');
        this.isLoadingResults = false;
      },
      () => {
        this.isLoadingResults = false;
        this.notifySer.notify('error', 'Xuất file không thành công!');
      }
    );
  }

  initDateFilter() {
    const obj = new DateFilter();
    obj.date_from = null;
    obj.date_to = null;

    this.currentDateFilter = obj;
    this.service.setDateFilter(obj);
  }

  openTimeDefault() {
    const dialogRef = this.dialog.open(DatetimeDefaultFilterDialogComponent, {
      data: {currentTitle: this.titleTimeDefault},
      width: '40%',
      minHeight: '80%',
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.title !== undefined) {
        this.titleTimeDefault = result.title;
      }
      this.syncChooseTitle();
      this.timeFilter.patchValue({typeTime: 'default'});
    });
  }

  openTimeChoose() {
    const dialogRef = this.dialog.open(DatetimeChooseFilterDialogComponent, {
      data: {},
      width: '40%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(() => {
      this.timeFilter.patchValue({typeTime: 'choose'});
      this.syncChooseTitle();
    });
  }

  radioTimeChange(event: Event) {
    if (this.timeFilter.controls['typeTime'].value === 'choose') {
      this.syncChooseTitle();
    } else {
      this.titleTimeChoose = 'Lựa chọn khác';
    }
  }

  syncChooseTitle() {
    const date = this.service.getDateFilter();
    if (!date || !date.date_from || !date.date_to) {
      this.titleTimeChoose = 'Lựa chọn khác';
      return;
    }
    this.titleTimeChoose = this.convertDate(new Date(date.date_from))
      + ' - ' + this.convertDate(new Date(date.date_to));
  }

  convertDate(date: Date) {
    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.downloadLink = this.service.getDownloadLink(this.apiFilter);

    this.service.getList(this.apiFilter).subscribe(res => {
      const data = res.body || [];
      data.forEach((item, index) => item.stt = index + 1);
      this.dataSource = data;
      this.reloadFilter(res);
      this.isLoadingResults = false;
    }, () => {
      this.isLoadingResults = false;
      this.notifySer.notify('error', 'Không tải được danh sách phiếu tồn đầu.');
    });
  }

  onFilterChange() {
    this.page = 1;
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  checkBoxFilterChange($event: any, value: any, field: string) {
    this.handleFilterCheckbox(this.statusFilter, field, value);
    this.onFilterChange();
  }

  openRow(row: OpeningBalance) {
    this.router.navigate(['/store/opening-balance/update/' + row.id]);
  }

  canDelete(row: OpeningBalance): boolean {
    return this.authSer.getPermissionsFromLocalStorage().indexOf('Opening-Balance.Delete') !== -1;
  }

  confirmDelete($event: Event, row: OpeningBalance) {
    $event.stopPropagation();

    const content = Number(row.status) === OPENING_BALANCE_STATUS.DONE
      ? 'Phiếu <b>' + row.no + '</b> đã hoàn thành. Xoá phiếu sẽ trừ lại phần tồn kho đã khai báo.<br>Bạn có chắc chắn muốn xoá?'
      : 'Bạn có chắc chắn muốn xoá phiếu <b>' + row.no + '</b>?';

    const dialogRef = this.dialog.open(PopupConfirmDialogComponent, {
      data: {action: 'Delete', title: 'Xoá phiếu tồn đầu', content: content},
      width: '40%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.event === 'confirm') {
        this.deleteRow(row);
      }
    });
  }

  deleteRow(row: OpeningBalance) {
    this.service.delete(row.id).subscribe(res => {
      this.notifySer.notify('success', res && res.message ? res.message : 'Đã xoá phiếu tồn đầu.');
      this.loadData();
    }, error => {
      // Backend chặn xoá khi lô trong phiếu đã bán bớt và trả về lý do cụ thể.
      const message = error && error.error && error.error.message
        ? error.error.message
        : 'Không xoá được phiếu tồn đầu.';
      this.notifySer.notify('error', message);
    });
  }
}
