import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {DateFilter, Supplier, SupplierFilter} from './supplier.model';
import {ResponseModel} from '../common/response.model';
import {ProductFilter} from '../product/product.model';
import {AuthService} from '../authentication/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  public dateFilter: BehaviorSubject<DateFilter> = new BehaviorSubject<DateFilter>(null);
  subscribeDateFilter: Observable<DateFilter> = this.dateFilter.asObservable();

  constructor(private http: HttpClient, private auth: AuthService) {
  }

  setDateFilter(obj: DateFilter) {
    this.dateFilter.next(obj);
  }

  getDateFilter() {
    return this.dateFilter.value;
  }

  convertDateYYYYMMDD(date: Date) {
    const month = date.getMonth() + 1;
    return date.getFullYear() + '-' + month + '-' + date.getDate();
  }

  getApiUrl(filter?: SupplierFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/supplier?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: SupplierFilter) {

    let url = '/supplier/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: SupplierFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getDetail(id: string, expand: string) {
    const url = environment.apiUrl + '/supplier/' + id + '?expand=' + expand;
    return this.http.get<Supplier>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/supplier/' + id;
    return this.http.put(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/supplier';
    return this.http.post(url, data);
  }

  autocomplete(term: string) {
    const url = environment.apiUrl + '/supplier/autocomplete?term=' + term;
    return this.http.get<Supplier[]>(url);
  }

  activate(id) {
    const url = environment.apiUrl + '/supplier/activate?id=' + id;
    return this.http.post(url, {});
  }

  lock(id) {
    const url = environment.apiUrl + '/supplier/lock?id=' + id;
    return this.http.post(url, {});
  }

  delete(id) {
    const url = environment.apiUrl + '/supplier/delete-supplier?id=' + id;
    return this.http.post<ResponseModel>(url, {});
  }

  getApiUrlReportDebtForSuppliers(filter?: SupplierFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/report/suppliers-debt?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getReportDebtForSuppliers(filter?: SupplierFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlReportDebtForSuppliers(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  /**
   * get Export excel link
   * @param filter
   */
  getDownloadLink(filter?: SupplierFilter) {
    const _token = this.auth.getToken();

    return environment.apiUrl + '/supplier/export?' + filter.toFilterString() + '&token=' + _token;
  }

  upload(data) {
    const url = environment.apiUrl + '/supplier/upload';
    return this.http.post(url, data);
  }

  /**
   * Tra cứu thông tin doanh nghiệp theo mã số thuế
   * @param taxCode
   */
  lookupBusinessInfo(taxCode: string) {
    const url = environment.apiUrl + '/supplier/lookup-business-info?taxCode=' + taxCode;
    return this.http.get<any>(url);
  }

}




