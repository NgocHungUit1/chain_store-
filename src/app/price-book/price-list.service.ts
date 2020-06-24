import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { PriceList, PriceListFilter } from './price-list.model';

@Injectable({
    providedIn: 'root'
})
export class PriceListService {

    constructor(private http: HttpClient) {
    }

    getApiUrl(filter?: PriceListFilter) {
        if (!filter.page) {
            filter.page = 1;
        }

        if (!filter.pageSize) {
            filter.pageSize = 20;
        }

        let url = '/price-list?per-page=' + filter.pageSize;

        url += '&' + filter.toFilterString();
        return url;
    }

    getStateUrl(filter?: PriceListFilter) {

        let url = '/price-list/list';
        if (!filter.page) {
            filter.page = 1;
        }
        if (!filter.pageSize) {
            filter.pageSize = 20;
        }
        url += '?' + filter.toFilterString();
        return url;
    }

    getList(filter?: PriceListFilter): Observable<HttpResponse<any>> {
        const url = environment.apiUrl + this.getApiUrl(filter);
        return this.http.get<HttpResponse<any>>(url, { observe: 'response' });
    }

    getDetail(id: string) {
        const url = environment.apiUrl + '/price-list/' + id;
        return this.http.get<object>(url);
    }

    update(id: string, pos: any) {
        const url = environment.apiUrl + '/price-list/' + id;
        return this.http.put(url, pos);
    }

    create(data) {
        const url = environment.apiUrl + '/price-list';
        return this.http.post(url, data);
    }
}




