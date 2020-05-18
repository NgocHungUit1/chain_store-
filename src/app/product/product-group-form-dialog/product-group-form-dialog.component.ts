import {Component, Inject, OnInit} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {NotifierService} from "angular-notifier";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {GroupService} from "../group.service";
import {GroupFilter} from "../group.model";

@Component({
  selector: 'app-product-group-form-dialog',
  templateUrl: './product-group-form-dialog.component.html',
  styleUrls: ['./product-group-form-dialog.component.css']
})
export class ProductGroupFormDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ProductGroupFormDialogComponent>,
    public notifySer: NotifierService,
    private fb: FormBuilder,
    private groupSer: GroupService,
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  public form: FormGroup;
  loading = false;

  parentList = [];

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [
        null,
        Validators.compose([
          Validators.required,
          Validators.maxLength(32)
        ])
      ],
      parent_id: [
        null
      ],
    });

    const groupFilter = new GroupFilter();
    groupFilter.parent_id = 0;

    this.groupSer.getList(groupFilter).subscribe(res => {
      this.parentList = res.body;
    });
  }

  submit() {
    if (this.form.valid) {
      let data = this.form.getRawValue();
      this.groupSer.create(data).subscribe(res => {
        this.notifySer.notify('success', 'Thêm nhóm hàng thành công!');
        this.dialogRef.close(res);
      });
    }
  }

}
