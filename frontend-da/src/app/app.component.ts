import {Component, ViewChild} from '@angular/core';
import {DataService} from "./core/service/data.service";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public dataService: DataService) {
  }
}
