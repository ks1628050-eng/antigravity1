// Real Payment Gateway Service (Razorpay + Direct UPI for India & Global)

export interface PaymentOptions {
  amount: number; // in INR
  planName: string;
  customerName: string;
  customerEmail: string;
  onSuccess: (paymentId: string, orderId: string, signature: string) => void;
  onError: (error: string) => void;
  orderId?: string;
}

export const paymentService = {
  /**
   * 1. Initialize Razorpay Checkout
   * To get your Key: Sign up on https://dashboard.razorpay.com -> Settings -> API Keys
   */
  openRazorpayCheckout: (options: PaymentOptions, razorpayKeyId?: string) => {
    const key = razorpayKeyId || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID;

    if (!key) {
      options.onError('Razorpay is not configured. Set VITE_RAZORPAY_KEY_ID for checkout.');
      return;
    }

    if (!(window as any).Razorpay) {
      options.onError('Razorpay SDK failed to load. Please check your internet connection.');
      return;
    }

    const rzpOptions = {
      key: key,
      amount: options.amount * 100, // Razorpay takes amount in paise (₹199 = 19900 paise)
      order_id: options.orderId,
      currency: 'INR',
      name: 'Kedar AI',
      description: `${options.planName} Subscription`,
      image: 'https://api.dicebear.com/7.x/shapes/svg?seed=kedarai',
      handler: function (response: any) {
        options.onSuccess(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature);
      },
      prefill: {
        name: options.customerName,
        email: options.customerEmail,
      },
      theme: {
        color: '#6366f1' // Indigo
      }
    };

    const rzp = new (window as any).Razorpay(rzpOptions);
    rzp.on('payment.failed', function (response: any) {
      options.onError(response.error?.description || 'Payment transaction failed');
    });
    rzp.open();
  },

  /**
   * 2. Generate Direct Dynamic UPI Payment Link (Zero Gateway Fee!)
   * Format: upi://pay?pa=YOUR_UPI_ID&pn=KedarAI&am=AMOUNT&cu=INR&tn=PlanName
   */
  generateUPILink: (upiId: string, amount: number, planName: string): string => {
    const cleanUpi = encodeURIComponent(upiId || 'kedar.swami@okaxis');
    const note = encodeURIComponent(`KedarAI ${planName}`);
    return `upi://pay?pa=${cleanUpi}&pn=KedarAI&am=${amount}&cu=INR&tn=${note}`;
  },

  /**
   * 3. Generate QR Code Image URL for UPI
   */
  getUPIQRCodeUrl: (upiId: string, amount: number, planName: string): string => {
    const upiUri = paymentService.generateUPILink(upiId, amount, planName);
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUri)}`;
  }
};
