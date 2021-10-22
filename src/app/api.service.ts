import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  get(endpoint:any, params?:any) {
    return this.http.get(endpoint, params);
  }

  post(endpoint:any, body?:any, params?:any) {
    return this.http.post(endpoint, body, params);
  }

  patch(endpoint:any, body?:any, params?:any) {
    return this.http.patch(endpoint, body, params);
  }
}
