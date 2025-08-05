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
  dateFrom: Date | null = null;
  dateTo: Date | null = null;

  // Thêm các tùy chọn cứng
  reasonOptions = [
    'Bao bì nguyên vẹn',
    'Thuốc không biến màu',
    'Không bị biến dạng'
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
    @Inject(MAT_DIALOG_DATA) public data: { isEdit: boolean; qualityCheck: any; qualityCheckDetail: any },
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
      this.loadEditData();
    }
  }

  ngOnInit(): void {
    // Khởi tạo các tùy chọn
    this.reasonOptions = [
      'Bao bì nguyên vẹn',
      'Thuốc không biến màu',
      'Không bị biến dạng'
    ];
    this.qualityNoteOptions = [
      'Đạt',
      'Không đạt',
      'Tốt',
      'Không tốt',
      'Đạt yêu cầu',
      'Không đạt yêu cầu'
    ];

    // Kiểm tra nếu là chế độ chỉnh sửa
    if (this.isEdit && this.data?.qualityCheck) {
      // Nếu là chế độ chỉnh sửa, load dữ liệu từ API thông qua data đã được truyền vào
      this.loadEditData();
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
    console.log('Removing row with index:', index);
    console.log('Before removal - total rows:', this.productRows.length);

    // Tìm và xóa dòng từ danh sách chính
    const rowIndex = this.productRows.findIndex(row => row.index === index);
    if (rowIndex !== -1) {
      this.productRows.splice(rowIndex, 1);

      // Cập nhật lại STT cho tất cả các dòng
      this.productRows.forEach((row, i) => {
        row.index = i + 1;
      });

      // Cập nhật lại danh sách đã lọc
      this.filteredRows = [...this.productRows];

      // Tính lại tổng số trang
      this.totalPages = Math.ceil(this.filteredRows.length / this.pageSize);

      // Đảm bảo trang hiện tại không vượt quá tổng số trang
      if (this.currentPage > this.totalPages && this.totalPages > 0) {
        this.currentPage = this.totalPages;
      } else if (this.totalPages === 0) {
        this.currentPage = 1;
      }

      // Hiển thị thông báo
      this.notifyService.notify('success', 'Đã xóa sản phẩm khỏi danh sách');
    }

    console.log('After removal - total rows:', this.productRows.length);
    console.log('Current page:', this.currentPage, 'Total pages:', this.totalPages);
  }

  formatLotDisplay(parcel: Parcel): string {
    const expirationDate = new Date(parcel.expiration_date);
    const formattedDate = expirationDate.toLocaleDateString('vi-VN');
    return `${parcel.parcel_no} - ${formattedDate}`;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  private loadEditData(): void {
    // Lấy dữ liệu từ data đã được truyền vào
    const qualityCheck = this.data.qualityCheck;
    const qualityCheckDetail = this.data.qualityCheckDetail;

    // Cập nhật thông tin form
    this.infoForm.patchValue({
      date: new Date(qualityCheck.date),
      title: qualityCheck.title || `Sổ kiểm soát chất lượng định kỳ đột xuất ngày ${this.formatDateForTitle(new Date(qualityCheck.date))}`,
      reason: qualityCheck.reason || '',
      note: qualityCheck.note || ''
    });

    // Kiểm tra xem có dữ liệu chi tiết không
    if (qualityCheckDetail && qualityCheckDetail.details && qualityCheckDetail.details.length > 0) {
      // Xử lý dữ liệu chi tiết
      this.isLoading = true;

      // Chuyển đổi details thành productRows
      const details = qualityCheckDetail.details;
      this.currentIndex = 1;
      this.productRows = [];

      details.forEach(detail => {
        // Tạo đối tượng Parcel
        const parcel: Parcel = {
          id: detail.warehouse_product_parcel_id,
          parcel_no: detail.parcel_no,
          expiration_date: detail.expiration_date,
          quantity_of_stock: detail.quantity.toString()
        };

        // Tạo ProductRow
        const productRow: ProductRow = {
          index: this.currentIndex++,
          id: detail.id, // ID của chi tiết để cập nhật
          productId: detail.product_id.toString(),
          productNo: detail.product_info ? detail.product_info.product_no : '',
          productName: detail.product_info ? detail.product_info.product_name : '',
          selectedLot: detail.parcel_no,
          lotOptions: [parcel], // Thêm lô đã chọn
          quantity: detail.quantity.toString(),
          quantityOfStock: detail.parcel_info ? detail.parcel_info.quantity_of_stock : '',
          unit: detail.product_info ? detail.product_info.base_unit : '',
          reason: detail.note || '',
          qualityNote: detail.quality_comment || this.defaultQualityNote,
          result: detail.result,
          qualityClassification: detail.quality_classification || 'Loại A'
        };

        this.productRows.push(productRow);
      });

      // Cập nhật danh sách đã lọc và phân trang
      this.filteredRows = [...this.productRows];
      this.totalPages = Math.ceil(this.filteredRows.length / this.pageSize);
      this.currentPage = 1;

      this.isLoading = false;
    } else {
      console.warn('No details found in quality check detail response');
      this.isLoading = false;
    }
  }

  onSubmit(): void {
    // Đảm bảo tất cả các dòng đều có giá trị mặc định
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
            id: this.isEdit && row.id ? row.id : undefined, // Sử dụng ID từ dữ liệu nếu là chế độ chỉnh sửa
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

      // Log để kiểm tra
      console.log('Submit payload:', payload);

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
          this.isLoading = false;
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
    this.productService.getAllQualityControlProducts().subscribe({
      next: (data) => {
        this.processAllProductsData(data);
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.notifyService.notify('error', 'Có lỗi xảy ra khi tải dữ liệu sản phẩm');
      }
    });
  }

  processAllProductsData(data: any[]): void {
    this.productRows = [];
    this.currentIndex = 1;

    if (Array.isArray(data)) {
      data.forEach(item => {
        if (!item.product) {
          console.warn('Product information missing:', item);
          return; // Skip this item
        }

        const parcel: Parcel = {
          id: item.id,
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

  searchByDate() {
    const filter: any = {};
    if (this.dateFrom) filter.date_from = this.formatDate(this.dateFrom);
    if (this.dateTo) filter.date_to = this.formatDate(this.dateTo);
    this.isLoading = true;
    this.productService.getAllQualityControlProducts(filter).subscribe({
      next: (data) => {
        this.processAllProductsData(data);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.notifyService.notify('error', 'Có lỗi xảy ra khi tải dữ liệu sản phẩm');
      }
    });
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

  // Thêm phương thức formatDateForTitle
  formatDateForTitle(date: Date): string {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
