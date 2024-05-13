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
import { UserService } from '../../user/user.service';
import { User } from '../../user/user.model';
import { NotifierService } from 'angular-notifier';
import { ItemInvoice, ListInvoice } from '../order.model';

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
  discount_type: string = 'price'; // use for payment
  customerPay: number = 0;
  priceLists: PriceList[] = [];
  priceListCommon: PriceList;
  form: FormGroup;
  selectCustomer = new FormControl();
  selectUser = new FormControl();
  user: User = null;


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
    let userID = null;
    let priceBookID = null;
    let noteSiderBar = null;
    let listInvoice = this.orderService.getListInvoiceLocalStorage();
    const listItemInvoice = listInvoice.itemInvoice;
    listItemInvoice.forEach(element => {
      if (element.active === true) {
        userID = element?.user?.id;
        priceBookID = element?.price_book_id;
        noteSiderBar = element.noteSiderBar;
        this.selectUser.patchValue(element?.user?.username);
        this.selectCustomer.patchValue(element?.customer?.name); // add name khach hang
      }
    });
    this.form = this.fb.group({
      userID: [userID],
      priceBookID: [priceBookID],
      noteSiderBar: [noteSiderBar]
    });

  }

  onSelectedCustomer(customer) {
    let listInvoice = this.orderService.getListInvoiceLocalStorage();
    const listItemInvoice = listInvoice.itemInvoice;
    listItemInvoice.forEach(element => {
      if (element.active === true) {
        element.customer = customer;
      }
    });
    this.orderService.setListInvoiceLocalStorage(listInvoice);
    this.selectCustomer.patchValue(customer.name);
  }

  onSelectedUser(user) {
    let listInvoice = this.orderService.getListInvoiceLocalStorage();
    const listItemInvoice = listInvoice.itemInvoice;
    listItemInvoice.forEach(element => {
      if (element.active === true) {
        element.user = {
          id: user?.id,
          username: user?.username,
          email: user?.email
        };
      }
    });
    this.orderService.setListInvoiceLocalStorage(listInvoice);
    this.selectUser.patchValue(user?.username);
    this.form.patchValue({
      'userID': user?.id
    });
  }

  loadUserLogin() {
    this.userService.getUserLogin().subscribe(res => {
      this.user = res;
    });
  }

  loadData() {
    this.loadUserLogin();
    const priceListFilter = new PriceListFilter();
    // lay PriceBook
    this.priceListSer.getList(priceListFilter).subscribe(res => {
      this.priceLists = res.body;
      this.priceLists.forEach((element, index) => {
        if (element.is_default === 1) {
          // xu ly them price book id vao mac dinh
          const listInvoice = this.orderService.getListInvoiceLocalStorage();
          const listItemInvoice = listInvoice.itemInvoice;
          listItemInvoice.forEach(ele => {
            if (ele.active === true && ele.price_book_id === undefined) {
              ele.price_book_id = element.id;
              this.form.patchValue({
                priceBookID: element.id,
              });
            }
          });
          this.orderService.setListInvoiceLocalStorage(listInvoice);
          this.priceListCommon = element;
        }
      });

    });

    // NEW
    this.orderService.subscribeObjectListInvoice.subscribe(listInvoice => {
      const listItemInvoice = listInvoice.itemInvoice;
      let mItemInvoice = new ItemInvoice();
      listItemInvoice.forEach(element => {
        if (element.active === true) {
          mItemInvoice = element;
        }
      });

      // user
      if (mItemInvoice.user === undefined) {
        mItemInvoice.user = this.user;
        this.selectUser.patchValue(this.user?.username);
        this.form.patchValue({
          'userID': this.user?.id
        });
      }

      // price_book_id
      if (mItemInvoice.price_book_id !== undefined) {
        this.form.patchValue({
          priceBookID: mItemInvoice.price_book_id,
        });
      }

      // customer
      if (mItemInvoice.customer !== undefined) {
        this.selectCustomer.patchValue(mItemInvoice.customer?.name);
      } else {
        this.selectCustomer.patchValue(null);
      }

      this.countProduct = 0;

      if (mItemInvoice.listProduct === undefined || mItemInvoice.listProduct.length === 0) {
      } else {
        const listProduct = mItemInvoice.listProduct;
        this.listProduct = [];
        listProduct.forEach(eProductInfo => {
          this.listProduct.push(eProductInfo);
          this.countProduct++;
        });
        this.listProduct.reverse();
        // handel add common price
        // sum price khi khoi tao
        let priceBookID = this.form.controls['priceBookID'].value;
        let list = this.listProduct;
        if (priceBookID !== null && Array.isArray(list)) {
          mItemInvoice.price_book_id = priceBookID;

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
              // end_price : la gia cua san pham dc add truc tiep
              this.sumPrice = 0;
              this.listProduct.forEach(elementData => {
                if (group[elementData.product.id] !== undefined) {
                  elementData.common_price = group[elementData.product.id][0]['price'];
                  if (elementData.product.end_price === undefined) {
                    this.sumPrice += group[elementData.product.id][0]['price'] * elementData.amount; // gia chung * so luong
                  } else {
                    this.sumPrice += elementData.product.end_price * elementData.amount; // gia chung * so luong
                  }
                } else {
                  elementData.common_price = elementData.product.sell_price;
                  if (elementData.product.end_price === undefined) {
                    this.sumPrice += elementData.product.sell_price * elementData.amount; // gia ban * so luong
                  } else {
                    this.sumPrice += elementData.product.end_price * elementData.amount; // gia ban * so luong
                  }
                }
              });

            }

            // discount
            const discountSiderBar = mItemInvoice.discountSiderBar;
            if (discountSiderBar !== undefined) {
              if (discountSiderBar?.type === 'price') {
                this.numberDiscount = discountSiderBar?.number;
                this.discount_type = 'price';
              } else {
                this.numberDiscount = this.sumPrice * discountSiderBar?.number / 100;
                this.discount_type = 'precent';
              }
              this.discount = discountSiderBar?.number;
            } else {
              this.numberDiscount = 0;
            }
            // End Discount
          });
        }

        // customerPay
        const paymentSiderBar = mItemInvoice.paymentSiderBar;
        if (paymentSiderBar !== undefined) {
          this.customerPay = paymentSiderBar?.number;
        } else {
          this.customerPay = 0;
        }
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
    return this.customerService.autocomplete(value, null).pipe(
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
    const price_book_id = this.form.controls['priceBookID'].value;
    const listInvoice = this.orderService.getListInvoiceLocalStorage();
    const listItemInvoice = listInvoice.itemInvoice;
    listItemInvoice.forEach(element => {
      if (element.active === true) {
        element.price_book_id = price_book_id;
      }
    });
    listInvoice.itemInvoice = listItemInvoice;
    this.orderService.setListInvoiceLocalStorage(listInvoice);
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
      minWidth: '750px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.selectCustomer.patchValue(result?.name);
      }
    });
  }
  //----------------Print -------------//
  printInvoice(invoice_id: number) {
    // const printContent = document.getElementById("print");
    // const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
    // WindowPrt.document.write(printContent.innerHTML);
    // WindowPrt.document.close();
    // WindowPrt.focus();
    // WindowPrt.print();
    // WindowPrt.close();
    // const obj = { invoice_id: invoice_id };
    // const dialogRef = this.dialog.open(SalePrintInvoiceDialogComponent, {
    //   width: '40%',
    //   minWidth: '750px',
    //   data: obj
    // });

    // dialogRef.afterClosed().subscribe(result => {

    // });
  }
  // ------------------------------------------------------ PAYMENT ----------------------------------------------------------//
  payment() {
    // this.printInvoice(4);
    // return;


    let listInvoice = this.orderService.getListInvoiceLocalStorage();
    const listItemInvoice = listInvoice.itemInvoice;
    let mItemInvoice = new ItemInvoice();
    listItemInvoice.forEach(element => {
      if (element.active === true) {
        mItemInvoice = element;
      }
    });

    const customer = mItemInvoice.customer;
    if (mItemInvoice.customer === undefined) {
      this.notifySer.notify('warning', 'Chưa chọn khách hàng !');
      return;
    }
    if (mItemInvoice.user === undefined) {
      this.notifySer.notify('warning', 'Chưa chọn nhân viên !');
      return;
    }
    if (mItemInvoice.paymentSiderBar?.number === undefined) {
      this.notifySer.notify('warning', 'Chưa chọn thanh toán !');
      return;
    }
    if (this.sumPrice - mItemInvoice.discountSiderBar?.number > mItemInvoice.paymentSiderBar?.number) {
      this.notifySer.notify('warning', 'Thanh toán chưa đủ !');
      return;
    }
    if (mItemInvoice.listProduct === undefined || mItemInvoice.listProduct.length === 0) {
      this.notifySer.notify('warning', 'Chưa chọn sản phẩm !');
      return;
    }

    this.orderService.setLoadProduct(true);

    const list = this.listProduct;
    const invoiceDetail = [];
    list.forEach(element => {
      let price = 0;
      let discount = 0;
      let discount_type = 'price';
      if (element.product.end_price === undefined) {
        price = (element.common_price !== undefined) ? element.common_price : element.product.sell_price;
      } else {
        price = element.product.end_price;
      }
      if (element.product?.discount_type === 'percent') {
        discount_type = element.product?.discount_type;
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

    /**
     * Gang du lieu data
     */
    const dataInvoice = {
      Invoice: {
        invoice_id: mItemInvoice.invoice_id,
        customer_id: customer?.id,
        total_price: this.sumPrice, // tong tien hang
        discount: this.discount,
        discount_type: this.discount_type,
        note: this.form.controls['noteSiderBar'].value,
        price_book_id: this.form.controls['priceBookID'].value,
        // created_by: this.form.controls['userID'].value, @NGHIA store id
      },
      InvoiceDetail: invoiceDetail,
      PaymentMethod: mItemInvoice.paymentSiderBar?.type,
      PaymentPrice: this.sumPrice - this.numberDiscount, // tien thanh toan
    };

    /**
     * Kiem tra invoice_id la don moi hay don cap nhat
     */
    if (mItemInvoice.invoice_id < 0) {
      this.orderService.saleOrder(dataInvoice).subscribe(res => {
        if (res !== false) {
          this.resetDataSiderBar();
          this.loadData();
          this.notifySer.notify('success', 'Lưu thành công !');
        } else {
          this.notifySer.notify('warning', 'Thất bại !');
        }
        this.orderService.setLoadProduct(false);
        this.orderService.setLoadDetailPage(true);
      });
    } else {
      this.orderService.updateOrder(dataInvoice).subscribe(res => {
        if (res !== false) {
          this.resetDataSiderBar();
          this.loadData();
          this.notifySer.notify('success', 'Cập nhật đơn thành công !');
        } else {
          this.notifySer.notify('warning', 'Thất bại !');
        }
        this.orderService.setLoadProduct(false);
        this.orderService.setLoadDetailPage(true);
      });
    }

  }

  resetDataSiderBar() {
    this.orderService.removeActive(); //@nghia
    this.selectCustomer.patchValue(null);
    this.selectUser.patchValue(null);
    this.form.patchValue({
      'userID': [null]
    });
    this.sumPrice = 0;
    this.countProduct = 0;
  }

  saveNoteSiderBar(event: Event) {
    const note = (event.target as HTMLInputElement).value;
    const listInvoice = this.orderService.getListInvoiceLocalStorage();
    const listItemInvoice = listInvoice.itemInvoice;
    listItemInvoice.forEach(element => {
      if (element.active === true) {
        element.noteSiderBar = note;
      }
    });
    this.orderService.setListInvoiceLocalStorage(listInvoice);
  }


}
