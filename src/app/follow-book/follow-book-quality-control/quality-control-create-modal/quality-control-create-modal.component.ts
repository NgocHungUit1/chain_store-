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
  parcelNo: string;
  expirationDate: string;
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
  productRows: ProductRow[] = []; // Hiển thị trên UI (phân trang)
  currentIndex = 1;
  isEdit = false;
  defaultQualityNote = 'Đạt';
  searchText = '';
  pageSize = 10;
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  dateFrom: Date | null = null;
  dateTo: Date | null = null;

  // Map để lưu user input (chỉ lưu những gì user THAY ĐỔI)
  userInputMap = new Map<number, {
    qualityNote: string;
    qualityClassification: string;
    result: number;
    reason: string;
  }>();

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
      // Nếu là chế độ tạo mới, load phân trang bình thường
      this.loadProductsByPage();
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
        parcelNo: '',
        expirationDate: '',
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
    const rowIndex = this.productRows.findIndex(row => row.index === index);
    if (rowIndex !== -1) {
      this.productRows.splice(rowIndex, 1);
      this.notifyService.notify('success', 'Đã xóa sản phẩm khỏi danh sách');
    }
  }

  formatLotDisplay(parcel: Parcel): string {
    if (!parcel.expiration_date) {
      return parcel.parcel_no;
    }

    let formattedDate = parcel.expiration_date;
    const dateObj = new Date(parcel.expiration_date);
    if (!isNaN(dateObj.getTime())) {
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = String(dateObj.getFullYear()).slice(-2);
      formattedDate = `${month}/${year}`;
    }

    return `${parcel.parcel_no} - ${formattedDate}`;
  }

  formatExpirationDate(expirationDate: string): string {
    if (!expirationDate) {
      return '';
    }
    return expirationDate;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  private loadEditData(): void {
    const qualityCheck = this.data.qualityCheck;
    const qualityCheckDetail = this.data.qualityCheckDetail;

    this.infoForm.patchValue({
      date: new Date(qualityCheck.date),
      title: qualityCheck.title || `Sổ kiểm soát chất lượng định kỳ đột xuất ngày ${this.formatDateForTitle(new Date(qualityCheck.date))}`,
      reason: qualityCheck.reason || '',
      note: qualityCheck.note || ''
    });

    if (qualityCheckDetail && qualityCheckDetail.details && qualityCheckDetail.details.length > 0) {
      this.isLoading = true;
      const details = qualityCheckDetail.details;
      this.currentIndex = 1;
      this.productRows = [];

      details.forEach(detail => {
        const parcel: Parcel = {
          id: detail.warehouse_product_parcel_id,
          parcel_no: detail.parcel_no,
          expiration_date: detail.expiration_date,
          quantity_of_stock: detail.quantity.toString()
        };

        const productRow: ProductRow = {
          index: this.currentIndex++,
          id: detail.id,
          productId: detail.product_id.toString(),
          productNo: detail.product_info ? detail.product_info.product_no : '',
          productName: detail.product_info ? detail.product_info.product_name : '',
          parcelNo: detail.parcel_no || '',
          expirationDate: this.formatExpirationDate(detail.expiration_date),
          selectedLot: detail.parcel_no,
          lotOptions: [parcel],
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

      this.isLoading = false;
    } else {
      console.warn('No details found in quality check detail response');
      this.isLoading = false;
    }
  }

  onSubmit(): void {
    if (!this.infoForm.valid) {
      this.notifyService.notify('error', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Nếu là chế độ edit, submit với productRows
    if (this.isEdit) {
      this.submitData(this.productRows);
      return;
    }

    // Nếu là chế độ tạo mới, lưu user input của page hiện tại trước
    this.saveCurrentPageUserInput();

    // Load TẤT CẢ data từ API
    this.isLoading = true;
    const filter: any = {
      page: 1,
      pageSize: 10000 // Load hết
    };

    if (this.dateFrom) {
      filter.date_from = this.formatDate(this.dateFrom);
    }
    if (this.dateTo) {
      filter.date_to = this.formatDate(this.dateTo);
    }

    this.productService.getAllQualityControlProducts(filter).subscribe({
      next: (response) => {
        const allData = response.body || [];

        // Merge với userInputMap
        const mergedData = this.mergeDataWithUserInput(allData);

        // Submit merged data
        this.submitData(mergedData);
      },
      error: (error) => {
        console.error('Error loading all products:', error);
        this.isLoading = false;
        this.notifyService.notify('error', 'Có lỗi xảy ra khi tải dữ liệu');
      }
    });
  }

  private saveCurrentPageUserInput(): void {
    // Lưu user input từ page hiện tại vào Map
    this.productRows.forEach(row => {
      this.userInputMap.set(row.index, {
        qualityNote: row.qualityNote,
        qualityClassification: row.qualityClassification,
        result: row.result,
        reason: row.reason
      });
    });
  }

  private mergeDataWithUserInput(allData: any[]): ProductRow[] {
    const mergedRows: ProductRow[] = [];
    let index = 1;

    allData.forEach(item => {
      if (!item.product) {
        return;
      }

      const expirationDate = item.warehouse_product_parcel?.expiration_date || item.expiration_date || '';

      const parcel: Parcel = {
        id: item.warehouse_product_parcel?.id || item.id,
        parcel_no: item.parcel_no,
        expiration_date: expirationDate,
        quantity_of_stock: item.quantity_of_stock
      };

      // Lấy user input nếu có
      const userInput = this.userInputMap.get(index);

      const productRow: ProductRow = {
        index: index,
        productId: item.product?.id || '',
        productNo: item.product?.product_no || '',
        productName: item.product?.product_name || '',
        parcelNo: item.parcel_no || '',
        expirationDate: this.formatExpirationDate(expirationDate),
        selectedLot: item.parcel_no,
        lotOptions: [parcel],
        quantity: item.quantity_of_stock,
        quantityOfStock: item.quantity_of_stock,
        unit: item.product?.base_unit || '',
        reason: userInput?.reason || '',
        qualityNote: userInput?.qualityNote || this.defaultQualityNote,
        result: userInput?.result || 1,
        qualityClassification: userInput?.qualityClassification || 'Loại A'
      };

      mergedRows.push(productRow);
      index++;
    });

    return mergedRows;
  }

  private submitData(rowsToSubmit: ProductRow[]): void {
    if (rowsToSubmit.length === 0) {
      this.notifyService.notify('error', 'Không có dữ liệu để tạo');
      this.isLoading = false;
      return;
    }

    const formattedDate = this.formatDate(this.infoForm.get('date')?.value);

    const payload = {
      no: this.isEdit ? this.data.qualityCheck.no : '',
      date: formattedDate,
      title: this.infoForm.get('title')?.value,
      reason: this.infoForm.get('reason')?.value,
      note: this.infoForm.get('note')?.value,
      status: QualityCheckStatus.COMPLETED,
      details: rowsToSubmit.map(row => {
        const selectedParcel = row.lotOptions.find(lot => lot.parcel_no === row.selectedLot);

        return {
          id: this.isEdit && row.id ? row.id : undefined,
          product_id: parseInt(row.productId),
          warehouse_product_parcel_id: selectedParcel?.id,
          parcel_no: row.selectedLot,
          expiration_date: selectedParcel?.expiration_date,
          quantity: parseInt(row.quantity),
          result: row.result,
          note: row.reason,
          quality_comment: row.qualityNote || 'Đạt',
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
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onLotChange(row: ProductRow): void {
    const selectedParcel = row.lotOptions.find(lot => lot.parcel_no === row.selectedLot);
    if (selectedParcel) {
      row.quantity = selectedParcel.quantity_of_stock;
      row.quantityOfStock = selectedParcel.quantity_of_stock;
    }
  }

  refreshData(): void {
  }

  onSearchInput(event: Event) {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    const input = event.target as HTMLInputElement;
    const keyword = input.value.trim();

    this.searchTimer = setTimeout(() => {
      this.performSearch(keyword);
    }, 100);
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
    setTimeout(() => {
      if (this.searchInput && this.searchInput.nativeElement) {
        this.searchInput.nativeElement.focus();
      }
    }, 300);
  }

  loadProductsByPage(): void {
    this.isLoading = true;

    const filter: any = {
      page: this.currentPage,
      pageSize: this.pageSize
    };

    if (this.dateFrom) {
      filter.date_from = this.formatDate(this.dateFrom);
    }
    if (this.dateTo) {
      filter.date_to = this.formatDate(this.dateTo);
    }

    this.productService.getAllQualityControlProducts(filter).subscribe({
      next: (response) => {
        const data = response.body || [];
        this.totalItems = parseInt(response.headers.get('X-Pagination-Total-Count') || '0');
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.processProductsData(data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
        this.notifyService.notify('error', 'Có lỗi xảy ra khi tải dữ liệu sản phẩm');
      }
    });
  }

  processProductsData(data: any[]): void {
    this.productRows = [];
    this.currentIndex = (this.currentPage - 1) * this.pageSize + 1;

    if (Array.isArray(data)) {
      data.forEach(item => {
        if (!item.product) {
          console.warn('Product information missing:', item);
          return;
        }

        const expirationDate = item.warehouse_product_parcel?.expiration_date || item.expiration_date || '';

        const parcel: Parcel = {
          id: item.warehouse_product_parcel?.id || item.id,
          parcel_no: item.parcel_no,
          expiration_date: expirationDate,
          quantity_of_stock: item.quantity_of_stock
        };

        const rowIndex = this.currentIndex++;

        // Kiểm tra xem user đã nhập data cho row này chưa
        const userInput = this.userInputMap.get(rowIndex);

        const productRow: ProductRow = {
          index: rowIndex,
          productId: item.product?.id || '',
          productNo: item.product?.product_no || '',
          productName: item.product?.product_name || '',
          parcelNo: item.parcel_no || '',
          expirationDate: this.formatExpirationDate(expirationDate),
          selectedLot: item.parcel_no,
          lotOptions: [parcel],
          quantity: item.quantity_of_stock,
          quantityOfStock: item.quantity_of_stock,
          unit: item.product?.base_unit || '',
          reason: userInput?.reason || '',
          qualityNote: userInput?.qualityNote || this.defaultQualityNote,
          result: userInput?.result || 1,
          qualityClassification: userInput?.qualityClassification || 'Loại A'
        };

        this.productRows.push(productRow);
      });
    }
  }


  searchByDate() {
    // Lưu user input của page hiện tại trước khi search lại
    this.saveCurrentPageUserInput();

    this.currentPage = 1;
    this.loadProductsByPage();
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchText = input.value;
  }

  onFieldChange(row: ProductRow): void {
    // Lưu user input vào Map ngay khi họ thay đổi
    this.userInputMap.set(row.index, {
      qualityNote: row.qualityNote,
      qualityClassification: row.qualityClassification,
      result: row.result,
      reason: row.reason
    });
  }

  getCurrentPageRows(): ProductRow[] {
    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      return this.productRows.filter(row =>
        row.productNo.toLowerCase().includes(searchLower) ||
        row.productName.toLowerCase().includes(searchLower)
      );
    }
    return this.productRows;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      // Lưu user input của page hiện tại vào Map trước khi chuyển trang
      this.saveCurrentPageUserInput();

      this.currentPage = page;
      this.loadProductsByPage();
    }
  }

  Math = Math;

  formatDateForTitle(date: Date): string {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
