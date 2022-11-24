import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {DataService} from "../core/service/data.service";

@Component({
  selector: 'app-metric-dashboard',
  templateUrl: './metric-dashboard.component.html',
  styleUrls: ['./metric-dashboard.component.scss']
})
export class MetricDashboardComponent implements OnInit {

  metrics:any
  loaded:boolean = false
  displayedColumns: string[] = ["fieldName", "fieldValue", "fieldConfidence"]

  constructor(private http: HttpClient, private dataService: DataService ) { }

  ngOnInit(): void {
    this.GetFRMetrics()
  }

  GetFRMetrics(){
    this.loaded = false
    this.metrics = this.dataService.getAllMetrics();
    this.loaded = true;
  }

  getColor(confidence: string){
    var c = Number(confidence.replace(',', '.')) * 100
    if(c > 0)
    {
      if(c < 50){
        return "red"
      }
      else if(c > 50 && c < 80){
        return "yellow"
      }
      else{
        return "green"
      }
    }
    return "white"
  }

  getAverageFieldConfidence(){

  }

}
