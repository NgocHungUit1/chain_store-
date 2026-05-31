import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {ProductService} from '../product.service';
import {Product} from '../product.model';
import {ProductMedicineDialogComponent} from '../product-medicine-dialog/product-medicine-dialog.component';
import {ProductMerchandiseFormDialogComponent} from '../product-merchandise-form-dialog/product-merchandise-form-dialog.component';
import {ProductPopupDeleteDialogComponent} from '../product-popup-delete-dialog/product-popup-delete-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {IdCodeFormDialogComponent} from '../id-code-form-dialog/id-code-form-dialog.component';
import {MedicineService} from '../../medicine/medicine.service';
import {Router} from '@angular/router';
import {PopupConfirmDialogComponent} from '../../common/popup-confirm-dialog/popup-confirm-dialog.component';
import {BaseComponent} from '../../shared/base';
import {AuthService} from '../../authentication/auth.service';

const JsBarcode = require('jsbarcode');

@Component({
  selector: 'app-product-tab-info',
  templateUrl: './product-tab-info.component.html',
  styleUrls: ['./product-tab-info.component.css']
})
export class ProductTabInfoComponent extends BaseComponent implements OnChanges {

  @Input() product_id: string;
  @Input() expandedElement: boolean;
  @Output() reload: EventEmitter<any> = new EventEmitter();
  product: Product;
  images: string[] = [];
  imageIndex = 0;

  allPermission: any;
  isAdminStore: boolean;

  constructor(
    private medicineService: MedicineService,
    private productSer: ProductService,
    public notifySer: NotifierService,
    public authSer: AuthService,
    private dialog: MatDialog,
    private router: Router
  ) {
    super(authSer);
  }

  textType = {
    'medicine': 'Thuốc',
    'merchandise': 'Hàng hóa'
  };


  ngOnChanges(changes: SimpleChanges): void {
    if (this.expandedElement) {
      this.productSer.getDetail(this.product_id, 'medicine,productUnits,productPlacements,group,images,quantity').subscribe(res => {
        this.product = <Product>res;
        const data = [];
        if (this.product.images.length === 0) {
          this.imageIndex = -1;
        } else {
          this.product.images.forEach(pImage => {
            data.push(pImage['link']);
          });
          this.images = data;
        }
      });

    }
    this.allPermission = sessionStorage.getItem('allPermission').split(',');
    this.isAdminStore = sessionStorage.getItem('isAdminStore') === 'true';
  }

  loadProduct(id) {
    this.productSer.getProducts(id, 'images,productPlacements,productUnits').subscribe(res => {
      this.product = res;
    });

  }

  openMedicineDialog(id, copy_product_id = null) {
    const obj = {
      action: copy_product_id !== null ? 'Copy' : 'Update',
      title: copy_product_id !== null ? 'Sao chép thuốc' : 'Cập nhật thuốc',
      product_id: id,
      copy_product_id: copy_product_id
    };

    const dialogRef = this.dialog.open(ProductMedicineDialogComponent, {
      data: obj,
      width: '60%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log(result);
      if (result.event === 'Save' && result.connect === true) {
        this.medicineService.connect(result.data.medicine_id).subscribe(res => {
          if (res['success']) {
            this.notifySer.notify('success', 'Liên thông thành công.');
          } else if (res['message'] !== undefined) {
            this.notifySer.notify('error', res['message']);
          }
        }, err => {
          if (err.error) {
            const messages = ([] as string[]).concat(...Object.values(err.error) as string[][]);
            messages.forEach(msg => this.notifySer.notify('error', msg));
          }
        });
      }
      // if (result.event === 'Update') {
      //   this.loadProduct(result.data.id);
      // }
      //
      // if (obj.action === 'Copy') {
      //   // debugger;
      //   this.productSer.setLoadProduct(false);
      // }

      if (result.event !== 'Cancel') {
        this.loadProduct(result.data.id);
        this.reload.emit(null);
      }
    });
  }

