import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Currency } from './Currency';

import { ExchangeServiceComponent } from './exchange-service/exchange-service.service';
import { RouterOutlet } from '@angular/router';
import { ExchangePickerComponent } from './components/exchange-picker/exchange-picker.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  imports: [RouterOutlet, ExchangePickerComponent, CommonModule, FormsModule],
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'exchange-app';
  isDataAvailable = false; // Indicates if currency data is available
  failedToLoad = false; // Indicates if there was an error loading currency data
  private _sourceCurrency!: Currency; // variable to hold the source currency
  private _targetCurrency!: Currency; // variable to hold the target currency
  amountValue: number = 1; // Initial value of the amount to convert
  converted: string | undefined; // Variable to hold the converted amount with currency symbol
  isResultAvailable = false; // Indicates if conversion result is available

  // Reference to child components for source and target currency selection
  @ViewChild('source') sourceCurrencyComponent!: ExchangePickerComponent;
  @ViewChild('target') targetCurrencyComponent!: ExchangePickerComponent;
  @ViewChild('formExchange', { static: false })
  convertButton!: ElementRef<HTMLDivElement>;
  formExchangeContainer!: ElementRef<HTMLDivElement>;

  constructor(public service: ExchangeServiceComponent) {}

  ngOnInit(): void {
    this.inited(); // Initialize the component
  }

  selectSourceCurrency = (currency: Currency): void => {
    this._sourceCurrency = currency;
    if (this.isResultAvailable) this.observer(); // If there is a result, observe the change
  };

  //  to handle target currency selection
  selectTargetCurrency = (currency: Currency): void => {
    this._targetCurrency = currency;
    if (this.isResultAvailable) this.observer();
  };

  changeAmountValue(): void {
    // Round the amount value to two decimal places
    this.amountValue = +(Math.round(this.amountValue * 100) / 100).toFixed(2);
    localStorage.setItem('amount', this.amountValue.toString());
    if (this.isResultAvailable) this.observer(); // If there is a result, observe the change
  }

  // to switch between source and target currencies
  switchCurrencies(): void {
    const temp: Currency = this._sourceCurrency;
    this.sourceCurrencyComponent.selectCurrency(this._targetCurrency);
    this.targetCurrencyComponent.selectCurrency(temp);
    if (this.isResultAvailable) this.observer();
  }

  // this is to calculate the conversion result
  observer(): void {
    const rateBase = this.calculateRateBase();
    const result = this.calculateResult(rateBase);
    this.converted = this.formatResult(result);
  }

  // to calculate the base rate
  private calculateRateBase(): number {
    return this._targetCurrency.rate / this._sourceCurrency.rate;
  }

  // to calculate the conversion result
  private calculateResult(rateBase: number): number {
    return this.amountValue * rateBase;
  }

  // to format the conversion result
  private formatResult(result: number): string {
    const formattedResult = result.toFixed(2); // Format the result to two decimal places
    const currencyName = this._targetCurrency.full_name
      ? this._targetCurrency.full_name
      : this._targetCurrency.name; // Get the currency name
    return `${formattedResult} ${currencyName}`; // Return the formatted result with currency name
  }

  // Function to resize the card
  cardResize(): void {
    this.convertButton.nativeElement.style.width =
      this.formExchangeContainer.nativeElement.style.width; // Resize the card
  }

  // Function to perform the currency conversion
  convertExchange(): void {
    this.observer(); // Calculate the conversion result
    this.isResultAvailable = true; // Set the flag to indicate that conversion result is available
  }

  // Getter function to get the symbol of the source currency
  get sourceCurrencySymbol(): string {
    return this._sourceCurrency?.symbol || '';
  }

  // function to initialize the component
  async inited() {
    try {
      const data: Currency[] = await this.service.getCurrenciesPromise();
      this._sourceCurrency = data[0];
      this._targetCurrency = data[1];
      this.isDataAvailable = true; // Set the flag to indicate that currency data is available
    } catch (error) {
      this.failedToLoad = true;
    }

    const localAmount = localStorage.getItem('amount'); // Get the amount value from local storage
    this.amountValue = localAmount ? parseFloat(localAmount) : 1; // Set the amount value, defaulting to 1 if not available
  }
}
