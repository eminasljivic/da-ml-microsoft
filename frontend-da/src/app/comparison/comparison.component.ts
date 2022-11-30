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
    this.dataService.saveMetrics(this.url, this.filePath.value.name)
  }

  test(){
    this.dataService.loading = true;
    this.http.post("http://localhost:7019/api/GetMetrics/type=all", null).subscribe((metrics: any) => {
        this.data = metrics
        this.dataService.loading = false;
        console.log(this.data);
    });
  }
}
