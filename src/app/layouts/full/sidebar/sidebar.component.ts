import {
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  ViewChild,
  HostListener,
  Directive,
  AfterViewInit, OnInit
} from '@angular/core';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { MediaMatcher } from '@angular/cdk/layout';
import { MenuItems } from '../../../shared/menu-items/menu-items';
import { AuthService } from '../../../authentication/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: []
})
export class AppSidebarComponent implements OnInit, OnDestroy {
  public config: PerfectScrollbarConfigInterface = {};
  mobileQuery: MediaQueryList;

  private _mobileQueryListener: () => void;
  public permissions: string[] = [];

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    public menuItems: MenuItems,
    private authService: AuthService,
    public router: Router
  ) {
    this.mobileQuery = media.matchMedia('(min-width: 768px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  checkMatchPermission(menuPermissions = []) {
    let res = false;

    menuPermissions.forEach(per => {
      if (this.permissions.indexOf(per) !== -1) {
        res = true;
        return;
      }
    });

    return res;
  }

  ngOnInit() {
    this.permissions = this.authService.getPermissionsFromLocalStorage();
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  styleNotBackground(state) {
    if (this.router.url === '/transaction/warehouse/create') {
      if (state === 'transaction') {
        return 'background: #ffffff; color: #67757c;';
      }
    }
    return '';
  }

  styleIconNotBackground(state) {
    if (this.router.url === '/transaction/warehouse/create') {
      if (state === 'transaction') {
        return 'color: #67757c;';
      }
    }
    return '';
  }

  styleNotBackgroundSubItem(state, subState, isIcon = false) {
    if (this.router.url === '/transaction/warehouse/create') {
      if (state === 'transaction' && subState === 'warehouse') {
        if (isIcon) {
          return 'color: #99abb4;';
        }
        return 'color: #67757c;';
      }
    }
    return '';
  }
}
