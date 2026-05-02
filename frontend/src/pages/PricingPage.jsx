import { SignUpButton, useAuth } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Sparkles, Zap, Crown, ArrowLeft } from 'lucide-react';
import { useApiCall } from '../hooks/useApiCall';
import toast from 'react-hot-toast';

const FREE_FEATURES = [
  '10 AI credits per month',
  'All 6 AI tools',
  'Article & blog title generation',
  'Image generation',
  'Background & object removal',
  'Resume analysis',
];

const PREMIUM_FEATURES = [
  'Unlimited AI credits',
  'All 6 AI tools',
  'Priority AI processing',
  'Higher quality outputs',
  'Usage history & analytics',
  'Cancel anytime',
];

export default function PricingPage() {
  const { isSignedIn } = useAuth();
  const { callApi } = useApiCall();
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    if (!isSignedIn) return;
    try {
      const data = await callApi('post', '/api/payments/create-checkout');
      window.location.href = data.checkoutUrl;
    } catch {
      toast.error('Failed to open checkout');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto border-b border-white/5">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Sparkles size={15} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg text-white">QuickAI</span>
        </Link>
        <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
          <ArrowLeft size={14} /> Back to home
        </Link>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="font-display text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-white/50 text-xl">Start free. Upgrade when you need more.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free plan */}
          <div className="card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Zap size={18} className="text-white/70" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-white">Free</h2>
                <p className="text-white/40 text-sm">Get started</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="font-display text-4xl font-bold text-white">$0</span>
              <span className="text-white/40 text-sm ml-2">/month</span>
            </div>

            <ul className="space-y-3 mb-8">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-white/60 text-sm">
                  <Check size={15} className="text-white/40 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>

            {isSignedIn ? (
              <button onClick={() => navigate('/dashboard')} className="btn-secondary w-full justify-center py-3">
                Go to Dashboard
              </button>
            ) : (
              <SignUpButton mode="modal">
                <button className="btn-secondary w-full justify-center py-3">Get Started Free</button>
              </SignUpButton>
            )}
          </div>

          {/* Premium plan */}
          <div className="relative card p-8 border-brand-500/30 bg-gradient-to-br from-brand-600/10 to-purple-600/10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-gradient-to-r from-brand-500 to-purple-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                MOST POPULAR
              </span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-brand-600/30 rounded-xl flex items-center justify-center">
                <Crown size={18} className="text-brand-400" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-white">Premium</h2>
                <p className="text-brand-400 text-sm">Unlimited access</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="font-display text-4xl font-bold text-white">$19</span>
              <span className="text-white/40 text-sm ml-2">/month</span>
            </div>

            <ul className="space-y-3 mb-8">
              {PREMIUM_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-white/80 text-sm">
                  <Check size={15} className="text-brand-400 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>

            {isSignedIn ? (
              <button onClick={handleUpgrade} className="btn-primary w-full justify-center py-3">
                <Crown size={16} /> Upgrade to Premium
              </button>
            ) : (
              <SignUpButton mode="modal">
                <button className="btn-primary w-full justify-center py-3">
                  <Crown size={16} /> Get Premium
                </button>
              </SignUpButton>
            )}
          </div>
        </div>

        <p className="text-center text-white/30 text-sm mt-8">
          Secure payment via Stripe · Cancel anytime · No hidden fees
        </p>
      </div>
    </div>
  );
}
