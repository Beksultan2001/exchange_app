import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Currency } from '../Currency';

interface ExchangeApiResponse {
  rates: { [currency: string]: number };
}

interface CurrencyDetails {
  name: string;
  symbol: string;
}

interface CountryApiResponse {
  currencies: { [currencyCode: string]: CurrencyDetails };
}

@Injectable({
  providedIn: 'root',
})
export class ExchangeServiceComponent {
  private readonly baseUrl = 'https://open.er-api.com/v6/latest/USD';
  private readonly countriesUrl =
    'https://restcountries.com/v3.1/all?fields=currencies';
  private currencies: Currency[] = [];

  constructor(private http: HttpClient) {}

  public getCurrencies() {
    return this.currencies;
  }

  public async getCurrenciesPromise(): Promise<Currency[]> {
    try {
      if (this.currencies.length > 0) {
        return this.currencies; // Return cached data if available
      }

      const exchangeData = await this.http
        .get<ExchangeApiResponse>(this.baseUrl)
        .toPromise();

      const countryData = await this.http
        .get<CountryApiResponse[]>(this.countriesUrl)
        .toPromise();

      if (!exchangeData || !countryData) {
        throw new Error('Failed to fetch exchange data');
      }

      const currencies: Currency[] = [];

      // Extract keys and values from exchange data and create Currency objects
      Object.entries(exchangeData.rates).forEach(([name, rate]) => {
        currencies.push({
          rate,
          full_name: '',
          name,
          symbol: '',
        });
      });

      // Populate full_name and symbol from country data
      for (const country of countryData) {
        const countryName = Object.keys(country.currencies)[0];
        const matchingCurrencyIndex = currencies.findIndex(
          (c) => c.name === countryName
        );

        if (matchingCurrencyIndex !== -1) {
          currencies[matchingCurrencyIndex] = {
            ...currencies[matchingCurrencyIndex],
            full_name: country.currencies[countryName].name,
            symbol: country.currencies[countryName].symbol,
          };
        }
      }

      // Cache currencies
      this.currencies = currencies;

      return currencies;
    } catch (error) {
      console.error('Error fetching currencies:', error);
      return [];
    }
  }
}
