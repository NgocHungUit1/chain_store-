import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BranchService } from '../../branch/branch.service';
import { Branch } from '../../branch/branch.model';
import {WarehouseProductParcelService} from '../warehouse-product-parcel.service';

@Component({
    selector: 'app-warehouse-product-parcel-change-stock-form-dialog',
    templateUrl: './warehouse-product-parcel-change-stock-form-dialog.component.html',
    styleUrls: ['./warehouse-product-parcel-change-stock-form-dialog.component.css']
})
export class WarehouseProductParcelChangeStockFormDialogComponent implements OnInit {

    constructor(
        public dialogRef: MatDialogRef<WarehouseProductParcelChangeStockFormDialogComponent>,
        public notifySer: NotifierService,
        private fb: FormBuilder,
        private branchService: BranchService,
        private mainService: WarehouseProductParcelService,
        private dialog: MatDialog,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
    ) {
        this.local_data = {...data};
        this.productParcelId = this.local_data.productParcelId;
    }

    local_data: any;
    productParcelId: string;

    form: FormGroup;

    fieldLabels = {
        // no: 'Mã nhóm hàng',
      quantity_of_stock: 'Tồn kho',
        // short: 'Mã ngắn',
        // note: 'Ghi chú',
        // description: 'Mô tả',
        // alias: 'alias',
    };


    onNoClick(): void {
        this.dialogRef.close();
    }

    initForm() {
        this.form = this.fb.group({
            // no: [null, Validators.required],
            quantity_of_stock: [null, [Validators.required]],
            // short: [null],
            // alias: [null],
            // note: [null],
            // description: [null],
        });
    }

    ngOnInit(): void {
        this.initForm();

        if (this.productParcelId !== null && this.productParcelId !== undefined) {
            this.loadModel(this.productParcelId);
        } else {
            // this.groupService.getNo().subscribe(no => {
            //     this.form.patchValue({
            //         'no': no,
            //     });
            // });
        }
    }

    loadModel(id) {
        this.mainService.getDetail(id, '').subscribe(res => {
            this.form.patchValue({
                id: res['id'],
                // no: group['no'],
                quantity_of_stock: res['quantity_of_stock'],
                // short: group['short'],
                // alias: group['alias'],
                // description: group['description'],
                // note: group['note'],
            });

        });
    }


    submit() {
        if (this.form.valid) {
            const data = this.form.getRawValue();

            if (this.productParcelId !== null && this.productParcelId !== undefined) {
                this.mainService.update(this.productParcelId, data).subscribe(res => {
                    this.notifySer.notify('success', 'Cập nhật thành công!');
                    this.dialogRef.close(res);
                }, (error) => {
                    if (error.status === 422) {
                        this.ajaxValidate(error);
                    }
                });
            }
        } else {
            // Form errors
            const controls = Object.entries(this.form.controls);
            const hasError = this.checkToShowControlError(controls);
        }
    }


    public ajaxValidate(error) {
        if (error.error) {
            if (this.form instanceof FormGroup) {
                const _fields = this.form.controls;
                Object.keys(_fields).forEach(key => {
                    const errorField = error.error.find(x => x.field === key);
                    if (errorField) {
                        this.form.controls[key].setErrors({
                            ajaxValidator: {
                                value: errorField.message,
                            }
                        });
                    }
                });
            }
        }
    }


    checkToShowControlError(controls) {
        const count = controls.length;
        let hasError = false;
        for (let i = 0; i < count; i++) {
            const fieldName = controls[i][0];
            const fieldControl = controls[i][1];
            if (fieldControl['errors'] !== null) {
                this.notifySer.notify('error', 'Lỗi thông tin trường ' + this.fieldLabels[fieldName]);
                hasError = true;
                break;
            }
        }
        return hasError;
    }

}
