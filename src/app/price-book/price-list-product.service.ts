import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PriceListProductFilter } from "./price-list-product.model";

@Injectable({
    providedIn: 'root'
})
export class PriceListProductService {

    constructor(private http: HttpClient) {
    }

    getApiUrl(filter?: PriceListProductFilter) {
        if (!filter.page) {
            filter.page = 1;
        }

        if (!filter.pageSize) {
            filter.pageSize = 20;
        }

        let url = '/price-list-product?per-page=' + filter.pageSize;

        url += '&' + filter.toFilterString();
        return url;
    }

    getStateUrl(filter?: PriceListProductFilter) {

        let url = '/price-list-product/list';
        if (!filter.page) {
            filter.page = 1;
        }
        if (!filter.pageSize) {
            filter.pageSize = 20;
        }
        url += '?' + filter.toFilterString();
        return url;
    }

    getList(filter?: PriceListProductFilter): Observable<HttpResponse<any>> {
        const url = environment.apiUrl + this.getApiUrl(filter);
        return this.http.get<HttpResponse<any>>(url, { observe: 'response' });
    }

    getDetail(id: string) {
        const url = environment.apiUrl + '/price-list-product/' + id;
        return this.http.get<object>(url);
    }

    update(id: string, pos: any) {
        const url = environment.apiUrl + '/price-list-product/' + id;
        return this.http.put(url, pos);
    }

    create(data) {
        const url = environment.apiUrl + '/price-list-product';
        return this.http.post(url, data);
    }

    exist(product_id: string, product_unit_id: string, price_list_id: string) {
        const url = environment.apiUrl + '/price-list-product/exist';
        return this.http.post(url, {
            product_id: product_id,
            product_unit_id: product_unit_id,
            price_list_id: price_list_id
        });
    }

    /**
     * Chua dung method delete duoc
     * dung tam method post
     */
    delete(id: string) {
        // const url = environment.apiUrl + '/price-list-product/delete/' + id;
        // return this.http.delete(url);

        const url = environment.apiUrl + '/price-list-product/post-delete';
        return this.http.post(url, { id: id });
    }

    updatePriceAll(price_list_id: string, price_list_common_id: string, data: any) {
        const url = environment.apiUrl + '/price-list-product/update-price-all';
        return this.http.post(url, {
            price_list_id: price_list_id,
            price_list_common_id: price_list_common_id,
            data: data
        });
    }

    getListProductCommon(common_id: string, list_product_unit_choose: string[]) {
        const url = environment.apiUrl + '/price-list-product/get-list-product-common';
        return this.http.post(url, { common_id: common_id, list_product_unit_choose: list_product_unit_choose });
    }
}




