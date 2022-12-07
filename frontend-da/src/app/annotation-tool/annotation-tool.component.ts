import {Component, Renderer2, ViewChild} from '@angular/core';
import {UntypedFormControl} from '@angular/forms';
import {NgxMatFileInputComponent} from '@angular-material-components/file-input/lib/file-input.component';
import {HttpClient} from '@angular/common/http';
import {BoundingBox} from '../model/bounding-box';
import {DataService} from '../core/service/data.service';
import {Field} from '../model/field';
import {Invoice} from "../model/invoice";
import {COMMA, ENTER, SPACE} from "@angular/cdk/keycodes";
import {MatChipInputEvent} from "@angular/material/chips";
import * as JSZip from "jszip";
import * as FileSaver from "file-saver";


@Component({
  selector: 'app-annotation-tool',
  templateUrl: './annotation-tool.component.html',
  styleUrls: ['./annotation-tool.component.scss']
})
export class AnnotationToolComponent {
  @ViewChild('pdfViewer') pdfViewer!: any;
  boundingBoxesContainer!: HTMLElement;

  filePaths: UntypedFormControl = new UntypedFormControl();
  selectedBoundingBoxes: BoundingBox[] = [];
  selectedIndex = 0;

  invoices: Invoice[] = [];
  selectedInvoice!: Invoice;

  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  fieldTags: string[] = [];

  constructor(private http: HttpClient, private dataService: DataService, private renderer: Renderer2) {
  }

  getBoundingBoxes() {
    this.dataService.loading = true;
    this.invoices = this.filePaths.value.map((f: any) => new Invoice(URL.createObjectURL(f), f.name));
    this.selectedInvoice = this.invoices[0];

    setTimeout(async () => {
      this.preparePdfViewer();

      const getImagePromises = this.invoices.map(i => this.http.get(i.url, {responseType: 'blob'}).toPromise());
      const images = await Promise.all(getImagePromises);

      const getFactorPromises = images.map(i => this.http.post('http://localhost:7071/api/size-function', i).toPromise());
      const factors = await Promise.all(getFactorPromises);
      this.invoices.forEach((i, idx) => {
        const pdfHeight = (factors[idx] as number[])[1];
        const pdfViewerHeight = this.pdfViewer.element.nativeElement.childNodes[0].scrollHeight;

        i.factor = pdfViewerHeight / pdfHeight;
      });

      const getBoundsPromises = images.map(i => this.http.post('http://localhost:7071/api/bounds-function', i).toPromise());
      const bounds = await Promise.all(getBoundsPromises);
      this.invoices.forEach((i, idx) => {
        const data = bounds[idx] as any[][];
        i.boundingBoxes = data.map(d => new BoundingBox(d.slice(0, d.length - 1), d[d.length - 1] as string));
      });

      this.drawBoxes();
      this.dataService.loading = false;
    }, 1000);
  }

  preparePdfViewer() {
    this.renderer.setStyle(this.pdfViewer.element.nativeElement.childNodes[0].childNodes[0], 'display', 'flex');
    this.renderer.setStyle(this.pdfViewer.element.nativeElement.childNodes[0].childNodes[0], 'justify-content', 'center');
    this.renderer.setStyle(this.pdfViewer.element.nativeElement.childNodes[0].childNodes[0].childNodes[0], 'position', 'absolute');

    this.boundingBoxesContainer = this.renderer.createElement('div');
    const style = this.pdfViewer.element.nativeElement.childNodes[0].childNodes[0].childNodes[0].style;
    this.renderer.setAttribute(this.boundingBoxesContainer, 'style', style.cssText);
    this.renderer.appendChild(this.pdfViewer.element.nativeElement.childNodes[0].childNodes[0], this.boundingBoxesContainer);
  }

  addField() {
    if(!this.selectedBoundingBoxes[0].field){
      const newField = new Field(this.selectedBoundingBoxes, this.selectedBoundingBoxes.map(b => b.text).join(' '));
      this.selectedBoundingBoxes.forEach(b => b.field = newField);
      this.selectedInvoice.fields.push(newField);
    }
  }

  drawBoxes() {
    for (const bound of this.selectedInvoice.boundingBoxes) {
      this.addBox(bound);
    }
  }

