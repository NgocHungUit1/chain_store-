import { Component, OnInit } from '@angular/core';
import { OrderService } from '../order.service';
import { Observable } from 'rxjs';
import { PriceList, PriceListFilter } from '../../price-book/price-list.model';
import { PriceListService } from '../../price-book/price-list.service';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { PriceListProductService } from '../../price-book/price-list-product.service';
import { Customer } from '../../customer/customer.model';
import { catchError, debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { CustomerService } from '../../customer/customer.service';
import { MatDialog } from '@angular/material/dialog';
import { DiscountSiderbarDialogComponent } from '../discount-siderbar-dialog/discount-siderbar-dialog.component';
import { PaymentSiderbarDialogComponent } from '../payment-siderbar-dialog/payment-siderbar-dialog.component';
import { SaleCustomerFormDialogComponent } from '../sale-customer-form-dialog/sale-customer-form-dialog.component';
import { UserService } from '../user.service';
import { User } from '../user.model';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-sale-siderbar-order',
  templateUrl: './sale-siderbar-order.component.html',
  styleUrls: ['./sale-siderbar-order.component.css'],
})


export class SaleSiderbarOrderComponent implements OnInit {

  today: number = Date.now();
  listProduct: any = [];
  countProduct: number = 0;
  sumPrice: number = 0;
  numberDiscount: number = 0; // use for view
  discount: number = 0; // use for payment
  discount_type: number = 1; // use for payment
  customerPay: number = 0;
  priceLists: PriceList[] = [];
  priceListCommon: PriceList;
  form: FormGroup;
  selectCustomer = new FormControl();
  selectUser = new FormControl();


  public filteredCustomers: Observable<Customer[]>;
  public filteredUsers: Observable<User[]>;

  constructor(
    private orderService: OrderService,
    private priceListSer: PriceListService,
    private fb: FormBuilder,
    private priceListProductSer: PriceListProductService,
    private customerService: CustomerService,
    private dialog: MatDialog,
    private userService: UserService,
    private notifySer: NotifierService,
  ) { }

  initForm() {
    this.form = this.fb.group({
      userID: [null],
      priceBookID: [null],
      noteSiderBar: [null]
    });
  }

  onSelectedCustomer(customer) {
    this.orderService.addCustomer(customer);
    this.selectCustomer.patchValue(customer.name);
  }

  onSelectedUser(user) {
    this.selectUser.patchValue(user.username);
    this.form.patchValue({
      'userID': user.id
    });
  }

