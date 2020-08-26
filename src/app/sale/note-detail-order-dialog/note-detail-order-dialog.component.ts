import { Component, OnInit, Inject, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService } from '../order.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-note-detail-order-dialog',
  templateUrl: './note-detail-order-dialog.component.html',
  styleUrls: ['./note-detail-order-dialog.component.css']
})
export class NoteDetailOrderDialogComponent implements OnInit {

  local_data: any;
  id: string;
  i: string;
  product_unit_id: string;
  note_detail_sale: string;
  constructor(
    public dialogRef: MatDialogRef<NoteDetailOrderDialogComponent>,
    private orderService: OrderService,
    private fb: FormBuilder,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    this.local_data = { ...data };
    this.i = this.local_data.i;
    this.product_unit_id = this.local_data.product_unit_id;
    this.note_detail_sale = this.local_data.note_detail_sale;
  }

  public form: FormGroup;

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {

    this.form = this.fb.group({
      noteDetailOrder: [
        this.note_detail_sale,
        Validators.compose([
          Validators.required,
          Validators.maxLength(32)
        ])
      ],
    });
  }

  submit() {
    this.orderService.updateNoteDetailOrder(this.i, this.form.controls['noteDetailOrder'].value);
    this.dialogRef.close();
  }

}
