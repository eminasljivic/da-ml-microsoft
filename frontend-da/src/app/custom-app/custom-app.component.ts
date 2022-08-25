import {Component, ViewChild} from '@angular/core';
import {FormControl} from "@angular/forms";
import {NgxMatFileInputComponent} from "@angular-material-components/file-input/lib/file-input.component";
import {HttpClient} from "@angular/common/http";
import {BoundingBox, BoundingBoxState} from "../model/bounding-box";
import {DataService} from "../core/service/data.service";

@Component({
  selector: 'app-custom-app',
  templateUrl: './custom-app.component.html',
  styleUrls: ['./custom-app.component.scss']
})
export class CustomAppComponent {

  @ViewChild("file") file!: NgxMatFileInputComponent;
  myCanvas!: HTMLCanvasElement;
  @ViewChild('pdfViewer') pdfViewer!: any;

  filePath: FormControl = new FormControl();
  url: string = "";
  img = new Image();
  boundingBoxes: BoundingBox[] = [];
  factor: number = 1;
  canvasContext!: CanvasRenderingContext2D;

  constructor(private http: HttpClient, private dataService: DataService) {
  }

  temp() {
    console.log(this.filePath.value);
    this.url = URL.createObjectURL(this.filePath.value);

    setTimeout(() => {
      this.myCanvas = document.getElementsByClassName('canvasWrapper')[0].children[0] as HTMLCanvasElement;
      this.canvasContext = this.myCanvas.getContext('2d')!;
    }, 1000);
  }

  drawBoxes(boundingBoxes: BoundingBox[]){
    for (const bound of boundingBoxes) {
      this.addBox(bound);
    }
  }

  send() {
    this.dataService.loading = true;
    this.http.get(this.url, {responseType: 'blob'}).subscribe((resp: any) => {
      this.http.post("http://localhost:7071/api/size-function", resp).subscribe((size: any) => {

        this.pdfViewer.element.nativeElement.onmousemove = (e: MouseEvent) => this.handleMouseMove(e, this.boundingBoxes, this.factor);
        this.pdfViewer.element.nativeElement.onclick = (e: MouseEvent) => this.handleMouseMove(e, this.boundingBoxes, this.factor);

        const canvasHeight = this.myCanvas.height;
        const pdfHeight = size[1];

        this.factor = canvasHeight / pdfHeight;

        this.http.post("http://localhost:7071/api/bounds-function", resp).subscribe((boundingBoxes: any) => {
          this.boundingBoxes = boundingBoxes.map((boundingBox: number[][][]) => new BoundingBox(boundingBox));
          this.drawBoxes(this.boundingBoxes);
          this.dataService.loading = false;
        });
      });
    });
  }

  handleMouseMove(e: MouseEvent, bounds: BoundingBox[], factor: number) {
    let graph: any = document.getElementsByClassName('canvasWrapper')[0].children[0];

    let offsetX = graph.getBoundingClientRect().x;
    let offsetY = graph.getBoundingClientRect().y;

    let mouseX = e.clientX - offsetX;
    let mouseY = e.clientY - offsetY;

    // Put your mousemove stuff here
    let hit = false;
    if (bounds && mouseX >= 0 && mouseY >= 0) {
      for (let i = 0; i < bounds.length; i++) {
        let bound = bounds[i];
        if (mouseX >= bound.box[0][0][0] * factor &&
          mouseX <= bound.box[0][1][0] * factor &&
          mouseY >= bound.box[0][0][1] * factor &&
          mouseY <= bound.box[0][2][1] * factor
        ) {
          switch (e.type) {
            case 'mousemove':
              bounds.map(bound => {
                if (bound.state == BoundingBoxState.HOVER) {
                  bound.state = BoundingBoxState.NO_ACTION;
                }
              })
              if (bound.state != BoundingBoxState.SELECTED) {
                bound.state = BoundingBoxState.HOVER;
              }
              this.drawBoxes(this.boundingBoxes);
              break;
            case 'click':
              bounds.map(bound => {
                if (bound.state == BoundingBoxState.SELECTED) {
                  bound.state = BoundingBoxState.NO_ACTION;
                }
              })
              bound.state = BoundingBoxState.SELECTED;
              this.drawBoxes(this.boundingBoxes);
          }
          hit = true;
        }
      }
      if (!hit) {
        switch (e.type) {
          case 'mousemove':
            bounds.map(bound => {
              if (bound.state == BoundingBoxState.HOVER) {
                bound.state = BoundingBoxState.NO_ACTION;
                this.drawBoxes(this.boundingBoxes);
              }
            })
            break;
          case 'click':
            bounds.map(bound => {
              if (bound.state == BoundingBoxState.SELECTED) {
                bound.state = BoundingBoxState.NO_ACTION;
                this.drawBoxes(this.boundingBoxes);
              }
            })
        }
      }
    }
  }

  addBox(
    boundingBox: BoundingBox,
    canvasCtx: CanvasRenderingContext2D = this.canvasContext,
    factor: number = this.factor
  ) {
    canvasCtx.beginPath();
    canvasCtx.setTransform(factor, 0, 0, factor, 0, 0);
    canvasCtx.rect(
      Number(boundingBox.box[0][0][0]),
      Number(boundingBox.box[0][0][1]),
      (Number(boundingBox.box[0][2][0]) - Number(boundingBox.box[0][0][0])),
      (Number(boundingBox.box[0][2][1]) - Number(boundingBox.box[0][0][1]))
    );
    switch (boundingBox.state) {
      case BoundingBoxState.NO_ACTION:
        canvasCtx.lineWidth = 1;
        canvasCtx.strokeStyle = 'grey';
        break;
      case BoundingBoxState.HOVER:
        canvasCtx.lineWidth = 1;
        canvasCtx.strokeStyle = 'black';
        break;
      case BoundingBoxState.SELECTED:
        canvasCtx.lineWidth = 3;
        canvasCtx.strokeStyle = 'red';
        break;
    }
    canvasCtx.stroke();
  }
}
