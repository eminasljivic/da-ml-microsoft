import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title: string = "Meine eigene App!";

  items: any[] = [
      {
          "text": "Das ist meine"
      },
      {
          "text": "erste eigene Angular-App."
      }
  ];

  // Restlicher Code
}