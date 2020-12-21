import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-settings-main',
  templateUrl: './settings-main.component.html',
  styleUrls: ['./settings-main.component.css']
})
export class SettingsMainComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private notifySer: NotifierService,
    private fb: FormBuilder,
  ) {
  }

  settingsType: string;

  settingsTypeName = {
    'transaction': 'Giao dịch',
    'store': 'Hàng hóa',
    'partner': 'Đối tác'
  };

  isLoadingResults = true;
  isRateLimitReached = false;

  ngOnInit(): void {
    this.settingsType = 'transaction';
    this.isLoadingResults = false;
  }

}
