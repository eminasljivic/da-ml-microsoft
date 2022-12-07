import {Component} from '@angular/core';
import {UntypedFormControl} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {DataService} from '../core/service/data.service';

@Component({
  selector: 'app-invoice-reader-custom',
  templateUrl: './invoice-reader-custom.component.html',
  styleUrls: ['./invoice-reader-custom.component.scss']
})
export class InvoiceReaderCustomComponent {
  editorOptions = {language: 'json', readOnly: true};
  code: string= '';
  filePath: UntypedFormControl = new UntypedFormControl();

  constructor(private dataService: DataService, private http:HttpClient) {
  }

  getData() {
    this.dataService.loading = true;
    this.http.get( URL.createObjectURL(this.filePath.value), {responseType: 'blob'}).subscribe((image) => {
      this.http.post('http://localhost:7071/api/invoice-data', image).subscribe((data) =>{
        this.code =  JSON.stringify(data,null,"    ");
      })
    })
    this.dataService.loading = false;
  }
}
