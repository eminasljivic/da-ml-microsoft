import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComparisonComponent } from './comparison/comparison.component';
import {CustomAppComponent} from "./custom-app/custom-app.component";
import { MetricDashboardComponent } from './metric-dashboard/metric-dashboard.component';

const routes: Routes = [
  {
    path: 'custom',
    component: CustomAppComponent

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
