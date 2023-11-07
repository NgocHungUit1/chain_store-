import { NationalPrescription } from './../../national-prescription/national-prescription.model';
import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { Observable } from 'rxjs';
import { Product } from '../../product/product.model';
import { OrderService } from '../order.service';
import {
  catchError,
  debounceTime,
  map,
  startWith,
  switchMap,
} from 'rxjs/operators';
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
import { OptionStoreService } from '../../common/option-store.service';
import { OptionStore } from '../../common/option-store.model';
import { ExpensesOrderService } from '../../expenses-order/expenses-order.service';
import {
  ExpensesOrder,
  ExpensesOrderFilter,
} from '../../expenses-order/expenses-order.model';
import { SaleExpensesDialogComponent } from '../sale-expenses-dialog/sale-expenses-dialog.component';
import { PrescriptionFormDialogComponent } from '../prescription-form-dialog/prescription-form-dialog.component';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { StoreService } from '../../store/store.service';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-sale-main',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './sale-main.component.html',
  styleUrls: ['./sale-main.component.scss'],
  providers: [
    DatePipe,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class SaleMainComponent implements OnInit {
  constructor(
    public dp: DatePipe,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private notifySer: NotifierService,
    private orderService: OrderService,
    private priceListSer: PriceListService,
    private priceListProductSer: PriceListProductService,
    private customerService: CustomerService,
    private userService: UserService,
    private optionStoreService: OptionStoreService,
    private expensesOrderService: ExpensesOrderService,
    public storeSer: StoreService,
  ) {
  }

  optionStore_auto_print: OptionStore = null;

  logo = null;
  description = null;

  submitted = false;

  optionStore_transaction_expenses_order: OptionStore = null;
  expenseOrder = 0; // thu khac
  expenseOrders: ExpensesOrder[] = null;

  selectProduct = new FormControl();
  public filteredProducts: Observable<Product[]>;
  isLoadingResults = true;
  isSelectedCustomer = false;

  showList = false;

  listProduct: any = [];
  countProduct = 0;

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

  panelOpenState = false;

  prescription_id: null; // ban theo don thuoc
  @ViewChild('prescription') prescription;
  @ViewChild('customerSearch') customerSearch: ElementRef;
  @ViewChild('customerPayment') customerPayment: ElementRef;
  @ViewChild('showListProd') showListProd: ElementRef;

  /**
   *  So sanh danh sach cu
   * @param listProductUnitIdChoose
   */
  compareEqualListProduct(listProductUnitIdChoose) {
    let fail = 1;
    listProductUnitIdChoose.forEach((value, index) => {
      if (
        this.listProductUnitIdChooseOld[index] === undefined ||
        this.listProductUnitIdChooseOld[index] !== value
      ) {
        fail = 0;
      }
    });
    return fail;
  }

  /*log(value) {
    console.log('Log Value: ', value);
  }*/

  async loadData() {
    const mItemInvoice = this.getNewItemInvoice();

    await this.handleAddPriceBookExist(mItemInvoice);

    await this.handleAddCustomerExist(mItemInvoice);

    await this.getDataExpenseOrder();

    await this.handleDetailOrder(mItemInvoice);

    await this.handleDiscountSiderBar(mItemInvoice);

    await this.handlePaymentSiderBar(mItemInvoice);

    this.localItemInvoice = mItemInvoice;
  }

  getAutoPrintValue() {
    this.optionStoreService.getValue('auto_print').subscribe(res => {
      this.optionStore_auto_print = res;
      if (res.value === 'no') {
        this.autoPrint = false;
      } else {
        this.autoPrint = true;
      }
    });
  }

  handleExpenseOrder() {
    this.expenseOrder = 0;
    if (this.expenseOrders !== null) {
      this.expenseOrders.forEach((element: ExpensesOrder) => {
        if (element.auto === 1) {
          if (element.type === 'price') {
            element.price = element.value;
          } else {
            element.price = Math.round((element.value * this.sumPrice) / 100);
          }
          this.expenseOrder += element.price;
        }
      });
    }
  }

  getDataExpenseOrder() {
    if (this.optionStore_transaction_expenses_order == null) {
      this.optionStoreService
        .getValue('transaction_expenses_order')
        .subscribe(res => {
          this.optionStore_transaction_expenses_order = res;
          if (this.optionStore_transaction_expenses_order?.value === 'yes') {
            const expensesOrderFilter = new ExpensesOrderFilter();
            expensesOrderFilter.status = '10';
            expensesOrderFilter.auto = '1';
            if (this.expenseOrders == null) {
              this.expensesOrderService
                .getList(expensesOrderFilter)
                .subscribe(expensesOrders => {
                  this.expenseOrders = <ExpensesOrder[]>expensesOrders.body;
                  this.handleExpenseOrder();
                });
            } else {
              this.handleExpenseOrder();
            }
          }
        });
    } else {
      if (this.optionStore_transaction_expenses_order?.value === 'yes') {
        const expensesOrderFilter = new ExpensesOrderFilter();
        expensesOrderFilter.status = '10';
        expensesOrderFilter.auto = '1';
        if (this.expenseOrders == null) {
          this.expensesOrderService
            .getList(expensesOrderFilter)
            .subscribe(expensesOrders => {
              this.expenseOrders = <ExpensesOrder[]>expensesOrders.body;
              this.handleExpenseOrder();
            });
        } else {
          this.handleExpenseOrder();
        }
      }
    }
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
          userID: element.user?.id,
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
    // this.selectCustomer.patchValue('Khách lẻ');
    // this.isSelectedCustomer = true;
    if (mItemInvoice?.customer?.name !== undefined) {
      this.selectCustomer.patchValue(mItemInvoice?.customer?.name);
      this.isSelectedCustomer = true;
    }
  }

  /**
   * Xu ly cho detail order
   */
  handleDetailOrder(mItemInvoice) {
    this.countProduct = 0;
    if (
      mItemInvoice.listProduct === undefined ||
      mItemInvoice.listProduct.length === 0
    ) {
      this.listProduct = [];
      this.prescription.checked = false;
      this.prescription_id = null;
      this.sumPrice = 0;
      this.listProductUnitIdChooseOld = [];
      this.form.patchValue({ total_amount: 0 });
    } else {
      if (
        mItemInvoice.prescription_id !== undefined &&
        mItemInvoice.prescription_id !== null
      ) {
        this.prescription.checked = true;
        this.prescription_id = mItemInvoice.prescription_id;
      }

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

      console.log(priceBookID);

      if (
        priceBookID !== null &&
        Array.isArray(list) &&
        this.listProduct !== null
      ) {
        const listProductUnitIdChoose = list.map(obj => obj.product_unit_id);
        // debugger;
        // debugger;
        /**
         * Truong hop:  thay doi vs sl , pricebook
         *
         * this.common_idOld !== priceBookID
         */
        if (
          this.compareEqualListProduct(listProductUnitIdChoose) === 0 ||
          this.changePriceBook === true
        ) {
          console.log('2');
          this.listProductUnitIdChooseOld = listProductUnitIdChoose;
          this.common_idOld = priceBookID;
          const common_id = priceBookID;
          /**
           * tien hanh xu ly add common_price vao list
           */
          this.priceListProductSer
            .getListProductCommon(common_id, listProductUnitIdChoose)
            .subscribe(resCommon => {
              if (Array.isArray(resCommon)) {
                const priceListProductCommonExist = resCommon;
                //
                // debugger;
                /**
                 * group = [ product_unit_id] => [
                 *          id,price,price_list_id,product_id
                 *          ]
                 * code group array by key
                 */
                const group = priceListProductCommonExist.reduce((r, a) => {
                  r[a.product_unit_id] = [...(r[a.product_unit_id] || []), a];
                  return r;
                }, {});

                /**
                 * Tien hanh sumPrice , cap nhat common_price, neu khong co common_price se cho sell_price
                 */
                this.sumPrice = 0;
                if (
                  mItemInvoice.total_amount !== undefined &&
                  mItemInvoice.total_amount !== null
                ) {
                  this.sumPrice = mItemInvoice.total_amount;
                }
                if (this.listProduct !== null) {
                  this.listProduct.forEach(elementData => {
                    // debugger;
                    if (group[elementData.product_unit_id] !== undefined) {
                      elementData.common_price =
                        group[elementData.product_unit_id][0]['price'];
                      if (!(elementData.sample_prescription_id !== undefined && elementData.sample_prescription_id !== null)) {
                        if (elementData.product.end_price === undefined) {
                          this.sumPrice +=
                            group[elementData.product_unit_id][0]['price'] *
                            elementData.amount; // gia chung * so luong
                        } else {
                          this.sumPrice +=
                            elementData.product.end_price * elementData.amount; // gia chung * so luong
                        }
                      }
                    } else {
                      elementData.common_price = elementData.product.sell_price;
                      if (!(elementData.sample_prescription_id !== undefined && elementData.sample_prescription_id !== null)) {
                        if (elementData.product.end_price === undefined) {
                          this.sumPrice +=
                            elementData.product.sell_price * elementData.amount; // gia ban * so luong
                        } else {
                          this.sumPrice +=
                            elementData.product.end_price * elementData.amount; // gia ban * so luong
                        }
                      }
                    }
                  });

                  // tslint:disable-next-line:no-shadowed-variable
                  const list = this.listProduct;
                  this.listProduct = [];
                  this.listProduct = list;
                } else {
                  this.sumPrice = 0;
                }
                this.form.patchValue({ total_amount: numeral(this.sumPrice).format('0,0') });
                this.checkToAdjustItemPriceByTotalDiff();
              } else {
                console.log('ket qua ko phari la array');
              }
            });
          // this.listProduct.reverse();
          // this.changePriceBook = false;
        } else {
          console.log('3');
          /**
           * Truong hop: khong thay doi vs sl , pricebook
           * groupProductIdCommonPrice = [ product_id] => [
           *          product_id, product[],common_price, amount
           *          ]
           */
          const groupProductIdCommonPrice =
            listProductOLD !== null
              ? listProductOLD.reduce((r, a) => {
                r[a.product_id] = [...(r[a.product_id] || []), a];
                return r;
              }, {})
              : [];
          /**
           * Tien hanh sumPrice , cap nhat common_price, neu khong co common_price se cho sell_price
           */

          this.sumPrice = 0;
          if (
            mItemInvoice.total_amount !== undefined &&
            mItemInvoice.total_amount !== null
          ) {
            this.sumPrice = mItemInvoice.total_amount;
          }
          if (this.listProduct !== null) {
            this.listProduct.forEach(elementData => {
              if (elementData.product.end_price !== undefined) {
                elementData.common_price = elementData.product.end_price;
                if (!(elementData.sample_prescription_id !== undefined && elementData.sample_prescription_id !== null)) {
                  this.sumPrice +=
                    elementData.product.end_price * elementData.amount;
                }
              } else {
                if (
                  groupProductIdCommonPrice[elementData.product_id] !==
                  undefined
                ) {
                  const unitPrice = groupProductIdCommonPrice[elementData.product_id]
                    .find(i => i.product_unit_id === elementData.product_unit_id);
                  if (unitPrice) {
                    elementData.common_price = unitPrice['common_price'];
                    if (!(elementData.sample_prescription_id !== undefined && elementData.sample_prescription_id !== null)) {
                      this.sumPrice += unitPrice['common_price'] * elementData.amount;
                    }
                  } else {
                    // lost here
                  }
                } else {
                  if (elementData.product.end_price !== undefined) {
                    elementData.common_price = elementData.product.end_price;
                    if (!(elementData.sample_prescription_id !== undefined && elementData.sample_prescription_id !== null)) {
                      this.sumPrice +=
                        elementData.product.end_price * elementData.amount;
                    }
                  } else {
                    elementData.common_price = elementData.product.sell_price;
                    if (!(elementData.sample_prescription_id !== undefined && elementData.sample_prescription_id !== null)) {
                      this.sumPrice +=
                        elementData.product.sell_price * elementData.amount;
                    }
                  }
                }
              }
            });
          } else {
            this.sumPrice = 0;
          }
          this.form.patchValue({ total_amount: numeral(this.sumPrice).format('0,0') });
          this.checkToAdjustItemPriceByTotalDiff();
        }
      }
      this.handleExpenseOrder();
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
    let time = null;
    const today = new Date();
    time =
      ('0' + today.getHours()).slice(-2) +
      ':' +
      ('0' + today.getMinutes()).slice(-2);
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
      time: [time],
      today: [today],
      invoice_id: [null],
      total_amount: [0],
      prescription_id: [null], // ban thuoc theo don
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
          let hasChanged = false;
          listItemInvoice.forEach(ele => {
            if (ele.active === true && ele.price_book_id === undefined) {
              ele.price_book_id = element.id;
              this.form.patchValue({
                priceBookID: element.id,
              });
              hasChanged = true;
            }
          });
          if (hasChanged) {
            this.orderService.setListInvoiceLocalStorage(listInvoice);
          }
        }
      });
    });
  }

  public changeBranch(event) {
    const data = { branch_store_id: event.value };
    this.userService.updateBranchLogin(data).subscribe(
      res => {
        if (res === true) {
          this.notifySer.notify('success', 'Chuyển chi nhánh thành công.');
          this.resetDataSiderBar();
          this.orderService.initListInvoice();
          setTimeout(function () {
            location.reload();
          }, 500);
        } else {
          this.notifySer.notify(
            'error',
            'Đã có lỗi xảy ra, vui lòng kiểm tra lại.'
          );
        }
      },
      error => {
      }
    );
  }

  /**
   * Init Component
   */
  ngOnInit(): void {
    // this.optionStore_transaction_expenses_order.value = 'no';
    this.isLoadingResults = true;
    this.allPermission = sessionStorage.getItem('allPermission')?.split(',');
    this.isAdminStore = sessionStorage.getItem('isAdminStore') === 'true';
    this.initFormSiderBar();
    // this.form.controls.today.valueChanges.subscribe(x => {
    // this.form.controls.today.patchValue(new Date(x));
    // });
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

    this.getAutoPrintValue();

    this.orderService.subscribeLoadDetailPage.subscribe(action => {
      if (action === true) {
        this.listProduct = null;
      }
    });
    this.orderService.subscribeObjectListInvoice.subscribe(ListInvoice => {
      this.loadData().then(r => { });
    });
    this.isLoadingResults = false;

    this.storeSer.getDetail().subscribe(res => {
      if (res['logo'] !== null && res['logo'].length > 0) {
        this.logo = res['logo'];
      }
      this.description = res['description'];
    });

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

  deleteProduct(i: any) {
    this.orderService.deleteProduct(i);
    // const mItemInvoice = this.getNewItemInvoice();
    // if (mItemInvoice.listProduct.length === 0) {
    //   this.sumPrice = 0;
    // }
    this.handleExpenseOrder();
  }

  upAmountProduct(product: Product, i: any) {
    this.orderService.upAmountProduct(product, i);
    this.handleExpenseOrder();
  }

  upAmountProductReturn(product: Product, i: any) {
    this.orderService.upAmountProductReturn(product, i);
  }

  downAmountProduct(product_id, i: any) {
    this.orderService.downAmountProduct(product_id, i);
    this.handleExpenseOrder();
  }

  inputAmountProduct(product_id, event) {
    event.target.value = Number(event.target.value);
    this.orderService.inputAmountProduct(product_id, event.target.value);
  }

  inputAmountProductReturn(product_id, value) {
    this.orderService.inputAmountProductReturn(product_id, value);
  }

  openNoteDetailOrderDialog(
    i: any,
    product_unit_id: string,
    note_detail_sale: string
  ) {
    const obj = {
      i: i,
      product_unit_id: product_unit_id,
      note_detail_sale: note_detail_sale,
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
      common_price: common_price,
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
    this.isSelectedCustomer = true;
  }

  onSelectedUser(user) {
    const listInvoice = this.orderService.getListInvoiceLocalStorage();
    const listItemInvoice = listInvoice.itemInvoice;
    listItemInvoice.forEach(element => {
      if (element.active === true) {
        element.user = {
          id: user?.id,
          username: user?.username,
          email: user?.email,
        };

        this.user.id = user?.id;
        this.user.username = user?.username;
        this.user.email = user?.email;
      }
    });
    this.orderService.setListInvoiceLocalStorage(listInvoice);
    this.selectUser.patchValue(user?.username);
    this.form.patchValue({
      userID: user?.id,
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
    // this.changePriceBook = true;
    // this.actionChoosePriceBook();
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
        this.numberDiscount = Math.round(
          (this.sumPrice * discountSiderBar?.number) / 100
        );
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
      this.form.patchValue({
        customerPay: paymentSiderBar?.number,
      });
    }

    // xu ly thay doi tab new thanh time hien tai
    if (mItemInvoice?.new === true) {
      let time = null;
      const today = new Date();
      time = ('0' + today.getHours()).slice(-2) + ':' + ('0' + today.getMinutes()).slice(-2);
      this.form.patchValue({
        today: today,
        time: time,
      });
      mItemInvoice.new = false;
    }

    this.form.controls['today'].enable();
    this.form.controls['time'].enable();

    if (Number(mItemInvoice.invoice_id) > 0) {
      const aDate = mItemInvoice.today.split('-');
      this.form.patchValue({
        today: new Date(aDate[0], aDate[1] - 1, aDate[2]),
        time: mItemInvoice.time,
        invoice_id: mItemInvoice.invoice_id,
      });
      this.form.controls['today'].disable();
      this.form.controls['time'].disable();
    }

    if (Number(mItemInvoice.invoice_id) === -1) {
      const today = new Date();
      const time =
        ('0' + today.getHours()).slice(-2) +
        ':' +
        ('0' + today.getMinutes()).slice(-2);
      if (!this.form.controls['today'].value) {
        this.form.patchValue({
          today: today,
          time: time,
        });
      }
    }
    this.handleExpenseOrder();
  }

  openSaleCustomerFormDialogComponent() {
    const dialogRef = this.dialog.open(SaleCustomerFormDialogComponent, {
      width: '40%',
      minWidth: '750px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.onSelectedCustomer(result);
      }
    });
  }

  changeDateTime(event, type = 'date') {
    // const listInvoice = this.orderService.getListInvoiceLocalStorage();
    // const listItemInvoice = listInvoice.itemInvoice;
    // listItemInvoice.forEach(element => {
    //   if (element.active === true) {
    //     element.new = false;
    //     if (type === 'date') {
    //       element.date = event.target.value;
    //     }
    //     if (type === 'time') {
    //       element.time = event.target.value;
    //     }
    //   }
    // });
    // listInvoice.itemInvoice = listItemInvoice;
    // this.orderService.setListInvoiceLocalStorage(listInvoice);
  }

  /**
   *  Chinh sua thu them
   */
  openExpensesOrder() {
    const dialogRef = this.dialog.open(SaleExpensesDialogComponent, {
      width: '50%',
      minHeight: '80%',
      data: {
        expenses: this.expenseOrders,
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      // console.log(result);
      if (result !== null && result !== undefined) {
        this.expenseOrders = result;
        this.handleExpenseOrder();
      }
    });
  }

  /**
   * Print Invoice
   */
  printInvoice(invoice_id: number) {
    let _font_size = '11px';
    let _margin = '4px;';
    let _padding = '3px;';
    let _solo = 'text-align:left;';
    this.optionStoreService.getValue('print_type').subscribe(res => {
      // console.log(res);
      if (res.value === 'K58') {
        _font_size = '11px;';
        _margin = '4px;';
        _padding = '3px;';
        _solo = 'text-align:left;';
      } else { // A4
        _font_size = '14px;';
        _margin = '6px;';
        _padding = '6px;';
        _solo = 'text-align:left; min-width: 100px;';
      }

      this.orderService.getDataInvoiceToPrint(invoice_id).subscribe(res => {
        const customer_name = (res?.customer?.name !== null && res?.customer?.name !== undefined) ? res?.customer?.name : 'Khách lẻ';
        const customer_phone = (res?.customer?.phone !== null && res?.customer?.phone !== undefined) ? res?.customer?.phone : '';
        let printContent = '<title>' + res?.invoice_no + '</title>';
        printContent += '<style> ' +
          'p,table,div {' +
          'font-family: Arial, sans-serif;' +
          'font-size: ' + _font_size +
          'margin: ' + _margin +
          '}' +
          'table, th, td {' +
          // 'font-family: arial, sans-serif;' +
          'border-collapse: collapse;' +
          'border: 1px solid black;' +
          'width: 100%;' +
          '}' +
          'td, th {' +
          'border: 1px solid black;' +
          'text-align: left;' +
          'padding: ' + _padding +
          '}</style>' +
          '<section style="padding: 10px; font-size: ' + _font_size + ' ">' +
          (this.logo !== null ? '<p style="text-align:center; margin-bottom: 10px"><img src="' + this.logo + '" style="max-width: 160px;"></p>' : '') +
          '<p style="text-align:center;">' + res?.store?.name + '</p>' +
          '<p style="text-align:center; font-weight:600;">HÓA ĐƠN BÁN HÀNG</p>' +
          '<p style="text-align:center; font-weight:600;">Số HĐ: ' + res?.invoice_no + '</p>' +
          '<p style="text-align:center;"> ' + res?.created_at + ' </p>' +
          '<br>';

        // Customer info
        const { nationalPrescription } = res;
        if (nationalPrescription) {
          printContent +=
            '<p>Mã đơn thuốc: <b>' + nationalPrescription.nationalPrescriptionId + '</b></p>' +
            '<p>Tên đơn vị: <b>' + nationalPrescription.medicalFacilityName + '</b></p>' +
            '<p>Họ tên: <b>' + nationalPrescription.patientName + '</b></p>' +
            '<p>SĐT: <b>' + nationalPrescription.patientPhoneNumber + '</b></p>' +
            '<p>Ngày sinh: <b>' + nationalPrescription.patientDOB + '</b>' +
            '&nbsp;&nbsp;&nbsp;&nbsp;Cân nặng: <b>' + nationalPrescription.patientWeight + '</b>' +
            '&nbsp;&nbsp;&nbsp;&nbsp;Giới tính: <b>' + nationalPrescription.patientSex + '</b></p>' +
            '<br>' +
            '<p><b>Chẩn đoán:</b> ' + nationalPrescription?.diagnostics[0]?.conclusion + '</p>';
        } else {
          '<p style="">Khách hàng: ' + customer_name + '</p>';
          if (customer_phone !== '') {
            printContent += '<p style="">SĐT: ' + customer_phone + '</p>';
          }
        }

        printContent +=
          '<br>' +
          '<table>' +
          '<tr>' +
          '<th>Tên thuốc</th>' +
          '<th style="text-align:center;">SL</th>';

        if (this.autoPrintInSoLo === true) {
          printContent += '<th style="' + _solo + '">Số lô</th>';
        }

        printContent += '<th style="text-align:center;">T.Tiền</th>' +
          '</tr>';

        const detail = res.detail;

        /**
         * Chi tiet don hang
         */
        // tslint:disable-next-line:no-shadowed-variable
        detail.forEach(element => {
          if (element?.base_unit == null) {
            printContent += '<tr>' +
              '<td>' + element.product?.product_name + '<br>' + element.price + '</td>' +
              '<td style="text-align:center;">' + element.amount + '</td>';
            if (this.autoPrintInSoLo === true) {
              printContent += '<td style="text-align:left;">' + element.so_lo + '</td>';
            }
            printContent += '<td style="text-align:right;">' + element.total + '</td>' +
              '</tr>';
          } else {
            printContent += '<tr>' +
              '<td>' + element.product?.product_name + ' - ' + element?.base_unit + '<br>' + element.price + '</td>' +
              '<td style="text-align:center;">' + element.amount + '</td>';
            if (this.autoPrintInSoLo === true) {
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
        if (this.autoPrintInSoLo === true) {
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

        // Footer
        printContent += '<br>';
        if (this.description !== null && this.description.length > 0) {
          printContent += '<p style="text-align:center; font-style: italic;" >' + this.description + '</p>';
        } else {
          printContent += '<p style="text-align:center;font-style: italic;" >Cám ơn và hẹn gặp lại.</p>';
        }
        // printContent += '<p style="text-align:left; font-size: 12px;font-style: italic;" >Hổ trợ : 0972 574 506</p>';

        printContent += '</section>';

        const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
        WindowPrt.document.write(printContent);
        WindowPrt.document.close();
        WindowPrt.focus();
        WindowPrt.print();
        // WindowPrt.close(); // lỗi tự đôngs
      });
    });
  }

  printInvoiceOld(invoice_id: number) {
    this.orderService.getDataInvoiceToPrint(invoice_id).subscribe(res => {
      const customer_name =
        res?.customer?.name !== null && res?.customer?.name !== undefined
          ? res?.customer?.name
          : 'Khách lẻ';
      const customer_phone =
        res?.customer?.phone !== null && res?.customer?.phone !== undefined
          ? res?.customer?.phone
          : '';
      let printContent = '<title>' + res?.invoice_no + '</title>';
      printContent +=
        '<style> ' +
        'p,table,div {' +
        'font-family: arial, sans-serif;' +
        'font-size: 11px;' +
        'margin: 4px;' +
        '}' +
        'table, th, td {' +
        // 'font-family: arial, sans-serif;' +
        'border-collapse: collapse;' +
        'border: 1px solid black;' +
        'width: 100%;' +
        '}' +
        'td, th {' +
        'border: 1px solid black;' +
        'text-align: left;' +
        'padding: 3px;' +
        '}</style>' +
        '<section style="padding: 10px;font-size: 11px;">' +
        '<p style="text-align:center;">' +
        res?.store?.name +
        '</p>' +
        '<p style="text-align:center; font-weight:600;">HÓA ĐƠN BÁN HÀNG</p>' +
        '<p style="text-align:center; font-weight:600;">Số HĐ: ' +
        res?.invoice_no +
        '</p>' +
        '<p style="text-align:center;"> ' +
        res?.created_at +
        ' </p>' +
        '<p style="">Khách hàng: ' +
        customer_name +
        '</p>';
      if (customer_phone !== '') {
        printContent += '<p style="">SĐT: ' + customer_phone + '</p>';
      }
      printContent +=
        '<table>' +
        '<tr>' +
        '<th>Tên thuốc</th>' +
        '<th style="text-align:center;">SL</th>';

      if (this.autoPrintInSoLo === true) {
        printContent += '<th style="text-align:left;">Số lô</th>';
      }
      printContent += '<th style="text-align:center;">T.Tiền</th>' + '</tr>';

      const detail = res.detail;

      /**
       * Chi tiet don hang
       */
      detail.forEach(element => {
        if (element?.base_unit == null) {
          printContent +=
            '<tr>' +
            '<td>' +
            element.product?.product_name +
            '<br>' +
            element.price +
            '</td>' +
            '<td style="text-align:center;">' +
            element.amount +
            '</td>';
          if (this.autoPrintInSoLo === true) {
            printContent +=
              '<td style="text-align:left;">' + element.so_lo + '</td>';
          }
          printContent +=
            '<td style="text-align:right;">' +
            element.total +
            '</td>' +
            '</tr>';
        } else {
          printContent +=
            '<tr>' +
            '<td>' +
            element.product?.product_name +
            ' - ' +
            element?.base_unit +
            '<br>' +
            element.price +
            '</td>' +
            '<td style="text-align:center;">' +
            element.amount +
            '</td>';
          if (this.autoPrintInSoLo === true) {
            printContent +=
              '<td style="text-align:left;">' + element.so_lo + '</td>';
          }
          printContent +=
            '<td style="text-align:right;">' +
            element.total +
            '</td>' +
            '</tr>';
        }
      });

      /**
       * Tong tien hang
       */
      let colspan = 2;
      if (this.autoPrintInSoLo === true) {
        colspan = 3;
      }
      printContent +=
        '<tr>' +
        '<td style="text-align:right; font-weight:600;" colspan="' +
        colspan +
        '">Tổng tiền hàng :</td>' +
        '<td style="text-align:right; font-weight:600;">' +
        res.total_price +
        '</td>' +
        '</tr>';
      printContent +=
        '<tr>' +
        '<td style="text-align:right; font-weight:600;" colspan="' +
        colspan +
        '">Chiết khấu :</td>' +
        '<td style="text-align:right; font-weight:600;">' +
        res.discount +
        '</td>' +
        '</tr>';
      printContent +=
        '<tr>' +
        '<td style="text-align:right; font-weight:600;" colspan="' +
        colspan +
        '">Tổng thanh toán :</td>' +
        '<td style="text-align:right; font-weight:600;">' +
        res.sum_payment +
        '</td>' +
        '</tr>';
      if (res.debt !== null) {
        printContent +=
          '<tr>' +
          '<td style="text-align:right; font-weight:600;" colspan="' +
          colspan +
          '">Còn nợ :</td>' +
          '<td style="text-align:right; font-weight:600;">' +
          res.debt +
          '</td>' +
          '</tr>';
      }
      printContent += '</table>';
      printContent +=
        '<p style="text-align:center;font-style: italic;" >Cám ơn và hẹn gặp lại.</p>';
      // printContent += '<p style="text-align:left; font-size: 12px;font-style: italic;" >Hổ trợ : 0972 574 506</p>';
      printContent += '</section>';

      const WindowPrt = window.open(
        '',
        '',
        'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0'
      );
      WindowPrt.document.write(printContent);
      WindowPrt.document.close();
      WindowPrt.focus();
      WindowPrt.print();
      // WindowPrt.close();
    });
  }

  /**
   * Print Returns
   */
  printReturns(returns_id: number) {
    this.orderService.getDataReturnsToPrint(returns_id).subscribe(res => {
      const customer_name =
        res?.customer?.name !== null && res?.customer?.name !== undefined
          ? res?.customer?.name
          : 'Khách lẻ';
      const customer_phone =
        res?.customer?.phone !== null && res?.customer?.phone !== undefined
          ? res?.customer?.phone
          : '';
      let printContent = '<title>' + res?.return_no + '</title>';
      printContent +=
        '<style>table {' +
        // 'font-family: arial, sans-serif;' +
        'border-collapse: collapse;' +
        'border: 1px solid black;' +
        'width: 100%;' +
        '}' +
        'td, th {' +
        'border: 1px solid black;' +
        'text-align: left;' +
        'padding: 8px;' +
        '}</style>' +
        '<section style="padding: 10px;">' +
        '<p style="text-align:center;">Địa chỉ : ' +
        res?.store?.name +
        '</p>' +
        '<p style="text-align:center; font-weight:600;">HÓA ĐƠN TRẢ HÀNG</p>' +
        '<p style="text-align:center; font-weight:600;">Số HĐ: ' +
        res?.return_no +
        '</p>' +
        '<p style="text-align:center;"> ' +
        res?.created_at +
        ' </p>' +
        '<p style="">Khách hàng: ' +
        customer_name +
        '</p>';
      if (customer_phone !== '') {
        printContent += '<p style="">SĐT: ' + customer_phone + '</p>';
      }
      printContent +=
        '<table>' +
        '<tr>' +
        '<th>Đơn giá</th>' +
        '<th style="text-align:center;">SL</th>' +
        '<th style="text-align:center;">T.Tiền</th>' +
        '</tr>';

      const detail = res.detail;

      /**
       * Chi tiet don hang
       */
      detail.forEach(element => {
        if (element?.base_unit == null) {
          printContent +=
            '<tr>' +
            '<td>' +
            element.product?.product_name +
            '<br>' +
            element.price +
            '</td>' +
            '<td style="text-align:center;">' +
            element.amount +
            '</td>' +
            '<td style="text-align:right;">' +
            element.total +
            '</td>' +
            '</tr>';
        } else {
          printContent +=
            '<tr>' +
            '<td>' +
            element.product?.product_name +
            ' - ' +
            element?.base_unit +
            '<br>' +
            element.price +
            '</td>' +
            '<td style="text-align:center;">' +
            element.amount +
            '</td>' +
            '<td style="text-align:right;">' +
            element.total +
            '</td>' +
            '</tr>';
        }
      });

      /**
       * Tong tien hang
       */
      printContent +=
        '<tr>' +
        '<td style="text-align:right; font-weight:600;" colspan="2">Tổng tiền hàng :</td>' +
        '<td style="text-align:right; font-weight:600;">' +
        res.total_price +
        '</td>' +
        '</tr>';
      printContent +=
        '<tr>' +
        '<td style="text-align:right; font-weight:600;" colspan="2">Chiết khấu :</td>' +
        '<td style="text-align:right; font-weight:600;">' +
        res.discount +
        '</td>' +
        '</tr>';
      printContent +=
        '<tr>' +
        '<td style="text-align:right; font-weight:600;" colspan="2">Tổng thanh toán :</td>' +
        '<td style="text-align:right; font-weight:600;">' +
        res.total +
        '</td>' +
        '</tr>';
      printContent += '</table>';
      printContent +=
        '<p style="text-align:center;font-style: italic;" >Cám ơn và hẹn gặp lại.</p>';
      printContent += '</section>';

      const WindowPrt = window.open(
        '',
        '',
        'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0'
      );
      WindowPrt.document.write(printContent);
      WindowPrt.document.close();
      WindowPrt.focus();
      WindowPrt.print();
      // WindowPrt.close();
    });
  }

  // ------------------------------------------------------ PAYMENT ----------------------------------------------------------//

  payment() {
    if (this.submitted) {
      return;
    }
    this.submitted = true;

    const listInvoice = this.orderService.getListInvoiceLocalStorage();
    const listItemInvoice = listInvoice.itemInvoice;
    let date_created = '';
    const data = this.form.getRawValue();
    let mItemInvoice = new ItemInvoice();
    listItemInvoice.forEach(element => {
      if (element.active === true) {
        mItemInvoice = element;
      }
    });

    const customer = mItemInvoice.customer;

    if (this.selectUser.value === '') {
      this.notifySer.notify('warning', 'Chưa chọn tên nhân viên !');
      this.submitted = false;
      return;
    }

    if (mItemInvoice.user === undefined) {
      mItemInvoice.user = this.user;
    }

    if (
      mItemInvoice.listProduct === undefined ||
      mItemInvoice.listProduct.length === 0
    ) {
      this.notifySer.notify('warning', 'Chưa chọn sản phẩm !');
      this.submitted = false;
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
        this.notifySer.notify(
          'warning',
          `Không đủ số lượng tồn kho sản phẩm ${element.product.product_name} (Tồn kho: ${product_unit.quantity_of_stock})`
        );
        needReturn = 1;
      }
      // console.log(product_unit);
    });
    if (needReturn === 1) {
      this.submitted = false;
      return;
    }

    this.orderService.setLoadProduct(true);
    const invoiceDetail = [];
    list.forEach(element => {
      let price = 0;
      let discount = 0;
      let discount_type = 'price';
      if (element.product.end_price === undefined) {
        price =
          element.common_price !== undefined
            ? element.common_price
            : element.product.sell_price;
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
      this.submitted = false;
      return;
    }

    if (data['today'] !== null && typeof data['today'] === 'object') {
      let effDate;
      if (!(data['today'] instanceof Date)) {
        effDate = data['today']._d;
      } else {
        // effDate = new Date(data['today'].getTime() + (420 * 60 * 1000));
        effDate = new Date(data['today'].getTime());
      }
      // @ts-ignore
      // date_created = data['time'] + ' ' + effDate.toISOString().split('T')[0];
      date_created =
        data['time'] + ' ' + this.dp.transform(effDate, 'yyyy-MM-dd');
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
        expenses_order_price: this.expenseOrder,
        prescription_id: this.prescription.checked ? mItemInvoice.prescription_id : null,
        national_pharmacy_no: this.prescription.checked ? mItemInvoice.national_pharmacy_no : null
      },
      UserID: mItemInvoice.user.id,
      InvoiceDetail: invoiceDetail,
      PaymentMethod: 'cash', // mItemInvoice.paymentSiderBar?.type,
      PaymentPrice: this.sumPrice - this.numberDiscount + this.expenseOrder, // tien thanh toan
      KhachNo: this.tienKhachNo,
      ExpenseOrders: this.expenseOrders,
      date_created: date_created,
    };

    /**
     * Kiem tra invoice_id la don moi hay don cap nhat
     */
    if (mItemInvoice.invoice_id < 0) {
      this.orderService.saleOrder(dataInvoice).subscribe(res => {
        this.submitted = false;
        if (res !== false) {
          if (typeof res === 'number' && this.autoPrint === true) {
            this.printInvoice(res);
          }
          this.resetDataSiderBar();
          this.notifySer.notify('success', 'Lưu thành công !');
        } else {
          this.notifySer.notify('warning', 'Thất bại !');
        }
        this.actionChoosePriceBook();
        this.loadData();

        this.orderService.setLoadProduct(false);
        this.orderService.setLoadDetailPage(true);
      }, error => {
        this.submitted = false;
      });
    } else {
      if (!this.isAdminStore) {
        this.notifySer.notify(
          'error',
          'Bạn không có quyền thực hiện chức năng này.'
        );
        this.submitted = false;
        return;
      }
      this.orderService.updateOrder(dataInvoice).subscribe(res => {
        this.submitted = false;
        if (res !== false) {
          if (typeof res === 'number' && this.autoPrint === true) {
            this.resetDataSiderBar();
            this.printInvoice(res);
          }
          this.resetDataSiderBar();
          this.notifySer.notify('success', 'Cập nhật đơn thành công !');
        } else {
          this.notifySer.notify('warning', 'Thất bại !');
        }
        this.actionChoosePriceBook();
        this.loadData();
        this.orderService.setLoadProduct(false);
        this.orderService.setLoadDetailPage(true);
      }, error => {
        this.submitted = false;
      });
    }
    this.handleExpenseOrder();
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

    if (
      mItemInvoice.listProduct === undefined ||
      mItemInvoice.listProduct.length === 0
    ) {
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
        price =
          element.common_price !== undefined
            ? element.common_price
            : element.product.sell_price;
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
    this.prescription.checked = false;
    this.prescription_id = null;
    this.discount = 0;
    this.numberDiscount = 0;
    setTimeout(() => {
      this.listProduct = [];
      this.discount = 0;
      this.numberDiscount = 0;

      const today = new Date();
      const time =
        ('0' + today.getHours()).slice(-2) +
        ':' +
        ('0' + today.getMinutes()).slice(-2);
      this.form.patchValue({
        time: time,
        total_amount: 0
      });
    }, 500);
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
    // console.log(this.optionStore_auto_print);
    // console.log(this.autoPrint);
    this.optionStore_auto_print.value = this.autoPrint === false ? 'no' : 'yes';
    this.optionStoreService
      .update(this.optionStore_auto_print.id, this.optionStore_auto_print)
      .subscribe(res => {
        console.log(res);
      });
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
  }

  tinhLaiTienThua() {
    this.tienThuaTraKhach =
      numeral(this.form.controls['customerPay'].value).value() -
      this.sumPrice +
      this.numberDiscount;
    this.tienKhachNo =
      this.sumPrice -
      this.numberDiscount -
      numeral(this.form.controls['customerPay'].value).value() +
      this.expenseOrder;
  }

  public checkPermissionSaleDisable() {
    let indexPermission;
    if (this.localItemInvoice?.invoice_id < 0) {
      indexPermission = this.allPermission?.indexOf('Invoice.Sale-Order');
    } else {
      indexPermission = this.allPermission?.indexOf('Invoice.Update-Order');
      if (!this.isAdminStore) {
        return true;
      }
    }
    if (indexPermission !== -1) {
      return false;
    }
    return true;
  }

  /**
   * Ban thuoc theo don
   */
  clickPrescription() {
    const obj = {
      prescription_id: this.prescription_id,
    };
    if (this.prescription.checked) {
      const dialogRef = this.dialog.open(PrescriptionFormDialogComponent, {
        data: obj,
        width: '60%',
        minHeight: '80%',
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result !== undefined) {
          this.prescription_id = result.id;
        }
      });
    }
  }

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode === 112) {
      event.preventDefault();
      !1 === this.showList ? (this.showList = !0) : (this.showList = !1);
    }

    if (event.keyCode === 113) {
      event.preventDefault();
      this.customerPayment.nativeElement.focus();
    }

    if (event.keyCode === 115) {
      event.preventDefault();
      this.customerSearch.nativeElement.focus();
    }

    if (event.keyCode === 117) {
      event.preventDefault();
      this.openDiscountSiderBar();
    }

    if (event.keyCode === 118) {
      event.preventDefault();
      this.payment();
    }
  }

  recalculateTotalAmount() {
    const formTotalAmount = numeral(this.form.controls['total_amount'].value).value();
    this.sumPrice = formTotalAmount;
    this.localItemInvoice.total_amount = formTotalAmount;

    this.checkToAdjustItemPriceByTotalDiff();
  }

  checkToAdjustItemPriceByTotalDiff() {
    let realTotal = 0;
    this.listProduct.forEach(item => {
      realTotal += (item.product.end_price > 0 ? item.product.end_price : item.common_price) * item.amount;
    });

    console.log(this.listProduct, this.sumPrice, realTotal);

    const diff = this.sumPrice - realTotal;
    if (diff) {
      this.listProduct.forEach(item => {
        /**
         * Điều chỉnh tổng giá hóa đơn, nên chia lại phần chênh lệch cho các sản phẩm trong đơn hàng theo tỉ lệ tương ứng.
         * => Tính lợi nhuận theo sản phẩm
         */
        if (diff !== 0 && !(item.product.end_price > 0)) {
          const commPrice = Number(item.common_price);
          item.common_price = Number(commPrice + (commPrice * diff / realTotal)).toFixed(0);
        }
      });
    }
  }
}
