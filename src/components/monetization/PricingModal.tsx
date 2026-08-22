import React, { useState } from 'react';
import { 
  Check, Sparkles, Zap, ShieldCheck, 
  Crown, ArrowRight, X, HeartHandshake, Building2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: { name: string; price: number; period: string }) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onSelectPlan }) => {
  const { profile } = useApp();

  if (!isOpen) return null;

  const plans = [
    {
      id: 'free',
      name: 'Free Student',
      tagline: 'Basic study & coding queries',
      price: 0,
      period: 'forever',
      features: [
        '5 AI queries per day',
        'Standard learning roadmaps',
        '1 ATS Resume analysis',
        'Standard Markdown chat export'
      ],
      isPopular: false,
      buttonText: 'Current Plan',
      disabled: profile.userTier === 'free'
    },
    {
      id: 'pro-monthly',
      name: 'Student Pro (Monthly)',
      tagline: 'Essential academic & viva copilot',
      price: 199,
      period: '/ month',
      features: [
        '⚡ Unlimited Gemini 2.0 / 1.5 Flash queries',
        '🎙️ Live Audio Viva Voce Examiner',
        '📑 1-Click University Lab Record Generator & PDF',
        '🎓 10-Mark University Exam Solver & PYQ sheets',
        '💻 Big-O Algorithm Optimizer & Debugger',
        '📄 Unlimited ATS 95+ Resume Rewrites',
        '🚀 Capstone Project & IEEE Synopsis Builder'
      ],
      isPopular: true,
      buttonText: 'Upgrade to Pro'
    },
    {
      id: 'pro-semester',
      name: 'Semester Pass (Best Value)',
      tagline: 'Full 6-month semester dominance',
      price: 499,
      period: '/ semester (₹83/mo)',
      features: [
        '🔥 Everything in Student Pro',
        '💎 58% discount vs monthly billing',
        '🎯 SDE-1 Technical Mock Interview Simulator',
        '💰 Access to Campus Ambassador 30% Cash Payouts',
        '🤝 Priority AI response streaming (<400ms latency)',
        '⭐ Official PRO Verified Student Badge'
      ],
      isPopular: false,
      badge: 'SAVE 58%',
      buttonText: 'Get Semester Pass'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl p-6 lg:p-8 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Student Monetization & Pro Plans</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-display font-bold text-white">
              Supercharge Your Engineering Career
            </h2>
            <p className="text-xs lg:text-sm text-slate-400">
              Unlock unlimited oral viva practice, 10-mark exam sheets, lab records, and referral revenue.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`p-6 rounded-2xl border flex flex-col justify-between space-y-6 transition-all relative ${
                plan.isPopular
                  ? 'bg-gradient-to-b from-indigo-950/60 to-slate-950 border-indigo-500 shadow-xl shadow-indigo-950/50'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                  Most Popular for B.Tech
                </div>
              )}

              {plan.badge && (
                <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider">
                  {plan.badge}
                </div>
              )}

              <div className="space-y-3">
                <h3 className="font-display font-bold text-lg text-white">{plan.name}</h3>
                <p className="text-xs text-slate-400">{plan.tagline}</p>

                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-display font-extrabold text-white">
                      {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                    </span>
                    <span className="text-xs text-slate-400">{plan.period}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-800/80">
                  {plan.features.map((f, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  if (plan.price > 0) {
                    onSelectPlan({ name: plan.name, price: plan.price, period: plan.period });
                  }
                }}
                disabled={plan.disabled || (plan.id === 'free' && profile.userTier === 'free')}
                className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all shadow-md ${
                  plan.isPopular
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30'
                    : plan.price > 0
                    ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    : 'bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-800'
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Guarantee Banner */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Student-Friendly Guarantee • Cancel Anytime • Instant Activation</span>
          </div>
          <span className="font-mono text-indigo-400">UPI / QR / Razorpay Ready</span>
        </div>

      </div>
    </div>
  );
};
