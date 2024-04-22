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
  title = 'currency-exchange';
  public isDataAvailable = false;
  public failedToLoad = false;
  private _sourceCurrency!: Currency;
  private _targetCurrency!: Currency;
  public amountValue: number = 1;

  public resultFrom: Currency | undefined;
  public resultTo: string | undefined;
  public isResult = false;

  @ViewChild('source') sourceCurrencyComponent!: ExchangePickerComponent;
  @ViewChild('target') targetCurrencyComponent!: ExchangePickerComponent;
  @ViewChild('submitBtn', { static: false })
  submitButton!: ElementRef<HTMLDivElement>;
  @ViewChild('formExchange', { static: false })
  formExchangeContainer!: ElementRef<HTMLDivElement>;

  constructor(public service: ExchangeServiceComponent) {}

  get sourceCurrencySymbol(): string {
    return this._sourceCurrency?.symbol || '';
  }

  public selectSourceCurrency = (currency: Currency): void => {
    this._sourceCurrency = currency;
    if (this.isResult) this.exchange();
  };

  public selectTargetCurrency = (currency: Currency): void => {
    this._targetCurrency = currency;
    if (this.isResult) this.exchange();
  };

  changeAmountValue(): void {
    this.amountValue = +(Math.round(this.amountValue * 100) / 100).toFixed(2);
    localStorage.setItem('amount', this.amountValue.toString());
    if (this.isResult) this.exchange();
  }

  public switchCurrencies(): void {
    const temp: Currency = this._sourceCurrency;
    this.sourceCurrencyComponent.selectCurrency(this._targetCurrency);
    this.targetCurrencyComponent.selectCurrency(temp);
    if (this.isResult) this.exchange();
  }

  public exchange(): void {
    const rateBase = this._targetCurrency.rate / this._sourceCurrency.rate;
    const result = this.amountValue * rateBase;
    this.resultTo =
      result.toFixed(2) +
      ' ' +
      (this._targetCurrency.full_name
        ? this._targetCurrency.full_name
        : this._targetCurrency.name);
  }

  onSubmit(): void {
    this.exchange();
    this.isResult = true;
  }

  ngOnInit(): void {
    this.service.getCurrenciesPromise().then(
      (data: Currency[]) => {
        this._sourceCurrency = data[0];
        this._targetCurrency = data[1];
        this.isDataAvailable = true;
      },
      () => {
        this.failedToLoad = true;
      }
    );

    const localAmount = localStorage.getItem('amount');
    this.amountValue = localAmount ? parseFloat(localAmount) : 1;
  }

  windowResize(): void {
    this.submitButton.nativeElement.style.width =
      this.formExchangeContainer.nativeElement.style.width;
  }
}
