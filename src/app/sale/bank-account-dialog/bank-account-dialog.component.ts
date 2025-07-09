import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BankAccount, VietQRBank } from '../../bank-account/bank-account.model';
import { BankAccountService } from '../../bank-account/bank-account.service';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-bank-account-dialog',
  templateUrl: './bank-account-dialog.component.html',
  styleUrls: ['./bank-account-dialog.component.scss']
})
export class BankAccountDialogComponent implements OnInit {
  bankAccountForm: FormGroup;
  banks: VietQRBank[] = [];
  filteredBanks: VietQRBank[] = [];
  loading = true;
  bankSearchControl = new FormControl('');

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<BankAccountDialogComponent>,
    private bankAccountService: BankAccountService,
    private notifySer: NotifierService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.bankAccountForm = this.fb.group({
      account_number: ['', [Validators.required]],
      bank_code: ['', [Validators.required]],
      account_name: ['', [Validators.required]],
      note: ['']
    });
  }

  compareBank(bank1: string, bank2: string): boolean {
    return bank1 === bank2;
  }

  getSelectedBankShortName(): string {
    const selectedCode = this.bankAccountForm.get('bank_code')?.value;
    const selectedBank = this.banks.find(bank => bank.code === selectedCode);
    return selectedBank ? selectedBank.shortName : '';
  }

  ngOnInit(): void {
    this.loadBanks();
  }

  loadBanks(): void {
    this.loading = true;
    this.bankAccountService.getVietQRBanks().subscribe(
      response => {
        console.log('API Response:', response); // Debug log
        if (response.code === '00') {
          // Lấy tất cả ngân hàng, không lọc transferSupported
          this.banks = response.data;
          // Sắp xếp theo thứ tự: ngân hàng lớn lên trước
          this.banks.sort((a, b) => {
            // Các ngân hàng lớn
            const majorBanks = ['VCB', 'TCB', 'BIDV', 'VBA', 'MB', 'VPB', 'ACB', 'STB'];
            const aIndex = majorBanks.indexOf(a.code);
            const bIndex = majorBanks.indexOf(b.code);

            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;

            return a.name.localeCompare(b.name, 'vi');
          });

          console.log('Processed Banks:', this.banks); // Debug log
          this.filteredBanks = [...this.banks];
        }
        this.loading = false;
      },
      error => {
        console.error('Error loading banks:', error);
        this.loading = false;
        this.notifySer.notify('error', 'Không thể tải danh sách ngân hàng');
      }
    );
  }

  onSearchChange(event: any): void {
    const searchTerm = event.target.value.toLowerCase().trim();
    this.filteredBanks = this.banks.filter(bank =>
      bank.name.toLowerCase().includes(searchTerm) ||
      bank.shortName.toLowerCase().includes(searchTerm) ||
      bank.code.toLowerCase().includes(searchTerm)
    );

    // Automatically select the first bank in filtered results
    if (this.filteredBanks.length > 0) {
      const firstBank = this.filteredBanks[0];
      this.bankAccountForm.patchValue({
        bank_code: firstBank.code
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.bankAccountForm.valid) {
      const data = this.bankAccountForm.value;
      // Thêm thông tin ngân hàng
      const selectedBank = this.banks.find(bank => bank.code === data.bank_code);
      if (selectedBank) {
        data.bank_name = selectedBank.name;
        data.bank_logo = selectedBank.logo;
      }

      this.bankAccountService.create(data).subscribe(
        res => {
          this.notifySer.notify('success', 'Thêm tài khoản ngân hàng thành công!');
          this.dialogRef.close(res);
        },
        error => {
          console.error('Error creating bank account:', error);
          this.notifySer.notify('error', 'Không thể tạo tài khoản ngân hàng');
        }
      );
    }
  }
}
