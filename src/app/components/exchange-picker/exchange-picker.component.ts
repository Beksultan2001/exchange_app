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

interface CurrencyChangeHandler {
  (currency: Currency): void;
}

@Component({
  selector: 'app-exchange-picker',
  standalone: true,
  templateUrl: './exchange-picker.component.html',
  styleUrl: './exchange-picker.component.scss',
  imports: [CommonModule, FormsModule],
})
export class ExchangePickerComponent implements OnInit {
  // Indicates whether the component is in edit mode
  public edited = true;

  // List of currencies
  exchangeList!: Currency[];
  // Currently selected currency
  selectedCurrency!: Currency;
  elementCurrenciesList: any;
  // Text used to filter currencies
  findCurrency!: string;
  ignoreFocusOut = false;

  noResultsFind = false;

  @Input() onChangeCurrency!: CurrencyChangeHandler;
  // Identifier used to differentiate instances of the component
  @Input() selectorIdentifier!: string;

  // Reference to the search input element in the template
  @ViewChild('search_input', { static: false }) search_input: any;

  constructor(
    private changeDetector: ChangeDetectorRef,
    public exchangeService: ExchangeServiceComponent
  ) {}

  ngOnInit(): void {
    // Initialize the component
    this.loadCurrencies();
  }

  loadCurrencies(): void {
    this.exchangeList = this.exchangeService.getCurrencies();
    this.selectedCurrency = this.exchangeService.getCurrencies()[0];
    this.onChangeCurrency(this.exchangeService.getCurrencies()[0]);
  }

  public valueFinding() {
    this.exchangeList = this.exchangeService
      .getCurrencies()
      .filter(
        (item) =>
          item.name.toLowerCase().includes(this.findCurrency.toLowerCase()) ||
          item.full_name.toLowerCase().includes(this.findCurrency.toLowerCase())
      );

    this.noResultsFind = this.exchangeList.length == 0;
  }

  // Function to handle currency selection
  selectCurrency = (currency: Currency): void => {
    this.selectedCurrency = currency;
    this.onChangeCurrency(currency);
    this.hideDropdown();

    localStorage.setItem(this.selectorIdentifier, currency.name);
  };

  // Show the dropdown menu
  showDropdown() {
    this.edited = false;
    this.elementCurrenciesList.className = 'dropdown-menu scrollable-menu show';
  }

  // Hide the dropdown menu
  hideDropdown() {
    this.edited = true;
    this.elementCurrenciesList.className = 'dropdown-menu scrollable-menu';
  }

  // Handle click event on the dropdown button
  dropClick() {
    this.findCurrency = '';
    this.showDropdown();
    this.changeDetector.detectChanges();
    this.search_input.nativeElement.focus();
    this.valueFinding();
  }

  // Handle focus out event on the search input
  focusOutInput() {
    if (!this.ignoreFocusOut) this.hideDropdown();
  }

  // Select the currency on component initialization
  private selectCurrencyOnStart() {
    const localData = localStorage.getItem(this.selectorIdentifier);
    const defaultCurrencyName =
      this.selectorIdentifier === 'source' ? 'EUR' : 'USD';
    const currencies = this.exchangeService.getCurrencies();
    const data = localData
      ? currencies.find((element) => element.name === localData)
      : currencies.find((element) => element.name === defaultCurrencyName);

    if (data) {
      this.selectCurrency(data);
    }
  }

  ngAfterViewInit(): void {
    // After the view is initialized, retrieve the reference to the currencies list element
    this.elementCurrenciesList = document.getElementById(
      'currenciesList ' + this.selectorIdentifier
    );
    this.selectCurrencyOnStart();
  }

  public selectCurrencyFunc(currency: Currency) {
    this.selectCurrency(currency);
  }
}
