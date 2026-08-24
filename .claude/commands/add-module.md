# Tạo Angular Module Mới

Tạo feature module mới cho dự án Pharma Store (RX20) theo chuẩn project.

**Module cần tạo:** $ARGUMENTS

## QUY TRÌNH

### Bước 1: Xác định yêu cầu
1. Tên module (kebab-case): ví dụ `price-book`
2. Cần CRUD? (list, create, edit, delete)
3. Cần dialog components nào?
4. API endpoints nào?
5. Model/interface nào?

### Bước 2: Tạo files theo cấu trúc chuẩn

```
/src/app/{module-name}/
├── {module-name}.module.ts           # NgModule
├── {module-name}.routing.ts          # Routes
├── {module-name}.service.ts          # API service
├── {module-name}.model.ts            # Models + Filter
├── {module-name}-list/               # List component
│   ├── {module-name}-list.component.ts
│   ├── {module-name}-list.component.html
│   └── {module-name}-list.component.scss
├── {module-name}-form/               # Form component (nếu cần)
│   ├── {module-name}-form.component.ts
│   ├── {module-name}-form.component.html
│   └── {module-name}-form.component.scss
└── {module-name}-dialog/             # Dialog (nếu cần)
    └── ...
```

### Bước 3: Implement theo thứ tự

1. **Model** (`{module}.model.ts`):
   - Interface cho entity
   - Filter class extend `ApiFilterBase`
   - Override `getModelSearch()`

2. **Service** (`{module}.service.ts`):
   - Inject HttpClient
   - CRUD methods: getList, getById, create, update, delete
   - Dùng `environment.apiUrl`
   - Return Observable, observe 'response' cho list

3. **List Component** (`{module}-list/`):
   - Extend `ListComponentBase`
   - Implement `loadData()` với service
   - Template: mat-table + mat-paginator + filters
   - Loading state + error handling

4. **Form Component** (`{module}-form/`):
   - Reactive Forms với FormBuilder
   - Validators cho required fields
   - Submit → service.create/update

5. **Module** (`{module}.module.ts`):
   - Declare components
   - Import: CommonModule, RouterModule.forChild, DemoMaterialModule, FormsModule, ReactiveFormsModule, FlexLayoutModule, SharedModule

6. **Routing** (`{module}.routing.ts`):
   - List route: `{ path: '', component: ListComponent }`
   - Detail/form routes nếu cần

7. **App Routing** (`app.routing.ts`):
   - Thêm lazy-loaded route trong FullComponent children

### Bước 4: Verify

```bash
npx tsc --noEmit
```

### Bước 5: Báo cáo
```
## Module đã tạo: {module-name}

### Files:
1. [path] - [mô tả]
2. ...

### Routes:
- /{route-path} → List
- /{route-path}/:id → Detail (nếu có)

### Cách test:
1. Navigate to /{route-path}
2. Kiểm tra list load data
3. Kiểm tra CRUD operations
4. Kiểm tra pagination/filter/sort
```