  addBox(boundingBox: BoundingBox) {
    const box = this.renderer.createElement('div');
    this.renderer.setStyle(box, 'width', boundingBox.box[2] * this.selectedInvoice.factor + 'px');
    this.renderer.setStyle(box, 'height', boundingBox.box[3] * this.selectedInvoice.factor + 'px');
    this.renderer.setStyle(box, 'top', boundingBox.box[1] * this.selectedInvoice.factor + 'px');
    this.renderer.setStyle(box, 'left', boundingBox.box[0] * this.selectedInvoice.factor + 'px');
    this.renderer.addClass(box, 'boundingBox');
    boundingBox.htmlElement = box;
    this.renderer.listen(box, 'click', (event) => this.selectBoundingBox(boundingBox, event));
    this.renderer.listen(box, 'dblclick', () => {
      this.selectBoundingBox(boundingBox);
      this.addField();
    });
    this.renderer.appendChild(this.boundingBoxesContainer, box);
  }

  selectBoundingBox(boundingBox: BoundingBox, event: MouseEvent | null = null) {
    this.removeSelectedField();

    if (boundingBox.field) {
      const htmlElement = document.getElementById('field' + this.selectedInvoice.fields.indexOf(boundingBox.field));
      this.renderer.addClass(htmlElement, 'selected');
    }

    if (event?.metaKey) {
      this.selectedBoundingBoxes.push(boundingBox);
      this.renderer.addClass(boundingBox.htmlElement, 'selected');
    } else {
      this.boundingBoxesContainer.childNodes.forEach((c: any) => this.renderer.removeClass(c, 'selected'));
      this.renderer.addClass(boundingBox.htmlElement, 'selected');
      this.selectedBoundingBoxes = [];
      this.selectedBoundingBoxes.push(boundingBox);
    }
  }

  private selectBoundingBoxes(boundingBoxes: BoundingBox[]) {
    this.removeSelectedField();
    const htmlElement = document.getElementById('field' + this.selectedInvoice.fields.indexOf(boundingBoxes[0].field));
    this.renderer.addClass(htmlElement, 'selected');
    this.boundingBoxesContainer.childNodes.forEach((c: any) => this.renderer.removeClass(c, 'selected'));

    for (const boundingBox of boundingBoxes) {
      this.renderer.addClass(boundingBox.htmlElement, 'selected');
    }
  }

  removeSelectedField() {
    for (let i = 0; i < this.selectedInvoice.fields.length; i++) {
      const htmlElement = document.getElementById('field' + i);
      this.renderer.removeClass(htmlElement, 'selected');
    }
  }

  removeField(field:Field){
    this.selectedInvoice.boundingBoxes.filter(b => b.field == field).forEach(b => b.field = null);
    const index = this.selectedInvoice.fields.indexOf(field, 0);
    if (index > -1) {
      this.selectedInvoice.fields.splice(index, 1);
    }
  }

  next() {
    this.selectedIndex++;
    this.selectedInvoice = this.invoices[this.selectedIndex];
    this.selectedBoundingBoxes = [];

    setTimeout(() => {
      this.preparePdfViewer();
      this.drawBoxes();
    }, 1000);
  }

  prev() {
    this.selectedIndex--;
    this.selectedInvoice = this.invoices[this.selectedIndex];
    this.selectedBoundingBoxes = [];

    setTimeout(() => {
      this.preparePdfViewer();
      this.drawBoxes();
    }, 1000);
  }

  fieldSelected(field: Field) {
    this.selectBoundingBoxes(field.boundingBoxes);
  }

  addFieldTag(event: MatChipInputEvent) {
    const value = (event.value || '').trim();
    if (value) {
      this.fieldTags.push(value);
    }
    event.chipInput!.clear();
  }

  removeFieldTag(fieldTag: string) {
    const index = this.fieldTags.indexOf(fieldTag);
    if (index >= 0) {
      this.fieldTags.splice(index, 1);
    }
  }

  exportFields() {
    let files = [];
    let names = [];
    for (const invoice of this.invoices) {
      let object = {};
      for (const field of invoice.fields) {
        // @ts-ignore
        object[field.fieldName] = field.fieldContent;
      }

      const blob = new Blob([JSON.stringify(object)], {type: 'text/plain'});
      files.push(blob);
      names.push(invoice.filename);
    }
    this.createZip(files, names, 'fields');
  }

  async createZip(files: any[], names: any[], zipName: string) {
    const zip = new JSZip();
    const name = zipName + '.zip';
    for (let counter = 0; counter < files.length; counter++) {
      zip.file(names[counter].split('.').slice(0, -1).join('.') + '.json', files[counter]);
    }
    zip.generateAsync({type: 'blob'}).then((content) => {
      if (content) {
        FileSaver.saveAs(content, name);
      }
    });
  }

}
