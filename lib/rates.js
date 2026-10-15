const RATES = {
  // Africa
  KES: 129.00, UGX: 3750.00, TZS: 2680.00, RWF: 1370.00, BIF: 2920.00,
  SSP: 4800.00, ETB: 122.00, SOS: 571.00, NGN: 1620.00, GHS: 15.60,
  ZAR: 18.20, EGP: 48.90, MAD: 9.95, ZMW: 27.30, ZWL: 780.00,
  MWK: 1740.00, MZN: 63.80, DZD: 133.00, AOA: 910.00, XOF: 604.00,
  XAF: 604.00, CDF: 2850.00, GMD: 71.00, GNF: 8600.00, LRD: 192.00,
  LYD: 4.85, MGA: 4650.00, MRU: 39.80, MUR: 46.50, SCR: 13.70,
  SDG: 601.00, SLL: 22800.00, STN: 22.60, SZL: 17.90, TND: 3.12,
  // Americas
  USD: 1.00, CAD: 1.37, MXN: 17.20, BRL: 5.42, ARS: 990.00,
  CLP: 940.00, COP: 4300.00, PEN: 3.78, UYU: 41.50, VES: 38.00,
  BOB: 6.91, PYG: 7800.00, GYD: 209.00, SRD: 35.50, JMD: 156.00,
  TTD: 6.78, BBD: 2.00, BSD: 1.00, BZD: 2.02, XCD: 2.70,
  DOP: 60.20, HTG: 132.00, CUP: 24.00, GTQ: 7.72, HNL: 25.30,
  NIO: 36.80, CRC: 510.00, PAB: 1.00, BMD: 1.00, KYD: 0.83,
  // Europe
  EUR: 0.92, GBP: 0.79, CHF: 0.88, SEK: 10.60, NOK: 11.00,
  DKK: 6.88, PLN: 3.98, CZK: 23.30, HUF: 360.00, RON: 4.58,
  BGN: 1.80, HRK: 6.95, RSD: 108.00, MKD: 56.50, ALL: 92.00,
  BAM: 1.80, MDL: 18.30, UAH: 41.30, RUB: 96.00, BYN: 3.27,
  GEL: 2.72, AMD: 388.00, AZN: 1.70, TRY: 34.20, ISK: 138.00,
  // Asia
  INR: 84.10, PKR: 278.00, BDT: 119.00, LKR: 293.00, NPR: 135.00,
  BTN: 84.00, CNY: 7.24, JPY: 152.00, KRW: 1370.00, TWD: 32.20,
  HKD: 7.78, MOP: 8.02, SGD: 1.32, MYR: 4.42, IDR: 15700.00,
  THB: 34.50, VND: 25400.00, PHP: 58.20, KHR: 4060.00, LAK: 21800.00,
  MMK: 2100.00, BND: 1.32, MNT: 3400.00, KZT: 490.00, UZS: 12800.00,
  TJS: 10.70, TMT: 3.50, KGS: 86.00, AFN: 68.00, IRR: 42000.00,
  IQD: 1310.00, ILS: 3.75, JOD: 0.71, LBP: 89500.00, SYP: 13000.00,
  SAR: 3.75, AED: 3.67, QAR: 3.64, KWD: 0.31, BHD: 0.38,
  OMR: 0.385, YER: 250.00,
  // Oceania
  AUD: 1.52, NZD: 1.65, FJD: 2.24, PGK: 3.95, SBD: 8.45,
  VUV: 119.00, WST: 2.75, TOP: 2.36, XPF: 110.00
};

const BASE_FEE_USD = 24;

function getLocalFee(currencyCode) {
  const code = String(currencyCode || '').toUpperCase();
  const rate = RATES[code];
  if (!rate) return null;
  const amount = BASE_FEE_USD * rate;
  const formatted = code + ' ' + amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return { currency: code, rate, amount, formatted };
}

module.exports = { RATES, BASE_FEE_USD, getLocalFee };
