import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {SamplePrescription, SamplePrescriptionItemFilter} from '../sample-prescription.model';
import {StockTakeItem} from '../../stock-take/stock-take.model';
import {MatTableDataSource} from '@angular/material/table';
import {NotifierService} from 'angular-notifier';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {SamplePrescriptionService} from '../sample-prescription.service';
import {SamplePrescriptionItemService} from '../sample-prescription-item.service';
import {BaseComponent} from '../../shared/base';
import {AuthService} from '../../authentication/auth.service';
import {PopupConfirmDialogComponent} from '../../common/popup-confirm-dialog/popup-confirm-dialog.component';

@Component({
  selector: 'app-sample-prescription-info-tab',
  templateUrl: './sample-prescription-info-tab.component.html',
  styleUrls: ['./sample-prescription-info-tab.component.css']
})
export class SamplePrescriptionInfoTabComponent extends BaseComponent implements OnChanges {

  @Input() sample: SamplePrescription;
  @Input() expandedElement: boolean;
  @Output() reload: EventEmitter<any> = new EventEmitter();

  columnsHeader = {
    '#': '#',
    'product_no': 'Mã hàng',
    'product_name': 'Tên hàng',
    'amount': 'Số lượng',
    'note': 'Liều dùng',
  };
  displayedColumns = [
    '#',
    'product_no',
    'product_name',
    'amount',
    'note',
  ];

  statusList = {
    '10': 'Áp dụng',
    '9': 'Chưa áp dụng'
  };

  statusesColor: object = {
    '9': 'label label-warning',
    '10': 'label label-success',
  };


  apiFilter: SamplePrescriptionItemFilter;
  isLoadingResults = false;
  data: StockTakeItem[] = [];
  productDataSource = new MatTableDataSource<StockTakeItem>([]);

  constructor(
    private samplePrescriptionService: SamplePrescriptionService,
    private samplePrescriptionItemService: SamplePrescriptionItemService,
    public notifySer: NotifierService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    public authSer: AuthService
  ) {
    super(authSer);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.expandedElement) {
      this.apiFilter = this.buildFilterFromParams();

      this.loadData();
    }
  }

  loadData(): void {

    this.isLoadingResults = true;
    this.samplePrescriptionItemService.getList(this.apiFilter).subscribe(res => {
      this.data = res.body;
      this.productDataSource = new MatTableDataSource<StockTakeItem>(this.data);
      this.isLoadingResults = false;
    });
  }

  buildFilterFromParams(): SamplePrescriptionItemFilter {
    // tslint:disable-next-line:max-line-length
    function write<K extends keyof SamplePrescriptionItemFilter>(arg: SamplePrescriptionItemFilter, key: K, value: SamplePrescriptionItemFilter[K]): void {
      arg[key] = value;
    }

    const filter = new SamplePrescriptionItemFilter();
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = 50;
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.sample_prescription_id = this.sample.id;
    filter.expand = 'product,productUnit';
    return filter;
  }

  reOpen() {
    this.router.navigate(['/store/sample-prescription/update/' + this.sample.id]);
  }

  delete() {
    const obj = {
      action: 'Connect',
      title: 'Xác nhận xóa đơn thuốc mẫu?',
      content: '',
    };

    const dialogRef = this.dialog.open(PopupConfirmDialogComponent, {
      data: obj,
      width: '30%',
      minHeight: '60%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.event === 'confirm') {
        this.samplePrescriptionService.delete(this.sample.id).subscribe(res => {
          if (res === true) {
            this.notifySer.notify('success', 'Xóa đơn thuốc mẫu thành công!');
            this.loadData();
            this.sample = null;
          } else {
            this.notifySer.notify('danger', 'Không xóa được.');
          }
        });
      }
    });
  }


}
