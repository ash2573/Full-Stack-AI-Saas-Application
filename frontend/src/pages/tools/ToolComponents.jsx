import { Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApiCall } from '../../hooks/useApiCall';
import toast from 'react-hot-toast';

export const ToolHeader = ({ icon: Icon, title, desc, color }) => (
  <div className="flex items-start gap-4 mb-8">
    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <h1 className="font-display text-2xl font-bold text-white">{title}</h1>
      <p className="text-white/50 text-sm mt-0.5">{desc}</p>
    </div>
  </div>
);

export const CreditsAlert = ({ onUpgrade }) => (
  <div className="card border-red-500/20 bg-red-500/10 p-5 flex items-center justify-between gap-4 animate-fade-in">
    <div>
      <p className="text-red-300 font-medium">You've run out of credits!</p>
      <p className="text-white/50 text-sm mt-0.5">Upgrade to Premium for unlimited access.</p>
    </div>
    <button onClick={onUpgrade} className="btn-primary text-sm py-2 px-4 bg-red-600 hover:bg-red-500 flex-shrink-0">
      <Crown size={14} /> Upgrade Now
    </button>
  </div>
);

export const LoadingSpinner = ({ text = 'Generating...' }) => (
  <div className="flex items-center gap-3 text-white/60">
    <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    <span className="text-sm">{text}</span>
  </div>
);

export const OutputCard = ({ children, className = '' }) => (
  <div className={`card p-6 animate-fade-in ${className}`}>
    {children}
  </div>
);

export const useUpgrade = () => {
  const { callApi } = useApiCall();
  return async () => {
    try {
      const data = await callApi('post', '/api/payments/create-checkout');
      window.location.href = data.checkoutUrl;
    } catch {
      toast.error('Failed to open checkout');
    }
  };
};
