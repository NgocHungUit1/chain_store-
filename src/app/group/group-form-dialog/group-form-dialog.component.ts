import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BranchService } from '../../branch/branch.service';
import { Branch } from '../../branch/branch.model';
import { GroupService } from '../group.service';

@Component({
    selector: 'app-group-form-dialog',
    templateUrl: './group-form-dialog.component.html',
    styleUrls: ['./group-form-dialog.component.css']
})
export class GroupFormDialogComponent implements OnInit {

    constructor(
        public dialogRef: MatDialogRef<GroupFormDialogComponent>,
        public notifySer: NotifierService,
        private fb: FormBuilder,
        private branchService: BranchService,
        private groupService: GroupService,
        private dialog: MatDialog,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
    ) {
        this.local_data = {...data};
        this.group_id = this.local_data.group_id;
    }

    local_data: any;
    group_id: string;

    form: FormGroup;

    fieldLabels = {
        no: 'Mã nhóm hàng',
        name: 'Tên nhóm hàng',
        short: 'Mã ngắn',
        note: 'Ghi chú',
        description: 'Mô tả',
        alias: 'alias',
    };


    onNoClick(): void {
        this.dialogRef.close();
    }

    initForm() {
        this.form = this.fb.group({
            no: [null, Validators.required],
            name: [null, [Validators.required]],
            short: [null],
            alias: [null],
            note: [null],
            description: [null],
        });
    }

    ngOnInit(): void {
        this.initForm();

        if (this.group_id !== null && this.group_id !== undefined) {
            this.loadModel(this.group_id);
        } else {
            this.groupService.getNo().subscribe(no => {
                this.form.patchValue({
                    'no': no,
                });
            });
        }
    }

    loadModel(id) {
        this.groupService.getDetail(id, '').subscribe(group => {
            this.form.patchValue({
                id: group['id'],
                no: group['no'],
                name: group['name'],
                short: group['short'],
                alias: group['alias'],
                description: group['description'],
                note: group['note'],
            });

        });
    }


    submit() {
        if (this.form.valid) {
            const data = this.form.getRawValue();

            if (this.group_id !== null && this.group_id !== undefined) {
                this.groupService.update(this.group_id, data).subscribe(res => {
                    this.notifySer.notify('success', 'Cập nhật  thành công!');
                    this.dialogRef.close(res);
                }, (error) => {
                    if (error.status === 422) {
                        this.ajaxValidate(error);
                    }
                });
            } else {
                this.groupService.create(data).subscribe(res => {
                    this.notifySer.notify('success', 'Thêm thành công!');
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
