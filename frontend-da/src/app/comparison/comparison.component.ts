import {Component, ViewChild} from '@angular/core';
import {FormControl} from "@angular/forms";
import {NgxMatFileInputComponent} from "@angular-material-components/file-input/lib/file-input.component";
import {HttpClient} from "@angular/common/http";
import {DataService} from "../core/service/data.service";

@Component({
  selector: 'app-comparison',
  templateUrl: './comparison.component.html',
  styleUrls: ['./comparison.component.scss']
})
export class ComparisonComponent{

  @ViewChild("file") file!: NgxMatFileInputComponent;
  filePath: FormControl = new FormControl();
  url: string = "";

  constructor(private http: HttpClient, private dataService: DataService)
  {}

  getInvoice() {
    this.url = URL.createObjectURL(this.filePath.value);
    console.log(this.url)
  }

  send(){
    console.log("begin")
    this.dataService.loading = true;
    this.http.get(this.url, {responseType: 'blob'}).subscribe((resp: any) => {
      this.http.post("http://localhost:7019/api/Function1", resp).subscribe((size: any) => {
          console.log(resp)
          this.dataService.loading = false;
        });
      });
    }
}
