import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, UserFilter } from './user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {


    constructor(private http: HttpClient) {
    }

    getApiUrl(filter?: UserFilter) {
        if (!filter.page) {
            filter.page = 1;
        }

        if (!filter.pageSize) {
            filter.pageSize = 20;
        }

        let url = '/user?per-page=' + filter.pageSize;

        url += '&' + filter.toFilterString();
        return url;
    }

    getStateUrl(filter?: UserFilter) {

        let url = '/user/list';
        if (!filter.page) {
            filter.page = 1;
        }
        if (!filter.pageSize) {
            filter.pageSize = 20;
        }
        url += '?' + filter.toFilterString();
        return url;
    }

    getList(filter?: UserFilter): Observable<HttpResponse<any>> {
        const url = environment.apiUrl + this.getApiUrl(filter);
        return this.http.get<HttpResponse<any>>(url, { observe: 'response' });
    }


    public getUsers(id: string, expand: string = ''): Observable<User> {
        const url = environment.apiUrl + '/user/' + id + '?expand=' + expand;
        // return this.http.get<object>(url);
        return this.http.get<User>(url);
    }

    update(id: string, pos: any) {
        const url = environment.apiUrl + '/user/' + id;
        return this.http.put(url, pos);
    }

    create(data) {
        const url = environment.apiUrl + '/user';
        return this.http.post(url, data);
    }

    autocomplete(term: string) {
        const url = environment.apiUrl + '/user/autocomplete?term=' + term;
        return this.http.get<User[]>(url);
    }

    getUserLogin() {
        const url = environment.apiUrl + '/user/login';
        return this.http.get<User>(url);
    }

}




