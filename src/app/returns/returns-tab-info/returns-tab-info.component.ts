import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Returns } from '../returns.model';
import { NationalPharmacyV2ConnectDialogComponent } from '../../common/national-pharmacy-v2/national-pharmacy-v2-connect-dialog/national-pharmacy-v2-connect-dialog.component';
import { NationalPharmacyV2Service } from '../../common/national-pharmacy-v2/national-pharmacy-v2.service';

@Component({
  selector: 'app-returns-tab-info',
  templateUrl: './returns-tab-info.component.html',
  styleUrls: ['./returns-tab-info.component.css']
})
export class ReturnsTabInfoComponent implements OnInit {

  @Input() detail: object[];

  /** Phiếu trả hàng, cần cho chức năng liên thông CSDL Dược quốc gia */
  @Input() model: Returns;

  displayedColumns: string[] = ['#', 'product_no', 'product_name', 'base_unit', 'amount', 'price', 'total_price'];

  columnsHeader = {
    '#': '#',
    'product_no': 'Mã sản phẩm',
    'product_name': 'Tên sản phẩm',
    'base_unit': 'Đơn vị',
    'amount': 'Số lượng',
    'price': 'Giá bán',
    'total_price': 'Thành tiền'
  };

  constructor(
    private dialog: MatDialog,
    public npV2Service: NationalPharmacyV2Service
  ) {
  }

  ngOnInit(): void {
  }

  /** Dialog liên thông đang mở — chặn mở thêm khi người dùng bấm nút nhiều lần */
  npV2DialogOpen = false;

  /**
   * Liên thông phiếu khách trả hàng lên CSDL Dược quốc gia v1.1
   * (POST /transactions/stock-in, lý do "Nhập trả lại từ khách hàng" — mục 6.4.1).
   *
   * Số lô được backend lấy theo lô đã bán trên hoá đơn gốc.
   */
  connectV2() {
    if (this.npV2DialogOpen) {
      return;
    }
    this.npV2DialogOpen = true;

    const dialogRef = this.dialog.open(NationalPharmacyV2ConnectDialogComponent, {
      width: '520px',
      data: {
        source: 'returns',
        id: this.model.id,
        referenceNumber: this.model.return_no,
        transaction: this.model.nationalPharmacyV2,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.npV2DialogOpen = false;

      if (result && result.event === 'changed') {
        this.model.nationalPharmacyV2 = result.transaction;
      }
    });
  }
}
