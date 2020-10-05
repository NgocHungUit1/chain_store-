export class mItem {
  count: number;
  sum: number;
}

export class mMonth {
  after: number;
  now: number;
}

export class DataDashBoard {
  invoice: mItem;
  returns: mItem;
  month: mMonth;
}
