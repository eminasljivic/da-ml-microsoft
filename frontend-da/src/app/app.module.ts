import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {PdfViewerModule} from "ng2-pdf-viewer";
import {NgxMatFileInputModule} from "@angular-material-components/file-input";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import { MatTabsModule } from '@angular/material/tabs';
import {HttpClientModule} from "@angular/common/http";
import {MatToolbarModule} from "@angular/material/toolbar";
import {AnnotationToolComponent} from './annotation-tool/annotation-tool.component';
import {ComparisonComponent} from './comparison/comparison.component';
import {MatIconModule} from "@angular/material/icon";
import {CommonModule} from "@angular/common";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatChipsModule} from "@angular/material/chips";
import {MatSelectModule} from "@angular/material/select";
import { MetricDashboardComponent } from './metric-dashboard/metric-dashboard.component';
import {MatMenuModule} from "@angular/material/menu";
import {MatButtonModule} from "@angular/material/button";
import {MatInputModule} from "@angular/material/input";
import {MatTableModule} from "@angular/material/table";
import {MatDialogModule} from '@angular/material/dialog';
import { DataService } from './core/service/data.service';
import { InvoiceReaderCustomComponent } from './invoice-reader-custom/invoice-reader-custom.component';
import {MonacoEditorModule} from "ngx-monaco-editor";


@NgModule({
  declarations: [
    AppComponent,
    AnnotationToolComponent,
    ComparisonComponent,
    MetricDashboardComponent,
    InvoiceReaderCustomComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PdfViewerModule,
    NgxMatFileInputModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonToggleModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatMenuModule,
    MatButtonModule,
    FormsModule,
    MatInputModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    CommonModule,
    MatTabsModule,
    MatTableModule,
    MatDialogModule,
    MonacoEditorModule.forRoot()
  ],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
