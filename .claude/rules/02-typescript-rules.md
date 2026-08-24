# TypeScript Rules - Pharma Store (RX20)

> Rules cho TypeScript, models, interfaces, và type safety

## 1. MODEL DEFINITIONS

### Interface Pattern
```typescript
// {module}.model.ts
export interface Product {
  id: number;
  name: string;
  code: string;
  barcode?: string;
  price: number;
  unit: string;
  quantity: number;
  created_at?: string;
  updated_at?: string;
}

// Nested relationships
export interface Invoice {
  id: number;
  code: string;
  customer: Customer;
  items: InvoiceItem[];
  total: number;
  status: string;
}
```

### Filter Class Pattern (extend ApiFilterBase)
```typescript
export class ProductFilter extends ApiFilterBase {
  name = '';
  code = '';
  category_id = '';
  status = '';

  getModelSearch() {
    return 'ProductSearch';  // Backend model search name
  }
}
```

### Response Wrapper (khi cần)
```typescript
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  // Pagination từ HTTP headers, không từ body
}
```

---

## 2. TYPE SAFETY

### Tránh `any` type
```typescript
// BAD
loadData(): any { ... }
onSelect(item: any) { ... }

// GOOD
loadData(): void { ... }
onSelect(item: Product) { ... }
```

### Typed HTTP calls
```typescript
// BAD
this.httpClient.get(url);

// GOOD
this.httpClient.get<Product[]>(url, { observe: 'response' });
this.httpClient.post<Product>(url, body);
```

### Optional chaining & nullish coalescing
```typescript
// Dùng optional chaining cho nested access
const name = customer?.contact?.name ?? 'N/A';

// Guard null trong template
<span>{{ item?.product?.name }}</span>
```

---

## 3. ENUM & CONSTANTS

### Dùng constants cho status/type values
```typescript
// Trong model file hoặc file riêng
export const INVOICE_STATUS = {
  DRAFT: 0,
  CONFIRMED: 1,
  CANCELLED: 2,
} as const;

export const PAYMENT_METHODS = {
  CASH: 'cash',
  BANK: 'bank',
  CARD: 'card',
} as const;
```

---

## 4. RXJS PATTERNS

### Subscribe & Unsubscribe
```typescript
export class MyComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    const sub = this.service.getData().subscribe(data => {
      this.data = data;
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
```

### Pipe operators
```typescript
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

// Search with debounce
this.searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(term => this.service.search(term))
).subscribe(results => {
  this.dataSource = results;
});
```

### CombineLatest cho multiple streams
```typescript
import { combineLatest } from 'rxjs';

combineLatest([
  this.categoryService.getList(),
  this.unitService.getList(),
]).subscribe(([categories, units]) => {
  this.categories = categories;
  this.units = units;
});
```

---

## 5. FORMATTING & STYLE

### Prettier config (đã có .prettierrc.json)
```json
{
  "tabWidth": 2,
  "useTabs": false,
  "singleQuote": true,
  "semi": true,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "trailingComma": "es5",
  "printWidth": 80
}
```

### Import order
```typescript
// 1. Angular core
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

// 2. Third-party libraries
import * as moment from 'moment';
import { NotifierService } from 'angular-notifier';

// 3. App modules (services, models, components)
import { ProductService } from './product.service';
import { Product, ProductFilter } from './product.model';
import { BaseComponent } from '../shared/base';
```

---

## 6. NUMBER & CURRENCY FORMATTING

```typescript
import * as numeral from 'numeral';

// Format currency (VND)
numeral(1234567).format('0,0');  // "1,234,567"

// In template, dùng Angular pipe
{{ price | number:'1.0-0' }}     // "1,234,567"
```

---

## 7. DO's & DON'Ts

```
DO:
- Define interfaces cho mọi model
- Extend ApiFilterBase cho filter classes
- Type HTTP responses
- Dùng optional chaining (?.) cho nested access
- Unsubscribe mọi Observable
- Dùng const assertions cho constants

DON'T:
- KHÔNG dùng `any` khi có thể define type
- KHÔNG forget getModelSearch() trong filter class
- KHÔNG subscribe mà không unsubscribe
- KHÔNG hardcode strings cho status/type values
- KHÔNG dùng var (dùng const/let)
- KHÔNG mutate input data trực tiếp
```

---

**Version**: 1.0
**Last Updated**: 2026-03-26
