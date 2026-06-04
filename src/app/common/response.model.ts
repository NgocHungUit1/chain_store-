export class ResponseModel {
  success: boolean;
  message: string;
}

export interface IResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}