  loadData() {
    const priceListFilter = new PriceListFilter();
    this.priceListSer.getList(priceListFilter).subscribe(res => {
      this.priceLists = res.body;
      this.priceLists.forEach((element, index) => {
        if (element.is_default === 1) {
          this.form.patchValue({
            priceBookID: element.id,
          });
          this.orderService.addPriceBookID(element.id);
          this.priceListCommon = element;
        }
      });
    });


    this.orderService.subscribeObjectOrder.subscribe(res => {
      if (res !== null && res['listProduct'] !== undefined) {
        const obj = res['listProduct'];
        this.listProduct = [];
        this.countProduct = 0;
        for (const prop of Object.keys(obj)) {
          this.listProduct.push(obj[prop]);
          this.countProduct++;
        }
        this.listProduct.reverse();
      }

      // sum price khi khoi tao
      const priceBookID = this.form.controls['priceBookID'].value;
      const list = this.listProduct;
      if (priceBookID !== null && Array.isArray(list)) {

        const listProductChoose = list.map(obj => obj.product.id);
        const common_id = priceBookID;
        // // tien hanh xu ly add common vao list
        this.priceListProductSer.getListProductCommon(common_id, listProductChoose).subscribe(resCommon => {
          if (Array.isArray(resCommon)) {
            const priceListProductCommonExist = resCommon;
            // code group array by key
            const group = priceListProductCommonExist.reduce((r, a) => {
              r[a.product_id] = [...r[a.product_id] || [], a];
              return r;
            }, {});
            // add common || null
            // neu co gia chung se chon common_price 
            this.sumPrice = 0;
            this.listProduct.forEach(elementData => {
              if (group[elementData.product.id] !== undefined) {
                if (elementData.product.end_price === undefined) {
                  this.sumPrice += group[elementData.product.id][0]['price'] * elementData.amount; // gia chung * so luong
                } else {
                  this.sumPrice += elementData.product.end_price * elementData.amount; // gia chung * so luong
                }
              } else {
                if (elementData.product.end_price === undefined) {
                  this.sumPrice += elementData.product.sell_price * elementData.amount; // gia ban * so luong
                } else {
                  this.sumPrice += elementData.product.end_price * elementData.amount; // gia ban * so luong
                }
              }

            });
          }
        });
      }

    });

    // sum price

    this.orderService.subscribePriceBookID.subscribe(pricebookID => {

      const priceBookID = pricebookID;
      const list = this.listProduct;
      if (priceBookID !== null && Array.isArray(list)) {

        const listProductChoose = list.map(obj => obj.product.id);
        const common_id = priceBookID;
        // // tien hanh xu ly add common vao list
        this.priceListProductSer.getListProductCommon(common_id, listProductChoose).subscribe(resCommon => {
          if (Array.isArray(resCommon)) {
            const priceListProductCommonExist = resCommon;
            // code group array by key
            const group = priceListProductCommonExist.reduce((r, a) => {
              r[a.product_id] = [...r[a.product_id] || [], a];
              return r;
            }, {});
            // add common || null
            // neu co gia chung se chon common_price 
            this.sumPrice = 0;
            this.listProduct.forEach(elementData => {
              if (group[elementData.product.id] !== undefined) {
                this.sumPrice += group[elementData.product.id][0]['price'] * elementData.amount; // gia chung * so luong
              } else {
                this.sumPrice += elementData.product.sell_price * elementData.amount; // gia ban * so luong
              }
            });
          }
        });
      }

    });

    // discount 
    this.orderService.subscribeDiscountSiderBar.subscribe(res => {
      if (res !== null) {
        if (res.type === 'vnd') {
          this.numberDiscount = res.number;
          this.discount_type = 1;
        } else {
          this.numberDiscount = this.sumPrice * res.number / 100;
          this.discount_type = 2;
        }
        this.discount = res.number;
      } else {
        this.numberDiscount = 0;
      }
    });

    // customerPay
    this.orderService.subscribePaymentSiderBar.subscribe(res => {
      if (res !== null) {
        this.customerPay = res.number;
      } else {
        this.customerPay = 0;
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.loadData();

    this.filteredCustomers = this.selectCustomer.valueChanges.pipe(
      startWith(''),
      // delay emits
      debounceTime(300),
      // use switch map so as to cancel previous subscribed events, before creating new once
      switchMap(value => {
        if (value !== '') {
          // lookup from github
          return this.lookupCustomer(value);
        } else {
          // if no value is present, return null
          return of(null);
        }
      })
    );

    // tim kiem nhan vien
    this.filteredUsers = this.selectUser.valueChanges.pipe(
      startWith(''),
      // delay emits
      debounceTime(300),
      // use switch map so as to cancel previous subscribed events, before creating new once
      switchMap(value => {
        if (value !== '') {
          // lookup from github
          return this.lookupUser(value);
        } else {
          // if no value is present, return null
          return of(null);
        }
      })
    );


  }

  lookupCustomer(value: string): Observable<Customer[]> {
    return this.customerService.autocomplete(value).pipe(
      // map the item property of the github results as our return object
      map(results => results),
      // catch errors
      catchError(_ => {
        return of(null);
      })
    );
  }

  lookupUser(value: string): Observable<User[]> {
    return this.userService.autocomplete(value).pipe(
      // map the item property of the github results as our return object
      map(results => results),
      // catch errors
      catchError(_ => {
        return of(null);
      })
    );
  }

  choosePriceBook(event: any) {
    this.orderService.addPriceBookID(this.form.controls['priceBookID'].value);
  }

  openDiscountSiderBar() {
    const dialogRef = this.dialog.open(DiscountSiderbarDialogComponent, {
      width: '30%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      // this.loadData();
    });
  }

  openPaymentSiderBarDialog() {
    const dialogRef = this.dialog.open(PaymentSiderbarDialogComponent, {
      width: '40%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      // this.loadData();
    });
  }

  openSaleCustomerFormDialogComponent() {
    const dialogRef = this.dialog.open(SaleCustomerFormDialogComponent, {
      width: '40%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.orderService.addCustomer(result);
      this.selectCustomer.patchValue(result.name);
    });
  }
  // ------------------------------------------------------ PAYMENT ----------------------------------------------------------//
  payment() {
    const customer = this.orderService.getCustomer();
    if (customer === null) {
      this.notifySer.notify('warning', 'Chưa chọn khách hàng !');
      return;
    }
    if (this.form.controls['userID'].value === null) {
      this.notifySer.notify('warning', 'Chưa chọn nhân viên !');
      return;
    }
    if (this.customerPay === 0) {
      this.notifySer.notify('warning', 'Chưa chọn thanh toán !');
      return;
    }
    if (this.sumPrice - this.numberDiscount >= this.customerPay) {
      this.notifySer.notify('warning', 'Thanh toán chưa đủ !');
      return;
    }
    this.orderService.setLoadProduct(true);
    const paymentSiderBar =  this.orderService.getPaymentSiderBar();
    // console.log(paymentSiderBar);
    // return;
    
    const list = this.listProduct;
    const invoiceDetail = [];
    list.forEach(element => {
      let price = 0;
      let discount = 0;
      let discount_type = 1;
      if (element.product.end_price === undefined) {
        price = element.common_price;
      } else {
        price = element.product.end_price;
      }
      if (element.product?.discount_type === 'percent') {
        discount_type = 2;
      }

      if (element.product?.discount !== undefined) {
        discount = element.product?.discount;
      }
      invoiceDetail.push({
        product_id: element.product.id,
        amount: element.amount,
        price: price,
        note: element.product?.note_detail_sale,
        discount: discount,
        discount_type: discount_type,
      });
    });

    const dataInvoice = {
      Invoice: {
        customer_id: customer?.id,
        total: this.sumPrice, // tong tien hang
        discount: this.discount,
        discount_type: this.discount_type,
        note: this.form.controls['noteSiderBar'].value,
        price_book_id: this.form.controls['priceBookID'].value,
        // created_by: this.form.controls['userID'].value, @NGHIA store id
      },
      InvoiceDetail: invoiceDetail,
      PaymentMethod: paymentSiderBar.type,
    };

    this.orderService.saleOrder(dataInvoice).subscribe(res => {
      if (res === true) {
        this.resetDataSiderBar();
        this.loadData();
        this.notifySer.notify('success', 'Lưu thành công !');
      } else {
        this.notifySer.notify('warning', 'Thất bại !');
      }
      this.orderService.setLoadProduct(false);
      this.orderService.setLoadDetailPage(true);
    });
  }

  resetDataSiderBar() {
    this.orderService.resetDATA(); //@nghia
    this.orderService.addCustomer(null);
    this.selectCustomer.patchValue(null);
    this.selectUser.patchValue(null);
    this.form.patchValue({
      'userID': [null]
    });
  }


}
