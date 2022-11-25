import {Component, Renderer2, ViewChild} from '@angular/core';
import {UntypedFormControl} from '@angular/forms';
import {NgxMatFileInputComponent} from '@angular-material-components/file-input/lib/file-input.component';
import {HttpClient} from '@angular/common/http';
import {BoundingBox} from '../model/bounding-box';
import {DataService} from '../core/service/data.service';
import {Field} from '../model/field';
import {Invoice} from "../model/invoice";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatChipInputEvent} from "@angular/material/chips";

@Component({
  selector: 'app-custom-app',
  templateUrl: './custom-app.component.html',
  styleUrls: ['./custom-app.component.scss']
})
export class CustomAppComponent {
  @ViewChild('file') file!: NgxMatFileInputComponent;
  @ViewChild('pdfViewer') pdfViewer!: any;
  boundingBoxesContainer!: HTMLElement;

  filePaths: UntypedFormControl = new UntypedFormControl();
  selectedBoundingBox: BoundingBox | null = null;
  selectedIndex = 0;
  addBoundingBoxAvailable = false;

  invoices: Invoice[] = [];
  selectedInvoice!: Invoice;

  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  fieldTags: string[] = [];

  constructor(private http: HttpClient, private dataService: DataService, private renderer: Renderer2) {
  }

