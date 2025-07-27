import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { Router } from '@angular/router';
import { AuthService } from '../../../authentication/auth.service';
import { log } from 'console';
import { OrderService } from '../../../sale/order.service';
import { ProductService } from '../../../product/product.service';
import { Product } from '../../../product/product.model';
import { NotifierService } from 'angular-notifier';
import { OptionStore } from '../../../common/option-store.model';
import { OptionStoreService } from '../../../common/option-store.service';
import { SharedDataService } from '../../../shared/shared-data.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { InvoiceTemplateService, InvoiceTemplate, TemplateResponse } from '../../../shared/invoice-handle/invoice-template.service';

@Component({
  selector: 'app-header-cart',
  templateUrl: './header-cart.component.html',
  styleUrls: ['./header-cart.component.css']
})
export class AppHeaderCartComponent implements OnInit {
  @Output() toggleRequested = new EventEmitter<void>();
  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;

  constructor(
    private route: Router,
    private authSer: AuthService,
    private orderService: OrderService,
    private productSer: ProductService,
    private optionStoreService: OptionStoreService,
    private shareDataSer: SharedDataService,
    private invoiceTemplateService: InvoiceTemplateService,
    public notifierSer: NotifierService,
  ) {

  }

  public config: PerfectScrollbarConfigInterface = {};


  // This is for Notifications
  notifications: Object[] = [
    {
      round: 'round-danger',
      icon: 'ti-link',
      title: 'Luanch Admin',
      subject: 'Just see the my new admin!',
      time: '9:30 AM'
    },
    {
      round: 'round-success',
      icon: 'ti-calendar',
      title: 'Event today',
      subject: 'Just a reminder that you have event',
      time: '9:10 AM'
    },
    {
      round: 'round-info',
      icon: 'ti-settings',
      title: 'Settings',
      subject: 'You can customize this template as you want',
      time: '9:08 AM'
    },
    {
      round: 'round-primary',
      icon: 'ti-user',
      title: 'Pavan kumar',
      subject: 'Just see the my admin!',
      time: '9:00 AM'
    }
  ];

  // This is for Mymessages
  mymessages: Object[] = [
    {
      useravatar: 'assets/images/users/1.jpg',
      status: 'online',
      from: 'Pavan kumar',
      subject: 'Just see the my admin!',
      time: '9:30 AM'
    },
    {
      useravatar: 'assets/images/users/2.jpg',
      status: 'busy',
      from: 'Sonu Nigam',
      subject: 'I have sung a song! See you at',
      time: '9:10 AM'
    },
    {
      useravatar: 'assets/images/users/2.jpg',
      status: 'away',
      from: 'Arijit Sinh',
      subject: 'I am a singer!',
      time: '9:08 AM'
    },
    {
      useravatar: 'assets/images/users/4.jpg',
      status: 'offline',
      from: 'Pavan kumar',
      subject: 'Just see the my admin!',
      time: '9:00 AM'
    }
  ];

  barcode: string;

  autoPrint: boolean = true;
  autoPrintInSoLo = false;

  optionStore_auto_print: OptionStore = null;

  // Replace fake data with service data
  invoiceTemplates: InvoiceTemplate[] = [];
  selectedTemplateId: string = '';
  initialTemplateId: string = '';
  ngOnInit(): void {
    this.getAutoPrintValue();
    this.loadTemplates();
  }

  logout() {
    this.authSer.logout().subscribe(res => {
      if (res) {
        this.route.navigate(['/', 'authentication', 'login']);
      }
    });
  }

  onkeydown($event) {
    this.barcode = $event.target.value;
    // console.log(this.barcode);
    this.productSer.addproductBarcode(this.barcode).subscribe(res => {
      // console.log(res);
      if (res['errors']) {
        this.notifierSer.notify('warning', res['errors']);
      }
      if (res !== null) {
        this.handlePriceListProduct(res);
      }
    });
    $event.target.value = '';
  }

