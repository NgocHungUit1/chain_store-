# Lint & Type Check

Check TypeScript errors CHỈ cho các files đã thay đổi.

**Files cụ thể (nếu có):** $ARGUMENTS

## QUAN TRỌNG
- TUYỆT ĐỐI KHÔNG lint toàn bộ project
- CHỈ check files được chỉ định hoặc files vừa thay đổi

## QUY TRÌNH

### Bước 1: Xác định files cần check
Nếu user chỉ định files cụ thể → check files đó.
Nếu không → chạy `git diff --name-only` để tìm files đã thay đổi.

### Bước 2: Check TypeScript

```bash
# Full TypeScript check
npx tsc --noEmit

# Build check (dev)
npm run build -- --configuration=dev
```

### Bước 3: Báo cáo kết quả
- Files đã check
- Errors tìm thấy
- Suggestions để fix (nếu có)
