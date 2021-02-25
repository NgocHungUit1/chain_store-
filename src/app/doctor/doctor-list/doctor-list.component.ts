import { Component, OnInit, ViewChild } from '@angular/core';
import { ListComponentBase } from '../../shared/base';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { DoctorService } from '../doctor.service';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Doctor, DoctorFilter } from '../doctor.model';
import { DoctorFormDialogComponent } from '../doctor-form-dialog/doctor-form-dialog.component';
import { MoveDetail } from '../../move/move.model';

@Component({
  selector: 'app-doctor-list',
  templateUrl: './doctor-list.component.html',
  styleUrls: ['./doctor-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class DoctorListComponent extends ListComponentBase implements OnInit {

  constructor(
    private service: DoctorService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private notifyService: NotifierService
  ) {
    super();
  }

  @ViewChild(MatTable, {static: true}) table: MatTable<any>;

  apiFilter: DoctorFilter;

  columnsHeader = {
    '#': '#',
    'name': 'Tên bác sĩ',
    'phone': 'Số điện thoại',
    'status': 'Trạng thái',
  };

  displayedColumns: string[] = [
    '#',
    'name',
    'phone',
    'status'
  ];
  columnsToDisplay: string[] = [
    '#',
    'name',
    'phone',
    'status'
  ];

  data: Doctor[] = [];
  itemDataSource = new MatTableDataSource<Doctor>([]);
  expandedElement: Doctor | null;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;

  buildFilterFromParams(): DoctorFilter {
    function write<K extends keyof DoctorFilter>(arg: DoctorFilter, key: K, value: DoctorFilter[K]): void {
      arg[key] = value;
    }

    const filter = new DoctorFilter();
    const objectKeys = Object.keys(filter) as Array<keyof DoctorFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['DoctorSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'province,district,ward';
    return filter;
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.service.getList(this.apiFilter).subscribe(res => {
      this.data = res.body;
      this.itemDataSource = new MatTableDataSource<Doctor>(this.data);
      this.reloadFilter(res);
      this.isLoadingResults = false;
    });
  }

  ngOnInit(): void {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();

    // this.service.subscribeLoadCustomer.subscribe(action => {
    //   if (action === true) {
    //     this.apiFilter = this.buildFilterFromParams();
    //     this.loadData();
    //     this.service.setLoadCustmer(false);
    //   }
    // });
  }

  openDoctorFormDialog() {
    const dialogRef = this.dialog.open(DoctorFormDialogComponent, {
      width: '70%',
      minWidth: '600px',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

}
