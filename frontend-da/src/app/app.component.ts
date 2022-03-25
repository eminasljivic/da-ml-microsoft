import {Component, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  filePath: FormControl = new FormControl();
  url: string = "";

  temp() {
    this.url = URL.createObjectURL(this.filePath.value);
  }
}
