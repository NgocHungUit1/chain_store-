import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { GroupService } from '../group.service';
import { Group } from '../group.model';
import { GroupFormDialogComponent } from '../group-form-dialog/group-form-dialog.component';


@Component({
  selector: 'app-group-tab-info',
  templateUrl: './group-tab-info.component.html',
  styleUrls: ['./group-tab-info.component.css']
})
export class GroupTabInfoComponent implements OnInit {

  @Input() group: Group;
  @Output() reload: EventEmitter<any> = new EventEmitter();

  constructor(
      private groupService: GroupService,
      private dialog: MatDialog,
      private notifyService: NotifierService,
  ) {
  }

  ngOnInit(): void {
  }

  openGroupFormDialog(id) {
    const obj = {
      action: 'Update',
      title: 'Cập nhật khách hàng',
      group_id: id,
    };

    const dialogRef = this.dialog.open(GroupFormDialogComponent, {
      data: obj,
      width: '600px',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadModel(result.id);
        this.reload.emit(null);
      }
    });
  }

  loadModel(id) {
    this.groupService.getDetail(id, 'branch').subscribe(res => {
      this.group = res;
    });
  }

  clickDelete() {
    this.groupService.delete(this.group.id).subscribe(res => {
      if (res?.success === true) {
        this.notifyService.notify('success', res?.message);
        this.reload.emit(null);
      } else {
        this.notifyService.notify('warning', res?.message);
      }
    });
  }

}
