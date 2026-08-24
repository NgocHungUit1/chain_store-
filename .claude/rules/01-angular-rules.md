# Angular Rules - Pharma Store (RX20)

> Rules cho Angular components, modules, routing, và patterns

## 1. MODULE STRUCTURE

### Tạo Module Mới

Mỗi feature module PHẢI:
- Lazy-loaded trong `app.routing.ts`
- Có file routing riêng `{module}.routing.ts`
- Import `DemoMaterialModule` nếu dùng Material components
- Import `SharedModule` nếu cần shared components

```typescript
// {module}.module.ts
@NgModule({
  declarations: [
    ModuleListComponent,
    ModuleFormComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(ModuleRoutes),
    DemoMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    SharedModule,
  ]
})
export class ModuleNameModule {}
```

### Routing

```typescript
// {module}.routing.ts
import { Routes } from '@angular/router';

export const ModuleRoutes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: ModuleListComponent },
      { path: ':id', component: ModuleDetailComponent },
    ]
  }
];
```

### Thêm route mới vào app.routing.ts
```typescript
// LUÔN lazy-load
{
  path: 'new-module',
  loadChildren: () => import('./new-module/new-module.module').then(m => m.NewModuleModule)
}
```

---

## 2. COMPONENT PATTERNS

### List Component (kế thừa ListComponentBase)

```typescript
export class ProductListComponent extends ListComponentBase implements OnInit {
  constructor(
    private productService: ProductService,
    private authSer: AuthService,
  ) {
    super();
    this.apiFilter = new ProductFilter();  // Extend ApiFilterBase
  }

  ngOnInit() {
    this.loadData();
  }

  loadData(summary = true) {
    this.loading = true;
    this.productService.getList(this.apiFilter.toFilterString())
      .subscribe(
        res => {
          this.dataSource = res.body;
          this.reloadFilter(res);  // Update pagination from headers
          this.loading = false;
        },
        err => { this.loading = false; }
      );
  }
}
```

### Form Component (với Reactive Forms)

```typescript
export class ProductFormComponent implements OnInit {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      code: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.productService.create(this.form.value).subscribe(
      res => { /* success */ },
      err => { /* error */ }
    );
  }
}
```

### Dialog Component (MatDialog)

```typescript
// Mở dialog
const dialogRef = this.dialog.open(PaymentDialogComponent, {
  width: '600px',
  data: { invoice: this.invoice }
});

dialogRef.afterClosed().subscribe(result => {
  if (result) { this.loadData(); }
});

// Dialog component
export class PaymentDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  onClose() { this.dialogRef.close(); }
  onSave() { this.dialogRef.close(this.result); }
}
```

---

## 3. LAYOUT SYSTEM

Project có 3 layouts:

| Layout | Path | Dùng cho |
|--------|------|----------|
| `FullComponent` | `/dashboard`, `/transaction`, `/invoice`, ... | Main app (sidebar + header) |
| `CartComponent` | `/sale` | POS bán hàng (không sidebar) |
| `AppBlankComponent` | `/authentication` | Login, register, 404 |

### Thêm route vào đúng layout
```typescript
// Trong app.routing.ts - chọn đúng parent component
// FullComponent cho trang quản lý thông thường
{ path: '', component: FullComponent, children: [{ path: 'new-feature', ... }] }

// CartComponent cho trang bán hàng
{ path: '', component: CartComponent, children: [{ path: 'sale', ... }] }
```

---

## 4. MATERIAL COMPONENTS

### Import Material
- KHÔNG import trực tiếp Material modules trong feature module
- Dùng `DemoMaterialModule` đã được config sẵn trong `demo-material-module.ts`

### Common Material Patterns
```html
<!-- Data Table với MatPaginator -->
<mat-table [dataSource]="dataSource">
  <ng-container matColumnDef="name">
    <mat-header-cell *matHeaderCellDef mat-sort-header>Tên</mat-header-cell>
    <mat-cell *matCellDef="let row">{{ row.name }}</mat-cell>
  </ng-container>
  <mat-header-row *matHeaderRowDef="displayColumns"></mat-header-row>
  <mat-row *matRowDef="let row; columns: displayColumns;"></mat-row>
</mat-table>

<mat-paginator [length]="pageTotalCount" [pageSize]="apiFilter.pageSize"
  [pageSizeOptions]="pageSizeOptions" (page)="onMatPageChange($event)">
</mat-paginator>

<!-- Confirm Delete -->
<button mat-icon-button (click)="openDeleteDialog(item)">
  <mat-icon>delete</mat-icon>
</button>
```

---

## 5. PERMISSIONS

### Check permission trong component
```typescript
// Kế thừa BaseComponent
export class MyComponent extends BaseComponent {
  constructor(authSer: AuthService) { super(authSer); }
}

// Trong template
<button *ngIf="canDo('product.create')" (click)="onCreate()">Thêm mới</button>
```

---

## 6. NOTIFICATION

```typescript
import { NotifierService } from 'angular-notifier';

constructor(private notifier: NotifierService) {}

// Success
this.notifier.notify('success', 'Lưu thành công');

// Error
this.notifier.notify('error', 'Có lỗi xảy ra');

// Warning
this.notifier.notify('warning', 'Cảnh báo');
```

---

## 7. DATE HANDLING

```typescript
import * as moment from 'moment';

// Date range filter (pattern từ ListComponentBase)
ranges: any = {
  'Hôm nay': [moment(), moment()],
  '7 ngày trước': [moment().subtract(6, 'days'), moment()],
  'Tháng này': [moment().startOf('month'), moment().endOf('month')],
};

// Format date
moment(date).format('DD/MM/YYYY');
moment(date).unix();  // Timestamp cho API
```

---

## 8. DO's & DON'Ts

```
DO:
- Lazy-load mọi feature module
- Kế thừa ListComponentBase cho list pages
- Dùng DemoMaterialModule thay vì import từng Material module
- Dùng MatDialog cho dialogs/modals
- Dùng NotifierService cho notifications
- Cleanup subscriptions trong ngOnDestroy
- Dùng FormGroup với Validators cho forms

DON'T:
- KHÔNG import Material modules trực tiếp trong feature module
- KHÔNG tạo module mà không lazy-load
- KHÔNG forget unsubscribe Observable
- KHÔNG dùng ngModel cho complex forms (dùng Reactive Forms)
- KHÔNG hardcode API URLs (dùng environment.apiUrl)
- KHÔNG thêm component vào AppModule (trừ global dialogs)
```

---

**Version**: 1.0
**Last Updated**: 2026-03-26
