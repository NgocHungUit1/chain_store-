import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {Product, ProductFilter} from './product.model';
import {AuthService} from '../authentication/auth.service';
import {NotifierService} from 'angular-notifier';
import {ResponseModel} from '../common/response.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private loadProduct: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  subscribeLoadProduct: Observable<boolean> = this.loadProduct.asObservable();

  setLoadProduct(action: boolean) {
    this.loadProduct.next(action);
  }

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    public notifySer: NotifierService,
  ) {
  }

  getApiUrl(filter?: ProductFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/product?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: ProductFilter) {

    let url = '/product/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: ProductFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getDetail(id: string, expand: string = '') {
    const url = environment.apiUrl + '/product/' + id + '?expand=' + expand;
    return this.http.get<object>(url);
  }

  public getProducts(id: string, expand: string = ''): Observable<Product> {
    const url = environment.apiUrl + '/product/' + id + '?expand=' + expand;
    // return this.http.get<object>(url);
    return this.http.get<Product>(url);
  }

  update(id: string, pos: any, expand: string = '') {
    let url = environment.apiUrl + '/product/' + id ;
    if (expand) {
      url += '?expand=' + expand;
    }

    return this.http.put(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/product';
    return this.http.post(url, data);
  }

  uploadImage(formData) {
    const url = environment.apiUrl + '/product/upload-image';
    return this.http.post(url, formData);
  }

  removeImage(id: string, imageId: string) {
    const url = environment.apiUrl + '/product/remove-image';
    return this.http.post(url, {product_id: id, image_id: imageId});
  }

  delete(id: string) {
    const url = environment.apiUrl + '/product/' + id;
    return this.http.delete(url);

    // const url = environment.apiUrl + '/product/delete-product';
    // return this.http.post(url, {product_id: id});
  }

  autocomplete(term: string) {
    const url = environment.apiUrl + '/product/autocomplete?term=' + term;
    return this.http.get<Product[]>(url);
  }

  autocompleteWithExpand(term: string, expand) {
    const url = environment.apiUrl + '/product/autocomplete?expand=' + expand + '&term=' + term;
    return this.http.get<Product[]>(url);
  }

  /**
   * Search Autocomplete With Units
   * @param term
   */
  autocompleteUnits(term: string) {
    const url = environment.apiUrl + '/product/autocomplete-units?term=' + term;
    return this.http.get<Product[]>(url);
  }

  /**
   * Search Autocomplete With Units by array id product
   * @param ids
   */
  autocompleteUnitsByIds(ids: []) {
    const url = environment.apiUrl + '/product/autocomplete-units?ids=' + ids;
    return this.http.get<Product[]>(url);
  }

  // list for cart
  getApiUrlCart(filter?: ProductFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/product/cart?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getListCart(filter?: ProductFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlCart(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getCountProduct() {
    const url = environment.apiUrl + '/product/count';
    return this.http.get<number>(url);
  }

  getRenderProductNo() {
    const url = environment.apiUrl + '/product/render-product-no';
    return this.http.get<string>(url);
  }

  getDownloadTemplateLink() {
    const _token = this.auth.getToken();

    const url = environment.apiUrl + '/product/download-template?token=' + _token;
    return url;
  }

  upload(data) {
    const url = environment.apiUrl + '/product/upload';
    return this.http.post(url, data);
  }

  activate(id) {
    const url = environment.apiUrl + '/product/activate?id=' + id;
    return this.http.post(url, {});
  }

  lock(id) {
    const url = environment.apiUrl + '/product/lock?id=' + id;
    return this.http.post(url, {});
  }

  addproductBarcode(code: string) {
    const url = environment.apiUrl + '/product/search-code?code=' + code;
    return this.http.get<Product>(url);
  }

  /*
  API for Report
   */
  getApiUrlReport(filter?: ProductFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/product/report?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getListReport(filter?: ProductFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlReport(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  /**
   * id unit
   * @param id
   */
  deleteUnit(id: string) {
    const url = environment.apiUrl + '/product/delete-unit?id=' + id;
    return this.http.post<ResponseModel>(url, {});
  }

  /**
   * Export report excel
   * @param filter
   */
  exportExcel(filter?: ProductFilter) {
    const url = environment.apiUrl + '/product/export?' + filter.toFilterString();
    return this.http.get(url, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  /**
   * Xuất phiếu tồn đầu kỳ đúng khuôn file mẫu để nộp lên cổng csdlduoc.com.vn
   * @param filter
   */
  exportNationalPharmacyOpeningStock(filter?: ProductFilter) {
    const url = environment.apiUrl + '/product/export-national-pharmacy-opening-stock?' + filter.toFilterString();
    return this.http.get(url, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  // DECREASED FUNCTION
  downloadFileExcel() {
    const _token = this.auth.getToken();
    return environment.apiUrl + '/product/download-product?token=' + _token;
  }

  getParcel(id: string) {
    const url = environment.apiUrl + '/product/get-parcel?id=' + id;
    return this.http.get(url);
  }

  getParcelNew(id: string) {
    const url = environment.apiUrl + `/warehouse-product-parcel/group-by-product?WarehouseProductParcelSearch[product_id]=${id}&WarehouseProductParcelSearch[hasStock]=1`;
    const res = this.http.get(url);
    return res;
  }

  // Dùng cho màn NHẬP HÀNG: liệt kê cả lô đã hết (tồn=0) để chọn nhập lại
  getParcelForImport(id: string) {
    const url = environment.apiUrl + `/warehouse-product-parcel/group-by-product?WarehouseProductParcelSearch[product_id]=${id}&WarehouseProductParcelSearch[includeEmpty]=1`;
    return this.http.get(url);
  }

  getPdfBarcode(data = {}) {
    const url = environment.apiUrl + '/product/print-pdf-barcode';
    return this.http.post(url, data);
  }
}




