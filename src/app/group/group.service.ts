import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Group, GroupFilter } from './group.model';
import { ResponseModel } from '../common/response.model';

@Injectable({
    providedIn: 'root'
})
export class GroupService {

    constructor(private http: HttpClient) {
    }

    getApiUrl(filter?: GroupFilter) {
        if (!filter.page) {
            filter.page = 1;
        }

        if (!filter.pageSize) {
            filter.pageSize = 20;
        }

        let url = '/group?per-page=' + filter.pageSize;

        url += '&' + filter.toFilterString();
        return url;
    }

    getStateUrl(filter?: GroupFilter) {

        let url = '/group/list';
        if (!filter.page) {
            filter.page = 1;
        }
        if (!filter.pageSize) {
            filter.pageSize = 20;
        }
        url += '?' + filter.toFilterString();
        return url;
    }

    getList(filter?: GroupFilter): Observable<HttpResponse<any>> {
        const url = environment.apiUrl + this.getApiUrl(filter);
        return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
    }

    getDetail(id: string, expand: string) {
        const url = environment.apiUrl + '/group/' + id + '?expand=' + expand;
        return this.http.get<Group>(url);
    }

    update(id: string, pos: any) {
        const url = environment.apiUrl + '/group/' + id;
        return this.http.put(url, pos);
    }

    create(data) {
        const url = environment.apiUrl + '/group';
        return this.http.post(url, data);
    }

    getNo() {
        const url = environment.apiUrl + '/group/no';
        return this.http.get<string>(url);
    }

    delete(id: number) {
        const url = environment.apiUrl + '/group/' + id;
        return this.http.delete<ResponseModel>(url, {});
    }


    getListShort(): Observable<HttpResponse<any>> {
        const filter = new GroupFilter();
        filter.page = 1;
        filter.pageSize = 100;

        const url = environment.apiUrl + this.getApiUrl(filter);
        return this.http.get<HttpResponse<any>>(url, { observe: 'response' });
    }
}




