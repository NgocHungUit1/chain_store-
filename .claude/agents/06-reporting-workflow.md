# Reporting & Export - Pharma Store (RX20)

## Tổng quan

Hệ thống báo cáo toàn diện bao gồm báo cáo bán hàng, tồn kho, công nợ, nhân viên, và báo cáo cuối ngày.

## Các loại báo cáo

### 1. Sale Report (Báo cáo bán hàng)
- Doanh thu theo ngày/tuần/tháng
- Top sản phẩm bán chạy
- Doanh thu theo nhân viên
- Doanh thu theo khách hàng
- Doanh thu theo nhóm sản phẩm

### 2. Product Report (Báo cáo tồn kho)
- Tồn kho hiện tại
- Sản phẩm sắp hết hạn
- Sản phẩm tồn kho thấp
- Xuất nhập tồn kho theo kỳ
- Giá trị hàng tồn kho

### 3. Debt Report (Báo cáo công nợ)
- Công nợ nhà cung cấp (debt-suppliers)
- Công nợ khách hàng (debt-customers)
- Chi tiết công nợ theo đối tác
- Hạn thanh toán

### 4. Employee Report (Báo cáo nhân viên)
- Hiệu suất bán hàng
- Chấm công
- Doanh thu theo nhân viên

### 5. Day Report (Báo cáo cuối ngày)
- Tổng hợp doanh thu trong ngày
- Số lượng đơn hàng
- Phương thức thanh toán
- Tiền mặt tồn quỹ

### 6. Invoice Report (Báo cáo hóa đơn)
- Thống kê hóa đơn theo trạng thái
- Hóa đơn chưa thanh toán
- Hóa đơn đã hủy

## Filter Pattern

Tất cả báo cáo đều sử dụng pattern chung:
```typescript
// Filter class extend ApiFilterBase
export class SaleReportFilter extends ApiFilterBase {
  start_date = '';
  end_date = '';
  employee_id = '';
  customer_id = '';
  category_id = '';

  getModelSearch() {
    return 'SaleReportSearch';
  }
}
```

## Chart Libraries

Dự án sử dụng nhiều thư viện chart:

| Library | Usage |
|---------|-------|
| **ApexCharts** (`ng-apexcharts`) | Charts chính (line, bar, pie) |
| **Chart.js** (`ng2-charts`) | Alternative charts |
| **ngx-charts** (`@swimlane/ngx-charts`) | Advanced visualizations |
| **D3.js** | Custom data visualizations |
| **Chartist** (`ng-chartist`) | Lightweight charts |

## Export Formats

### Excel Export
```typescript
import * as XLSX from 'xlsx';

// Export table data to Excel
const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
XLSX.writeFile(wb, 'report.xlsx');
```

### PDF Export
```typescript
import * as jsPDF from 'jspdf';
import domtoimage from 'dom-to-image';

// Capture DOM element as image then create PDF
domtoimage.toPng(element).then(dataUrl => {
  const doc = new jsPDF();
  doc.addImage(dataUrl, 'PNG', 0, 0, width, height);
  doc.save('report.pdf');
});
```

## Dashboard

### Module: `/dashboard`
- Dashboard chính (`dashboard-main/`)
- Hiển thị KPIs: doanh thu, đơn hàng, khách hàng mới
- Charts: biểu đồ doanh thu, top sản phẩm
- Quick actions: bán hàng, nhập kho
