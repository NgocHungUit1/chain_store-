import {
  Component,
  EventEmitter,
  Inject,
  OnInit,
  Output,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'payment-qr-dialog',
  templateUrl: './payment-qr-dialog.component.html',
  styleUrls: ['./payment-qr-dialog.component.scss'],
})
export class PaymentQrDialogComponent implements OnInit {
  visible: boolean = true;
  accountName: string;
  accountNumber: string;
  bankCode: string;
  qrImageUrl: string;

  @Output() close = new EventEmitter<void>();

  constructor(
    public dialogRef: MatDialogRef<PaymentQrDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    // Generate QR code if not provided
    if (this.data) {
        this.accountName = this.data.accountName;
        this.accountNumber = this.data.accountNumber;
        this.bankCode = this.data.bankCode;
        this.qrImageUrl = this.data.qrImageUrl;
    }
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  printQrCode(): void {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      alert('Please allow popups to print the QR code');
      return;
    }

    // Get the printable content
    const printElement = document.getElementById('printableQR');

    if (!printElement) {
      return;
    }

    // Get all stylesheets from the current document
    const stylesheets = Array.from(document.styleSheets);
    const styleHtml = stylesheets
      .map(sheet => {
        try {
          // Try to extract style rules
          return Array.from(sheet.cssRules || [])
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          // Some external stylesheets might block access due to CORS
          return `@import url('${sheet.href}');`;
        }
      })
      .join('\n');

    // Write the HTML to the print window with inline styles
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>VietQR Print</title>
          <style>
            ${styleHtml}
            
            /* Ensure background images are printed */
            @media print {
              .printable-qr {
                background-image: url(assets/images/background/qrframe.png) !important;
                background-repeat: no-repeat !important;
                background-size: cover !important;
                background-position: center !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
                print-color-adjust: exact;
              }
              
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
              }
            }
          </style>
        </head>
        <body>
          ${printElement.outerHTML}
        </body>
      </html>
    `);

    // Wait for content to load before printing
    printWindow.document.close();
    printWindow.focus();

    // Print after a small delay to ensure everything is loaded
    setTimeout(() => {
      printWindow.print();
      // Close the window after printing (or after the print dialog is closed)
      printWindow.addEventListener('afterprint', () => {
        printWindow.close();
      });
    }, 500);
  }
}