  getBoundingBoxes() {
    this.dataService.loading = true;
    this.invoices = this.filePaths.value.map((f: Blob) => new Invoice(URL.createObjectURL(f)));
    this.selectedInvoice = this.invoices[0];

    setTimeout(async () => {
      this.preparePdfViewer();

      const getImagePromises = this.invoices.map(i => this.http.get(i.url, {responseType: 'blob'}).toPromise());
      const images = await Promise.all(getImagePromises);

      const getFactorPromises = images.map(i => this.http.post('http://localhost:7071/api/size-function', i).toPromise());
      const factors = await Promise.all(getFactorPromises);
      this.invoices.forEach((i, idx) => {
        const pdfHeight = (factors[idx] as number[])[1];
        const pdfViewerHeight = this.pdfViewer.element.nativeElement.childNodes[0].scrollHeight;

        i.factor = pdfViewerHeight / pdfHeight;
      });


      //const getBoundsPromises = images.map(i => this.http.post('http://localhost:7071/api/bounds-function', i).toPromise());
      //const bounds = await Promise.all(getBoundsPromises);
      this.invoices.forEach((i, idx) => {
        //i.boundingBoxes = bounds[idx] as BoundingBox[];
        const data = [[[[1458, 81], [1793, 81], [1793, 135], [1458, 135]], "Nintex UK Ltd", 0.8991305787767121], [[[1455, 130], [2175, 130], [2175, 184], [1455, 184]], "Ground Floor, 138 Fetter Lane", 0.784737290265369], [[[1454, 173], [1941, 173], [1941, 237], [1454, 237]], "LONDON EC4A 1BT", 0.6537928260565755], [[[1458, 228], [1909, 228], [1909, 285], [1458, 285]], "UNITED KINGDOM", 0.7115512792180184], [[[1459, 278], [2130, 278], [2130, 342], [1459, 342]], "Phone: +44 (0) 20 3693 0200", 0.7089468516451459], [[[1457, 330], [2060, 330], [2060, 391], [1457, 391]], "Fax: +44 (0) 20 7799 4869", 0.6759036422977286], [[[1460, 385], [1855, 385], [1855, 434], [1460, 434]], "WWW.nintex.com", 0.5257685270087933], [[[1460, 431], [2031, 431], [2031, 483], [1460, 483]], "VAT No. GB 139 0095 19", 0.7887400838284854], [[[1459, 564], [2037, 564], [2037, 606], [1459, 606]], "Please email remittance advice to:", 0.7077243926478175], [[[158, 609], [390, 609], [390, 664], [158, 664]], "Invoice To", 0.7179510209115544], [[[448, 615], [678, 615], [678, 660], [448, 660]], "ACC-031079", 0.7239703569704643], [[[1460, 614], [2116, 614], [2116, 664], [1460, 664]], "Accountsreceivable@nintex.com", 0.9234775224937434], [[[158, 674], [709, 674], [709, 736], [158, 736]], "smartpoint IT consulting GmbH", 0.6980589256708154], [[[162, 724], [371, 724], [371, 766], [162, 766]], "Strasserau 6", 0.9936463961088912], [[[1920, 678], [2390, 678], [2390, 777], [1920, 777]], "Tax Invoice", 0.9982758649916981], [[[162, 768], [247, 768], [247, 807], [162, 807]], "Linz", 0.9999942779541016], [[[262, 765], [394, 765], [394, 807], [262, 807]], "A-4020", 0.8996681080641099], [[[164, 806], [294, 806], [294, 848], [164, 848]], "Austria", 0.9998467577724892], [[[1424, 805], [1541, 805], [1541, 860], [1424, 860]], "Date", 0.9982206844920389], [[[1677, 808], [1889, 808], [1889, 860], [1677, 860]], "Invoice #", 0.9999289768449527], [[[2023, 805], [2312, 805], [2312, 860], [2023, 860]], "PO. Number", 0.9543357797562341], [[[1368, 902], [1599, 902], [1599, 946], [1368, 946]], "27-Dec-2019", 0.8900458063772638], [[[1688, 902], [1877, 902], [1877, 946], [1688, 946]], "INV19929", 0.92535987101363], [[[2056, 898], [2276, 898], [2276, 950], [2056, 950]], "Q-00062893", 0.8326914504357236], [[[163, 1006], [442, 1006], [442, 1061], [163, 1061]], "Tax Number", 0.8559157358110756], [[[1792, 1005], [1941, 1005], [1941, 1061], [1792, 1061]], "Terms", 0.9999913634491684], [[[167, 1087], [418, 1087], [418, 1129], [167, 1129]], "ATU63428259", 0.748456242126141], [[[1807, 1087], [1926, 1087], [1926, 1129], [1807, 1129]], "Net 30", 0.8861418542079934], [[[164, 1191], [358, 1191], [358, 1235], [164, 1235]], "Description", 0.9999967651307695], [[[891, 1188], [1070, 1188], [1070, 1233], [891, 1233]], "Start Date", 0.9971919916662141], [[[1123, 1191], [1287, 1191], [1287, 1233], [1123, 1233]], "End Date", 0.9996966290848815], [[[1342, 1187], [1416, 1187], [1416, 1238], [1342, 1238]], "Qty", 0.9704177208721595], [[[1531, 1191], [1617, 1191], [1617, 1230], [1531, 1230]], "Rate", 0.9622959044678181], [[[1771, 1191], [1926, 1191], [1926, 1230], [1771, 1230]], "Tax Rate", 0.9929832968107267], [[[1954, 1191], [2099, 1191], [2099, 1230], [1954, 1230]], "Tax Amt", 0.989375672063082], [[[2168, 1191], [2305, 1191], [2305, 1230], [2168, 1230]], "Amount", 0.999980095157113], [[[161, 1241], [761, 1241], [761, 1279], [161, 1279]], "Nintex Workflow-Enterprise Edition Annual", 0.7734779650335073], [[[890, 1243], [1074, 1243], [1074, 1275], [890, 1275]], "29-Dec-2019", 0.999553954345793], [[[1122, 1243], [1304, 1243], [1304, 1275], [1122, 1275]], "28-Dec-2020", 0.8041242800045145], [[[1620, 1243], [1745, 1243], [1745, 1275], [1620, 1275]], "4,014.50", 0.9775330346193344], [[[1849, 1243], [1925, 1243], [1925, 1275], [1849, 1275]], "0.09", 0.8410767064463818], [[[2074, 1243], [2139, 1243], [2139, 1275], [2074, 1275]], "0.00", 0.9988727569580078], [[[2257, 1243], [2382, 1243], [2382, 1275], [2257, 1275]], "4,014.50", 0.9573014849650482], [[[163, 1277], [435, 1277], [435, 1309], [163, 1309]], "Software Assurance", 0.9969907576097848], [[[163, 2401], [1053, 2401], [1053, 2454], [163, 2454]], "End User: AIT Austrian Institute of Technology GmbH", 0.8224721221413963], [[[164, 2441], [485, 2441], [485, 2483], [164, 2483]], "End User Account:", 0.8792091905744822], [[[1812, 2434], [1911, 2434], [1911, 2478], [1812, 2478]], "Total", 0.999985125934759], [[[2232, 2436], [2388, 2436], [2388, 2478], [2232, 2478]], "4,014.50", 0.9670906936796343], [[[1812, 2477], [2060, 2477], [2060, 2522], [1812, 2522]], "Balance Due", 0.9910401989507641], [[[2212, 2477], [2388, 2477], [2388, 2522], [2212, 2522]], "\u20ac4,014.50", 0.8587529464022217], [[[163, 2549], [2020, 2549], [2020, 2598], [163, 2598]], "This is a reverse charge supply_VAT is due in the country of the recipient pursuant to Article 196 of the EC Directive 2006/112", 0.719054596981679], [[[164, 2586], [1003, 2586], [1003, 2625], [164, 2625]], "PLEASE NOTE OUR BANK DETAILS HAVE CHANGED", 0.6328845570128974], [[[1908, 2593], [2237, 2593], [2237, 2648], [1908, 2648]], "Currency in Euro", 0.7820963300053115], [[[185, 2619], [361, 2619], [361, 2656], [185, 2656]], "Credit Card", 0.9988519208536695], [[[381, 2619], [467, 2619], [467, 2659], [381, 2659]], "VISA,", 0.9590770231877749], [[[475, 2617], [1702, 2617], [1702, 2665], [475, 2665]], "Mastercard and American Express are accepted by Nintex. Please request a credit", 0.8108743285177938], [[[162, 2653], [985, 2653], [985, 2695], [162, 2695]], "card authorization form to make payment by credit card", 0.8629504659367638], [[[185, 2686], [619, 2686], [619, 2723], [185, 2723]], "EFT Transfer: Account Name", 0.9487431409278665], [[[636, 2684], [1197, 2684], [1197, 2726], [636, 2726]], "Nintex UK Ltd; Bank: HSBC Bank plc;", 0.7969139944653661], [[[164, 2720], [294, 2720], [294, 2757], [164, 2757]], "Address", 0.9740966302047367], [[[311, 2717], [1341, 2717], [1341, 2762], [311, 2762]], "City of London Branch; 60 Queen Victoria Street; London; EC4N 4TR", 0.5901227473082441], [[[164, 2753], [405, 2753], [405, 2793], [164, 2793]], "EUR Payments:", 0.9981157177415848], [[[165, 2788], [244, 2788], [244, 2820], [165, 2820]], "Bank", 0.9998013037899682], [[[247, 2781], [1123, 2781], [1123, 2831], [247, 2831]], "Routing Number (SWIFT): HBUKGBAB Sort Code: 401276", 0.8032929235158801], [[[1149, 2784], [1565, 2784], [1565, 2824], [1149, 2824]], "Account Number:76005900", 0.9475205300365913], [[[162, 2820], [714, 2820], [714, 2857], [162, 2857]], "IBAN: GB12HBUK40127676005900", 0.7518358811953728], [[[164, 2854], [405, 2854], [405, 2893], [164, 2893]], "USD Payments:", 0.9990001157533184], [[[164, 2885], [1122, 2885], [1122, 2927], [164, 2927]], "Bank Routing Number (SWIFT): HBUKGBAB Sort Code: 401276", 0.5753927489187478], [[[1160, 2885], [1581, 2885], [1581, 2924], [1160, 2924]], "Account Number: 76005868", 0.980511103448688], [[[162, 2918], [696, 2918], [696, 2958], [162, 2958]], "IBAN:GBO3HBUK40127676005868", 0.8459196814009043], [[[162, 2952], [405, 2952], [405, 2991], [162, 2991]], "GBP Payments:", 0.7247200589076169], [[[164, 2985], [833, 2985], [833, 3028], [164, 3028]], "Bank Routing Number (SWIFT): HBUKGBAB", 0.7413220169053757], [[[860, 2985], [1150, 2985], [1150, 3025], [860, 3025]], "Sort Code: 401160", 0.9768686604862443], [[[164, 3019], [585, 3019], [585, 3059], [164, 3059]], "Account Number: 80108588", 0.886893664724737], [[[613, 3019], [1155, 3019], [1155, 3059], [613, 3059]], "IBAN: GBI8HBUK4O116080108588", 0.5655741805025842], [[[184, 3051], [786, 3051], [786, 3094], [184, 3094]], "Cheque: Made payable to Nintex UK Ltd", 0.9269393870407435], [[[796, 3051], [1248, 3051], [1248, 3094], [796, 3094]], "Ground Floor; 138 Fetter Lane", 0.7877983086710727], [[[162, 3086], [789, 3086], [789, 3126], [162, 3126]], "LONDON EC4A 1BT, UNITED KINGDOM", 0.6474763594049336], [[[162, 3120], [1200, 3120], [1200, 3159], [162, 3159]], "Please email remittance advices to: AccountsReceivable @Nintex.com", 0.6988879982760069], [[[163, 3183], [1966, 3183], [1966, 3234], [163, 3234]], "Unless otherwise expressly agreed between Customer and Nintex; by paying the Subscription; Support; or License fees in", 0.8467932666830299], [[[158, 3213], [1876, 3213], [1876, 3268], [158, 3268]], "this Invoice; Customer is accepting all of the terms and conditions of the applicable Nintex agreement(s) available at", 0.836854583878926]];
        i.boundingBoxes = data.map(d => new BoundingBox(d[0] as number[][], d[1] as string));
      });

      this.drawBoxes();
      this.dataService.loading = false;
    }, 1000);
  }

