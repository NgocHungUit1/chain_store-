# API & Service Rules - Pharma Store (RX20)

> Rules cho HTTP services, API calls, và data flow

## 1. SERVICE STRUCTURE

### Standard Service Pattern

```typescript
@Injectable({
  providedIn: 'root',  // Hoặc provided trong module
})
export class ProductService {
  private baseUrl = environment.apiUrl;

  constructor(private httpClient: HttpClient) {}

  // GET list (với pagination headers)
  getList(filter: string) {
    return this.httpClient.get<Product[]>(
      this.baseUrl + '/products?' + filter,
      { observe: 'response' }
    );
  }

  // GET detail
  getById(id: number) {
    return this.httpClient.get<Product>(
      this.baseUrl + '/products/' + id
    );
  }

  // POST create
  create(data: Partial<Product>) {
    return this.httpClient.post<Product>(
      this.baseUrl + '/products',
      data
    );
  }

  // PUT update
  update(id: number, data: Partial<Product>) {
    return this.httpClient.put<Product>(
      this.baseUrl + '/products/' + id,
      data
    );
  }

  // DELETE
  delete(id: number) {
    return this.httpClient.delete(
      this.baseUrl + '/products/' + id
    );
  }
}
```

---

## 2. API CONVENTIONS

### URL Patterns
```
GET    /v1/{resource}              → List (with filter query params)
GET    /v1/{resource}/{id}         → Detail
POST   /v1/{resource}              → Create
PUT    /v1/{resource}/{id}         → Update
DELETE /v1/{resource}/{id}         → Delete
```

### Filter Query Params (qua ApiFilterBase.toFilterString())
```
?page=1&pageSize=15&sort=-created_at&ProductSearch[name]=abc&ProductSearch[status]=1
```

### Pagination Response (HTTP Headers)
```
X-Pagination-Total-Count: 250   → Tổng records
X-Pagination-Per-Page: 15       → Records per page
X-Pagination-Current-Page: 1    → Trang hiện tại
```

### Sort Convention
```
sort=name          → ASC by name
sort=-name         → DESC by name (prefix -)
sort=-created_at   → DESC by created_at (mặc định)
```

---

## 3. AUTHENTICATION

### Token Flow
1. Login → API trả token → `AuthService.setToken(token)` → localStorage
2. `AuthTokenInterceptor` tự thêm `Authorization: Bearer {token}` vào mọi request
3. `AuthInterceptor` handle 401 → redirect to login

### Auth Service Usage
```typescript
// Check logged in
const token = this.authService.getToken();

// Check permission
const permissions = this.authService.getPermissionsFromLocalStorage();
const canEdit = permissions.includes('product.update');

// Login
this.authService.login(username, password).subscribe(res => {
  this.authService.setToken(res.token);
  this.authService.setPermissions(res.permissions);
});
```

---

## 4. ERROR HANDLING

### Trong Service (nếu cần xử lý chung)
```typescript
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

getList(filter: string) {
  return this.httpClient.get<Product[]>(url, { observe: 'response' }).pipe(
    catchError(error => {
      console.error('API Error:', error);
      return throwError(error);
    })
  );
}
```

### Trong Component
```typescript
this.service.create(data).subscribe(
  res => {
    this.notifier.notify('success', 'Tạo thành công');
    this.loadData();
  },
  err => {
    this.notifier.notify('error', err.error?.message || 'Có lỗi xảy ra');
  }
);
```

---

## 5. DATA FLOW PATTERNS

### List Page Flow
```
1. Component.ngOnInit()
2. → loadData()
3. → service.getList(filter.toFilterString())
4. → API GET /v1/{resource}?page=1&pageSize=15&...
5. ← Response: body = data[], headers = pagination
6. → reloadFilter(res)  // Update pagination
7. → dataSource = res.body
8. → Template renders table + paginator
```

### Form Submit Flow
```
1. User fills form
2. → onSubmit()
3. → Validate form (form.invalid check)
4. → service.create(form.value) hoặc service.update(id, form.value)
5. ← API Response
6. → Success: notify + redirect/reload
7. → Error: notify error message
```

### Dialog Flow
```
1. Parent opens dialog: dialog.open(DialogComponent, { data })
2. Dialog component processes data
3. Dialog closes: dialogRef.close(result)
4. Parent receives result: dialogRef.afterClosed().subscribe(result => ...)
5. Parent reloads data if needed
```

---

## 6. SPECIAL SERVICES

### OptionStoreService (shared options/dropdown data)
```typescript
// Cached dropdown data - dùng cho select boxes
this.optionStoreService.getCategories()
this.optionStoreService.getUnits()
this.optionStoreService.getPaymentMethods()
```

### InvoiceTemplateService (print/preview)
```typescript
// Invoice printing
this.invoiceTemplateService.getTemplate(templateId)
this.printService.print(invoiceHtml)
this.previewService.preview(invoiceHtml)
```

### SharedDataService (cross-component communication)
```typescript
// Share data between unrelated components
this.sharedDataService.setData('key', value);
this.sharedDataService.getData('key');
```

---

## 7. ENVIRONMENT CONFIG

```typescript
// src/environments/environment.ts (dev)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:31080/v1',
  defaultInvoiceTemplate: 0
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.rx20.vn/v1',
  defaultInvoiceTemplate: 0
};
```

---

## 8. DO's & DON'Ts

```
DO:
- Dùng environment.apiUrl cho base URL
- Observe 'response' khi cần pagination headers
- Return Observable từ service (không subscribe trong service)
- Handle errors trong component với user-friendly messages
- Dùng AuthService cho authentication state

DON'T:
- KHÔNG hardcode API URLs
- KHÔNG subscribe trong service (trả Observable cho component)
- KHÔNG ignore error handling
- KHÔNG gọi API mà không có loading state
- KHÔNG store sensitive data ngoài localStorage token
- KHÔNG bypass AuthTokenInterceptor (nó tự thêm Bearer token)
```

---

**Version**: 1.0
**Last Updated**: 2026-03-26
