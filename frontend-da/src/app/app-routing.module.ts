import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {CustomAppComponent} from "./custom-app/custom-app.component";

const routes: Routes = [
  {
    path: 'custom',
    component: CustomAppComponent
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
