import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useApiCall } from '../hooks/useApiCall';
import { FileText, Hash, Image, Scissors, Eraser, FileSearch, Crown, ArrowRight, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const TOOLS = [
  { to: '/dashboard/article-generator', icon: FileText, label: 'Article Generator', desc: 'Generate full articles from a title', color: 'from-blue-500 to-cyan-500' },
  { to: '/dashboard/blog-titles', icon: Hash, label: 'Blog Title Generator', desc: '5 blog title ideas per keyword', color: 'from-purple-500 to-pink-500' },
  { to: '/dashboard/image-generator', icon: Image, label: 'Image Generator', desc: 'Create AI images with DALL-E 3', color: 'from-orange-500 to-amber-500' },
  { to: '/dashboard/background-remover', icon: Scissors, label: 'Background Remover', desc: 'Remove image backgrounds', color: 'from-green-500 to-emerald-500' },
  { to: '/dashboard/object-remover', icon: Eraser, label: 'Object Remover', desc: 'Erase objects from photos', color: 'from-red-500 to-rose-500' },
  { to: '/dashboard/resume-analyzer', icon: FileSearch, label: 'Resume Analyzer', desc: 'AI resume scoring & feedback', color: 'from-indigo-500 to-violet-500' },
];

export default function DashboardHome() {
  const { userData, loading } = useUser();
  const { callApi } = useApiCall();
  const navigate = useNavigate();

  const isPremium = userData?.user?.plan === 'premium';
  const credits = userData?.user?.credits;

  const handleUpgrade = async () => {
    try {
      const data = await callApi('post', '/api/payments/create-checkout');
      window.location.href = data.checkoutUrl;
    } catch {
      toast.error('Failed to open checkout');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-1">
          Welcome back{userData?.user?.name ? `, ${userData.user.name.split(' ')[0]}` : ''}! 👋
        </h1>
        <p className="text-white/50">Choose a tool to get started</p>
      </div>

      {/* Credits card */}
      {!isPremium && !loading && (
        <div className="card p-5 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-600/20 rounded-xl flex items-center justify-center">
              <Zap size={18} className="text-brand-400" />
            </div>
            <div>
              <p className="text-white font-medium">AI Credits Remaining</p>
              <p className="text-white/40 text-sm">{credits} of 10 free credits</p>
            </div>
          </div>
          <button onClick={handleUpgrade} className="btn-primary text-sm py-2 px-5">
            <Crown size={15} /> Upgrade
          </button>
        </div>
      )}

      {isPremium && (
        <div className="card p-5 mb-8 flex items-center gap-4 border-brand-500/20 bg-brand-600/10">
          <Crown size={18} className="text-brand-400" />
          <p className="text-brand-300 font-medium">Premium Plan — Unlimited AI Credits</p>
        </div>
      )}

      {/* Tools grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map((tool) => (
          <button
            key={tool.to}
            onClick={() => navigate(tool.to)}
            className="card-hover p-5 text-left group"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <tool.icon size={18} className="text-white" />
            </div>
            <h3 className="font-display font-semibold text-white mb-1 flex items-center justify-between">
              {tool.label}
              <ArrowRight size={15} className="text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
            </h3>
            <p className="text-white/40 text-sm">{tool.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
