export interface CustomerComplaint {
  id: number;
  complaint_date: string;
  customer_id: number;
  complaint_content: string;
  recipient: string;
  resolution: string;
  status: number;
  created_at: number;
  updated_at: number;
  created_by: number;
  updated_by: number;
  customer?: {
    id: number;
    name: string;
    phone: string;
    address: string;
  };
  createdBy?: {
    id: number;
    username: string;
  };
  statusName?: string;
}
