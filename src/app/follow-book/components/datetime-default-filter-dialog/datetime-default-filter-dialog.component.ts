import { Component, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DateFilterResult {
  title: string;
  filter_key: string;
  date_from: string | null;
  date_to: string | null;
  skip_filter: boolean;
}

@Component({
  selector: 'app-datetime-default-filter-dialog',
  template: `
    <div class="dialog-container">
      <h2 class="dialog-title">Chọn thời gian</h2>

      <div class="filter-sections">
        <div class="filter-section">
          <div class="filter-header">Theo ngày</div>
          <div class="filter-options">
            <button class="filter-option" (click)="selectTime('today')">Hôm nay</button>
            <button class="filter-option" (click)="selectTime('yesterday')">Hôm qua</button>
            <button class="filter-option" (click)="selectTime('allTime')">Toàn thời gian</button>
          </div>
        </div>

        <div class="filter-section">
          <div class="filter-header">Theo tuần</div>
          <div class="filter-options">
            <button class="filter-option" (click)="selectTime('thisWeek')">Tuần này</button>
            <button class="filter-option" (click)="selectTime('lastWeek')">Tuần trước</button>
          </div>
        </div>

        <div class="filter-section">
          <div class="filter-header">Theo tháng</div>
          <div class="filter-options">
            <button class="filter-option" (click)="selectTime('thisMonth')">Tháng này</button>
            <button class="filter-option" (click)="selectTime('lastMonth')">Tháng trước</button>
            <button class="filter-option" (click)="selectTime('last3Months')">3 tháng trước</button>
            <button class="filter-option" (click)="selectTime('last6Months')">6 tháng trước</button>
          </div>
        </div>
      </div>

      <div class="dialog-footer">
        <button class="close-button" (click)="dialogRef.close()">
          <span class="close-icon">×</span> Bỏ qua
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      padding: 0;
      background-color: white;
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .dialog-title {
      font-size: 16px;
      padding: 15px;
      margin: 0;
      font-weight: 500;
      border-bottom: 1px solid #e0e0e0;
    }

    .filter-sections {
      display: flex;
      padding: 15px;
      gap: 15px;
    }

    .filter-section {
      flex: 1;
    }

    .filter-header {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      margin-bottom: 10px;
    }

    .filter-options {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .filter-option {
      background: none;
      border: none;
      text-align: left;
      padding: 8px 5px;
      font-size: 14px;
      cursor: pointer;
      border-radius: 3px;
      color: #333;
    }

    .filter-option:hover {
      background-color: #f5f5f5;
    }

    .dialog-footer {
      padding: 10px 15px;
      display: flex;
      justify-content: flex-end;
      border-top: 1px solid #e0e0e0;
    }

    .close-button {
      background: none;
      border: none;
      padding: 5px 10px;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      color: #666;
    }

    .close-icon {
      font-size: 18px;
      margin-right: 5px;
    }
  `]
})
export class DatetimeDefaultFilterDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DatetimeDefaultFilterDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  selectTime(filter_key: string) {
    const today = new Date();
    const result: DateFilterResult = {
      title: '',
      filter_key,
      date_from: null,
      date_to: null,
      skip_filter: false
    };

    switch(filter_key) {
      case 'today':
        result.title = 'Hôm nay';
        result.date_from = this.formatDate(today);
        result.date_to = this.formatDate(today);
        break;

      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        result.title = 'Hôm qua';
        result.date_from = this.formatDate(yesterday);
        result.date_to = this.formatDate(yesterday);
        break;

      case 'allTime':
        result.title = 'Toàn thời gian';
        result.skip_filter = true;
        break;

      case 'thisWeek':
        const mondayThisWeek = this.getMondayOfCurrentWeek(today);
        result.title = 'Tuần này';
        result.date_from = this.formatDate(mondayThisWeek);
        result.date_to = this.formatDate(today);
        break;

      case 'lastWeek':
        const mondayLastWeek = this.getMondayOfLastWeek(today);
        const sundayLastWeek = new Date(mondayLastWeek);
        sundayLastWeek.setDate(sundayLastWeek.getDate() + 6);
        result.title = 'Tuần trước';
        result.date_from = this.formatDate(mondayLastWeek);
        result.date_to = this.formatDate(sundayLastWeek);
        break;

      case 'thisMonth':
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        result.title = 'Tháng này';
        result.date_from = this.formatDate(firstDayOfMonth);
        result.date_to = this.formatDate(today);
        break;

      case 'lastMonth':
        const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        result.title = 'Tháng trước';
        result.date_from = this.formatDate(firstDayOfLastMonth);
        result.date_to = this.formatDate(lastDayOfLastMonth);
        break;

      case 'last3Months':
        const date3MonthsAgo = new Date(today);
        date3MonthsAgo.setMonth(date3MonthsAgo.getMonth() - 3);
        result.title = '3 tháng trước';
        result.date_from = this.formatDate(date3MonthsAgo);
        result.date_to = this.formatDate(today);
        break;

      case 'last6Months':
        const date6MonthsAgo = new Date(today);
        date6MonthsAgo.setMonth(date6MonthsAgo.getMonth() - 6);
        result.title = '6 tháng trước';
        result.date_from = this.formatDate(date6MonthsAgo);
        result.date_to = this.formatDate(today);
        break;
    }

    this.dialogRef.close(result);
  }

  private getMondayOfCurrentWeek(date: Date): Date {
    const dayOfWeek = date.getDay();
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(date);
    monday.setDate(diff);
    return monday;
  }

  private getMondayOfLastWeek(date: Date): Date {
    const mondayThisWeek = this.getMondayOfCurrentWeek(date);
    const mondayLastWeek = new Date(mondayThisWeek);
    mondayLastWeek.setDate(mondayLastWeek.getDate() - 7);
    return mondayLastWeek;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
