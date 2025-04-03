import { Component, OnInit, Inject, ViewChild, ElementRef, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.interface';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Parcel } from '../../models/parcel.interface';
import { QualityCheckStatus } from '../../models/quality-check.interface';
import { NotifierService } from 'angular-notifier';

interface ProductRow {
  index: number;
  productId: string;
  productNo: string;
  productName: string;
  selectedLot: string;
  lotOptions: Parcel[];
  quantity: string;
  quantityOfStock: string;
  unit: string;
  reason: string;
  qualityNote: string;
  result: number;
  qualityClassification: string;
  id?: number;
}

@Component({
  selector: 'app-quality-control-create-modal',
  templateUrl: './quality-control-create-modal.component.html',
  styleUrls: ['./quality-control-create-modal.component.scss']
})
export class QualityControlCreateModalComponent implements OnInit {
  mainForm: FormGroup;
  infoForm: FormGroup;
  searchResults: Product[] = [];
  isLoading = false;
  productRows: ProductRow[] = [];
  currentIndex = 1;
  isEdit = false;
  defaultQualityNote = 'Đạt';
  searchText = '';
  filteredRows: ProductRow[] = [];
  pageSize = 10;
  currentPage = 1;
  totalPages = 1;

  // Thêm các tùy chọn cứng
  reasonOptions = [
    'Định kỳ',
    'Đột xuất',
    'Kiểm tra định kỳ',
    'Kiểm tra chất lượng'
  ];

  qualityNoteOptions = [
    'Đạt',
    'Không đạt',
    'Tốt',
    'Không tốt',
    'Đạt yêu cầu',
    'Không đạt yêu cầu'
  ];

  resultOptions = [
    { value: 1, label: 'Đạt' },
    { value: 0, label: 'Không đạt' }
  ];

  @ViewChild('searchInput') searchInput: ElementRef;
  private searchTimer: any;

  constructor(
    private dialogRef: MatDialogRef<QualityControlCreateModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { isEdit: boolean; qualityCheck: any },
    private fb: FormBuilder,
    private productService: ProductService,
    private notifyService: NotifierService
  ) {
    this.isEdit = data?.isEdit || false;
    this.mainForm = this.fb.group({
      productSearch: ['']
    });

    this.infoForm = this.fb.group({
      timeType: ['Ngày'],
      date: [new Date()],
      title: ['Số kiểm soát chất lượng định kỳ đợt xuất ngày'],
      reason: [''],
      note: ['']
    });

    if (this.isEdit && data.qualityCheck) {
      this.loadEditData(data.qualityCheck);
    }
  }

  ngOnInit(): void {
    if (this.isEdit && this.data?.qualityCheck) {
      // Nếu là chế độ chỉnh sửa, load dữ liệu từ qualityCheck
      this.loadEditData(this.data.qualityCheck);
    } else {
      // Nếu là chế độ tạo mới, load tất cả sản phẩm
      this.loadAllProducts();
    }

    // Add search listener
    this.mainForm.get('productSearch')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(keyword => {
          if (!keyword || keyword.length < 2) {
            return of([]);
          }
          this.isLoading = true;
          return this.productService.searchProducts(keyword);
        })
      )
      .subscribe({
        next: (results) => {
          this.searchResults = results;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });

    if (!this.isEdit) {
      this.productRows.forEach(row => {
        if (!row.qualityNote) {
          row.qualityNote = 'Đạt';
        }
      });
    }

    // Khởi tạo danh sách đã lọc
    this.filteredRows = [...this.productRows];
  }

  async selectProduct(product: Product): Promise<void> {
    this.isLoading = true;
    try {
      const parcels = await this.productService.getParcelsByProduct(product.id.toString()).toPromise();

      const newRow: ProductRow = {
        index: this.currentIndex++,
        productId: product.id.toString(),
        productNo: product.product_no,
        productName: product.product_name,
        selectedLot: '',
        lotOptions: parcels || [],
        quantity: '0',
        quantityOfStock: '0',
        unit: product.base_unit,
        reason: '',
        qualityNote: this.defaultQualityNote,
        result: 1,
        qualityClassification: 'Loại A'
      };

      this.productRows.push(newRow);

      // Xóa kết quả tìm kiếm
      this.searchResults = [];

      // Xóa input
      if (this.searchInput && this.searchInput.nativeElement) {
        this.searchInput.nativeElement.value = '';
      }
    } catch (error) {
      console.error('Error fetching parcels:', error);
      this.notifyService.notify('error', 'Có lỗi xảy ra khi lấy thông tin lô hàng');
    } finally {
      this.isLoading = false;
    }
  }

  removeRow(index: number): void {
    this.productRows = this.productRows.filter(row => row.index !== index);
  }

  formatLotDisplay(parcel: Parcel): string {
    const expirationDate = new Date(parcel.expiration_date);
    const formattedDate = expirationDate.toLocaleDateString('vi-VN');
    return `${parcel.parcel_no} - ${formattedDate}`;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  private loadEditData(qualityCheck: any) {
    this.infoForm.patchValue({
      date: new Date(qualityCheck.date),
      title: qualityCheck.title,
      reason: qualityCheck.reason,
      note: qualityCheck.note
    });

    // Load product details
    qualityCheck.details.forEach(async (detail: any) => {
      try {
        const product = {
          id: detail.product_id,
          product_no: detail.product_info.product_no,
          product_name: detail.product_info.product_name,
          base_unit: detail.product_info.base_unit
        };

        const parcels = await this.productService.getParcelsByProduct(product.id.toString()).toPromise();

        const newRow: ProductRow = {
          index: this.currentIndex++,
          productId: product.id.toString(),
          productNo: product.product_no,
          productName: product.product_name,
          selectedLot: detail.parcel_no,
          lotOptions: parcels || [],
          quantity: detail.quantity.toString(),
          quantityOfStock: detail.parcel_info.quantity_of_stock,
          unit: product.base_unit,
          reason: detail.note,
          qualityNote: detail.quality_comment,
          result: detail.result,
          qualityClassification: detail.quality_classification
        };

        this.productRows.push(newRow);
      } catch (error) {
        console.error('Error loading product details:', error);
      }
    });
  }

  onSubmit(): void {
    this.productRows.forEach(row => {
      if (!row.qualityNote) {
        row.qualityNote = 'Đạt';
      }
    });

    if (this.infoForm.valid && this.productRows.length > 0) {
      const formattedDate = this.formatDate(this.infoForm.get('date')?.value);

      const payload = {
        no: this.isEdit ? this.data.qualityCheck.no : '',
        date: formattedDate,
        title: this.infoForm.get('title')?.value,
        reason: this.infoForm.get('reason')?.value,
        note: this.infoForm.get('note')?.value,
        status: QualityCheckStatus.COMPLETED,
        details: this.productRows.map(row => {
          const selectedParcel = row.lotOptions.find(lot => lot.parcel_no === row.selectedLot);
          return {
            id: this.isEdit ? row.id : undefined,
            product_id: parseInt(row.productId),
            warehouse_product_parcel_id: selectedParcel?.id,
            parcel_no: row.selectedLot,
            expiration_date: selectedParcel?.expiration_date,
            quantity: parseInt(row.quantity),
            result: row.result,
            note: row.reason,
            quality_comment: row.qualityNote,
            quality_classification: row.qualityClassification
          };
        })
      };

      this.isLoading = true;
      const request = this.isEdit ?
        this.productService.updateQualityControl(this.data.qualityCheck.id, payload) :
        this.productService.createQualityControl(payload);

      request.subscribe({
        next: (response) => {
          this.notifyService.notify('success', this.isEdit ? 'Cập nhật thành công' : 'Tạo mới thành công');
          this.dialogRef.close(response);
        },
        error: (error) => {
          console.error('Error:', error);
          this.notifyService.notify('error', this.isEdit ? 'Có lỗi xảy ra khi cập nhật' : 'Có lỗi xảy ra khi tạo mới');
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Add new method to handle lot selection
  onLotChange(row: ProductRow): void {
    const selectedParcel = row.lotOptions.find(lot => lot.parcel_no === row.selectedLot);
    if (selectedParcel) {
      row.quantity = selectedParcel.quantity_of_stock;
      row.quantityOfStock = selectedParcel.quantity_of_stock;
    }
  }

  refreshData(): void {
    // Implementation of refreshData method
  }

  onSearchInput(event: Event) {
    // Clear previous timer
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    // Get input value
    const input = event.target as HTMLInputElement;
    const keyword = input.value.trim();

    // Set new timer with shorter delay
    this.searchTimer = setTimeout(() => {
      this.performSearch(keyword);
    }, 100); // Giảm xuống 100ms thay vì 300ms
  }

  private performSearch(keyword: string) {
    if (!keyword || keyword.length < 2) {
      this.searchResults = [];
      return;
    }

    this.isLoading = true;
    this.productService.searchProducts(keyword).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error searching products:', error);
        this.searchResults = [];
        this.isLoading = false;
      }
    });
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const searchContainer = document.querySelector('.search-container');
    const target = event.target as HTMLElement;

    if (searchContainer && !searchContainer.contains(target)) {
      this.searchResults = [];
    }
  }

  ngAfterViewInit() {
    // Focus vào input search sau khi modal được hiển thị
    setTimeout(() => {
      if (this.searchInput && this.searchInput.nativeElement) {
        this.searchInput.nativeElement.focus();
      }
    }, 300);
  }

  // Thêm phương thức mới để load tất cả sản phẩm
  loadAllProducts(): void {
    this.isLoading = true;
    this.productService.getAllParcels().subscribe({
      next: (response) => {
        console.log('API Response:', response);
        this.processAllProductsData(response);
        console.log('ProductRows after processing:', this.productRows);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
        this.notifyService.notify('error', 'Có lỗi xảy ra khi tải dữ liệu sản phẩm');
      }
    });
  }

  // Thêm phương thức để xử lý dữ liệu từ API
  processAllProductsData(data: any[]): void {
    // Reset danh sách sản phẩm hiện tại
    this.productRows = [];
    this.currentIndex = 1;

    // Xử lý và thêm từng sản phẩm vào bảng
    if (Array.isArray(data)) {
      data.forEach(item => {
        // Kiểm tra xem item.product có tồn tại không
        if (!item.product) {
          console.warn('Product information missing:', item);
          return; // Skip this item
        }

        // Tạo đối tượng Parcel từ dữ liệu API
        const parcel: Parcel = {
          id: item.warehouse_product_id,
          parcel_no: item.parcel_no,
          expiration_date: item.expiration_date,
          quantity_of_stock: item.quantity_of_stock
        };

        // Tạo ProductRow để hiển thị
        const productRow: ProductRow = {
          index: this.currentIndex++,
          productId: item.product?.id || '',
          productNo: item.product?.product_no || '',
          productName: item.product?.product_name || '',
          selectedLot: item.parcel_no,
          lotOptions: [parcel],
          quantity: item.quantity_of_stock,
          quantityOfStock: item.quantity_of_stock,
          unit: item.product?.base_unit || '',
          reason: '',
          qualityNote: this.defaultQualityNote,
          result: 1,
          qualityClassification: 'Loại A'
        };

        this.productRows.push(productRow);
      });
    }

    // Cập nhật danh sách đã lọc và phân trang
    this.filteredRows = [...this.productRows];
    this.totalPages = Math.ceil(this.filteredRows.length / this.pageSize);
    this.currentPage = 1;
  }

  // Thêm phương thức lọc dữ liệu
  filterData(): void {
    if (!this.searchText) {
      this.filteredRows = [...this.productRows];
    } else {
      const searchLower = this.searchText.toLowerCase();
      this.filteredRows = this.productRows.filter(row =>
        row.productNo.toLowerCase().includes(searchLower) ||
        row.productName.toLowerCase().includes(searchLower)
      );
    }

    // Cập nhật tổng số trang và reset về trang 1
    this.totalPages = Math.ceil(this.filteredRows.length / this.pageSize);
    this.currentPage = 1;
  }

  // Phương thức xử lý sự kiện tìm kiếm
  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchText = input.value;
    this.filterData();
  }

  // Phương thức lấy danh sách dòng cho trang hiện tại
  getCurrentPageRows(): ProductRow[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredRows.slice(startIndex, startIndex + this.pageSize);
  }

  // Phương thức chuyển trang
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Thêm Math object để sử dụng trong template
  Math = Math;
}