  handlePriceListProduct(product: Product) {
    let units = product.productUnits;
    // tslint:disable-next-line:no-shadowed-variable
    units.forEach(element => {
      element.quantity_of_stock = Math.floor(product.quantity_of_stock / element.value);
    });
    // tslint:disable-next-line:no-shadowed-variable
    units = units.filter(element => element.quantity_of_stock > 0);
    product.productUnits = units;

    this.orderService.addProduct(product);
  }

  goToInvoices() {
    // this.route.navigate(['/transaction/invoice']);
    window.location.href = '/transaction/invoice';

  }

  onChangeSlideToggleTuDongInHoaDon() {
    this.autoPrint = !this.autoPrint;
    this.optionStore_auto_print.value = this.autoPrint === false ? 'no' : 'yes';
    this.optionStoreService
      .update(this.optionStore_auto_print.id, this.optionStore_auto_print)
      .subscribe(_ => {
      });
    if(!this.autoPrint){
      this.shareDataSer.setInSoLo(false);
      this.autoPrintInSoLo = false;
    }
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

  onChangeSlideToggleInSoLo(e: any) {
    this.autoPrintInSoLo = e.checked;
    this.shareDataSer.setInSoLo(e.checked);
  }

  onToggleClick(event: MouseEvent) {
    event.stopPropagation();
  }

  // Convert numeric index to letter prefix (0 -> A, 1 -> B, etc.)
  getLetterPrefix(index: number): string {
    return String.fromCharCode(65 + index); // 65 is ASCII for 'A'
  }

  // Get the badge letter for the currently selected template
  getBadgeLetterForSelectedTemplate(): string {
    if (!this.selectedTemplateId || this.invoiceTemplates.length === 0) {
      return '';
    }

    const selectedIndex = this.invoiceTemplates.findIndex(template => template.id === this.selectedTemplateId);
    if (selectedIndex === -1) {
      return '';
    }

    return this.getLetterPrefix(selectedIndex);
  }

  // Load templates from API
  private loadTemplates(): void {
    this.invoiceTemplateService.getAllTemplates().subscribe(
      (templates: TemplateResponse) => {
        this.invoiceTemplates = templates.data;
        // Set the selected template from localStorage if available
        const template = this.invoiceTemplates.find((template)=> template.status==='default') || this.invoiceTemplates[0]
        this.initialTemplateId = template.id;
        this.selectedTemplateId = this.initialTemplateId;
        localStorage.setItem('selectedTemplate', JSON.stringify(template));

      },
      error => {
        console.error('Error loading invoice templates:', error);
        this.notifierSer.notify('error', 'Không thể tải mẫu in. Vui lòng thử lại sau.');
      }
    );
  }


  // Invoice select template
  // Phương thức xử lý chọn mẫu in
  onSelectInvoiceTemplate(templateId: string, event?: MouseEvent) {
    // Prevent menu from closing
    if (event) {
      event.stopPropagation();
    }
    this.selectedTemplateId = templateId.toString();

  }



  onClosePrintButton() {
    // Đóng menu print selection bằng MatMenuTrigger
    this.selectedTemplateId = this.initialTemplateId;
    if (this.menuTrigger) {
      this.menuTrigger.closeMenu();
    }
  }

  onMenuClosed() {
    // Reset selectedTemplateId khi menu đóng mà không lưu (click ra ngoài)
    this.selectedTemplateId = this.initialTemplateId;
  }

  onSaveAndClosePrintButton() {
    // Lưu selection và đóng menu
    this.invoiceTemplateService.updateTemplate(this.selectedTemplateId, {
      id: this.selectedTemplateId,
      status: 'active' // Đặt mẫu này là mặc định
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.notifierSer.notify('success', 'Đã lưu mẫu in đã chọn!');
          this.initialTemplateId = this.selectedTemplateId;
        } else {
          this.notifierSer.notify('error', 'Không thể lưu mẫu in. Vui lòng thử lại.');
        }
      },
      error: (error) => {
        console.error('Error saving template selection:', error);
        this.notifierSer.notify('error', 'Không thể lưu mẫu in. Vui lòng thử lại.');
      }
    })
    // Đóng menu sau khi save
    if (this.menuTrigger) {
      this.menuTrigger.closeMenu();
    }
  }
}
