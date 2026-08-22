import React, { useState } from 'react';
import { 
  X, Check, QrCode, CreditCard, ShieldCheck, 
  Sparkles, Lock, ArrowRight, Loader2, Award, Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: { name: string; price: number; period: string } | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, plan }) => {
  const { profile, updateProfile, showToast } = useApp();
  
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !plan) return null;

  const originalPrice = plan.price;
  const discountAmount = Math.round((originalPrice * discountPercent) / 100);
  const finalPrice = originalPrice - discountAmount;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'KEDAR50' || couponCode.toUpperCase() === 'STUDENT50') {
      setDiscountPercent(50);
      setCouponApplied(true);
      showToast('50% Student Discount Applied! 🎉', 'success');
    } else {
      showToast('Invalid coupon code. Try "KEDAR50"', 'error');
    }
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    showToast('Connecting to UPI / Payment Gateway...', 'info');

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Update User Profile to PRO tier
      updateProfile({
        ...profile,
        userTier: 'pro',
        tierExpiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
      });

      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      showToast('PRO Subscription Activated Successfully! 🚀', 'success');
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg p-6 lg:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Secure Payment Checkout</span>
            <h3 className="text-xl font-display font-bold text-white">{plan.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isSuccess ? (
          <div className="space-y-5">
            
            {/* Price Summary */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Plan Duration</span>
                <span className="text-slate-200 font-semibold">{plan.period}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Base Price</span>
                <span className="text-slate-200 font-semibold">₹{originalPrice}</span>
              </div>

              {couponApplied && (
                <div className="flex justify-between text-xs text-emerald-400 font-semibold">
                  <span>Student Discount (50%)</span>
                  <span>- ₹{discountAmount}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-900 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Total Amount Due</span>
                <span className="text-2xl font-display font-extrabold text-emerald-400">₹{finalPrice}</span>
              </div>
            </div>

            {/* Coupon Code Box */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder='Promo Code (e.g. "KEDAR50")'
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={couponApplied}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 uppercase placeholder-slate-500 outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={couponApplied || !couponCode.trim()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-semibold text-white transition-colors"
              >
                {couponApplied ? 'Applied' : 'Apply'}
              </button>
            </form>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Choose Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'upi'
                      ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span>UPI / GPay / PhonePe</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-indigo-400" />
                  <span>Debit / Credit Card</span>
                </button>
              </div>
            </div>

            {/* UPI QR Simulation Preview */}
            {paymentMethod === 'upi' ? (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                <div className="w-28 h-28 bg-white rounded-xl p-2 mx-auto flex items-center justify-center shadow-inner">
                  <div className="w-full h-full border-2 border-slate-900 flex flex-col items-center justify-center text-slate-900">
                    <QrCode className="w-16 h-16" />
                    <span className="text-[9px] font-bold">SCAN TO PAY</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Scan with any UPI App (GPay, Paytm, PhonePe, Cred, BHIM)
                </p>
              </div>
            ) : (
              <div className="space-y-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <input
                  type="text"
                  placeholder="Card Number: 4111 2222 3333 4444"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="MM / YY"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 outline-none"
                  />
                  <input
                    type="password"
                    placeholder="CVV: 123"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handleSimulatePayment}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay ₹{finalPrice} & Activate PRO</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Payment Success Screen */
          <div className="text-center py-6 space-y-5 animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-glow">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-display font-bold text-white">PRO Activated! 🎉</h3>
              <p className="text-xs text-slate-400">
                Transaction ID: <span className="font-mono text-indigo-400">TXN_{Date.now().toString().slice(-8)}</span>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs text-slate-300 space-y-1.5">
              <p className="font-semibold text-white">Included Features Unlocked:</p>
              <p>✔ Unlimited Real-time Audio Viva Voce tests</p>
              <p>✔ 1-Click Lab Practical Record PDF formatting</p>
              <p>✔ 10-Mark University Exam Solvers</p>
              <p>✔ Campus Ambassador 30% Referral Cashouts</p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/20"
            >
              Start Using PRO Features
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
