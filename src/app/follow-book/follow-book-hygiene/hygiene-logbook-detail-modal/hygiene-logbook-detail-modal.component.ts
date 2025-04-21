import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HygieneLogbookService } from '../../services/hygiene-logbook.service';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-hygiene-logbook-detail-modal',
  templateUrl: './hygiene-logbook-detail-modal.component.html',
  styleUrls: ['./hygiene-logbook-detail-modal.component.scss']
})
export class HygieneLogbookDetailModalComponent implements OnInit {
  logbookDetails: any = null;
  isLoading = false;
  isExporting = false;

  constructor(
    private dialogRef: MatDialogRef<HygieneLogbookDetailModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private hygieneLogbookService: HygieneLogbookService,
    private notifier: NotifierService
  ) {}

  ngOnInit(): void {
    this.loadLogbookDetails();
  }

  loadLogbookDetails(): void {
    if (!this.data.id) {
      this.notifier.notify('error', 'Không tìm thấy ID phiếu theo dõi vệ sinh');
      return;
    }

    this.isLoading = true;
    this.hygieneLogbookService.getHygieneLogbookDetail(this.data.id).subscribe(
      (response) => {
        this.logbookDetails = response;
        this.isLoading = false;
      },
      (error) => {
        this.notifier.notify('error', 'Không thể tải thông tin chi tiết');
        this.isLoading = false;
      }
    );
  }

  exportToExcel(): void {
    if (!this.data.id) {
      this.notifier.notify('error', 'Không tìm thấy ID phiếu theo dõi vệ sinh');
      return;
    }

    this.isExporting = true;
    this.hygieneLogbookService
      .exportToExcel({ id: this.data.id })
      .subscribe(
        (response: Blob) => {
          const fileName = `Phieu_theo_doi_ve_sinh_${this.logbookDetails.month}.xlsx`;

          const url = window.URL.createObjectURL(response);

          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;

          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          this.isExporting = false;
        },
        (error) => {
          this.notifier.notify('error', 'Không thể xuất file Excel');
          this.isExporting = false;
        }
      );
  }

  getStatusText(status: number): string {
    return status === 1 ? 'Hoàn thành' : 'Chưa hoàn thành';
  }

  getStatusClass(status: number): string {
    return status === 1 ? 'status-completed' : 'status-pending';
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
