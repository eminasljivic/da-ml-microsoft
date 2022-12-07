import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComparisonComponent } from './comparison/comparison.component';
import {AnnotationToolComponent} from "./annotation-tool/annotation-tool.component";
import { MetricDashboardComponent } from './metric-dashboard/metric-dashboard.component';
import {InvoiceReaderCustomComponent} from "./invoice-reader-custom/invoice-reader-custom.component";

const routes: Routes = [
  {
    path: 'annotation-tool',
    component: AnnotationToolComponent

  },
  {
    path: 'custom',
    component: InvoiceReaderCustomComponent

  },
  {
    path: 'comparison',
    component: ComparisonComponent

  },
  {
    path: 'dashboard',
    component: MetricDashboardComponent

  }/*
  {
    path: '**',
    component: PageNotFoundComponent
  }*/
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
