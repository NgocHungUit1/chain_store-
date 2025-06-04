import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EInvoiceRegisterModalComponent } from '../e-invoice-register-modal/e-invoice-register-modal.component';

@Component({
  selector: 'app-e-invoice-modal',
  templateUrl: './e-invoice-modal.component.html',
  styleUrls: ['./e-invoice-modal.component.scss']
})
export class EInvoiceModalComponent {
  constructor(
    public dialogRef: MatDialogRef<EInvoiceModalComponent>,
    private dialog: MatDialog
  ) {}

  openRegisterModal(): void {
    const dialogRef = this.dialog.open(EInvoiceRegisterModalComponent, {
      width: '500px',
      panelClass: 'register-modal-dialog',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dialogRef.close();
      }
    });
  }

  onCloseClick(event: Event): void {
    event.stopPropagation(); // Ngăn không cho sự kiện click lan ra ngoài
    this.dialogRef.close();
  }
}
