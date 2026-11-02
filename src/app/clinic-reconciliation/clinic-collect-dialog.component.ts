import {Component, Inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {format} from 'date-fns';
import {NotifierService} from 'angular-notifier';
import {environment} from '../../environments/environment';

export interface CollectInvoice {
  invoice_id: number;
  invoice_no: string;
  date: number;
  order_code: string;
  remaining: number;
}

/**
 * Thu nợ phòng khám: nhập một số tiền, tự trừ vào hoá đơn còn nợ cũ nhất trước, lập phiếu thu "Thu nợ khách hàng"
 * (cùng API với Sổ quỹ › Lập phiếu thu nên Sổ quỹ / Công nợ thu / Đối soát đều khớp).
 */
@Component({
  selector: 'app-clinic-collect-dialog',
  templateUrl: './clinic-collect-dialog.component.html',
  styleUrls: ['../cash-flow/cash-flow-form.css', './clinic-collect-dialog.component.scss']
})
export class ClinicCollectDialogComponent {
  amount: string;
  typeMoney: 'money' | 'bank' = 'money';
  note: string;
  saving = false;
  readonly debt: number;
  private readonly invoices: CollectInvoice[];

  constructor(
    public dialogRef: MatDialogRef<ClinicCollectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { clinic: { name: string, customer_id: number }, invoices: CollectInvoice[] },
    private http: HttpClient,
    private notify: NotifierService,
  ) {
    this.invoices = [...(data.invoices || [])].filter(i => i.remaining > 0)
      .sort((a, b) => a.date - b.date || a.invoice_id - b.invoice_id);
    this.debt = this.invoices.reduce((s, i) => s + i.remaining, 0);
    this.amount = this.fmt(this.debt);
    this.note = 'Phòng khám trả nợ ' + format(new Date(), 'MM/YYYY');
  }

  get value(): number {
    return Number(String(this.amount || '').replace(/[^\d]/g, '')) || 0;
  }

  get error(): string {
    if (this.value <= 0) {
      return 'Nhập số tiền phòng khám trả';
    }
    if (this.value > this.debt) {
      return 'Lớn hơn số đang nợ (' + this.fmt(this.debt) + ' đ)';
    }
    return '';
  }

  /** Trừ vào hoá đơn cũ nhất trước */
  get allocation(): { inv: CollectInvoice, pay: number, left: number }[] {
    let rest = Math.min(this.value, this.debt);
    return this.invoices.map(inv => {
      const pay = Math.min(inv.remaining, rest);
      rest -= pay;
      return {inv, pay, left: inv.remaining - pay};
    });
  }

  fmt(n: number): string {
    return new Intl.NumberFormat('en-US').format(n || 0);
  }

  formatInput() {
    this.amount = this.value ? this.fmt(this.value) : '';
  }

  payAll() {
    this.amount = this.fmt(this.debt);
  }

  save() {
    if (this.error || this.saving) {
      return;
    }
    this.saving = true;
    const items = this.allocation.filter(a => a.pay > 0).map(a => ({
      invoice_id: a.inv.invoice_id, processed_amount: a.pay, need_to_process_amount: a.inv.remaining,
    }));
    this.http.get<string>(environment.apiUrl + '/cash-flow/render-no').subscribe(no => {
      this.http.post(environment.apiUrl + '/cash-flow', {
        no, type: 'receipt', method: 'customer', type_money: this.typeMoney, doi_tuong_nop: 'customer',
        nguoi_nop_id: this.data.clinic.customer_id, ten_nguoi_nop: this.data.clinic.name,
        value: this.value, note: this.note, invoice_items: items,
        date_created: format(new Date(), 'HH:mm YYYY-MM-DD'),
      }).subscribe(res => {
        this.saving = false;
        this.notify.notify('success', 'Đã lập phiếu thu ' + this.fmt(this.value) + ' đ');
        this.dialogRef.close({saved: true, cashFlow: res});
      }, err => this.fail(err));
    }, err => this.fail(err));
  }

  private fail(err: any) {
    this.saving = false;
    // 422 trả mảng [{field, message}] (vd hoá đơn vừa được người khác thu)
    const msg = err?.error?.message || (Array.isArray(err?.error) && err.error[0]?.message);
    this.notify.notify('error', msg || 'Không lập được phiếu thu');
  }
}
