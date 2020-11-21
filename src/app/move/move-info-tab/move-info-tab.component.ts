import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { SamplePrescription, SamplePrescriptionItemFilter } from '../../sample-prescription/sample-prescription.model';
import { StockTakeItem } from '../../stock-take/stock-take.model';
import { MatTableDataSource } from '@angular/material/table';
import { SamplePrescriptionService } from '../../sample-prescription/sample-prescription.service';
import { SamplePrescriptionItemService } from '../../sample-prescription/sample-prescription-item.service';
import { NotifierService } from 'angular-notifier';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Move, MoveDetail, MoveDetailFilter } from '../move.model';
import { MoveService } from '../move.service';
import { MoveDetailService } from '../move-detail.service';
import { environment } from '../../../environments/environment';

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
  };
  displayedColumns = [
    '#',
    'product_no',
    'product_name',
    'amount',
  ];

  statusList = {
    '10': 'Hoàn thành',
    '9': 'Khởi tạo'
  };

  statusesColor: object = {
    '9': 'label label-warning',
    '10': 'label label-success',
  };


  apiFilter: MoveDetailFilter;
  isLoadingResults = false;
  data: MoveDetail[] = [];
  productDataSource = new MatTableDataSource<MoveDetail>([]);

  constructor(
    private moveService: MoveService,
    private moveDetailService: MoveDetailService,
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
    }
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
    // tslint:disable-next-line:max-line-length
    function write<K extends keyof MoveDetailFilter>(arg: MoveDetailFilter, key: K, value: MoveDetailFilter[K]): void {
      arg[key] = value;
    }

    const filter = new MoveDetailFilter();
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = 50;//this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.move_id = this.sample.id;
    filter.expand = 'product,productUnit';
    return filter;
  }

  reOpen() {
    this.router.navigate(['/transaction/move/update/' + this.sample.id]);
  }

  delete() {

    this.moveService.delete(this.sample.id).subscribe(res => {
      this.notifySer.notify('warning', 'Đã xóa đơn');
      this.reload.emit(null);
      setTimeout(function () {
        location.reload();
      }, 1000);
    });
  }

}
