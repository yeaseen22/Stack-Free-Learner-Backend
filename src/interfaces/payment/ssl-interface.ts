declare module "sslcommerz-lts" {
  interface SSLCommerzConfig {
    store_id: string;
    store_passwd: string;
    is_live: boolean;
  }

  interface PaymentInitData {
    total_amount: number;
    currency: string;
    tran_id: string;
    success_url: string;
    fail_url: string;
    cancel_url: string;
    ipn_url?: string;
    product_name: string;
    cus_name: string;
    cus_email: string;
    cus_add1: string;
    cus_phone: string;
    shipping_method: string;
    product_category: string;
  }

  export default class SSLCommerzPayment {
    constructor(store_id: string, store_passwd: string, is_live: boolean);
    init(data: PaymentInitData): Promise<any>;
  }
}