  preparePdfViewer() {
    this.renderer.setStyle(this.pdfViewer.element.nativeElement.childNodes[0].childNodes[0], 'display', 'flex');
    this.renderer.setStyle(this.pdfViewer.element.nativeElement.childNodes[0].childNodes[0], 'justify-content', 'center');

    this.renderer.setStyle(this.pdfViewer.element.nativeElement.childNodes[0].childNodes[0].childNodes[0], 'position', 'absolute');

    this.boundingBoxesContainer = this.renderer.createElement('div');
    const style = this.pdfViewer.element.nativeElement.childNodes[0].childNodes[0].childNodes[0].style;
    this.renderer.setAttribute(this.boundingBoxesContainer, 'style', style.cssText);
    this.renderer.appendChild(this.pdfViewer.element.nativeElement.childNodes[0].childNodes[0], this.boundingBoxesContainer);
  }

  addField() {
    this.addBoundingBoxAvailable = false;
    const newField = new Field(this.selectedBoundingBox!, this.selectedBoundingBox!.text);
    this.selectedBoundingBox!.field = newField
    this.selectedInvoice.fields.push(newField);
  }

  drawBoxes() {
    for (const bound of this.selectedInvoice.boundingBoxes) {
      this.addBox(bound);
    }
  }

  addBox(boundingBox: BoundingBox) {
    const box = this.renderer.createElement('div');
    this.renderer.setStyle(box, 'width', (Number(boundingBox.box[2][0]) - Number(boundingBox.box[0][0])) * this.selectedInvoice.factor + 'px');
    this.renderer.setStyle(box, 'height', (Number(boundingBox.box[2][1]) - Number(boundingBox.box[0][1])) * this.selectedInvoice.factor + 'px');
    this.renderer.setStyle(box, 'top', Number(boundingBox.box[0][1]) * this.selectedInvoice.factor + 'px');
    this.renderer.setStyle(box, 'left', Number(boundingBox.box[0][0]) * this.selectedInvoice.factor + 'px');
    this.renderer.addClass(box, 'boundingBox');
    boundingBox.htmlElement = box;
    this.renderer.listen(box, 'click', (evt) => this.selectBoundingBox(boundingBox));
    this.renderer.appendChild(this.boundingBoxesContainer, box);
  }

