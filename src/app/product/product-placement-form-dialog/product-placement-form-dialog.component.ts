import {Component, Inject, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PlacementService} from '../placement.service';
import { StoreService } from '../../store/store.service';

@Component({
  selector: 'app-product-placement-form-dialog',
  templateUrl: './product-placement-form-dialog.component.html',
  styleUrls: ['./product-placement-form-dialog.component.css']
})
export class ProductPlacementFormDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ProductPlacementFormDialogComponent>,
    public notifySer: NotifierService,
    private fb: FormBuilder,
    private mainSer: PlacementService,
    public storeSer: StoreService,
  ) { }

  public form: FormGroup;
  loading = false;

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      store_id: [null, Validators.required],
      name: [
        null,
        Validators.compose([
          Validators.required,
          Validators.maxLength(32)
        ])
      ],
    });

    this.loadStore();
  }

  loadStore(): void {
    this.storeSer.getDetail().subscribe(store => {
      this.form.patchValue({
        store_id: store['id'],
      });
    });
  }

  submit() {
    if (this.form.valid) {
      const data = this.form.getRawValue();
      this.mainSer.create(data).subscribe(res => {
        this.notifySer.notify('success', 'Thêm vị trí thành công!');
        this.dialogRef.close(res);
      });
    }
  }

}
