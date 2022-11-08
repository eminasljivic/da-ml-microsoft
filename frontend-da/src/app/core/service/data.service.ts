import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class DataService {
  loading = false;

  constructor(private http: HttpClient) { }

  getAllMetrics(){

  }
}
