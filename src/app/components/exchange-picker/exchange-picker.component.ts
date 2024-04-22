import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Currency } from '../../Currency';
import { ExchangeServiceComponent } from '../../exchange-service/exchange-service.service';

@Component({
  selector: 'app-exchange-picker',
  standalone: true,
  templateUrl: './exchange-picker.component.html',
  styleUrl: './exchange-picker.component.scss',
  imports: [CommonModule, FormsModule],
})
export class ExchangePickerComponent implements OnInit {
  public edited = true;
  @Input() changeCurrency: any;
  @Input() selectorId: any;

  currencies: any;

  public selectedCurrency: any;
  public elementCurrenciesList: any;
  public findCurrency: any;
  public ignoreFocusOut = false;
  public noResultsFind = false;
  @ViewChild('search_input', { static: false }) search_input: any;

  constructor(
    private changeDetector: ChangeDetectorRef,
    public service: ExchangeServiceComponent
  ) {}

  public valueFinding() {
    this.currencies = this.service
      .getCurrencies()
      .filter(
        (item) =>
          item.name.toLowerCase().includes(this.findCurrency.toLowerCase()) ||
          item.full_name.toLowerCase().includes(this.findCurrency.toLowerCase())
      );

    this.noResultsFind = this.currencies.length == 0;
  }

  selectCurrency = (currency: Currency): void => {
    this.selectedCurrency = currency;
    this.changeCurrency(currency);
    this.HideDropdown();

    localStorage.setItem(this.selectorId, currency.name);
  };

  ShowDropdown() {
    console.log('showDropdown');
    this.edited = false;
    this.elementCurrenciesList.className = 'dropdown-menu scrollable-menu show';
  }

  HideDropdown() {
    console.log('hideDropdown');
    this.edited = true;
    this.elementCurrenciesList.className = 'dropdown-menu scrollable-menu';
  }

  dropClick() {
    this.findCurrency = '';
    this.ShowDropdown();
    this.changeDetector.detectChanges();
    this.search_input.nativeElement.focus();
    this.valueFinding();
  }

  focusOutInput() {
    if (!this.ignoreFocusOut) this.HideDropdown();
  }

  private selectCurrencyOnStart() {
    let data: any;
    let localData = localStorage.getItem(this.selectorId);
    if (localData)
      data = this.service
        .getCurrencies()
        .find((element) => element.name == localData);
    if (!data)
      data = this.service
        .getCurrencies()
        .find(
          (element) =>
            element.name == (this.selectorId == 'from' ? 'EUR' : 'USD')
        );
    if (data) this.selectCurrency(data);
  }

  ngAfterViewInit(): void {
    this.elementCurrenciesList = document.getElementById(
      'currenciesList ' + this.selectorId
    );
    this.selectCurrencyOnStart();
  }

  public selectCurrencyFunc(currency: any) {
    this.selectCurrency(currency);
  }

  ngOnInit(): void {
    this.currencies = this.service.getCurrencies();

    this.selectedCurrency = this.service.getCurrencies()[0];
    this.changeCurrency(this.service.getCurrencies()[0]);
  }
}
