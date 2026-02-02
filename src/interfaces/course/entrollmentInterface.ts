
import { Types } from "mongoose";


export interface IEnrollment {
  user: Types.ObjectId;
  course:Types.ObjectId;
  status?: "pending" | "success" | "failed";
  payment_method?: "bkash" | "nagad" | "rocket" | "sslcommerz";
  amount: number, 
  batch: number,
  student_name: string, 
  transactionId?: string;
  isComplete: boolean;
  enrolledAt: Date;
}

export interface EnrollmentEmailProps {
  name: string;
  courseTitle: string;
  transactionId: string;
  batchNo: string | number;
  paymentMethod: string;
  paymentGateway?: string;
  bankName?: string | null;
}
