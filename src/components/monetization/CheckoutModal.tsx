import React, { useState, useEffect } from 'react';
import { 
  X, Check, QrCode, CreditCard, ShieldCheck, 
  Sparkles, Lock, ArrowRight, Loader2, Award,
  Smartphone, Copy, ExternalLink, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { backendService } from '../../services/backendService';
import { paymentService } from '../../services/paymentService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: { name: string; price: number; period: string } | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, plan }) => {
  const { profile, updateProfile, showToast } = useApp();
  
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'razorpay'>('upi');
  const [utrNumber, setUtrNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [upiLink, setUpiLink] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Owner UPI ID is configured exclusively in environment variables (.env / Vercel)
  const upiId = ((import.meta as any).env?.VITE_OWNER_UPI_ID || '').trim();
  const hasRazorpay = paymentService.isRazorpayConfigured();

  const finalPrice = plan?.price ?? 0;

  useEffect(() => {
    if (isOpen && plan && upiId) {
      const qr = paymentService.getUPIQRCodeUrl(upiId, finalPrice, plan.name);
      const link = paymentService.generateUPILink(upiId, finalPrice, plan.name);
      setQrCodeUrl(qr);
      setUpiLink(link);
    }
  }, [isOpen, plan, finalPrice, upiId]);

  if (!isOpen || !plan) return null;

  const handleRazorpayPayment = async () => {
    setIsProcessing(true);
    try {
      if (!backendService.isConfigured) throw new Error('Cloud payments are not configured. Connect Supabase before accepting payments.');
      const order = await backendService.createPaymentOrder(finalPrice, plan.name);
      const orderId = order.orderId;

      paymentService.openRazorpayCheckout({
        amount: finalPrice,
        planName: plan.name,
        customerName: profile.name,
        customerEmail: profile.email,
        orderId,
        onSuccess: async (paymentId, paidOrderId, signature) => {
          try {
            const v = await backendService.verifyPayment({ paymentId, orderId: paidOrderId || orderId, signature });
            if (!v.verified) throw new Error('Payment verification failed');
            activatePro(paymentId);
          } catch (err) {
            showToast(err instanceof Error ? err.message : 'Verification failed', 'error');
          } finally { setIsProcessing(false); }
        },
        onError: (error) => {
          setIsProcessing(false);
          if (error !== 'RAZORPAY_NOT_CONFIGURED') showToast(error, 'error');
        }
      });
    } catch (err) {
      setIsProcessing(false);
      showToast(err instanceof Error ? err.message : 'Unable to start payment', 'error');
    }
  };

  const handleConfirmUpiPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      activatePro(utrNumber || 'UPI_DIRECT');
    }, 800);
  };

  const activatePro = (paymentId?: string) => {
    setIsSuccess(true);
    updateProfile({ ...profile, userTier: 'pro', tierExpiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString() } as any);
    confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
    showToast('🎉 PRO Subscription Activated!', 'success');
    if (paymentId) console.log('Payment ID for records:', paymentId);
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    showToast('UPI ID copied to clipboard!', 'success');
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg p-6 lg:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Direct Account Checkout</span>
            <h3 className="text-xl font-display font-bold text-white">{plan.name}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isSuccess ? (
          <div className="space-y-5">
            
            {/* Price Summary */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Subscription Period</span>
                <span className="text-slate-200 font-semibold">{plan.period}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Direct Payout</span>
                <span className="text-emerald-400 font-semibold">100% to Your Bank</span>
              </div>
              <div className="pt-2 border-t border-slate-900 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Amount Payable</span>
                <span className="text-2xl font-display font-extrabold text-emerald-400">₹{finalPrice}</span>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Choose Payment Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'upi' ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Direct UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'razorpay' ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-indigo-400" />
                  <span>Cards / NetBanking</span>
                </button>
              </div>
            </div>

            {/* UPI Method */}
            {paymentMethod === 'upi' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                {upiId ? (
                  <>
                    {/* Real QR Code */}
                    <div className="flex justify-center">
                      <div className="w-[180px] h-[180px] bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-lg border-4 border-emerald-500/40">
                        {qrCodeUrl ? (
                          <img
                            src={qrCodeUrl}
                            alt="UPI QR Code"
                            className="w-full h-full object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <QrCode className="w-16 h-16 text-slate-900" />
                        )}
                      </div>
                    </div>

                    <div className="text-center space-y-1">
                      <p className="text-xs font-bold text-white">Scan with GPay, PhonePe, Paytm, BHIM, Cred</p>
                      <div className="flex items-center justify-center gap-2">
                        <code className="text-xs text-emerald-300 font-mono">{upiId}</code>
                        <button onClick={copyUpiId} className="text-slate-400 hover:text-white">
                          {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400">Amount: <span className="text-white font-bold">₹{finalPrice}</span></p>
                    </div>

                    <a
                      href={upiLink}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-md shadow-emerald-600/20"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Open UPI App Directly</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {/* Direct UTR / Confirmation */}
                    <div className="pt-2 border-t border-slate-900 space-y-2">
                      <label className="block text-[11px] font-semibold text-slate-300">
                        Paid via UPI? Enter UTR / Ref No. to Activate Instantly:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. 423987123456 (or click Confirm)"
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={handleConfirmUpiPayment}
                          disabled={isProcessing}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50"
                        >
                          {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          <span>Confirm & Unlock</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        100% of this payment goes directly to the account owner via instant UPI. Zero platform commission.
                      </p>
                    </div>

                  </>
                ) : (
                  /* UPI not configured */
                  <div className="text-center space-y-3 py-4">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Owner UPI Not Configured</p>
                      <p className="text-xs text-slate-400 mt-1">Add <code className="text-amber-300 font-mono">VITE_OWNER_UPI_ID</code> to your <code className="text-amber-300 font-mono">.env</code> or Vercel environment variables to generate student payment QR codes.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Razorpay Method */}
            {paymentMethod === 'razorpay' && (
              <div className="space-y-3">
                {!hasRazorpay && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-200 leading-relaxed">
                      Razorpay is not configured for this deployment. Add the public key ID to the frontend environment and the secret keys to Supabase Edge Function secrets.
                    </p>
                  </div>
                )}
                <button
                  onClick={handleRazorpayPayment}
                  disabled={isProcessing || !hasRazorpay}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay ₹{finalPrice} with Razorpay</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <Lock className="w-3 h-3 text-indigo-400" />
                <span>256-bit SSL</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Instant Activation</span>
              </div>
            </div>
          </div>
        ) : (
          /* Success Screen */
          <div className="text-center py-6 space-y-5 animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <Award className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-display font-bold text-white">PRO Activated! 🎉</h3>
              <p className="text-xs text-slate-400">Welcome to Kedar AI Student Pro</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs text-slate-300 space-y-1.5">
              <p className="font-semibold text-white mb-2">PRO Features Unlocked:</p>
              {['Unlimited AI Chat & Voice Viva Examiner', '10-Mark Exam Solver & PYQ Archive', '1-Click Lab Record PDF Generator', 'Capstone Project IEEE Architect', 'Campus Ambassador 30% Revenue Share'].map(f => (
                <p key={f} className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />{f}</p>
              ))}
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
