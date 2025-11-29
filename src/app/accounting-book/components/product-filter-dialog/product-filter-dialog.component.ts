import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { AccountingBookService } from '../../services/accounting-book.service';
import { Product } from '../../models/product.interface';

@Component({
  selector: 'app-product-filter-dialog',
  templateUrl: './product-filter-dialog.component.html',
  styleUrls: ['./product-filter-dialog.component.scss']
})
export class ProductFilterDialogComponent implements OnInit {
  searchControl = new FormControl('');
  productList: Product[] = [];
  isLoading = false;
  selectedProduct: Product | null = null;

  constructor(
    public dialogRef: MatDialogRef<ProductFilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { currentProduct: Product | null },
    private accountingBookService: AccountingBookService
  ) {
    if (data && data.currentProduct) {
      this.selectedProduct = data.currentProduct;
    }
  }

  ngOnInit(): void {
    // Load all products when dialog opens
    this.loadAllProducts();

    // Setup search with API call
    let searchTimeout: any;
    this.searchControl.valueChanges.subscribe((keyword: string) => {
      // Clear previous timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Debounce search
      searchTimeout = setTimeout(() => {
        if (keyword && keyword.trim().length >= 2) {
          this.isLoading = true;
          this.accountingBookService.searchProductsForDialog(keyword.trim()).subscribe({
            next: (products: Product[]) => {
              this.productList = products;
              this.isLoading = false;
            },
            error: (error: any) => {
              console.error('Error searching products:', error);
              this.isLoading = false;
            }
          });
        } else if (!keyword || keyword.trim().length === 0) {
          // If empty, reload all products
          this.loadAllProducts();
        }
      }, 400);
    });
  }

  loadAllProducts(): void {
    this.isLoading = true;
    this.accountingBookService.getAllProducts().subscribe({
      next: (products: Product[]) => {
        this.productList = products;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
      }
    });
  }

  selectProduct(product: Product): void {
    this.selectedProduct = product;
  }

  onConfirm(): void {
    if (this.selectedProduct) {
      this.dialogRef.close(this.selectedProduct);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }
}
