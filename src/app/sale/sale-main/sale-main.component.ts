import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { Observable } from 'rxjs';
import { Product } from '../../product/product.model';
import { OrderService } from '../order.service';
import { catchError, debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { PriceList, PriceListFilter } from '../../price-book/price-list.model';
import { PriceListService } from '../../price-book/price-list.service';
import { NoteDetailOrderDialogComponent } from '../note-detail-order-dialog/note-detail-order-dialog.component';
import { PriceDetailOrderDialogComponent } from '../price-detail-order-dialog/price-detail-order-dialog.component';
import { PriceListProductService } from '../../price-book/price-list-product.service';
import { ItemInvoice } from '../order.model';
import { Customer } from '../../customer/customer.model';
import { SaleCustomerFormDialogComponent } from '../sale-customer-form-dialog/sale-customer-form-dialog.component';
import { PaymentSiderbarDialogComponent } from '../payment-siderbar-dialog/payment-siderbar-dialog.component';
import { DiscountSiderbarDialogComponent } from '../discount-siderbar-dialog/discount-siderbar-dialog.component';
import { CustomerService } from '../../customer/customer.service';
import { UserService } from '../../user/user.service';
import { User } from '../../user/user.model';
import * as numeral from 'numeral';

@Component({
  selector: 'app-sale-main',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './sale-main.component.html',
  styleUrls: ['./sale-main.component.css']
})
export class SaleMainComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private notifySer: NotifierService,
    private orderService: OrderService,
    private priceListSer: PriceListService,
    private priceListProductSer: PriceListProductService,
    private customerService: CustomerService,
    private userService: UserService,
  ) {

  }

  selectProduct = new FormControl();
  public filteredProducts: Observable<Product[]>;
  isLoadingResults = true;

  listProduct: any = [];
  countProduct = 0;

  today: number = Date.now();
  sumPrice = 0;
  numberDiscount = 0; // use for view
  discount = 0; // use for payment
  discount_type = 'price'; // use for payment
  customerPay = 0;
  tienThuaTraKhach = 0;
  tienKhachNo = 0;
  priceLists: PriceList[] = [];
  form: FormGroup;
  selectCustomer = new FormControl();
  selectUser = new FormControl();
  user: User = null;
  localItemInvoice: ItemInvoice;

  public filteredCustomers: Observable<Customer[]>;
  public filteredUsers: Observable<User[]>;

  //
  listProductUnitIdChooseOld: number[] = [];
  common_idOld: string;

  autoPrint = true;
  autoPrintInSoLo = false;

  changePriceBook = false;

  branchList: any;

  allPermission: any;
  isAdminStore: boolean;

  /**
   *  So sanh danh sach cu
   * @param listProductUnitIdChoose
   */
  compareEqualListProduct(listProductUnitIdChoose) {
    let fail = 1;
    listProductUnitIdChoose.forEach((value, index) => {
      if (this.listProductUnitIdChooseOld[index] === undefined || this.listProductUnitIdChooseOld[index] !== value) {
        fail = 0;
      }
    });
    return fail;
  }

  async loadData() {
    const mItemInvoice = this.getNewItemInvoice();

    await this.handleAddPriceBookExist(mItemInvoice);

    await this.handleAddCustomerExist(mItemInvoice);

    await this.handleDetailOrder(mItemInvoice);

    await this.handleDiscountSiderBar(mItemInvoice);

    await this.handlePaymentSiderBar(mItemInvoice);

    this.localItemInvoice = mItemInvoice;
  }

  getNewItemInvoice() {
    let mItemInvoice = new ItemInvoice();
    this.orderService.subscribeObjectListInvoice.subscribe(ListInvoice => {
      const listItemInvoice = ListInvoice.itemInvoice;
      listItemInvoice.forEach(element => {
        if (element.active === true) {
          mItemInvoice = element;
        }
      });
    });
    return mItemInvoice;
  }

  /**
   * Active User
   */
  handleActiveUser() {
    const listInvoice = this.orderService.getListInvoiceLocalStorage();
    const listItemInvoice = listInvoice.itemInvoice;
    listItemInvoice.forEach(element => {
      if (element.active === true) {

        if (element.user === undefined || element.user === null) {
          element.user = this.user;
          this.orderService.setListInvoiceLocalStorage(listInvoice);

        }
        this.selectUser.patchValue(element.user?.username);
        this.form.patchValue({
          'userID': element.user?.id
        });
      }
    });
  }

  /**
   *  Add price_book_id Exist
   */
  handleAddPriceBookExist(mItemInvoice) {
    if (mItemInvoice.price_book_id !== undefined) {
      this.form.patchValue({
        priceBookID: mItemInvoice.price_book_id,
      });
    }
  }

  /**
   * Add customer exist
   */
  handleAddCustomerExist(mItemInvoice) {
    this.selectCustomer.patchValue('Khách lẻ');
    if (mItemInvoice?.customer?.name !== undefined) {
      this.selectCustomer.patchValue(mItemInvoice?.customer?.name);
    }
  }

  /**
   * Xu ly cho detail order
   */
  handleDetailOrder(mItemInvoice) {
    this.countProduct = 0;
    if (mItemInvoice.listProduct === undefined || mItemInvoice.listProduct.length === 0) {
      this.listProduct = [];
    } else {
      const listProductSubscribe = mItemInvoice.listProduct;
      this.countProduct = 0;

      const listProductOLD = this.listProduct; // luu lai danh sach cu
      this.listProduct = [];

      listProductSubscribe.forEach(eProductInfo => {
        this.listProduct.push(eProductInfo);
        this.countProduct++;
      });

      // debugger;

      // handle add common price
      const priceBookID = mItemInvoice.price_book_id; // this.orderService.getPriceBookID();
      const list = this.listProduct;

      if (priceBookID !== null && Array.isArray(list) && this.listProduct !== null) {
        const listProductUnitIdChoose = list.map(obj => obj.product_unit_id);
        // debugger;
        // debugger;
        /**
         * Truong hop:  thay doi vs sl , pricebook
         *
         * this.common_idOld !== priceBookID
         */
        if (this.compareEqualListProduct(listProductUnitIdChoose) === 0 || this.changePriceBook == true) {
          this.listProductUnitIdChooseOld = listProductUnitIdChoose;
          this.common_idOld = priceBookID;
          const common_id = priceBookID;
          /**
           * tien hanh xu ly add common_price vao list
           */
          this.priceListProductSer.getListProductCommon(common_id, listProductUnitIdChoose).subscribe(resCommon => {
            if (Array.isArray(resCommon)) {
              const priceListProductCommonExist = resCommon;
              //
// debugger;
              /**
               * group = [ product_id] => [
               *          id,price,price_list_id,product_id
               *          ]
               * code group array by key
               */
              const group = priceListProductCommonExist.reduce((r, a) => {
                r[a.product_unit_id] = [...r[a.product_unit_id] || [], a];
                return r;
              }, {});

              /**
               * Tien hanh sumPrice , cap nhat common_price, neu khong co common_price se cho sell_price
               */
              this.sumPrice = 0;
              if (this.listProduct !== null) {
                this.listProduct.forEach(elementData => {
                  // debugger;
                  if (group[elementData.product_unit_id] !== undefined) {
                    elementData.common_price = group[elementData.product_unit_id][0]['price'];
                    if (elementData.product.end_price === undefined) {
                      this.sumPrice += group[elementData.product_unit_id][0]['price'] * elementData.amount; // gia chung * so luong
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

                /*
                bug
                 */
                // console.log(this.listProduct);
                const list = this.listProduct;
                this.listProduct = [];
                this.listProduct = list;
              } else {
                this.sumPrice = 0;
              }

            }
          });
          this.listProduct.reverse();
          this.changePriceBook = false;
        } else {
          /**
           * Truong hop: khong thay doi vs sl , pricebook
           * groupProductIdCommonPrice = [ product_id] => [
           *          product_id, product[],common_price, amount
           *          ]
           */
          const groupProductIdCommonPrice = (listProductOLD !== null) ? listProductOLD.reduce((r, a) => {
            r[a.product_id] = [...r[a.product_id] || [], a];
            return r;
          }, {}) : [];

          /**
           * Tien hanh sumPrice , cap nhat common_price, neu khong co common_price se cho sell_price
           */

          this.sumPrice = 0;
          if (this.listProduct !== null) {
            this.listProduct.forEach(elementData => {
              if (groupProductIdCommonPrice[elementData.product_unit_id] !== undefined) {
                if (elementData.product.end_price !== undefined) {
                  elementData.common_price = elementData.product.end_price;
                  this.sumPrice += elementData.product.end_price * elementData.amount;
                } else {
                  elementData.common_price = groupProductIdCommonPrice[elementData.product_unit_id][0]['common_price'];
                  this.sumPrice += groupProductIdCommonPrice[elementData.product_unit_id][0]['common_price'] * elementData.amount;
                }
              } else {
                if (elementData.product.end_price !== undefined) {
                  elementData.common_price = elementData.product.end_price;
                  this.sumPrice += elementData.product.end_price * elementData.amount;
                } else {
                  elementData.common_price = elementData.product.sell_price;
                  this.sumPrice += elementData.product.sell_price * elementData.amount;
                }

              }
            });
          } else {
            this.sumPrice = 0;
          }

        }

      }
    }
  }

  /**
   * Active user current
   */
  loadUserLogin() {
    if (this.user == null) {
      this.userService.getUserLogin().subscribe(res => {
        this.user = res;
      });
    }
  }

  /**
   * Form Sider Bar
   */
  async initFormSiderBar() {
    let userID = null;
    let priceBookID = null;
    let noteSiderBar = null;
    let branch_id = null;
    const listInvoice = this.orderService.getListInvoiceLocalStorage();
    const listItemInvoice = listInvoice.itemInvoice;
    listItemInvoice.forEach(element => {
      if (element.active === true) {
        userID = element?.user?.id;
        priceBookID = element?.price_book_id;
        noteSiderBar = element.noteSiderBar;
        branch_id = element?.branch_id;
        this.selectUser.patchValue(element?.user?.username);
        this.selectCustomer.patchValue(element?.customer?.name); // add name khach hang
      }
    });
    this.form = this.fb.group({
      userID: [userID],
      priceBookID: [priceBookID],
      noteSiderBar: [noteSiderBar],
      customerPay: [0],
      branch_id: [branch_id],
    });

    if (this.form.controls['branch_id'].value == null) {
      this.userService.getBranchLogin().subscribe(branchLogin => {
        this.form.controls['branch_id'].setValue(branchLogin);
      });
    }

  }

  /**
   * Lay danh sach bang gia
   */
  loadPriceBookDefault() {
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
        }
      });
    });
  }

  /**
   * Init Component
   */
  ngOnInit(): void {
    this.isLoadingResults = true;
    this.allPermission = sessionStorage.getItem('allPermission').split(',');
    this.isAdminStore = sessionStorage.getItem('isAdminStore') === 'true';
    this.initFormSiderBar();
    /**
     * Load user login
     */
    this.userService.getUserLogin().subscribe(res => {
      this.user = res;
      this.handleActiveUser();
      this.loadPriceBookDefault();
    });

    this.userService.getStoreBranchList().subscribe(res => {
      this.branchList = res.body;
    });


    this.orderService.subscribeLoadDetailPage.subscribe(action => {
      if (action === true) {
        this.listProduct = null;
      }
    });
    this.orderService.subscribeObjectListInvoice.subscribe(ListInvoice => {
      this.loadData();
    });
    this.isLoadingResults = false;

    /**
     * Tim kiem khach hang
     */
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

    /**
     * Tim kiem nhan vien
     */
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


  /**
   * ********************************************** SALE DETAIL ORDER ***********************************************
   */

  deleleProduct(i: any) {
    this.orderService.deleteProduct(i);
  }

  upAmountProduct(product: Product, i: any) {
    this.orderService.upAmountProduct(product, i);
  }

  upAmountProductReturn(product: Product, i: any) {
    this.orderService.upAmountProductReturn(product, i);
  }

  downAmountProduct(product_id, i: any) {
    this.orderService.downAmountProduct(product_id, i);
  }

  inputAmountProduct(product_id, value) {
    this.orderService.inputAmountProduct(product_id, value);
  }

  inputAmountProductReturn(product_id, value) {
    this.orderService.inputAmountProductReturn(product_id, value);
  }

  openNoteDetailOrderDialog(i: any, product_unit_id: string, note_detail_sale: string) {
    const obj = {
      i: i,
      product_unit_id: product_unit_id,
      note_detail_sale: note_detail_sale
    };
    const dialogRef = this.dialog.open(NoteDetailOrderDialogComponent, {
      data: obj,
      width: '40%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      // this.loadData();
    });
  }

  openPriceDetailOrderDialog(i: any, product: Product, common_price: string) {
    const obj = {
      i: i,
      product: product,
      common_price: common_price
    };

    const dialogRef = this.dialog.open(PriceDetailOrderDialogComponent, {
      data: obj,
      width: '30%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  /**
   * ******************************************* END SALE DETAIL ORDER *******************************************
   * *******************************************  SALE SIDER BAR ORDER *******************************************
   */


  onSelectedCustomer(customer) {
    const listInvoice = this.orderService.getListInvoiceLocalStorage();
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
    const listInvoice = this.orderService.getListInvoiceLocalStorage();
    const listItemInvoice = listInvoice.itemInvoice;
    listItemInvoice.forEach(element => {
      if (element.active === true) {
        element.user = {
          id: user?.id,
          username: user?.username,
          email: user?.email
        };

        this.user.id = user?.id;
        this.user.username = user?.username;
        this.user.email = user?.email;

      }
    });
    this.orderService.setListInvoiceLocalStorage(listInvoice);
    this.selectUser.patchValue(user?.username);
    this.form.patchValue({
      'userID': user?.id
    });
  }


  lookupCustomer(value: string): Observable<Customer[]> {
    if (value !== null) {
      return this.customerService.autocomplete(value).pipe(
        // map the item property of the github results as our return object
        map(results => results),
        // catch errors
        catchError(_ => {
          return of(null);
        })
      );
    }

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

  /**
   * Chay 2 lan de ko bi trash
   * @param event
   */
  choosePriceBook(event: any) {
    this.changePriceBook = true;
    this.actionChoosePriceBook();
    this.changePriceBook = true;
    this.actionChoosePriceBook();
  }

  actionChoosePriceBook() {
    // console.log(this.form.controls['priceBookID'].value);
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

    dialogRef.afterClosed().subscribe(mItemInvoiceActive => {
      if (mItemInvoiceActive !== undefined) {
        this.handleDiscountSiderBar(mItemInvoiceActive);
      }
    });
  }

  /**
   * Xu ly giam gia siderbar
   */
  handleDiscountSiderBar(mItemInvoice) {

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
  }

  openPaymentSiderBarDialog() {
    const dialogRef = this.dialog.open(PaymentSiderbarDialogComponent, {
      width: '40%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(mItemInvoiceActive => {
      if (mItemInvoiceActive !== undefined) {
        this.handlePaymentSiderBar(mItemInvoiceActive);
      }
    });
  }

  /**
   * Xu ly thanh toan siderbar
   */
  handlePaymentSiderBar(mItemInvoice) {
    const paymentSiderBar = mItemInvoice.paymentSiderBar;
    if (paymentSiderBar !== undefined) {
      // this.customerPay = paymentSiderBar?.number;
      this.form.patchValue({
        customerPay: paymentSiderBar?.number
      });
    } else {
      // this.form.patchValue({
      //   customerPay : 0
      // });
      // this.customerPay = 0;
    }
  }

  openSaleCustomerFormDialogComponent() {
    const dialogRef = this.dialog.open(SaleCustomerFormDialogComponent, {
      width: '40%',
      minWidth: '750px',
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log(result);
      if (result !== undefined) {
        this.onSelectedCustomer(result);
        // this.selectCustomer.patchValue(result?.name);
      }
    });
  }

  /**
   * Print Invoice
   */
  printInvoice(invoice_id: number) {
    this.orderService.getDataInvoiceToPrint(invoice_id).subscribe(res => {
      const address = (res?.customer?.address !== null && res?.customer?.address !== undefined) ? res?.customer?.address : '';
      const customer_name = (res?.customer?.name !== null && res?.customer?.name !== undefined) ? res?.customer?.name : 'Khách lẻ';
      const customer_phone = (res?.customer?.phone !== null && res?.customer?.phone !== undefined) ? res?.customer?.phone : '';
      let printContent = '<title>' + res?.invoice_no + '</title>';
      printContent += '<style> ' +
        'p,table,div {' +
        'font-family: arial, sans-serif;' +
        '}' +
        'table {' +
        // 'font-family: arial, sans-serif;' +
        'border-collapse: collapse;' +
        'width: 100%;' +
        '}' +
        'td, th {' +
        'border: 1px solid #dddddd;' +
        'text-align: left;' +
        'padding: 8px;' +
        '}</style>' +
        '<section style="padding: 10px;">' +
        '<p style="text-align:center;">Địa chỉ : ' + res?.store?.name + '</p>' +
        '<p style="text-align:center; font-weight:600;">HÓA ĐƠN BÁN HÀNG</p>' +
        '<p style="text-align:center; font-weight:600;">Số HĐ: ' + res?.invoice_no + '</p>' +
        '<p style="text-align:center;"> ' + res?.created_at + ' </p>' +
        '<p style="">Khách hàng: ' + customer_name + '</p>' +
        '<p style="">SĐT: ' + customer_phone + '</p>' +
        '<p style="">Địa chỉ: ' + address + '</p>' +
        '<table>' +
        '<tr>' +
        '<th>Đơn giá</th>' +
        '<th style="text-align:center;">Số lượng</th>';

      if (this.autoPrintInSoLo === true) {
        printContent += '<th style="text-align:left;">Số lô</th>';
      }

      printContent += '<th style="text-align:center;">Thành tiền</th>' +
        '</tr>';

      const detail = res.detail;

      /**
       * Chi tiet don hang
       */
      detail.forEach(element => {
        if (element?.base_unit == null) {
          printContent += '<tr>' +
            '<td>' + element.product?.product_name + '<br>' + element.price + '</td>' +
            '<td style="text-align:center;">' + element.amount + '</td>';
          if (this.autoPrintInSoLo == true) {
            printContent += '<td style="text-align:left;">' + element.so_lo + '</td>';
          }
          printContent += '<td style="text-align:right;">' + element.total + '</td>' +
            '</tr>';
        } else {
          printContent += '<tr>' +
            '<td>' + element.product?.product_name + ' - ' + element?.base_unit + '<br>' + element.price + '</td>' +
            '<td style="text-align:center;">' + element.amount + '</td>';
          if (this.autoPrintInSoLo == true) {
            printContent += '<td style="text-align:left;">' + element.so_lo + '</td>';
          }
          printContent += '<td style="text-align:right;">' + element.total + '</td>' +
            '</tr>';
        }
      });

      /**
       * Tong tien hang
       */
      let colspan = 2;
      if (this.autoPrintInSoLo == true) {
        colspan = 3;
      }
      printContent += '<tr>' +
        '<td style="text-align:right; font-weight:600;" colspan="' + colspan + '">Tổng tiền hàng :</td>' +
        '<td style="text-align:right; font-weight:600;">' + res.total_price + '</td>' +
        '</tr>';
      printContent += '<tr>' +
        '<td style="text-align:right; font-weight:600;" colspan="' + colspan + '">Chiết khấu :</td>' +
        '<td style="text-align:right; font-weight:600;">' + res.discount + '</td>' +
        '</tr>';
      printContent += '<tr>' +
        '<td style="text-align:right; font-weight:600;" colspan="' + colspan + '">Tổng thanh toán :</td>' +
        '<td style="text-align:right; font-weight:600;">' + res.sum_payment + '</td>' +
        '</tr>';
      if (res.debt !== null) {
        printContent += '<tr>' +
          '<td style="text-align:right; font-weight:600;" colspan="' + colspan + '">Còn nợ :</td>' +
          '<td style="text-align:right; font-weight:600;">' + res.debt + '</td>' +
          '</tr>';
      }
      printContent += '</table>';
      printContent += '<p style="text-align:center;font-style: italic;" >Cám ơn và hẹn gặp lại.</p>';
      printContent += '</section>';

      const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
      WindowPrt.document.write(printContent);
      WindowPrt.document.close();
      WindowPrt.focus();
      WindowPrt.print();
      WindowPrt.close();
    });

  }

  /**
   * Print Returns
   */
  printReturns(returns_id: number) {
    this.orderService.getDataReturnsToPrint(returns_id).subscribe(res => {
      const address = (res?.customer?.address !== null && res?.customer?.address !== undefined) ? res?.customer?.address : '';
      const customer_name = (res?.customer?.name !== null && res?.customer?.name !== undefined) ? res?.customer?.name : 'Khách lẻ';
      const customer_phone = (res?.customer?.phone !== null && res?.customer?.phone !== undefined) ? res?.customer?.phone : '';
      let printContent = '<title>' + res?.return_no + '</title>';
      printContent += '<style>table {' +
        // 'font-family: arial, sans-serif;' +
        'border-collapse: collapse;' +
        'width: 100%;' +
        '}' +
        'td, th {' +
        'border: 1px solid #dddddd;' +
        'text-align: left;' +
        'padding: 8px;' +
        '}</style>' +
        '<section style="padding: 10px;">' +
        '<p style="text-align:center;">Địa chỉ : ' + res?.store?.name + '</p>' +
        '<p style="text-align:center; font-weight:600;">HÓA ĐƠN TRẢ HÀNG</p>' +
        '<p style="text-align:center; font-weight:600;">Số HĐ: ' + res?.return_no + '</p>' +
        '<p style="text-align:center;"> ' + res?.created_at + ' </p>' +
        '<p style="">Khách hàng: ' + customer_name + '</p>' +
        '<p style="">SĐT: ' + customer_phone + '</p>' +
        '<p style="">Địa chỉ: ' + address + '</p>' +
        '<table>' +
        '<tr>' +
        '<th>Đơn giá</th>' +
        '<th style="text-align:center;">Số lượng</th>' +
        '<th style="text-align:center;">Thành tiền</th>' +
        '</tr>';

      const detail = res.detail;

      /**
       * Chi tiet don hang
       */
      detail.forEach(element => {
        if (element?.base_unit == null) {
          printContent += '<tr>' +
            '<td>' + element.product?.product_name + '<br>' + element.price + '</td>' +
            '<td style="text-align:center;">' + element.amount + '</td>' +
            '<td style="text-align:right;">' + element.total + '</td>' +
            '</tr>';
        } else {
          printContent += '<tr>' +
            '<td>' + element.product?.product_name + ' - ' + element?.base_unit + '<br>' + element.price + '</td>' +
            '<td style="text-align:center;">' + element.amount + '</td>' +
            '<td style="text-align:right;">' + element.total + '</td>' +
            '</tr>';
        }
      });

      /**
       * Tong tien hang
       */
      printContent += '<tr>' +
        '<td style="text-align:right; font-weight:600;" colspan="2">Tổng tiền hàng :</td>' +
        '<td style="text-align:right; font-weight:600;">' + res.total_price + '</td>' +
        '</tr>';
      printContent += '<tr>' +
        '<td style="text-align:right; font-weight:600;" colspan="2">Chiết khấu :</td>' +
        '<td style="text-align:right; font-weight:600;">' + res.discount + '</td>' +
        '</tr>';
      printContent += '<tr>' +
        '<td style="text-align:right; font-weight:600;" colspan="2">Tổng thanh toán :</td>' +
        '<td style="text-align:right; font-weight:600;">' + res.total + '</td>' +
        '</tr>';
      printContent += '</table>';
      printContent += '<p style="text-align:center;font-style: italic;" >Cám ơn và hẹn gặp lại.</p>';
      printContent += '</section>';

      const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
      WindowPrt.document.write(printContent);
      WindowPrt.document.close();
      WindowPrt.focus();
      WindowPrt.print();
      WindowPrt.close();
    });

  }

  // ------------------------------------------------------ PAYMENT ----------------------------------------------------------//
  payment() {
    const listInvoice = this.orderService.getListInvoiceLocalStorage();
    const listItemInvoice = listInvoice.itemInvoice;
    let mItemInvoice = new ItemInvoice();
    listItemInvoice.forEach(element => {
      if (element.active === true) {
        mItemInvoice = element;
      }
    });

    const customer = mItemInvoice.customer;

    if (this.selectUser.value === '') {
      this.notifySer.notify('warning', 'Chưa chọn tên nhân viên !');
      return;
    }

    if (mItemInvoice.user === undefined) {
      mItemInvoice.user = this.user;
    }

    if (mItemInvoice.listProduct === undefined || mItemInvoice.listProduct.length === 0) {
      this.notifySer.notify('warning', 'Chưa chọn sản phẩm !');
      return;
    }

    const list = this.listProduct;
    let needReturn = 0;
    list.forEach(element => {
      const product_unit_id = element.product_unit_id;
      const units = element.product.productUnits;
      const product_unit = units.find(ele => ele.id === product_unit_id);
      // console.log(product_unit);
      if (element.amount > product_unit.quantity_of_stock) {
        this.notifySer.notify('warning', 'Không đủ số lượng tồn kho sản phẩm ' + element.product.product_name);
        needReturn = 1;
      }
      // console.log(product_unit);
    });
    if (needReturn === 1) {
      return;
    }

    this.orderService.setLoadProduct(true);
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
        product_unit_id: element.product_unit_id,
        product_unit_value: element.product_unit_value,
        base_unit: element.base_unit,
      });
    });

    if (this.form.controls['branch_id'].value == null) {
      this.notifySer.notify('warning', 'Chưa chọn chi nhánh!');
      return;
    }

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
        branch_id: this.form.controls['branch_id'].value,
      },
      InvoiceDetail: invoiceDetail,
      PaymentMethod: 'cash', // mItemInvoice.paymentSiderBar?.type,
      PaymentPrice: this.sumPrice - this.numberDiscount, // tien thanh toan
      KhachNo: this.tienKhachNo,
    };

    /**
     * Kiem tra invoice_id la don moi hay don cap nhat
     */
    if (mItemInvoice.invoice_id < 0) {
      this.orderService.saleOrder(dataInvoice).subscribe(res => {
        if (res !== false) {
          if (typeof res === 'number' && this.autoPrint === true) {
            this.printInvoice(res);
          }
          this.resetDataSiderBar();
          this.notifySer.notify('success', 'Lưu thành công !');
        } else {
          this.notifySer.notify('warning', 'Thất bại !');
        }
        this.loadData();

        this.orderService.setLoadProduct(false);
        this.orderService.setLoadDetailPage(true);
      });
    } else {
      if (!this.isAdminStore) {
        this.notifySer.notify('error', 'Bạn không có quyền thực hiện chức năng này.');
        return;
      }
      this.orderService.updateOrder(dataInvoice).subscribe(res => {
        if (res !== false) {
          if (typeof res === 'number' && this.autoPrint === true) {
            this.printInvoice(res);
          }
          this.resetDataSiderBar();
          this.notifySer.notify('success', 'Cập nhật đơn thành công !');
        } else {
          this.notifySer.notify('warning', 'Thất bại !');
        }
        this.loadData();
        this.orderService.setLoadProduct(false);
        this.orderService.setLoadDetailPage(true);
      });
    }

  }

  /**
   * Tra hang
   */
  returns() {
    const listInvoice = this.orderService.getListInvoiceLocalStorage();
    const listItemInvoice = listInvoice.itemInvoice;
    let mItemInvoice = new ItemInvoice();
    listItemInvoice.forEach(element => {
      if (element.active === true) {
        mItemInvoice = element;
      }
    });

    const customer = mItemInvoice.customer;
    // if (mItemInvoice.customer === undefined) {
    //   this.notifySer.notify('warning', 'Chưa chọn khách hàng !');
    //   return;
    // }

    if (this.selectUser.value === '') {
      this.notifySer.notify('warning', 'Chưa chọn tên nhân viên !');
      return;
    }

    if (mItemInvoice.user === undefined) {
      mItemInvoice.user = this.user;
    }

    if (mItemInvoice.listProduct === undefined || mItemInvoice.listProduct.length === 0) {
      this.notifySer.notify('warning', 'Chưa chọn sản phẩm !');
      return;
    }

    const listCheckReturn = mItemInvoice.listProduct;
    let amountCheckReturn = 0;
    listCheckReturn.forEach(element => {
      amountCheckReturn += element.amount;
    });
    if (amountCheckReturn <= 0) {
      this.notifySer.notify('warning', 'Chưa chọn số lượng trả hàng !');
      return;
    }

    this.orderService.setLoadProduct(true);

    const list = this.listProduct;
    const returnsDetail = [];
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

      if (element.amount > 0) {
        returnsDetail.push({
          product_id: element.product.id,
          amount: element.amount,
          price: price,
          note: element.product?.note_detail_sale,
          discount: discount,
          discount_type: discount_type,
          product_unit_id: element.product_unit_id,
          product_unit_value: element.product_unit_value,
          base_unit: element.base_unit,
        });
      }

    });

    /**
     * Gang du lieu data
     */
    const dataReturn = {
      Returns: {
        invoice_id: mItemInvoice.invoice_id,
        customer_id: customer?.id,
        total_price: this.sumPrice, // tong tien hang
        discount: this.discount,
        discount_type: this.discount_type,
        note: this.form.controls['noteSiderBar'].value,
        price_book_id: this.form.controls['priceBookID'].value,
        branch_id: this.form.controls['branch_id'].value,
      },
      ReturnsDetail: returnsDetail,
      // PaymentMethod: mItemInvoice.paymentSiderBar?.type,
      PaymentPrice: this.sumPrice - this.numberDiscount, // tien thanh toan
    };

    this.orderService.returnsOrder(dataReturn).subscribe(res => {
      if (res !== false) {
        if (typeof res === 'number' && this.autoPrint === true) {
          this.printReturns(res);
          // console.warn(res);
          // return;
        }
        this.resetDataSiderBar();
        this.notifySer.notify('success', 'Trả hàng thành công !');
      } else {
        this.notifySer.notify('warning', 'Thất bại !');
      }
      this.loadData();

      this.orderService.setLoadProduct(false);
      this.orderService.setLoadDetailPage(true);
    });

  }


  async resetDataSiderBar() {
    await this.orderService.removeActive();
    await this.selectCustomer.patchValue('Khách lẻ');
    // await this.selectUser.patchValue(null);
    // await this.form.patchValue({
    //   'userID': [null]
    // });
    this.sumPrice = 0;
    this.countProduct = 0;
    this.listProduct = [];
  }

  /**
   * Luu ghi chu o siderbar
   */
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

  /**
   *  Tu dong in hoa don
   * @param e
   */
  onChangeSlideToggleTuDongInHoaDon(e: any) {
    this.autoPrint = e.checked;
  }

  /**
   * In so lo
   * @param e
   */
  onChangeSlideToggleInSoLo(e: any) {
    this.autoPrintInSoLo = e.checked;
  }

  onChangeProductUnit(e: any, itemProduct, i: number) {
    const units = itemProduct?.product?.productUnits;
    const item = units.find(element => element.id === e.value);

    const listProduct = this.listProduct;
    listProduct[i]['product_unit_id'] = item['id'];
    listProduct[i]['product_unit_value'] = item['value'];
    listProduct[i]['product']['sell_price'] = item['sell_price'];
    listProduct[i]['product']['product_no'] = item['no'];
    listProduct[i]['common_price'] = item['price'];

    this.listProduct = listProduct;
    const listInvoice = this.orderService.getListInvoiceLocalStorage();
    const listItemInvoice = listInvoice.itemInvoice;
    listItemInvoice.forEach(element => {
      if (element.active === true) {
        element.listProduct = listProduct;
      }
    });
    this.orderService.setListInvoiceLocalStorage(listInvoice);

  }

  /**
   * Format input number
   * @Nghia
   */
  inputformatNumber(event: any) {
    event.target.value = numeral(event.target.value).format('0,0');
    this.tienThuaTraKhach = numeral(this.form.controls['customerPay'].value).value() - this.sumPrice + this.numberDiscount;
    this.tienKhachNo = this.sumPrice - this.numberDiscount - numeral(this.form.controls['customerPay'].value).value();
  }

  public checkPermissionSaleDisable() {
    let indexPermission;
    if (this.localItemInvoice?.invoice_id < 0) {
      indexPermission = this.allPermission.indexOf('Invoice.Sale-Order');
    } else {
      indexPermission = this.allPermission.indexOf('Invoice.Update-Order');
      if (!this.isAdminStore) {
        return true;
      }
    }
    if (indexPermission !== -1) {
      return false;
    }
    return true;
  }

}