  selectBoundingBox(boundingBox: BoundingBox) {
    this.removeSelectedField();

    if (boundingBox.field) {
      const htmlElement = document.getElementById('field' + this.selectedInvoice.fields.indexOf(boundingBox.field));
      this.renderer.addClass(htmlElement, 'selectedField');
    }

    this.boundingBoxesContainer.childNodes.forEach((c: any) => this.renderer.removeClass(c, 'selectedBoundingBox'));
    this.renderer.addClass(boundingBox.htmlElement, 'selectedBoundingBox');
    this.selectedBoundingBox = boundingBox;
  }

  removeSelectedField() {
    for (let i = 0; i < this.selectedInvoice.fields.length; i++) {
      const htmlElement = document.getElementById('field' + i);
      this.renderer.removeClass(htmlElement, 'selectedField');
    }
  }

  next() {
    this.selectedIndex++;
    this.selectedInvoice = this.invoices[this.selectedIndex];
    this.selectedBoundingBox = null;

    setTimeout(() => {
      this.preparePdfViewer();
      this.drawBoxes();
    }, 500);
  }

  prev() {
    this.selectedIndex--;
    this.selectedInvoice = this.invoices[this.selectedIndex];
    this.selectedBoundingBox = null;

    setTimeout(() => {
      this.preparePdfViewer();
      this.drawBoxes();
    }, 500);
  }

  fieldSelected(field: Field) {
    this.selectBoundingBox(field.boundingBox);
  }

  addFieldTag(event: MatChipInputEvent) {
    const value = (event.value || '').trim();
    if (value) {
      this.fieldTags.push(value);
    }
    event.chipInput!.clear();
  }

  removeFieldTag(fieldTag: string) {
    const index = this.fieldTags.indexOf(fieldTag);
    if (index >= 0) {
      this.fieldTags.splice(index, 1);
    }
  }
}
