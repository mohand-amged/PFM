export const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SR' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
] as const;

export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number]['code'];

/**
 * Get currency information by currency code
 */
export function getCurrencyInfo(code: string) {
  return SUPPORTED_CURRENCIES.find(currency => currency.code === code);
}

/**
 * Get formatted currency options for dropdowns
 */
export function getCurrencyOptions() {
  return SUPPORTED_CURRENCIES.map(currency => ({
    value: currency.code,
    label: `${currency.code} - ${currency.name}`,
    symbol: currency.symbol,
  }));
}

/**
 * Format currency amount with proper symbol and locale
 */
export function formatCurrency(amount: number, currencyCode: string = 'USD', locale: string = 'en-US') {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported currencies
    const currencyInfo = getCurrencyInfo(currencyCode);
    const symbol = currencyInfo?.symbol || currencyCode;
    return `${symbol}${amount.toFixed(2)}`;
  }
}

/**
 * Common currency groups for easier selection
 */
export const CURRENCY_GROUPS = {
  MAJOR: ['USD', 'EUR', 'GBP', 'JPY'],
  MIDDLE_EAST_AFRICA: ['EGP', 'SAR', 'AED', 'ZAR'],
  ASIA_PACIFIC: ['CNY', 'INR', 'SGD', 'HKD', 'KRW'],
  AMERICAS: ['CAD', 'BRL', 'MXN'],
  EUROPE: ['CHF', 'TRY', 'RUB'],
  OCEANIA: ['AUD'],
} as const;
