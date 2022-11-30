import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import { catchError, ObservableInput, retry } from 'rxjs';

class Error {
  occured: boolean = false;
  message: string = "";
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  loading = false;
  error: Error = new Error();

  constructor(private http: HttpClient) {}

  saveMetrics(url: string, name: string){
    this.loading = true;
    var data;
    var t0: any;
    var t1;
    this.http.get(url, {responseType: 'blob'}).subscribe((resp: any) => {
      t0 = Date.now()
      this.http.post("http://localhost:7019/api/GetInvoiceDetails", resp).subscribe((invoice: any) => {
        data = invoice;
        t1 = Date.now()

        var req:any = {
          name: name,
          begin: t0,
          end: t1,
          duration: t1 - t0,
          type: "FORMRECOGNIZER",
          invoice: data
        }
        this.http.post("http://localhost:7019/api/SaveMetrics", req).subscribe((metric: any) => {
          console.log(metric);
          this.loading = false;
        });
      });
    });
  }
  getAllMetrics(): any{
    this.loading = true;
    this.http.post("http://localhost:7019/api/GetMetrics/type=formrecognizer", null).pipe(retry(0), catchError(this.handleError)).subscribe((metrics: any) => {
        console.log(metrics)
        this.loading = false;
        return metrics;
    });
  }

  handleError(error: any): ObservableInput<any>{
    //this.error.occured = true;
    //this.error.message = error.message

    return "";
  }
}
