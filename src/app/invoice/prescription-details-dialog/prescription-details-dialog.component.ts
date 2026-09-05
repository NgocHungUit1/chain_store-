import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Prescription } from '../../sale/prescription.model';
import { PrescriptionService } from '../../sale/prescription.service';
import { Invoice, InvoiceDetail } from '../invoice.model';
import { InvoiceService } from '../invoice.service';

export interface PrescriptionDetailsDialogData {
  invoiceId: string;
  prescriptionId: string;
  patientName?: string;
}

@Component({
  selector: 'app-prescription-details-dialog',
  templateUrl: './prescription-details-dialog.component.html',
  styleUrls: ['./prescription-details-dialog.component.css']
})
export class PrescriptionDetailsDialogComponent implements OnInit {
  prescription: Prescription = null;
  invoice: Invoice = null;
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    if (!this.data?.prescriptionId) {
      this.isLoading = false;
      this.errorMessage = 'Hóa đơn không có đơn thuốc để tra cứu.';
      return;
    }

    this.prescriptionService.getInvoicePrescriptionDetail(this.data.prescriptionId).subscribe(
      prescription => {
        this.prescription = prescription;
        this.loadInvoiceDetails();
      },
      () => {
        this.loadInvoiceDetails();
      }
    );
  }

  private loadInvoiceDetails(): void {
    this.invoiceService.getPrescriptionInvoiceDetail(this.data.invoiceId).subscribe(
      invoice => {
        this.invoice = invoice;
        this.isLoading = false;
      },
      () => {
        if (!this.prescription) {
          this.errorMessage = 'Không thể tải thông tin đơn thuốc. Vui lòng thử lại.';
        }
        this.isLoading = false;
      }
    );
  }

  constructor(
    private readonly dialogRef: MatDialogRef<PrescriptionDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PrescriptionDetailsDialogData,
    private readonly prescriptionService: PrescriptionService,
    private readonly invoiceService: InvoiceService
  ) {}

  display(value: any): string {
    if (value === null || value === undefined || value === '') {
      return 'Chưa có thông tin';
    }
    return String(value);
  }

  productName(detail: InvoiceDetail): string {
    return detail?.product?.product_name || '';
  }

  activeSubstance(detail: InvoiceDetail): string {
    const product: any = detail?.product as any;
    return (detail as any)?.main_active_substance
      || product?.main_active_substance
      || product?.medicine?.main_active_substance
      || '';
  }

  close(): void {
    this.dialogRef.close();
  }
}
