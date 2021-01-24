import {Component, Input, OnInit} from '@angular/core';
import {PaySheet} from '../pay-sheet.model';
import {DatePipe} from '@angular/common';
import * as moment from 'moment';
import {NotifierService} from 'angular-notifier';
import {PaySheetService} from '../pay-sheet.service';

@Component({
  selector: 'app-pay-sheet-tab-info',
  templateUrl: './pay-sheet-tab-info.component.html',
  styleUrls: ['./pay-sheet-tab-info.component.css'],
  providers: [DatePipe]
})
export class PaySheetTabInfoComponent implements OnInit {

  @Input() paySheet: PaySheet;

  constructor(
    private notifySer: NotifierService,
    private paySheetService: PaySheetService
  ) { }

  salaryPeriods: any[] = [
    {
      'id': 1,
      'title': 'Hàng tháng'
    },
    // {
    //   'id': 2,
    //   'title': '2 lần 1 tháng'
    // },
    // {
    //   'id': 3,
    //   'title': 'Hàng tuần'
    // },
    // {
    //   'id': 4,
    //   'title': '2 tuần 1 lần'
    // },
    // {
    //   'id': 5,
    //   'title': '2 Tủy chọn'
    // }
  ];

  ngOnInit(): void {
  }

  cancelPaySheet() {
    const data = {
      status: 0
    };
    this.paySheetService.update(this.paySheet.id.toString(), data).subscribe(res => {
      this.notifySer.notify('success', 'Cập nhật thành công.');
      this.paySheet = res;
    });

  }

  getNameSalaryPeriod(id) {
    if (!id) {
      return '';
    }
    const salaryType = this.salaryPeriods.find(item => item.id === id);
    if (salaryType) {
      return salaryType.title;
    }
    return '';
  }
}
