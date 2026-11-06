import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NotifierService } from 'angular-notifier';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Move, MoveDetail, MoveDetailFilter, MOVE_STATUS, MOVE_STATUS_COLORS, MOVE_STATUS_LABELS } from '../move.model';
import { MoveService } from '../move.service';
import { MoveDetailService } from '../move-detail.service';
import { UserService } from '../../user/user.service';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { MoveReceiveDialogComponent } from '../move-receive-dialog/move-receive-dialog.component';

@Component({
  selector: 'app-move-info-tab',
  templateUrl: './move-info-tab.component.html',
  styleUrls: ['./move-info-tab.component.css']
})
export class MoveInfoTabComponent implements OnChanges {

  @Input() sample: Move;
  @Input() expandedElement: boolean;
  @Output() reload: EventEmitter<any> = new EventEmitter();

  columnsHeader = {
    '#': '#',
    'product_no': 'Mã hàng',
    'product_name': 'Tên hàng',
    'amount': 'Số lượng',
    'lots': 'Lô · HSD · gửi / thực nhận (đơn vị cơ bản)',
  };
  displayedColumns = [
    '#',
    'product_no',
    'product_name',
    'amount',
    'lots',
  ];

  statusList = MOVE_STATUS_LABELS;
  statusesColor: object = MOVE_STATUS_COLORS;
  STATUS = MOVE_STATUS;

  apiFilter: MoveDetailFilter;
  isLoadingResults = false;
  data: MoveDetail[] = [];
  productDataSource = new MatTableDataSource<MoveDetail>([]);
  /** Chi nhánh đang làm việc: quyết định nút Nhận hàng (chi nhánh nhận) / Huỷ chuyển (chi nhánh gửi) */
  branchLogin: number = null;
  busy = false;

  constructor(
    private moveService: MoveService,
    private moveDetailService: MoveDetailService,
    private userService: UserService,
    public notifySer: NotifierService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.expandedElement) {
      this.apiFilter = this.buildFilterFromParams();
      this.loadData();
      if (this.branchLogin === null) {
        this.userService.getBranchLogin().subscribe(id => this.branchLogin = Number(id));
      }
    }
  }

  get isFrom(): boolean {
    return this.branchLogin !== null && Number(this.sample.branch_from) === this.branchLogin;
  }

  get isTo(): boolean {
    return this.branchLogin !== null && Number(this.sample.branch_to) === this.branchLogin;
  }

  is(status: number): boolean {
    return Number(this.sample.status) === status;
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.moveDetailService.getList(this.apiFilter).subscribe(res => {
      this.data = res.body;
      this.productDataSource = new MatTableDataSource<MoveDetail>(this.data);
      this.isLoadingResults = false;
    });
  }

  buildFilterFromParams(): MoveDetailFilter {
    const filter = new MoveDetailFilter();
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = 50;
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.move_id = this.sample.id;
    filter.expand = 'product,productUnit,parcels';
    return filter;
  }

  /** Dòng thuốc không theo lô: số gửi theo đơn vị cơ bản */
  sentBase(item: MoveDetail): number {
    return Number(item.amount) * Number(item.productUnit ? item.productUnit['value'] : 1);
  }

  reOpen() {
    this.router.navigate(['/transaction/move/update/' + this.sample.id]);
  }

  delete() {
    this.confirm('Xoá phiếu chuyển', 'Xoá phiếu ' + this.sample.no + ' (đang khởi tạo, chưa trừ tồn)?', 'Xoá phiếu', () => {
      this.moveService.delete(this.sample.id).subscribe(() => {
        this.notifySer.notify('success', 'Đã xoá phiếu chuyển.');
        this.reload.emit(null);
      });
    });
  }

  receive() {
    this.dialog.open(MoveReceiveDialogComponent, {
      width: '760px',
      data: {move: this.sample, details: this.data},
    }).afterClosed().subscribe(ok => {
      if (ok) {
        this.reload.emit(null);
      }
    });
  }

  cancel() {
    this.confirm('Huỷ chuyển hàng', 'Huỷ phiếu ' + this.sample.no + '? Tồn và lô đã xuất được trả lại chi nhánh này; chi nhánh nhận không nhận được nữa.',
      'Huỷ chuyển', () => {
        this.busy = true;
        this.moveService.cancel(this.sample.id).subscribe(() => {
          this.busy = false;
          this.notifySer.notify('success', 'Đã huỷ phiếu chuyển, tồn và lô đã trả lại.');
          this.reload.emit(null);
        }, () => this.busy = false);
      });
  }

  private confirm(title: string, message: string, confirmButtonText: string, then: () => void) {
    this.dialog.open(ConfirmationDialogComponent, {
      width: '440px',
      data: {title, message, confirmButtonText, cancelButtonText: 'Quay lại'},
    }).afterClosed().subscribe(ok => {
      if (ok) {
        then();
      }
    });
  }
}
