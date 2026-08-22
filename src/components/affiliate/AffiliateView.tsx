import React, { useState } from 'react';
import { 
  HeartHandshake, Sparkles, Copy, Check, DollarSign, 
  TrendingUp, Users, ArrowUpRight, Award, Share2, 
  Send, QrCode, Wallet, CheckCircle2, ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { initialReferralStats } from '../../data/initialData';

export const AffiliateView: React.FC = () => {
  const { profile, showToast } = useApp();
  
  const [stats, setStats] = useState(initialReferralStats);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [upiInput, setUpiInput] = useState(stats.upiId);

  const referralLink = `https://kedarai.app/ref/${profile.referralCode || 'KEDAR-PRO99'}`;

  const shareTemplate = `🚨 Hey everyone! Check out **Kedar AI** — the all-in-one AI study copilot for engineering students.
It has:
🎓 10-Mark University Exam Solvers
🎙️ Live Audio Viva Voce Examiner
📑 1-Click Lab Practical Record Generators
💻 LeetCode & DSA Code Optimizer

Use my student link for 50% OFF with code KEDAR50:
👉 ${referralLink}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    showToast('Referral link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyShareTemplate = () => {
    navigator.clipboard.writeText(shareTemplate);
    setCopiedTemplate(true);
    showToast('WhatsApp share template copied!', 'success');
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const handleWithdraw = () => {
    showToast('Payouts are unavailable until a verified payout provider is configured.', 'info');
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-purple-950/70 border border-emerald-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Campus Ambassador & Student Revenue Engine</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-display font-bold text-white">
            Monetization & Referral Hub
          </h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Share Kedar AI with your engineering batchmates and college groups. Earn a <strong className="text-emerald-400">30% recurring cash commission</strong> (₹60 to ₹150 per Pro conversion) with instant UPI cashouts!
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-right shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue Earned</span>
          <p className="text-3xl font-display font-extrabold text-emerald-400 mt-0.5">₹{stats.totalEarnings}</p>
          <span className="text-[11px] text-slate-400">18 Paid Conversions</span>
        </div>
      </div>

      {/* 4-Stat Metric Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <span className="text-xs font-semibold text-slate-400">Link Clicks</span>
          <p className="text-2xl font-display font-bold text-white mt-1">{stats.totalClicks}</p>
          <p className="text-[11px] text-emerald-400 mt-1">▲ +24 this week</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <span className="text-xs font-semibold text-slate-400">Free Signups</span>
          <p className="text-2xl font-display font-bold text-white mt-1">{stats.freeSignups}</p>
          <p className="text-[11px] text-indigo-400 mt-1">17% conversion rate</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <span className="text-xs font-semibold text-slate-400">Paid PRO Upgrades</span>
          <p className="text-2xl font-display font-bold text-emerald-400 mt-1">{stats.paidConversions}</p>
          <p className="text-[11px] text-slate-400 mt-1">₹200 avg per user</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <span className="text-xs font-semibold text-slate-400">Pending UPI Payout</span>
          <p className="text-2xl font-display font-bold text-amber-400 mt-1">₹{stats.pendingPayout}</p>
          <button
            onClick={handleWithdraw}
            disabled
            className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 mt-1 disabled:opacity-40"
          >
            Payouts unavailable
          </button>
        </div>
      </div>

      {/* Main Grid: Referral Link Box + Viral Share Template */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Your Custom Referral Link (6 Cols) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>Your Unique Referral Link</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              30% COMMISSION
            </span>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Shareable URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 outline-none"
              />
              <button
                onClick={copyLink}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* UPI Payout Details Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-400" />
              <span>UPI Payout Address</span>
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={upiInput}
                onChange={(e) => setUpiInput(e.target.value)}
                placeholder="yourname@okhdfcbank"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleWithdraw}
                disabled
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-xs font-semibold text-white transition-colors shadow-md shadow-emerald-600/20"
              >
                Configure payouts
              </button>
            </div>
            <p className="text-[10px] text-slate-500">Verified payout processing will appear here after a payout provider is connected.</p>
          </div>
        </div>

        {/* Right: Viral WhatsApp / Telegram Copy Template (6 Cols) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-400" />
              <span>Viral WhatsApp / College Group Template</span>
            </h3>
            <button
              onClick={copyShareTemplate}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs text-slate-300 transition-colors"
            >
              {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedTemplate ? 'Copied Template' : 'Copy Text'}</span>
            </button>
          </div>

          <textarea
            rows={8}
            readOnly
            value={shareTemplate}
            className="w-full p-4 rounded-xl bg-slate-950 font-sans text-xs text-slate-300 border border-slate-800 outline-none resize-none leading-relaxed"
          />

          <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Post this in your college WhatsApp class groups, Discord, and Telegram study channels to start earning today!</span>
          </div>
        </div>

      </div>

    </div>
  );
};
