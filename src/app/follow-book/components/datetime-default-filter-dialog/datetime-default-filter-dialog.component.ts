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
          <div class="filter-header">Theo năm</div>
          <div class="filter-options">
            <button class="filter-option" (click)="selectTime('thisYear')">Năm nay</button>
            <button class="filter-option" (click)="selectTime('lastYear')">Năm trước</button>
            <button class="filter-option" (click)="selectTime('last3Years')">3 năm gần đây</button>
          </div>
        </div>

        <div class="filter-section">
          <div class="filter-header">Theo quý</div>
          <div class="filter-options">
            <button class="filter-option" (click)="selectTime('q1')">Quý 1</button>
            <button class="filter-option" (click)="selectTime('q2')">Quý 2</button>
            <button class="filter-option" (click)="selectTime('q3')">Quý 3</button>
            <button class="filter-option" (click)="selectTime('q4')">Quý 4</button>
          </div>
        </div>

        <div class="filter-section">
          <div class="filter-header">Theo tháng</div>
          <div class="filter-options">
            <button class="filter-option" (click)="selectTime('thisMonth')">Tháng này</button>
            <button class="filter-option" (click)="selectTime('lastMonth')">Tháng trước</button>
            <button class="filter-option" (click)="selectTime('allTime')">Toàn thời gian</button>
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
      justify-content: space-between;
      padding: 20px;
      gap: 20px;
    }

    .filter-section {
      flex: 1;
      max-width: 220px;
    }

    .filter-header {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      margin-bottom: 12px;
      padding-bottom: 4px;
      border-bottom: 1px solid #eee;
    }

    .filter-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .filter-option {
      background: none;
      border: none;
      text-align: left;
      padding: 10px;
      font-size: 14px;
      cursor: pointer;
      border-radius: 4px;
      color: #333;
      transition: background-color 0.2s;
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
      case 'allTime':
        result.title = 'Toàn thời gian';
        result.skip_filter = true;
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

      case 'q1':
        const firstDayQ1 = new Date(today.getFullYear(), 0, 1);
        const lastDayQ1 = new Date(today.getFullYear(), 3, 0);
        result.title = 'Quý 1 ' + today.getFullYear();
        result.date_from = this.formatDate(firstDayQ1);
        result.date_to = this.formatDate(lastDayQ1);
        break;

      case 'q2':
        const firstDayQ2 = new Date(today.getFullYear(), 3, 1);
        const lastDayQ2 = new Date(today.getFullYear(), 6, 0);
        result.title = 'Quý 2 ' + today.getFullYear();
        result.date_from = this.formatDate(firstDayQ2);
        result.date_to = this.formatDate(lastDayQ2);
        break;

      case 'q3':
        const firstDayQ3 = new Date(today.getFullYear(), 6, 1);
        const lastDayQ3 = new Date(today.getFullYear(), 9, 0);
        result.title = 'Quý 3 ' + today.getFullYear();
        result.date_from = this.formatDate(firstDayQ3);
        result.date_to = this.formatDate(lastDayQ3);
        break;

      case 'q4':
        const firstDayQ4 = new Date(today.getFullYear(), 9, 1);
        const lastDayQ4 = new Date(today.getFullYear(), 12, 0);
        result.title = 'Quý 4 ' + today.getFullYear();
        result.date_from = this.formatDate(firstDayQ4);
        result.date_to = this.formatDate(lastDayQ4);
        break;

      case 'thisYear':
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        result.title = 'Năm ' + today.getFullYear();
        result.date_from = this.formatDate(firstDayOfYear);
        result.date_to = this.formatDate(today);
        break;

      case 'lastYear':
        const firstDayOfLastYear = new Date(today.getFullYear() - 1, 0, 1);
        const lastDayOfLastYear = new Date(today.getFullYear() - 1, 11, 31);
        result.title = 'Năm ' + (today.getFullYear() - 1);
        result.date_from = this.formatDate(firstDayOfLastYear);
        result.date_to = this.formatDate(lastDayOfLastYear);
        break;

      case 'last3Years':
        const date3YearsAgo = new Date(today);
        date3YearsAgo.setFullYear(date3YearsAgo.getFullYear() - 3);
        date3YearsAgo.setMonth(0);
        date3YearsAgo.setDate(1);
        result.title = '3 năm gần đây';
        result.date_from = this.formatDate(date3YearsAgo);
        result.date_to = this.formatDate(today);
        break;

      default:
        result.title = 'Tùy chọn';
        result.skip_filter = true;
        break;
    }

    this.dialogRef.close(result);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
