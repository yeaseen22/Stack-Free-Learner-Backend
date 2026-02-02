import { Types } from "mongoose";

export interface IManualPaymentInfo {
  paymentPhoneNumber: string;
  transactionId: string;
  amount: number;
  method: 'bkash' | 'nagad' | 'rocket';
  status?: 'pending' | 'approved' | 'rejected'; 
  user: Types.ObjectId;
  course: Types.ObjectId;   
  batchNo: number;
  enrolledAt: Date;
}
