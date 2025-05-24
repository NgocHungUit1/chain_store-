import { Component, DoCheck, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { Observable, Subject } from 'rxjs';
import { Product } from '../../product/product.model';
import { OrderService } from '../order.service';
import { catchError, debounceTime, finalize, map, startWith, switchMap } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { PriceList, PriceListFilter } from '../../price-book/price-list.model';
import { PriceListService } from '../../price-book/price-list.service';
import { NoteDetailOrderDialogComponent } from '../note-detail-order-dialog/note-detail-order-dialog.component';
import { PriceDetailOrderDialogComponent } from '../price-detail-order-dialog/price-detail-order-dialog.component';
import { PriceListProductService } from '../../price-book/price-list-product.service';
import { ItemInvoice, ProductInfo } from '../order.model';
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
import { ExpensesOrder, ExpensesOrderFilter } from '../../expenses-order/expenses-order.model';
import { SaleExpensesDialogComponent } from '../sale-expenses-dialog/sale-expenses-dialog.component';
import { PrescriptionFormDialogComponent } from '../prescription-form-dialog/prescription-form-dialog.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';
import { StoreService } from '../../store/store.service';
import { ProductService } from '../../product/product.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { SaleProductParcelSelectDialogComponent } from '../sale-product-parcel-select-dialog/sale-product-parcel-select-dialog.component';
import {AuthService} from '../../authentication/auth.service';
import { SharedDataService } from '../../shared/shared-data.service';
import { BankAccountDialogComponent } from '../bank-account-dialog/bank-account-dialog.component';
import { PaymentQrDialogComponent } from '../payment-qr-dialog/payment-qr-dialog.component';
import { TransactionNotifyDialogComponent } from '../transaction-notify-dialog/bank-account-dialog.component';
import { BankAccountService } from '../../bank-account/bank-account.service';
import { BankAccountFilter } from '../../bank-account/bank-account.model';
import { SearchProductDialogComponent } from '../../common/search-product-dialog/search-product-dialog.component';

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
interface BankAccount {
  id: string;
  bank_code: string;
  account_number: string;
  account_name: string;
}
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
export class SaleMainComponent implements OnInit, DoCheck {
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
    private authSer: AuthService,
    private sharedDataSer: SharedDataService,
    public storeSer: StoreService,
    private productSer: ProductService,
    private bankAccountSer: BankAccountService,

  ) {
    this.optionStoreService.getValue('point_enabled').subscribe(res => {
      this.isPointEnabled = res.value === 'true';
    });

    this.optionStoreService.getValue('point_point_to_cash_rate').subscribe(res => {
      this.pointToCashRate = parseInt(res.value);
    });

    this.optionStoreService.getValue('point_can_pay_by_point_after_invoices').subscribe(res => {
      this.canPayByPointAfterInvoices = parseInt(res.value);
    });

    this.optionStoreService.getValue('sale_negative_stock').subscribe(res => {
      this.canNegativeStock = res.value === 'yes';
    });
  }
  private loadBankAccountsSubject = new Subject<void>(); // Subject to trigger debouncing

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
  customer: Customer;

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

  canNegativeStock: boolean = false;
  isPointEnabled: boolean = false;
  pointToCashRate: number = 0;
  canPayByPointAfterInvoices: number = 0;
  isUsePoint: boolean = false;
  pointCanUse: number = 0;
  numberPointDiscount: number = 0;
  paymentForm: FormGroup;
  paymentMethods: string[] = ['Tiền mặt', 'Chuyển khoản'];
  amounts: number[] = [20000, 50000, 100000, 200000, 500000];
  selectedMethod: string = this.paymentMethods[0];
  selectedAmount: number | null = null;
  selectedBankQr: string;
  selectedWallet: any;
  bankAccounts: any[] = [];
  filteredBankAccounts: any[] = [];
  searchTerm: string = '';
  isDropdownOpen: boolean = false;
  wallets: any[] = [];
  bankAccountFilter: BankAccountFilter = new BankAccountFilter();
  @ViewChild('prescription') prescription;
  @ViewChild('customerSearch') customerSearch: ElementRef;
  @ViewChild('customerPayment') customerPayment: ElementRef;
  @ViewChild('showListProd') showListProd: ElementRef;
  @ViewChild('einvoiceCheckbox') einvoiceCheckbox;

  @ViewChildren('noteTextArea') noteTextArea!: QueryList<ElementRef<HTMLTextAreaElement>>;
  isEinvoiceEnabled = false;

  private _prevTotal = this.total;
  private _selectedBankAccount: BankAccount|null = null;

  get total(): number {
    return this.sumPrice
         - this.numberDiscount
         - this.numberPointDiscount
         + this.expenseOrder;
  }
  get selectedBankAccount(): BankAccount|null {
    return this._selectedBankAccount;
  }
  set selectedBankAccount(acct: BankAccount|null) {
    this._selectedBankAccount = acct;

    if (!acct) {
      // no bank → clear QR
      this.selectedBankQr = '';
      return;
    }

    // show spinner
    this.isLoadingResults = true;

    // fetch the new QR, hide spinner when done
    this.getQrCode(acct)
      .pipe(finalize(() => this.isLoadingResults = false))
      .subscribe(qr => {
        // debugger;
        this.selectedBankQr = qr;
      });
  }
  onTotalChange() {
    this.getQrCode(this.selectedBankAccount).subscribe(qrCode=>{
      this.selectedBankQr = qrCode
    });    // …do whatever you need here…
    if (this.form.controls['customerPay'].value !== 0) {
      this.tinhLaiTienThua(); //Tín: khách thanh toán = 0 thì mặc định thanh toán hết => nợ = 0
    }
  }
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

    await this.handlePointDiscountSiderBar(mItemInvoice);

    await this.handlePaymentSiderBar(mItemInvoice);


    this.triggerLoadBankAccounts();

    this.filteredBankAccounts = [...this.bankAccounts];

    this.localItemInvoice = mItemInvoice;

    this.handleLoadParcel(mItemInvoice);
    this.handleAddMasterTag(mItemInvoice);
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

    this.sharedDataSer.isInSoLo$.subscribe(res=>{
      this.autoPrintInSoLo = res;
    })
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
      this.customer = mItemInvoice.customer;
    } else {
      this.customer = null;
      this.selectCustomer.patchValue('');
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

      // console.log(priceBookID);

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

          const groupProductIdCommonPrice =
          listProductOLD !== null
            ? listProductOLD.reduce((r, a) => {
              r[a.product_id] = [...(r[a.product_id] || []), a];
              return r;
            }, {})
            : [];
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
                      if(groupProductIdCommonPrice[elementData.product_id] && groupProductIdCommonPrice[elementData.product_id].length >= 1) {
                        elementData.common_price = groupProductIdCommonPrice[elementData.product_id][0].common_price;
                      } else {
                        elementData.common_price = group[elementData.product_unit_id][0]['price'];
                      }
                      elementData.common_price =  elementData.common_price ?? 0;

                      if (!(elementData.sample_prescription_id !== undefined && elementData.sample_prescription_id !== null)) {
                        if (elementData.product.end_price === undefined) {
                          this.sumPrice +=
                            elementData.common_price *
                            elementData.amount; // gia chung * so luong
                        } else {
                          this.sumPrice +=
                            elementData.product.end_price * elementData.amount; // gia chung * so luong
                        }
                      }
                    } else {
                      if (groupProductIdCommonPrice[elementData.product_id] && groupProductIdCommonPrice[elementData.product_id].length >= 1) {
                        elementData.common_price = groupProductIdCommonPrice[elementData.product_id][0].common_price;
                      } else {
                        elementData.common_price = elementData.product.sell_price;
                      }
                      elementData.common_price =  elementData.common_price ?? 0;

                      if (!(elementData.sample_prescription_id !== undefined && elementData.sample_prescription_id !== null)) {
                        if (elementData.product.end_price === undefined) {
                          this.sumPrice +=
                            elementData.common_price * elementData.amount; // gia ban * so luong
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
                this.handleDiscountSiderBar(mItemInvoice);
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
          this.handleDiscountSiderBar(mItemInvoice);
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
      use_einvoice: [false],
      selectedMethod: ['Tiền mặt'] // Default value
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
        // if (value !== '') {
          // lookup from github
          return this.lookupUser(value);
        // } else {
        //   // if no value is present, return null
        //   return of(null);
        // }
      })
    );

    // Kiểm tra cấu hình hóa đơn điện tử
    this.optionStoreService.getValue('einvoice_enabled').subscribe(res => {
      this.isEinvoiceEnabled = res.value === 'true';
    });
    this.loadBankAccountsSubject.pipe(
      debounceTime(300) // Wait for 300ms of inactivity
    ).subscribe(() => {
      this.loadBankAccounts(); // Call the actual function after debounce
    });
  }

  ngDoCheck() {
    const t = this.total;
    if (t !== this._prevTotal) {
      this._prevTotal = t;
      this.onTotalChange();
    }
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

  adjustAmountProduct(i: any, event) {
    const product = this.listProduct[i];
    const currentValue = product['amount'];
    let newValue;
    if (event === 'up') {
      newValue = currentValue + 1;
    } else {
      newValue = currentValue - 1;
    }

    this.orderService.inputAmountProduct(i, newValue);
    this.handleAddRowIfNecessary(i, newValue);
    this.handleExpenseOrder();

  }

  upAmountProductReturn( i: any) {
    this.orderService.upAmountProductReturn(i);
  }

  downAmountProduct(product_id) {
    this.orderService.downAmountProduct(product_id);
    this.handleExpenseOrder();
  }

  inputAmountProduct(product_index, event) {
    const value = Number(event.target.value);
    this.orderService.inputAmountProduct(product_index, value);
    this.handleAddRowIfNecessary(product_index, value);
    this.listProduct = [...this.listProduct];
  }

  inputAmountProductReturn(product_index: number, event) {
    const value = event.target.value;
    this.orderService.inputAmountProductReturn(product_index, value);
    this.handleAddRowIfNecessary(product_index, value);
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

  removeCustomer() {
    const listInvoice = this.orderService.getListInvoiceLocalStorage();
    const listItemInvoice = listInvoice.itemInvoice;
    listItemInvoice.forEach(element => {
      if (element.active === true) {
        delete element.customer;
      }
    });
    this.orderService.setListInvoiceLocalStorage(listInvoice);
    this.selectCustomer.patchValue('');
    this.isSelectedCustomer = false;
    this.customer = null;
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
      return this.customerService.autocomplete(value, 'total_point,total_invoice,total_debt').pipe(
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
        this.discount_type = 'percent';
      }
      this.discount = discountSiderBar?.number;
    } else {
      this.numberDiscount = 0;
    }
  }

  handlePointDiscountSiderBar(mItemInvoice) {
    const {pointDiscountSiderBar, customer} = mItemInvoice;
    this.isUsePoint = pointDiscountSiderBar?.isUsePoint || false;
    let pointCanUse = Math.floor((this.sumPrice - this.numberDiscount + this.expenseOrder) / this.pointToCashRate) || 0;
    if (customer && pointCanUse > customer.total_point) {
      pointCanUse = customer.total_point;
    }

    this.pointCanUse = pointCanUse;
    this.numberPointDiscount = this.isUsePoint ? pointCanUse * this.pointToCashRate : 0;
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

  openBankAccountsDialog() {
    const dialogRef = this.dialog.open(BankAccountDialogComponent, {
      width: '500px',
      minHeight: '300px',
      panelClass: 'rounded-dialog'
    });

    dialogRef.afterClosed().subscribe(bankAccount => {
      if (bankAccount !== undefined) {
        this.selectedBankAccount = bankAccount
        this.triggerLoadBankAccounts();
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

  openPaymentQrDialog() {
    const dialogRef = this.dialog.open(PaymentQrDialogComponent, {
      data:{
          accountName: this.selectedBankAccount.account_name,
          accountNumber: this.selectedBankAccount.account_number,
          bankCode: this.selectedBankAccount.bank_code,
          qrImageUrl: this.selectedBankQr,
      }

    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
      }
    });
  }

  openTransactionNotifyDialog() {
    const dialogRef = this.dialog.open(TransactionNotifyDialogComponent, {
      width: '800px',
      data: this.selectedBankAccount
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
      }
    });
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
    let _font_size_store = '13px';
    let _margin = '4px';
    let _padding = '3px';
    let _solo = 'text-align:left;';

    this.optionStoreService.getValue('print_type').subscribe(res => {
      if (res.value === 'K58') {
        _font_size = '11px';
        _margin = '4px';
        _padding = '3px';
        _solo = 'text-align:left;';
      } else { // A4
        _font_size = '14px';
        _font_size_store = '16px';
        _margin = '6px';
        _padding = '6px';
        _solo = 'text-align:left; min-width: 100px;';
      }

      this.orderService.getDataInvoiceToPrint(invoice_id).subscribe(res => {
        const customer_name = (res?.customer?.name !== null && res?.customer?.name !== undefined) ? res?.customer?.name : 'Khách lẻ';
        const customer_phone = (res?.customer?.phone !== null && res?.customer?.phone !== undefined) ? res?.customer?.phone : '';

        // debugger
        let printContent = '<title>' + res?.invoice_no + '</title>';
        printContent += `
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              width: 100%;
            }
            p, div {
              font-size: ${_font_size};
              margin: ${_margin};
              padding: 0;
              line-height: 1.2;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: ${_font_size};
            }
            th, td {
              padding: ${_padding};
              text-align: left;
            }
            .center {
              text-align: center;
            }
            .bold {
              font-weight: bold;
            }
            .right {
              text-align: right;
            }

            .invoice-table {
              width: 100%;
              border-collapse: collapse;
            }
            .header-border {
              border-top: 1px solid black;
              border-bottom: 1px solid black;
            }

            .top-border {
              border-top: 1px dashed black;
            }
          </style>
          <section style="padding: 5px; font-size: ${_font_size}; width: 100%;">
            ${this.logo ? `<p class="center"><img src="${this.logo}" style="max-width: 120px;"></p>` :
                          `<p class="center"><img src="assets/images/Rx20_16x16_op1-1207.png" style="max-width: 120px;"></p>`}
            <p class="center bold" style="font-size: ${_font_size_store}">${res?.store?.name || 'Store Name'}</p>
            <p class="center">${res?.store?.address || 'Store Address'}</p>
            <p class="center bold">HÓA ĐƠN BÁN HÀNG</p>
            <p class="center bold">Số HĐ: ${res?.invoice_no}</p>
            <p class="center">Ngày ${res?.created_at}</p>
        `;

        // Customer info
        const { nationalPrescription } = res;
        if (nationalPrescription) {
          printContent += `
            <p>Mã đơn thuốc: <b>${nationalPrescription.nationalPrescriptionId || ''}</b></p>
            <p>Tên đơn vị: <b>${nationalPrescription.medicalFacilityName || ''}</b></p>
            <p>Họ tên: <b>${nationalPrescription.patientName || ''}</b></p>
            <p>SĐT: <b>${nationalPrescription.patientPhoneNumber || ''}</b></p>
            <p>Ngày sinh: <b>${nationalPrescription.patientDOB || ''}</b>
              Cân nặng: <b>${nationalPrescription.patientWeight || ''}</b>
              Giới tính: <b>${nationalPrescription.patientSex || ''}</b></p>
            <br>
            <p><b>Chẩn đoán:</b> ${nationalPrescription?.diagnostics?.[0]?.conclusion || ''}</p>
          `;
        } else {
          printContent += `<p>Khách hàng: ${customer_name}</p>`;
          if (customer_phone) {
            printContent += `<p>SĐT: ${customer_phone}</p>`;
          }
        }

        printContent += `
          <table>
            <tr class="header-border">
              <th style="width: 40%;">Đơn giá</th>
              <th style="width: 20%; text-align: center;">SL</th>`;

        // Add Số lô column header if needed
        if (this.autoPrintInSoLo === true) {
          printContent += `<th style="${_solo}">Số lô</th>`;
        }

        printContent += `<th style="width: 40%; text-align: right;">Thành tiền</th>
            </tr>
        `;

        // Product details
        const detail = res.detail || [];
        detail.forEach(element => {
          if (!element?.base_unit) {
            printContent += `
              <tr>
                <td colspan="${this.autoPrintInSoLo ? '4' : '3'}">${element.product?.product_name || ''}</td>
              </tr>
              <tr>
                <td>${numeral(element.price || 0).format('0,0')}</td>
                <td style="text-align: center;">${element.amount || 0}</td>`;

            // Add Số lô cell if needed
            if (this.autoPrintInSoLo === true) {
              printContent += `<td style="text-align:left;">${element.so_lo || ''}</td>`;
            }

            printContent += `<td style="text-align: right;">${numeral(element.total || 0).format('0,0')}</td>
              </tr>
            `;
          } else {
            printContent += `
              <tr>
                <td colspan="${this.autoPrintInSoLo ? '4' : '3'}">${element.product?.product_name || ''} - (${element?.base_unit || ''})</td>
              </tr>
              <tr>
                <td>${numeral(element.price || 0).format('0,0')}</td>
                <td style="text-align: center;">${element.amount || 0}</td>`;

            // Add Số lô cell if needed
            if (this.autoPrintInSoLo === true) {
              printContent += `<td style="text-align:left;">${element.so_lo || ''}</td>`;
            }

            printContent += `<td style="text-align: right;">${numeral(element.total || 0).format('0,0')}</td>
              </tr>
            `;
          }
        });

        // Determine the colspan based on whether _solo is included
        const colspan = this.autoPrintInSoLo ? '3' : '2';

        // Totals
        printContent += `
          <tr class="top-border">
            <td colspan="${colspan}" class="right bold">Tổng tiền hàng :</td>
            <td class="right bold">${numeral(res?.total_price || 0).format('0,0')}</td>
          </tr>
          <tr>
            <td colspan="${colspan}" class="right bold">Chiết khấu :</td>
            <td class="right bold">${numeral(res?.discount || 0).format('0,0')}</td>
          </tr>
          <tr>
            <td colspan="${colspan}" class="right bold">Tổng thanh toán :</td>
            <td class="right bold">${numeral(res?.sum_payment || 0).format('0,0')}</td>
          </tr>
        `;

        if (res.debt !== null) {
          printContent += `
            <tr>
              <td colspan="${colspan}" class="right bold">Còn nợ :</td>
              <td class="right bold">${numeral(res.debt).format('0,0')}</td>
            </tr>
          `;
        }

        printContent += `</table>`;
        // debugger;
        // Add Vietnamese text for the amount
        printContent += `<p>${this.numberToVietnameseText(numeral(res?.sum_payment).value() || 0)}</p>`;

        // Footer with QR code
        printContent += `
          <br>
          <p class="center"><img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=Cám%20ơn%20và%20hẹn%20gặp%20lại" style="width: 80px; height: 80px;" onload="onQrLoaded()"></p>
          <p class="center" style="font-style: italic;">Cám ơn và hẹn gặp lại!</p>
          <p class="center" style="font-size: 9px;">POWERED BY rx20.vn</p>
          <script>
            function onQrLoaded() {
              window.print();
            }
            window.onafterprint = function() {
              window.close();
            }
          </script>
          </section>
        `;

        const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
        WindowPrt.document.write(printContent);
        WindowPrt.document.close();
        WindowPrt.focus();
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
  printPreInvoice(preInvoiceData: any) {
    let _font_size = '11px';
    let _font_size_store = '13px';
    let _margin = '4px';
    let _padding = '3px';
    let _solo = 'text-align:left;';

    // Determine print type (K58 or A4)
    this.optionStoreService.getValue('print_type').subscribe(res => {
      if (res.value === 'K58') {
        _font_size = '11px';
        _margin = '4px';
        _padding = '3px';
        _solo = 'text-align:left;';
      } else { // A4
        _font_size = '14px';
        _font_size_store = '16px';
        _margin = '6px';
        _padding = '6px';
        _solo = 'text-align:left; min-width: 100px;';
      }

      // Use preInvoiceData instead of fetching from service
      const customer_name = preInvoiceData?.customer?.name || 'Khách lẻ';
      const customer_phone = preInvoiceData?.customer?.phone || '';
      const invoiceDate = preInvoiceData?.created_at ? new Date(preInvoiceData.created_at) : new Date();

      let printContent = '<title>Chi nhánh trung tâm - Bán hàng</title>'; // Temporary title
      printContent += `
        <style>
          p, table, div {
            font-family: Arial, sans-serif;
            font-size: ${_font_size};
            margin: ${_margin};
          }
          table, th, td {
            border-collapse: collapse;
            border: 1px solid black;
            width: 100%;
          }
          td, th {
            border: 1px solid black;
            text-align: left;
            padding: ${_padding};
          }
        </style>
        <section style="padding: 10px; font-size: ${_font_size}">
          ${this.logo ? `<p style="text-align:center; margin-bottom: 10px"><img src="${this.logo}" style="max-width: 160px;"></p>` : ''}
          <p style="text-align:center; font-size: ${_font_size_store}">${preInvoiceData?.store?.name || 'Store Name'}</p>
          <p style="text-align:center;">${preInvoiceData?.store?.address || 'Store Address'}</p>
          <p style="text-align:center; font-weight:600;">HÓA ĐƠN BÁN HÀNG (DỰ THẢO)</p>
          <p style="text-align:center; font-weight:600;">Số HĐ: Chưa lưu</p>
          <p style="text-align:center;">Ngày ${invoiceDate.getDate()} tháng ${invoiceDate.getMonth()} năm ${invoiceDate.getFullYear()}</p>
          <br>
      `;

      // Customer info
      const { nationalPrescription } = preInvoiceData || {};
      if (nationalPrescription) {
        printContent += `
          <p>Mã đơn thuốc: <b>${nationalPrescription.nationalPrescriptionId || ''}</b></p>
          <p>Tên đơn vị: <b>${nationalPrescription.medicalFacilityName || ''}</b></p>
          <p>Họ tên: <b>${nationalPrescription.patientName || ''}</b></p>
          <p>SĐT: <b>${nationalPrescription.patientPhoneNumber || ''}</b></p>
          <p>Ngày sinh: <b>${nationalPrescription.patientDOB || ''}</b>
                Cân nặng: <b>${nationalPrescription.patientWeight || ''}</b>
                Giới tính: <b>${nationalPrescription.patientSex || ''}</b></p>
          <br>
          <p><b>Chẩn đoán:</b> ${nationalPrescription?.diagnostics?.[0]?.conclusion || ''}</p>
        `;
      } else {
        printContent += `<p style="">Khách hàng: ${customer_name}</p>`;
        if (customer_phone) {
          printContent += `<p style="">SĐT: ${customer_phone}</p>`;
        }
      }

      printContent += `
        <br>
        <table>
          <tr>
            <th>Tên thuốc</th>
            <th style="text-align:center;">SL</th>
            ${this.autoPrintInSoLo ? `<th style="${_solo}">Số lô</th>` : ''}
            <th style="text-align:center;">T.Tiền</th>
          </tr>
      `;

      // Product details
      const detail = preInvoiceData?.detail || [];
      detail.forEach((element: any) => {
        if (!element?.base_unit) {
          printContent += `
            <tr>
              <td>${element.product?.product_name || ''}<br>${element.price || 0}</td>
              <td style="text-align:center;">${element.amount || 0}</td>
              ${this.autoPrintInSoLo ? `<td style="text-align:left;">${element.so_lo || ''}</td>` : ''}
              <td style="text-align:right;">${element.total || 0}</td>
            </tr>
          `;
        } else {
          printContent += `
            <tr>
              <td>${element.product?.product_name || ''} - ${element?.base_unit || ''}<br>${element.price || 0}</td>
              <td style="text-align:center;">${element.amount || 0}</td>
              ${this.autoPrintInSoLo ? `<td style="text-align:left;">${element.so_lo || ''}</td>` : ''}
              <td style="text-align:right;">${element.total || 0}</td>
            </tr>
          `;
        }
      });

      // Totals
      const colspan = this.autoPrintInSoLo ? 3 : 2;
      printContent += `
        <tr>
          <td style="text-align:right; font-weight:600;" colspan="${colspan}">Tổng tiền hàng :</td>
          <td style="text-align:right; font-weight:600;">${preInvoiceData?.total_price || 0}</td>
        </tr>
        <tr>
          <td style="text-align:right; font-weight:600;" colspan="${colspan}">Chiết khấu :</td>
          <td style="text-align:right; font-weight:600;">${preInvoiceData?.discount || 0}</td>
        </tr>
        <tr>
          <td style="text-align:right; font-weight:600;" colspan="${colspan}">Tổng thanh toán :</td>
          <td style="text-align:right; font-weight:600;">${preInvoiceData?.sum_payment || 0}</td>
        </tr>
      `;
      if (preInvoiceData?.debt != null) {
        printContent += `
          <tr>
            <td style="text-align:right; font-weight:600;" colspan="${colspan}">Còn nợ :</td>
            <td style="text-align:right; font-weight:600;">${preInvoiceData.debt}</td>
          </tr>
        `;
      }
      printContent += `</table>`;

      // Footer
      printContent += `
        <br>
        ${this.description && this.description.length > 0
          ? `<p style="text-align:center; font-style: italic;">${this.description}</p>`
          : `<p style="text-align:center; font-style: italic;">Cám ơn và hẹn gặp lại.</p>`}
        </section>
      `;

      const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
      WindowPrt.document.write(printContent);
      WindowPrt.document.close();
      WindowPrt.focus();
      WindowPrt.print();
      // WindowPrt.close(); // Uncomment if you want to auto-close after printing
    });
  }



  async getPreInvoiceData(): Promise<any> {
    // debugger;
    const activeInvoice = this.localItemInvoice || new ItemInvoice();
    const formData = this.form.getRawValue();

    const detail = this.listProduct.map(item => ({
      product: { product_name: item.product.product_name },
      base_unit: item.base_unit || null,
      price: item.common_price || item.product.sell_price || item.product.end_price || 0,
      amount: item.amount || 0,
      total: (item.common_price || item.product.sell_price || item.product.end_price || 0) * (item.amount || 0),
      so_lo: item.so_lo || ''
    }));

    const totalPrice = this.sumPrice;
    const discount = this.discount_type === 'price' ? this.discount : Math.round((this.sumPrice * this.discount) / 100);
    const sumPayment = totalPrice - this.numberDiscount - this.numberPointDiscount + this.expenseOrder;
    const debt = this.tienKhachNo > 0 ? this.tienKhachNo : null;

    // Await store data
    const storeRes = await this.storeSer.getDetail().toPromise();
    const storeData = {
      name: storeRes['name'] || 'Store Name',    // Adjust if property names differ
      address: storeRes['address'] || 'Store Address'
    };

    const today = formData.today instanceof Date ? formData.today : new Date();
    const createdAt = formData.today && formData.time
      ? `${this.dp.transform(today, 'yyyy-MM-dd')} ${formData.time}`
      : new Date().toLocaleString();

    return {
      store: storeData,
      customer: this.customer || activeInvoice.customer || { name: 'Khách lẻ', phone: '' },
      detail: detail,
      total_price: totalPrice,
      discount: discount || 0,
      sum_payment: sumPayment,
      debt: debt,
      nationalPrescription: activeInvoice.prescription_id ? this.getNationalPrescriptionData(activeInvoice.prescription_id) : null,
      invoice_no: activeInvoice.invoice_name || 'Chưa lưu',
      created_at: createdAt
    };
  }

  printPreInvoiceV2(preInvoiceData: any) {
    let _font_size = '11px';
    let _font_size_store = '13px';
    let _margin = '4px';
    let _padding = '3px';
    let _solo = 'text-align:left;';

    // Determine print type (K58 or A4)
    this.optionStoreService.getValue('print_type').subscribe(res => {
      if (res.value === 'K58') {
        _font_size = '11px';
        _margin = '4px';
        _padding = '3px';
        _solo = 'text-align:left;';
      } else { // A4
        _font_size = '14px';
        _font_size_store = '16px';
        _margin = '6px';
        _padding = '6px';
        _solo = 'text-align:left; min-width: 100px;';
      }

      // Use preInvoiceData instead of fetching from service
      const customer_name = preInvoiceData?.customer?.name || 'Khách lẻ';
      const customer_phone = preInvoiceData?.customer?.phone || '';
      const invoiceDate = preInvoiceData?.created_at ? new Date(preInvoiceData.created_at) : new Date();

      let printContent = '<title>Chi nhánh trung tâm - Bán hàng</title>'; // Temporary title
      printContent += `
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            width: 100%;
          }
          p, div {
            font-size: ${_font_size};
            margin: ${_margin};
            padding: 0;
            line-height: 1.2;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: ${_font_size};
          }
          th, td {
            padding: ${_padding};
            text-align: left;
          }
          .center {
            text-align: center;
          }
          .bold {
            font-weight: bold;
          }
          .right {
            text-align: right;
          }

          .invoice-table {
            width: 100%;
            border-collapse: collapse;
          }
          .header-border {
            border-top: 1px solid black;
            border-bottom: 1px solid black;
          }

          .top-border {
            border-top: 1px dashed black;
          }
        </style>
        <section style="padding: 5px; font-size: ${_font_size}; width: 100%;">
          ${`<p class="center"><img src="${this.logo??'assets/images/Rx20_16x16_op1-1207.png'}" style="max-width: 120px;"></p>`}
          <p class="center bold" style="font-size: ${_font_size_store}">${preInvoiceData?.store?.name || 'Store Name'}</p>
          <p class="center">${preInvoiceData?.store?.address || 'Store Address'}</p>
          <p class="center bold">HÓA ĐƠN TẠM TÍNH</p>
          <p class="center bold">Số HĐ: Chưa lưu</p>
          <p class="center">Ngày ${invoiceDate.getDate()} tháng ${invoiceDate.getMonth() + 1} năm ${invoiceDate.getFullYear()}</p>
      `;

      // Customer info
      const { nationalPrescription } = preInvoiceData || {};
      if (nationalPrescription) {
        printContent += `
          <p>Mã đơn thuốc: <b>${nationalPrescription.nationalPrescriptionId || ''}</b></p>
          <p>Tên đơn vị: <b>${nationalPrescription.medicalFacilityName || ''}</b></p>
          <p>Họ tên: <b>${nationalPrescription.patientName || ''}</b></p>
          <p>SĐT: <b>${nationalPrescription.patientPhoneNumber || ''}</b></p>
          <p>Ngày sinh: <b>${nationalPrescription.patientDOB || ''}</b>
            Cân nặng: <b>${nationalPrescription.patientWeight || ''}</b>
            Giới tính: <b>${nationalPrescription.patientSex || ''}</b></p>
          <br>
          <p><b>Chẩn đoán:</b> ${nationalPrescription?.diagnostics?.[0]?.conclusion || ''}</p>
        `;
      } else {
        printContent += `<p>Khách hàng: ${customer_name}</p>`;
        if (customer_phone) {
          printContent += `<p>SĐT: ${customer_phone}</p>`;
        }
      }

      printContent += `

      <table>
        <tr class="header-border">
          <th style="width: 40%;">Đơn giá</th>
          <th style="width: 20%; text-align: center;">SL</th>`;

      // Add Số lô column header if needed
      if (this.autoPrintInSoLo === true) {
        printContent += `<th style="${_solo}">Số lô</th>`;
      }

      printContent += `<th style="width: 40%; text-align: right;">Thành tiền</th>
        </tr>
      `;

      // Product details
      const detail = preInvoiceData?.detail || [];
      detail.forEach((element: any) => {
        if (!element?.base_unit) {
          printContent += `
            <tr>
              <td colspan="${this.autoPrintInSoLo ? '4' : '3'}">${element.product?.product_name || ''}</td>
            </tr>
            <tr>
              <td>${numeral(element.price || 0).format('0,0')}</td>
              <td style="text-align: center;">${element.amount || 0}</td>`;

          // Add Số lô cell if needed
          if (this.autoPrintInSoLo === true) {
            printContent += `<td style="text-align:left;">${element.so_lo || ''}</td>`;
          }

          printContent += `<td style="text-align: right;">${numeral(element.total || 0).format('0,0')}</td>
            </tr>
          `;
        } else {
          printContent += `
            <tr>
              <td colspan="${this.autoPrintInSoLo ? '4' : '3'}">${element.product?.product_name || ''} - (${element?.base_unit || ''})</td>
            </tr>
            <tr>
              <td>${numeral(element.price || 0).format('0,0')}</td>
              <td style="text-align: center;">${element.amount || 0}</td>`;

          // Add Số lô cell if needed
          if (this.autoPrintInSoLo === true) {
            printContent += `<td style="text-align:left;">${element.so_lo || ''}</td>`;
          }

          printContent += `<td style="text-align: right;">${numeral(element.total || 0).format('0,0')}</td>
            </tr>
          `;
        }
      });

      // Determine the colspan based on whether _solo is included
      const colspan = this.autoPrintInSoLo ? '3' : '2';

      // Totals
      printContent += `
        <tr class="top-border">
          <td colspan="${colspan}" class="right bold">Tổng tiền hàng :</td>
          <td class="right bold">${numeral(preInvoiceData?.total_price || 0).format('0,0')}</td>
        </tr>
        <tr>
          <td colspan="${colspan}" class="right bold">Chiết khấu :</td>
          <td class="right bold">${numeral(preInvoiceData?.discount || 0).format('0,0')}</td>
        </tr>
        <tr>
          <td colspan="${colspan}" class="right bold">Tổng thanh toán :</td>
          <td class="right bold">${numeral(preInvoiceData?.sum_payment || 0).format('0,0')}</td>
        </tr>
      `;
      if (preInvoiceData?.debt != null) {
        printContent += `
          <tr>
            <td colspan="${colspan}" class="right bold">Còn nợ :</td>
            <td class="right bold">${numeral(preInvoiceData.debt).format('0,0')}</td>
          </tr>
        `;
      }
      printContent += `</table>`;
      printContent += `<p>${this.numberToVietnameseText(+preInvoiceData?.sum_payment || 0)}</p>`

      // Footer with QR code
      printContent += `
          <br>
          <p class="center"><img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=Cám%20ơn%20và%20hẹn%20gặp%20lại" style="width: 80px; height: 80px;" onload="onQrLoaded()"></p>
          <p class="center" style="font-style: italic;">Cám ơn và hẹn gặp lại!</p>
          <p class="center" style="font-size: 9px;">POWERED BY rx20.vn</p>
          <script>
            function onQrLoaded() {
              window.print();
            }
            window.onafterprint = function() {
              window.close();
            }
          </script>
          </section>
        `;

        const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
        WindowPrt.document.write(printContent);
        WindowPrt.document.close();
        WindowPrt.focus();
      // WindowPrt.close(); // Uncomment if you want to auto-close after printing
    });
  }

  private getNationalPrescriptionData(prescriptionId: string): any {
    // Placeholder: Replace with actual logic if available
    return null;
  }

  async printPreInvoiceHandler() {
    const preInvoiceData = await this.getPreInvoiceData();
    this.printPreInvoiceV2(preInvoiceData);
  }

  payment() {
    this.getAutoPrintValue();
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

    // --- Determine Payment Method and Bank Account ---
    let paymentMethodValue = 'cash'; // Default to cash
    let bankAccountId;
    // debugger;
    const selectedPaymentMethod = this.form.get('selectedMethod').value;

    if (selectedPaymentMethod === 'Chuyển khoản') {
        paymentMethodValue = 'bank_transfer';
        if (this.selectedBankAccount) { // Check if a bank is selected
            bankAccountId = this.selectedBankAccount.id
        } else {
            this.notifySer.notify('warning', 'Vui lòng chọn tài khoản ngân hàng thanh toán!');
            this.submitted = false;
        }
    } else if (selectedPaymentMethod === 'Tiền mặt') {
        paymentMethodValue = 'cash';
        bankAccountId = null;
    }

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
      if (!this.canNegativeStock) {
        // Kiểm tra nếu là cập nhật thì cộng dồn số lượng tồn trước
        let currentStock = product_unit.quantity_of_stock;
        if (mItemInvoice.invoice_id && mItemInvoice.invoice_id > 0) {
          currentStock += element.invoice_detail_amount; // cần tìm số lượng trước khi cập nhật
        }
        if (element.amount > currentStock) {
          this.notifySer.notify(
            'warning',
            `Không đủ số lượng tồn kho sản phẩm ${element.product.product_name} (Tồn kho: ${currentStock})`
          );
          needReturn = 1;
        }
      }
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
        note: element.note,
        discount: discount,
        discount_type: discount_type,
        product_unit_id: element.product_unit_id,
        product_unit_value: element.product_unit_value,
        base_unit: element.base_unit,

        // new parcel, add row task
        parcel_no: element?.product_parcels?.[0]?.parcel_no,
        is_sub_item: element?.product?.is_sub_item,
        master_product_id: element?.product?.master_product_id,
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
        total_price: this.sumPrice,
        discount: this.discount,
        discount_type: this.discount_type,
        note: this.form.controls['noteSiderBar'].value,
        price_book_id: this.form.controls['priceBookID'].value,
        branch_id: this.form.controls['branch_id'].value,
        expenses_order_price: this.expenseOrder,
        prescription_id: this.prescription.checked
                         ? (mItemInvoice.prescription_id || this.prescription_id)
                         : null,
        national_pharmacy_no: this.prescription.checked ? mItemInvoice.national_pharmacy_no : null,
        use_einvoice: this.isEinvoiceEnabled && this.einvoiceCheckbox.checked ? 1 : 0
      },
      UserID: mItemInvoice.user.id,
      InvoiceDetail: invoiceDetail,
      PaymentMethod: paymentMethodValue,
      BankAccountId: bankAccountId,
      PaymentPrice: this.sumPrice - this.numberDiscount - this.numberPointDiscount + this.expenseOrder, // tien thanh toan
      usedPoint: this.isUsePoint ? this.pointCanUse : 0,
      KhachNo: this.tienKhachNo,
      ExpenseOrders: this.expenseOrders,
      date_created: date_created,
    };
    console.log(dataInvoice);

    /**
     * Kiem tra invoice_id la don moi hay don cap nhat
     */
    if (mItemInvoice.invoice_id < 0) {
      this.isLoadingResults = true;
      this.orderService.saleOrder(dataInvoice).subscribe(res => {
        this.isLoadingResults = false;
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
      this.isLoadingResults = true;
      this.orderService.updateOrder(dataInvoice).subscribe(res => {
        this.isLoadingResults = false;
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
          note: element.note,
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

    this.isLoadingResults = true;
    this.orderService.returnsOrder(dataReturn).subscribe(res => {
      this.isLoadingResults = false;
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
    this.customer = null;
    this.sumPrice = 0;
    this.countProduct = 0;
    this.listProduct = [];
    this.prescription.checked = false;
    this.prescription_id = null;
    this.discount = 0;
    this.numberDiscount = 0;
    this.isUsePoint = false;
    this.numberPointDiscount = 0;
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
  // onChangeSlideToggleTuDongInHoaDon(e: any) {
  //   this.autoPrint = e.checked;
  //   // console.log(this.optionStore_auto_print);
  //   // console.log(this.autoPrint);
  //   this.optionStore_auto_print.value = this.autoPrint === false ? 'no' : 'yes';
  //   this.optionStoreService
  //     .update(this.optionStore_auto_print.id, this.optionStore_auto_print)
  //     .subscribe(res => {
  //       console.log(res);
  //     });
  // }

  /**
   * In so lo
   * @param e
   */
  // onChangeSlideToggleInSoLo(e: any) {
  //   this.autoPrintInSoLo = e.checked;
  // }

  onChangeSlideToggleUsePoint(e: any) {
    this.isUsePoint = e.checked;

    const listInvoice = this.orderService.getListInvoiceLocalStorage();
    const listItemInvoice = listInvoice.itemInvoice;
    listItemInvoice.forEach(element => {
      if (element.active === true) {
        element.pointDiscountSiderBar = element.pointDiscountSiderBar || {};
        element.pointDiscountSiderBar.isUsePoint = this.isUsePoint;
        this.orderService.setListInvoiceLocalStorage(listInvoice);
      }
    });
  }

  onChangeProductUnit(e: any, itemProduct, i: number) {
    const units = itemProduct?.product?.productUnits;
    const item = units.find(element => element.id === e.value);
    const curListProduct = this.listProduct;
    curListProduct[i]['product_unit_id'] = item['id'];
    curListProduct[i]['product_unit_value'] = item['value'];
    curListProduct[i]['product']['sell_price'] = item['sell_price'];
    curListProduct[i]['product']['end_price'] = item['sell_price'];
    curListProduct[i]['product']['product_no'] = item['no'];
    curListProduct[i]['common_price'] = item['price'];

    console.log(curListProduct);

    this.listProduct = curListProduct;
    const listInvoice = this.orderService.getListInvoiceLocalStorage();
    const listItemInvoice = listInvoice.itemInvoice;
    listItemInvoice.forEach(element => {
      if (element.active === true) {
        element.listProduct = curListProduct;
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
    let customerPayValue = numeral(this.form.controls['customerPay'].value).value();

    // for case null: delete all in the customerPay input it will be null => làm cách của Đức thì nợ 100% hoá đơn thì ko được
    if(customerPayValue === 0 || customerPayValue === null) {
      customerPayValue = 0;
      // this.tienThuaTraKhach = 0;
      // this.tienKhachNo = 0;
      // return;
    }

    this.tienThuaTraKhach =
      customerPayValue
      - this.sumPrice
      + this.numberDiscount
      + this.numberPointDiscount;
    this.tienKhachNo = this.sumPrice
      - this.numberDiscount
      - this.numberPointDiscount
      - customerPayValue
      + this.expenseOrder;
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
    // debugger;
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

    // console.log(this.listProduct, this.sumPrice, realTotal);

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

  canDo(permissionName: string): boolean {
    const allPermissions = this.authSer.getPermissionsFromLocalStorage();
    return allPermissions.indexOf(permissionName) !== -1;
  }

  // Coding parcel + add row function
  shownMenus: Set<number> = new Set();
  all_product_parcels: Map<string, object[]> = new Map();
  available_product_parcels: Map<string, object[]> = new Map();
  parcelItemControls: Map<number, FormControl> = new Map();
  parcelFilteredItems: Map<number, Observable<object[]>> = new Map();
  separatorKeysCodes: number[] = [ENTER, COMMA];

  /**
   * Receive index and active 1 of 3 actions
   * - If note is not showing -> show the initial textarea
   * - If note is showing -> make it disappear
   * - If note is containing value -> focus into it
   * @param i
   */
  toggleShowNote(i: number) {
    const currentProduct = this.listProduct[i];
    const noteText = currentProduct.note;
    if (noteText == '') {
      delete this.listProduct[i].note;
    } else if (noteText == undefined) {
      this.listProduct[i].note = '';
    } else {
      this.focusTextArea(i);
    }
    this.handleUpdateStorage();
  }

  /**
   * Helping toggleShowNote function to focus into a textArea
   * @param i
   * @private
   */
  private focusTextArea(i: number) {
     setTimeout(() => {
      const textAreaArray = this.noteTextArea.toArray();
        if (textAreaArray[i]) {
          textAreaArray[i].nativeElement.focus();
        }
    }, 0);
  }

  /**
   * Decide a note is shown or not
   * @param i
   */
  isNoteShown(i: number) {
    const note = this.listProduct[i].note;
    return note !== undefined;
  }

  /**
   * Decide a menu selection is shown or not
   * @param i
   */
  isMenuShown(i: number) {
    return this.shownMenus.has(i);
  }

  /**
   * Call when click into the menu icon to show the popup
   * @param i
   */
  toggleShowMenu(i: number) {
    if (this.shownMenus.has(i)) {
      this.shownMenus.delete(i);
    } else {
      this.shownMenus.add(i);
    }
  }

  /**
   * This function must be called after change any pies of data to update the change into the localstorage
   */
  handleUpdateStorage() {
    const listInvoice = this.orderService.getListInvoiceLocalStorage();
    const listItemInvoice = listInvoice.itemInvoice;
    listItemInvoice.forEach(element => {

      if (element.active === true) {
        if (element.invoice_id === this.localItemInvoice.invoice_id) {
          element.listProduct = this.listProduct;
        }
      }
    });
    this.orderService.setListInvoiceLocalStorage(listInvoice);
  }

  /**
   * Get all values of parcels is not selected (copy the logic in warehourse import page)
   * @param product_index
   * @private
   */
  private getAvailableItems(product_index: number) {
    const product = this.listProduct[product_index];
    const product_id = product.product_id.toString();
    return this.available_product_parcels.get(product_id) || [];
  }

  /**
   * Helper function to get the parcels in the selection list
   * @param product_index
   * @param searchText
   * @private
   */
  private _filter(product_index: number, searchText: string) {
    const filterValue = searchText.toLowerCase();
    return this.getAvailableItems(product_index)
     .filter(item =>
        item['parcel_no'].toLowerCase().includes(filterValue)
      );
  }

  /**
   * Get parcels in the filter list
   * @param id
   */
  getFilterItems(id: number): Observable<object[]> {
    return this.parcelFilteredItems.get(id) || of([]);
  }

  /**
   * Set up fields for typing and filter
   * @param product_index
   * @private
   */
  private setupFilteredItems(product_index: number) {
    const control = this.parcelItemControls.get(product_index)!;
    const filterItems = control.valueChanges.pipe(
      // startWith(''),
      map((searchText: string|null) => {
          if (searchText === null || typeof searchText !== 'string') {
            return this.getAvailableItems(product_index);
          }
          return this._filter(product_index, searchText);
        }
      ));
    this.parcelFilteredItems.set(product_index, filterItems);
  }

  // TODO: check later
  public onInputFocus(product_index: number): void {
    // Show all available items when input gets focus
    const availableItems = this.getAvailableItems(product_index);
    this.parcelFilteredItems.set(product_index, of(availableItems));
  }

  // create input for each row
  getItemControl(product_index: number) {
    if (!this.parcelItemControls.has(product_index)) {
      this.parcelItemControls.set(product_index, new FormControl());
      this.setupFilteredItems(product_index);
    }
    return this.parcelItemControls?.get(product_index);
  }



  /**
   * When click into a option of autocomplete chip
   * Put it into the product_parcels and remove from available
   * @param event
   * @param id
   */
  selected(event: MatAutocompleteSelectedEvent, id: number) {
    if (event.option.value == null) {
      return;
    }
    const parcel = event.option.value;
    this.getItemControl(id)?.setValue(null);
    this.listProduct[id].product_parcels.push(parcel);

    const product = this.listProduct[id];
    const product_id = product.product_id.toString();
    const availableItems = this.available_product_parcels.get(product_id);
    availableItems.filter(item => item['parcel_no'] != product.product_parcels[0].parcel_no);
    const listInvoice = this.orderService.getListInvoiceLocalStorage();
    const listItemInvoice = listInvoice.itemInvoice;
    listItemInvoice.forEach(element => {
      if (element.active === true) {
        if (element.invoice_id === this.localItemInvoice.invoice_id) {
          element.listProduct = this.listProduct;
        }
      }
    });
    this.orderService.setListInvoiceLocalStorage(listInvoice);
  }


  /**
   * Opposite with the selectd function
   * @param id
   * @param item
   */
  removeParcel(id: number): void {
    const product = this.listProduct[id];
    if (!product) { return; }
    const parcel = product.product_parcels[0];
    product.product_parcels = [];
    const currentFilteredItems = this.parcelFilteredItems.get(id);
    if (currentFilteredItems) {
      const updatedFilteredItems = currentFilteredItems.pipe(
        map(items => [...items, parcel])  // Add the item back to the array
      );
      this.parcelFilteredItems.set(id, updatedFilteredItems);
    }
    this.handleUpdateStorage();
  }


  /**
   * Handle open Selection Parcel Dialog, allow user enter number amount in the dialog with parcel
   * @param product_index
   */
  openParcelSelectionDialog(product_index: number) {
    const product = this.listProduct[product_index];
    const product_id = product.product_id.toString();
    if (!product) { return; }
    const selectedParcel = product.product_parcels[0] || null;
    const dialogRef = this.dialog.open(SaleProductParcelSelectDialogComponent, {
      width: '40%',
      data: {
        product_id: product.product_id,
        quantity: product.amount,
        selectedParcel: selectedParcel,
        allParcels: this.all_product_parcels.get(product_id),
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) { return; }
      const product = this.listProduct[product_index];
      if (!product) { return; }
      product.product_parcels = [];
      product.product_parcels.push(result.parcel);
      const exist = this.parcelFilteredItems.has(product_index);
      if (exist) {
        const currentFilteredItems = this.getAvailableItems(product_index);
        const selectedParcelNos = new Set(product.product_parcels.map(p => p['parcel_no']));
        const updatedFilteredItems = currentFilteredItems.filter(item => !selectedParcelNos.has(item['parcel_no']));
        this.available_product_parcels.set(product_id, updatedFilteredItems);
        this.setupFilteredItems(product_index);
      }

      product.amount = result.quantity;
      this.listProduct = [...this.listProduct];
      const sum_amount = product.amount;
      let redu = 0;
      let isLastParcel = false;

      if (product.amount > selectedParcel.quantity_of_stock) {
        product.amount = selectedParcel.quantity_of_stock;
        // this.orderService.inputAmountProduct(product_index, selectedParcel.quantity_of_stock);

        redu += selectedParcel.quantity_of_stock;
        const availableParcels = this.getAvailableItems(product_index).filter(
          parcel => parcel['parcel_no'] !== selectedParcel.parcel_no
        );
        const sortedParcels = [...availableParcels].sort((a, b) => {
          const dateA = new Date(a['expiration_date']);
          const dateB = new Date(b['expiration_date']);
          return dateA.getTime() - dateB.getTime();
        });
        for (let i = 0; i < sortedParcels.length; i++) {
          const parcel = sortedParcels[i];

          if (redu >= sum_amount) {
            break;
          }
          const remain = sum_amount - redu;

          isLastParcel = (i === sortedParcels.length - 1) || (redu + parcel['quantity_of_stock'] >= sum_amount);

          let quantityToAdd;
          if (isLastParcel) {
            quantityToAdd = remain;
          } else {
            quantityToAdd = Math.min(parcel['quantity_of_stock'], remain);
          }
          this.addNewRow(product_index, parcel, quantityToAdd);
          redu += quantityToAdd;

          if (redu >= sum_amount) {
            break;
          }
        }
      }
      this.handleExpenseOrder();
      this.listProduct = [...this.listProduct];
      this.handleUpdateStorage();
    });
  }

  /**
   * Automation add one parcel if the current one smaller than amount input
   * @param product_index
   * @param new_input_amount
   */
  handleAddRowIfNecessary(product_index: number, new_input_amount: number) {
    const product = this.listProduct[product_index];
    if (product.product.is_sub_item) {
      return;
    }
    const selectedParcel = product.product_parcels[0];
    if (!selectedParcel) { return; }
    const sum_amount = new_input_amount;
    let redu = 0;
    let isLastParcel = false;
    const availableParcels = this.getAvailableItems(product_index).filter(
      parcel => parcel['parcel_no'] !== selectedParcel.parcel_no
    );
    if (availableParcels.length == 0) {
      return;
    }
    const existSubItemProduct = this.listProduct[product_index + 1];
    if (existSubItemProduct?.product?.is_sub_item) {
      return;
    }
    if (sum_amount > selectedParcel.quantity_of_stock ) {
      product.amount = selectedParcel.quantity_of_stock;
      this.listProduct[product_index] =  {...product};
      this.listProduct = [...this.listProduct];
      redu += selectedParcel.quantity_of_stock;


      const sortedParcels = [...availableParcels].sort((a, b) => {
        const dateA = new Date(a['expiration_date']);
        const dateB = new Date(b['expiration_date']);
        return dateA.getTime() - dateB.getTime();
      });
      for (let i = 0; i < sortedParcels.length; i++) {
        const parcel = sortedParcels[i];

        if (redu >= sum_amount) {
          break;
        }
        const remain = sum_amount - redu;

        isLastParcel = (i === sortedParcels.length - 1) || (redu + parcel['quantity_of_stock'] >= sum_amount);

        let quantityToAdd;
        if (isLastParcel) {
          quantityToAdd = remain;
        } else {
          quantityToAdd = Math.min(parcel['quantity_of_stock'], remain);
        }

        this.addNewRow(product_index, parcel, quantityToAdd);
        redu += quantityToAdd;
        if (redu >= sum_amount) {
          break;
        }
      }
    }
  }

  /**
   * Main function use to call api and load parcels of each product
   * @param mItemInvoice
   * @private
   */
  private handleLoadParcel(mItemInvoice: ItemInvoice) {
    try {
      const listProduct = mItemInvoice.listProduct;
      if (listProduct !== undefined) {
        listProduct.map(async (product) => {
          const product_id = product.product_id.toString();
          return new Promise<void>((resolveProduct, rejectProduct) => {
            this.productSer.getParcelNew(product_id).pipe(
              map(res => {
                if (res && Array.isArray(res) && res.length > 0) {
                  return (res as object[]).map(item => ({
                    parcel_no: item['parcel_no'],
                    expiration_date: item['expiration_date'],
                    quantity_of_stock: item['quantity_of_stock']
                  }));
                }
                return [];
              })
            ).subscribe({
              next: (formattedRes) => {
                const uniqueParcels = formattedRes.filter((item, index, self) =>
                  index === self.findIndex(t => t.parcel_no === item.parcel_no)
                );
                formattedRes = uniqueParcels;
                if (formattedRes && formattedRes.length > 0) {
                  this.all_product_parcels.set(product_id, formattedRes as object[]);

                  const sortedParcels = [...formattedRes].sort((a, b) => {
                    const dateA = new Date(a.expiration_date);
                    const dateB = new Date(b.expiration_date);
                    return dateA.getTime() - dateB.getTime();
                  });

                  if (!!product.product_parcels) {
                    this.available_product_parcels.set(product_id, formattedRes);
                  } else {
                    product.product_parcels = [];
                    if (product.parcel_no) {
                      const choseParcel = sortedParcels.find(parcel => parcel.parcel_no == product.parcel_no);
                      product.product_parcels.push(choseParcel);
                    } else {
                      product.product_parcels.push(sortedParcels[0]);
                    }
                    const availableParcels = formattedRes.filter(parcel => {
                      if (product.product_parcels &&
                        product.product_parcels.length > 0 &&
                        product.product_parcels[0].parcel_no) {
                        return parcel.parcel_no !== product.product_parcels[0].parcel_no;
                      }
                      return true;
                    });
                    this.available_product_parcels.set(product_id, availableParcels);
                  }
                }
                resolveProduct();
              },
              error: (error) => {
                console.error(`Error loading parcel for product ${product_id}:`, error);
                rejectProduct(error);
              },
              complete: () => {
                resolveProduct();
              }
            });
          });

        });
        this.listProduct = [...listProduct];
        return this.listProduct;
      } else {
        this.listProduct = [];
        return this.listProduct;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add a sub item of product
   * @param i
   * @param parcel
   * @param amount
   */
  addNewRow(i: number, parcel: object = null, amount: number = 0) {
    const oldItem = {...this.listProduct[i]};
    const oldProduct = {...oldItem.product};
    if (oldItem.note != undefined) {
      delete oldItem.note;
    }
    oldProduct.is_sub_item = 1;
    oldProduct.master_product_id = oldProduct.id;
    let newItem: object = {};
    if (parcel) {
       newItem = {...oldItem, product: oldProduct, product_parcels: [parcel], amount: amount};
    } else {
       newItem = {...oldItem, product: oldProduct, product_parcels: [], amount: 1};

    }
    this.listProduct.splice(i + 1, 0, newItem);
    this.listProduct = [...this.listProduct];
    this.handleUpdateStorage();
  }

  /**
   * Data after getting from api missing master_product_id and is_sub_item now.
   * So we need to inital them, maybe no need in the future
   * @param mItemInvoice
   * @private
   */
  private handleAddMasterTag(mItemInvoice: ItemInvoice) {
    const listProduct = mItemInvoice.listProduct;
    if (listProduct !== undefined) {
      listProduct.map((productInfor) => {
        // add master_product_id = product_id
        productInfor.product.master_product_id = productInfor.master_product_id || productInfor.product.master_product_id || productInfor.product.id;
        // add is_sub_item = 0
        productInfor.product.is_sub_item = productInfor.is_sub_item || productInfor.product.is_sub_item || 0;
        return productInfor; // Make sure to return the modified product
      });
      this.listProduct = [...listProduct];
    }
    // update
  }

  /**
   * Get all master products
   */
  getMasterProducts() {
    return this.listProduct.filter(item => item.product.is_sub_item === 0);
  }

  /**
   * Get all subitem of a master product
    * @param masterProduct
   */
  getSubItemsForMaster(masterProduct) {
    return this.listProduct.filter(item =>
      item.product.is_sub_item === 1 &&
      item.product.master_product_id === masterProduct.product.id
    );
  }

  /**
   * Get the index of one row in the list
   * @param product
   */
  getProductIndex(product) {
    return this.listProduct.findIndex(item => item === product);
  }

  public clickHelp() {
    window.open('https://rx20.vn/huong-dan-su-dung/', '_black');
  }

  selectAmount(amount: number): void {
    this.selectedAmount = amount;
    this.updateCustomerPay(amount);
  }
  updateCustomerPay(amount: number): void {
    // Update the customerPay form control with the selected amount
    this.form.get('customerPay')?.setValue(numeral(amount.toString()).format('0,0'));

    this.tinhLaiTienThua();
  }
  onMethodChange(): void {
    // console.log(`Selected payment method: ${this.selectedMethod}`);
  }

  loadBankAccounts() {
    function write<K extends keyof BankAccountFilter>(arg: BankAccountFilter, key: K, value: BankAccountFilter[K]): void {
      arg[key] = value;
    }

    write(this.bankAccountFilter, 'page', 1);
    write(this.bankAccountFilter, 'pageSize', 1000);
    write(this.bankAccountFilter, 'status', '10,9');
    write(this.bankAccountFilter, 'expand', 'province,district,ward');

    this.bankAccountSer.getList(this.bankAccountFilter).subscribe((res) => {
      this.bankAccounts = res.body
      if(!this.selectedBankAccount){
        this.selectedBankAccount = this.bankAccounts[0];
        this.getQrCode(this.selectedBankAccount).subscribe(qrCode=>{
          this.selectedBankQr = qrCode;
        });
      }
      this.filterBanks();
    });
  }

  toggleDropdown() {
    this.triggerLoadBankAccounts();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  filterBanks() {
    if (!this.searchTerm) {
      this.filteredBankAccounts = [...this.bankAccounts];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredBankAccounts = this.bankAccounts.filter(bank =>
      bank.bank_code.toLowerCase().includes(term) ||
      bank.account_number.includes(term) ||
      bank.account_name.toLowerCase().includes(term));
  }

  // Function to trigger the debounced loadBankAccounts
  triggerLoadBankAccounts(): void {
    this.loadBankAccountsSubject.next(); // Emit an event to the Subject
  }

  selectBankAccount(bank: BankAccount|null) {
    this.selectedBankAccount = bank;
    this.isDropdownOpen = false;
  }

  getQrCode(bankAccount: BankAccount): Observable<string> {
    if (!bankAccount) {
      // fallback image
      return of(`assets/images/default/qr-code.png`);
    }

    const template    = 'qr_only'; // or 'compact2' | 'compact' | 'print'
    const namePart    = bankAccount.account_name
      ? `&accountName=${encodeURIComponent(bankAccount.account_name)}`
      : '';

    //A short payment memo or description (up to 25 chars).
    const info = ""

    const infoPart    = info
      ? `&addInfo=${encodeURIComponent(info)}`
      : '';

    const amountPart  = this.total;

    // Use acqId (6‑digit BIN) as BANK_ID; adjust if you have a text code instead
    const url = [
      `https://img.vietqr.io/image/`,
      `${bankAccount.bank_code}-${bankAccount.account_number}-${template}.png`,
      `?amount=${amountPart}&accountName=${namePart}&addInfo${infoPart}`
    ].join('');

    return of(url);
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const element = event.target as HTMLElement;
    if (!element.closest('.bank-dropdown-container')) {
      this.isDropdownOpen = false;
    }
  }


  numberToVietnameseText(number) {
    // Handle invalid input
    if (isNaN(number) || number < 0) {
      return "Invalid input";
    }

    // Format the number with commas
    const formattedNumber = number.toLocaleString('vi-VN');

    // Convert number to Vietnamese words
    const vietnameseWords = this.convertNumberToVietnameseWords(number);

    // Return the formatted string
    return `${vietnameseWords} đồng chẵn`;
  }

  /**
   * Converts a number to Vietnamese words
   * @param {number} number - The number to convert
   * @returns {string} Vietnamese words representation of the number
   */
  convertNumberToVietnameseWords(number:number) {
    const units = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
    const teens = ["", "mười một", "mười hai", "mười ba", "mười bốn", "mười lăm", "mười sáu", "mười bảy", "mười tám", "mười chín"];
    const tens = ["", "mười", "hai mươi", "ba mươi", "bốn mươi", "năm mươi", "sáu mươi", "bảy mươi", "tám mươi", "chín mươi"];
    const scales = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

    // Handle zero
    if (number === 0) {
      return "Không";
    }

    // Convert to string and pad to handle groups of 3 digits
    let numStr = number.toString();
    // Ensure string length is multiple of 3 by padding with leading zeros
    const remainder = numStr.length % 3;
    if (remainder > 0) {
      numStr = '0'.repeat(3 - remainder) + numStr;
    }

    // Split into groups of 3 digits
    const groups = [];
    for (let i = 0; i < numStr.length; i += 3) {
      groups.push(numStr.substring(i, i + 3));
    }

    // Process each group
    const results = [];
    groups.forEach((group, index) => {
      const groupIndex = groups.length - 1 - index;
      const groupValue = parseInt(group);

      if (groupValue > 0) {
        const groupText = this.convertGroupToVietnamese(group);
        const scaleText = groupIndex > 0 ? " " + scales[groupIndex] : "";
        results.push(groupText + scaleText);
      }
    });

    // Join groups and capitalize first letter
    let result = results.join(" ");
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  /**
   * Converts a 3-digit group to Vietnamese words
   * @param {string} group - 3-digit group as string
   * @returns {string} Vietnamese words for the group
   */
   convertGroupToVietnamese(group) {
    const units = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
    const digits = group.split('').map(d => parseInt(d));

    let result = "";

    // Handle hundreds
    if (digits[0] > 0) {
      result += units[digits[0]] + " trăm";
    }

    // Handle tens and units
    if (digits[1] > 0) {
      // Add space if we already have hundreds
      if (result !== "") {
        result += " ";
      }

      if (digits[1] === 1) {
        // Special case for "mười"
        result += "mười";
      } else {
        result += units[digits[1]] + " mươi";
      }

      // Handle units
      if (digits[2] > 0) {
        if (digits[2] === 1 && digits[1] !== 0) {
          // Special case for "một" after a "mươi"
          result += " mốt";
        } else if (digits[2] === 5 && digits[1] !== 0) {
          // Special case for "năm" after a "mươi"
          result += " lăm";
        } else {
          result += " " + units[digits[2]];
        }
      }
    } else if (digits[2] > 0) {
      // Only units, no tens
      // Add space if we already have hundreds
      if (result !== "") {
        result += " lẻ ";
      }
      result += units[digits[2]];
    }

    return result;
  }

  public openSearchProductDialog(masterProduct: ProductInfo): void {
    const dialogRef = this.dialog.open(SearchProductDialogComponent, {
      width: '80%',
      minWidth: '750px',
      minHeight: '85%',
      data: {
        is_select_single: true,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result['event'] === 'Choose') {
        if (result['product_id']) {
          this.handleAddProductToList(result['product_id'], masterProduct);
        }
      }
    });
  }

  private handleAddProductToList(productId: number, masterProduct: ProductInfo): void {
    const indexProduct = this.listProduct.findIndex(item => item.product.id === productId);
    if (indexProduct !== -1) {
      this.notifySer.notify('warning', 'Sản phẩm đã tồn tại trong hóa đơn!');
      return;
    }

    this.isLoadingResults = true;
    this.productSer.getDetail(productId.toString(), 'productUnits,quantity')
      .pipe(
        finalize(() => {
          this.isLoadingResults = false;
        })
      )
      .subscribe((product: Product) => {
        product.quantity_of_stock = product.quantity ? product.quantity.number : 0;

        if (product.quantity_of_stock === 0) {
          this.notifySer.notify('warning', 'Sản phẩm không đủ tồn kho.');
          return;
        }

        const units = product.productUnits;
        units.forEach(element => {
          element.quantity_of_stock = Math.floor(
            product.quantity_of_stock / element.value
          );
        });
        product.productUnits = units;
        product.product_unit_id = product.productUnit ? product.productUnit.id : null;

        const indexMasterProduct = this.getProductIndex(masterProduct);
        if (indexMasterProduct !== -1) {
          if (product.quantity_of_stock < masterProduct.amount) {
            this.orderService.inputAmountProduct(indexMasterProduct, 1);
          }

          this.orderService.updateProduct(indexMasterProduct, product);
        } else {
          this.orderService.addProduct(product);
        }
      });
  }

  clickEinvoice() {
    const currentValue = this.form.get('use_einvoice').value;
    this.form.get('use_einvoice').setValue(!currentValue);
  }
}

