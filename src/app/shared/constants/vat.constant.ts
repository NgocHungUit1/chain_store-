export interface VatOption {
  value: number;
  label: string;
}

export const VAT_OPTIONS: VatOption[] = [
  { value: 0,  label: '0%' },
  { value: 5,  label: '5%' },
  { value: 8,  label: '8%' },
  { value: 10, label: '10%' },
  { value: -1, label: 'Không chịu thuế' },
  { value: -2, label: 'Không kê khai thuế' },
];
