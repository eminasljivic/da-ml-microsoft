import {Component, ViewChild} from '@angular/core';
import {UntypedFormControl} from "@angular/forms";
import {NgxMatFileInputComponent} from "@angular-material-components/file-input/lib/file-input.component";
import {HttpClient} from "@angular/common/http";
import {BoundingBox} from "../model/bounding-box";
import {DataService} from "../core/service/data.service";

@Component({
  selector: 'app-comparison',
  templateUrl: './comparison.component.html',
  styleUrls: ['./comparison.component.scss']
})
export class ComparisonComponent{

  @ViewChild("file") file!: NgxMatFileInputComponent;
  myCanvas!: HTMLCanvasElement;
  @ViewChild('pdfViewer') pdfViewer!: any;

  filePath: UntypedFormControl = new UntypedFormControl();
  url: string = "";
  img = new Image();
  boundingBoxes: BoundingBox[] = [];
  factor: number = 1;
  canvasContext!: CanvasRenderingContext2D;
  data: any
  t0: number = 0;
  t1: number = 0;
  pdfsrc: any

  constructor(private http: HttpClient, private dataService: DataService)
  {}

  getInvoice() {
    this.url = URL.createObjectURL(this.filePath.value);
    console.log(this.filePath)
    }

  send(){
    console.log("begin")

    this.dataService.loading = true;
    this.http.get(this.url, {responseType: 'blob'}).subscribe((resp: any) => {
      this.t0 = Date.now()
      this.http.post("http://localhost:7019/api/getInvoiceDetails", resp).subscribe((invoice: any) => {
        this.data = invoice;
        this.t1 = Date.now()

        var req:any = {
          begin:this.t0,
          end: this.t1,
          duration: this.t1 - this.t0,
          type: "FORMRECOGNIZER",
          invoice: this.data
        }
        this.http.post("http://localhost:7019/api/SaveMetrics", req).subscribe((metric: any) => {
          console.log(metric);
          this.dataService.loading = false;
        });
      });
    });
  }

  test(){
    this.dataService.loading = true;
    this.http.post("http://localhost:7019/api/GetMetrics", null).subscribe((metrics: any) => {
          console.log(metrics);
          this.dataService.loading = false;
        });
  }
}
