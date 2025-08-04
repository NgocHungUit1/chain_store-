import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EInvoiceService } from '../e-invoice.service';

@Component({
  selector: 'app-load-dialog',
  templateUrl: './load-dialog.component.html',
  styleUrls: ['./load-dialog.component.css']
})
export class LoadDialogComponent implements OnInit {
  loadForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<LoadDialogComponent>,
    private eInvoiceService: EInvoiceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadForm = this.fb.group({
      MST: ['0314540246', [Validators.required]],
      LastUpdate: [null, [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loadForm.valid) {
      const formValue = this.loadForm.value;
      // Format LastUpdate to match required format
      const lastUpdate = new Date(formValue.LastUpdate);
      formValue.LastUpdate = lastUpdate.toISOString();
      
      this.dialogRef.close(formValue);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  exportExcel() {
    if (this.loadForm.invalid) return;
    const value = this.loadForm.value;
    const d = value.LastUpdate;
    // Sử dụng ISO string chuẩn
    const formatted = d instanceof Date ? d.toISOString() : value.LastUpdate;
    this.eInvoiceService.exportExcel(value.MST, formatted).subscribe({
      next: (blob) => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = 'e-invoice-export.xlsx';
        a.click();
        URL.revokeObjectURL(objectUrl);
        this.snackBar.open('Xuất file thành công!', '', { duration: 2000 });
      },
      error: () => {
        this.snackBar.open('Xuất file thất bại!', '', { duration: 2000 });
      }
    });
  }
} 