  openIdCodeFormDialog(product, useQuantity = true) {
    const obj = {
      printProductData: [{
        print_quantity: useQuantity? product['quantity']?.['number']||1: 30,
        product_no: product['product_no'],
        product_name: product['product_name'],
        selected_unit_id: product['productUnits'][0]['id'],
        product_units: product['productUnits'],
      }],
    };

    const dialogRef = this.dialog.open(IdCodeFormDialogComponent, {
      data: obj,
      width: '80%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  openMerchandiseFormDialog(id, copy_product_id = null) {

    const obj = {
      action: copy_product_id !== null ? 'Copy' : 'Update',
      title: copy_product_id !== null ? 'Sao chép hàng hóa' : 'Cập nhật hàng hóa',
      product_id: id,
      copy_product_id: copy_product_id
    };

    const dialogRef = this.dialog.open(ProductMerchandiseFormDialogComponent, {
      data: obj,
      width: '60%',
      minWidth: '750px',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.event !== 'Cancel') {
        this.loadProduct(result.data.id);
        this.reload.emit(null);
      }
    });
  }

  deleteMerchandise(id) {

    const obj = {
      action: 'Delete',
      title: 'Xóa hàng hóa',
      product_id: id,
    };

    const dialogRef = this.dialog.open(ProductPopupDeleteDialogComponent, {
      data: obj,
      width: '20%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.event === 'Delete') {
        // BUG
        this.product = null;
      }
    });
  }

  deleteMedicine(id) {
    const obj = {
      action: 'Delete',
      title: 'Xóa thuốc',
      product_id: id,
    };
    const dialogRef = this.dialog.open(ProductPopupDeleteDialogComponent, {
      data: obj,
      width: '20%',
      minHeight: '80%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.event === 'Delete') {
        // BUG
        this.product = null;
      }
    });
  }

  lock() {
    const obj = {
      action: 'Delete',
      title: 'Xác nhận tạm ngừng danh sách đã chọn.',
      content: '',
    };

    const dialogRef = this.dialog.open(PopupConfirmDialogComponent, {
      data: obj,
      width: '30%',
      minHeight: '60%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.event === 'confirm') {
        this.productSer.lock(this.product.id).subscribe(x => {
          this.product.status = '9';
          this.notifySer.notify('success', 'Đã tạm ngừng thành công!');
        });
      }
    });
  }



  delete() {
    const obj = {
      action: 'Delete',
      title: 'Xác nhận xóa sản phẩm "' + this.product.product_name + '"  đã chọn .',
      content: 'Bạn có xác nhận xoá sản phẩm khỏi cửa hàng.' +
        ' Sau khi xoá SP sẽ đặt lại số lượng SP tất cả chi nhánh bằng 0.' +
        ' Nếu chỉ muốn cập nhật lại số lượng SP cho 1 chi nhánh vui lòng tạo phiếu kiểm kho.',
    };
    const dialogRef = this.dialog.open(PopupConfirmDialogComponent, {
      data: obj,
      width: '30%',
      minHeight: '60%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.event === 'confirm') {
        this.productSer.delete(this.product.id).subscribe(x => {
          this.product.status = '9';
          this.notifySer.notify('success', 'Đã xóa thành công!');
          this.reload.emit(null);
        });
      }
    });
  }

  activate() {
    this.productSer.activate(this.product.id).subscribe(x => {
      this.product.status = '10';
      this.notifySer.notify('success', 'Đã kích hoạt thành công!');
    });
  }

  connectMedicine(product) {
    this.medicineService.connect(product.medicine_id).subscribe(res => {
      if (res['success']) {
        product['medicine']['medicine_no'] = res['medicine_no'];
        this.notifySer.notify('success', 'Liên thông thành công.');
      } else if (res['message'] !== undefined) {
        this.notifySer.notify('error', res['message']);
      }
    });
  }

  disConnectMedicine(product) {
    this.medicineService.disconnect(product.medicine_id).subscribe(res => {
      if (res['success']) {
        product['medicine']['medicine_no'] = null;
        this.notifySer.notify('success', 'Gỡ liên thông thành công.');
      } else if (res['message'] !== undefined) {
        this.notifySer.notify('error', res['message']);
      }
    });
  }

  goToWarehouseCreate() {
    localStorage.setItem('product_id', this.product_id);
    this.router.navigate(['/transaction/warehouse/create']);
  }

  goToStockTakeCreate() {
    localStorage.setItem('product_id', this.product_id);
    this.router.navigate(['/store/stock-take/create']);
  }

  goToMoveCreate() {
    localStorage.setItem('product_id', this.product_id);
    this.router.navigate(['/transaction/move/create']);
  }

  getPlacementNames(product: Product): string {
    if (!product?.productPlacements) {
      return '';
    }

    return product.productPlacements.map(p => p.name).join(', ');
  }


}
