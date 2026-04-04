import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

// Date
export const CUSTOM_DATE_INPUT_FORMAT = 'DD/MM/YYYY';

const CUSTOM_DATE_FORMATS = {
  parse: {
    dateInput: CUSTOM_DATE_INPUT_FORMAT
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};

export const MatDateProviders = [
  {
    provide: DateAdapter,
    useClass: MomentDateAdapter,
    deps: [MAT_DATE_LOCALE]
  },
  {
    provide: MAT_DATE_FORMATS,
    useValue: CUSTOM_DATE_FORMATS
  }
];

// Month
export const CUSTOM_MONTH_INPUT_FORMAT = 'MM/YYYY';

const CUSTOM_MONTH_FORMATS = {
  parse: {
    dateInput: CUSTOM_MONTH_INPUT_FORMAT
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};

export const MatMonthProviders = [
  {
    provide: DateAdapter,
    useClass: MomentDateAdapter,
    deps: [MAT_DATE_LOCALE]
  },
  {
    provide: MAT_DATE_FORMATS,
    useValue: CUSTOM_MONTH_FORMATS
  }
];
