import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {FormControl} from "@angular/forms";
import {
  NgxMatFileInputComponent
} from "@angular-material-components/file-input/lib/file-input.component";
import {HttpClient} from "@angular/common/http";
import {PdfViewerComponent} from "ng2-pdf-viewer";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild("file") file!: NgxMatFileInputComponent;
  myCanvas!: HTMLCanvasElement;
  @ViewChild('pdfViewer') pdfViewer!: any;

  filePath: FormControl = new FormControl();
  url: string = "";
  img = new Image();
  bounds: any;
  factor: number = 1;


  constructor(private http: HttpClient, private renderer: Renderer2) {
  }

  ngOnInit(): void {
  }

  public context!: CanvasRenderingContext2D;

  temp() {
    this.url = URL.createObjectURL(this.filePath.value);
  }

  send() {
    this.myCanvas = document.getElementsByClassName('canvasWrapper')[0].children[0] as HTMLCanvasElement;
    this.context = this.myCanvas.getContext('2d')!;
    this.http.get(this.url, {responseType: 'blob'}).subscribe((resp: any) => {
      this.http.post("http://localhost:7071/api/size-function", resp).subscribe((size: any) => {

        this.pdfViewer.element.nativeElement.onmousemove = (e: MouseEvent) => this.handleMouseMove(e, this.bounds, this.factor);
        const canvasHeight = this.myCanvas.height;
        const canvasWidth = this.myCanvas.width;

        const pdfWidth = size[0];
        const pdfHeight = size[1];

        const factorY = canvasHeight / pdfHeight;
        const factorX = canvasWidth / pdfWidth;
        this.factor = factorY;

        this.http.post("http://localhost:7071/api/bounds-function", resp).subscribe((bounds: any) => {
          for (const bound of bounds) {
            this.bounds = bounds;
            this.context.beginPath();
            this.context.setTransform(factorX, 0, 0, factorY, 0, 0);
            this.context.rect(
              Number(bound[0][0][0]),
              Number(bound[0][0][1]),
              (Number(bound[0][2][0]) - Number(bound[0][0][0])),
              (Number(bound[0][2][1]) - Number(bound[0][0][1]))
            );
            this.context.lineWidth = 1;
            this.context.stroke();
            this.context.closePath();
          }
        });
      });
    });
  }

  handleMouseMove(e: MouseEvent, bounds: any, factor: number) {
    let graph: any = document.getElementsByClassName('canvasWrapper')[0].children[0];
    let ctx = graph.getContext("2d");

    let tipCanvas = document.getElementById("tip") as HTMLCanvasElement;
    let tipCtx = tipCanvas.getContext("2d")!;

    let offsetX = graph.getBoundingClientRect().x;
    let offsetY = graph.getBoundingClientRect().y;

    let mouseX = e.clientX - offsetX;
    let mouseY = e.clientY - offsetY;

    // Put your mousemove stuff here
    let hit = false;
    if (bounds && mouseX >= 0 && mouseY >= 0) {
      for (let i = 0; i < bounds.length; i++) {
        let bound = bounds[i];
        if (mouseX >= bound[0][0][0] * factor &&
          mouseX <= bound[0][1][0] * factor &&
          mouseY >= bound[0][0][1] * factor &&
          mouseY <= bound[0][2][1] * factor
        ) {
          tipCanvas.style.left = ( -75 + bound[0][0][0]*factor + ((bound[0][1][0]*factor-bound[0][0][0]*factor)/2)) + "px";
          tipCanvas.style.top = (bound[0][0][1] * factor - 40) + "px";
          tipCtx.clearRect(0, 0, tipCanvas.width, tipCanvas.height);
          tipCtx.fillText(bound[1], 5, 15);
          console.log('HIT!');
          hit = true;
        }
      }
      if (!hit) {
        tipCanvas.style.left = "-200px";
        console.log('no hit');
      }
    }
  }
}
