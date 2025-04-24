export interface MedicineRecall {
  id?: number;
  document_number: string;
  date: string | Date;
  medicine_name: string;
  batch_number: string;
  manufacturer: string;
  quantity: number;
  units_sold: number;
  returned_amount: number;
  customer_info: string;
  receiver: string;
  notes: string;
}
