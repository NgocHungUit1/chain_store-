import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ListComponentBase } from '../../../shared/base';
import { InventoryTrackingService } from '../../services/inventory-tracking.service';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-inventory-detail-modal',
  templateUrl: './inventory-detail-modal.component.html',
  styleUrls: ['./inventory-detail-modal.component.scss']
})
export class InventoryDetailModalComponent extends ListComponentBase implements OnInit {
  displayedColumns = ['stt', 'date', 'document_no', 'supplier', 'parcel_no', 'imports', 'exports', 'final_stock'];
  dataSource = [];
  productInfo: any;
  totalItems = 0;
  isLoadingResults = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public dialogRef: MatDialogRef<InventoryDetailModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private inventoryService: InventoryTrackingService,
    private notifyService: NotifierService
  ) {
    super();
  }

  ngOnInit(): void {
    this.productInfo = this.data.productInfo;
    this.page = 1;
    this.pageSize = 10;
    this.loadData();
  }

  loadData(): void {
    this.isLoadingResults = true;

    const filter = {
      page: this.page,
      pageSize: this.pageSize,
      product_id: this.productInfo.product.id
    };

    this.inventoryService.getProductStockCardDetails(filter).subscribe(
      response => {
        if (response && response.body) {
          this.processStockCardData(response.body);

          if (response.headers.get('X-Pagination-Total-Count')) {
            this.totalItems = parseInt(response.headers.get('X-Pagination-Total-Count'));
          }
        }
        this.isLoadingResults = false;
      },
      error => {
        console.error('Error loading stock card details:', error);
        this.isLoadingResults = false;
        this.notifyService.notify('error', 'Có lỗi xảy ra khi tải dữ liệu chi tiết');
      }
    );
  }

  processStockCardData(data: any[]): void {
    if (!data || data.length === 0) {
      this.dataSource = [];
      return;
    }

    // Khởi tạo danh sách hiển thị
    this.dataSource = data.map((item, index) => {
      return {
        stt: (this.page - 1) * this.pageSize + index + 1,
        date: item.date ? new Date(item.date) : null,
        document_no: item.no || '',
        supplier: item.supplier?.name || '',
        parcel_no: item.parcel_no || '',
        // Đảm bảo giá trị 0 thay vì null
        imports: item.quantity > 0 ? item.quantity : 0,
        exports: item.quantity < 0 ? Math.abs(item.quantity) : 0,
        final_stock: item.quantity_of_stock || 0,
        method: item.method || '',
      };
    });
  }

  onChangePage(event: any): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  exportExcel(): void {
    this.isLoadingResults = true;

    // Lấy product_id từ thông tin sản phẩm
    const productId = this.productInfo.product.id;

    this.inventoryService.exportStockCardToExcel(productId).subscribe(
      (response: any) => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Tạo tên file với thông tin sản phẩm
        const productName = this.productInfo.product.product_name || 'san-pham';
        const productCode = this.productInfo.product.product_no || '';
        const dateStr = new Date().toISOString().slice(0, 10);

        link.download = `chi-tiet-xuat-nhap-${productCode}-${productName}-${dateStr}.xlsx`;

        link.click();
        window.URL.revokeObjectURL(url);
        this.isLoadingResults = false;
        this.notifyService.notify('success', 'Xuất file Excel thành công');
      },
      error => {
        console.error('Error exporting Excel:', error);
        this.isLoadingResults = false;
        this.notifyService.notify('error', 'Có lỗi xảy ra khi xuất file Excel');
      }
    );
  }
}
