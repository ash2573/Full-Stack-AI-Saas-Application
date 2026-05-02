import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { useUser } from '../context/UserContext';
import {
  FileText, Hash, Image, Scissors, Eraser, FileSearch,
  LayoutDashboard, Sparkles, Zap, Crown, ChevronRight
} from 'lucide-react';
import { useApiCall } from '../hooks/useApiCall';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/dashboard/article-generator', icon: FileText, label: 'Article Generator' },
  { to: '/dashboard/blog-titles', icon: Hash, label: 'Blog Titles' },
  { to: '/dashboard/image-generator', icon: Image, label: 'Image Generator' },
  { to: '/dashboard/background-remover', icon: Scissors, label: 'BG Remover' },
  { to: '/dashboard/object-remover', icon: Eraser, label: 'Object Remover' },
  { to: '/dashboard/resume-analyzer', icon: FileSearch, label: 'Resume Analyzer' },
];

export default function DashboardLayout() {
  const { userData, loading } = useUser();
  const { callApi } = useApiCall();
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    try {
      const data = await callApi('post', '/api/payments/create-checkout');
      window.location.href = data.checkoutUrl;
    } catch {
      toast.error('Failed to open checkout');
    }
  };

  const credits = userData?.user?.credits;
  const plan = userData?.user?.plan;
  const isPremium = plan === 'premium';

  return (
    <div className="min-h-screen bg-[#0a0a14] flex">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-white/5 flex flex-col h-screen sticky top-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/5">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Sparkles size={15} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg text-white">QuickAI</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? 'bg-brand-600/20 text-brand-300 border border-brand-500/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} className={isActive ? 'text-brand-400' : 'text-white/40 group-hover:text-white/70'} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={14} className="text-brand-400/60" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Credits / Upgrade */}
        <div className="p-4 border-t border-white/5">
          {!isPremium && (
            <div className="card p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-xs font-medium">Credits</span>
                <span className="text-brand-400 font-display font-bold text-sm">
                  {loading ? '...' : credits} / 10
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 mb-3">
                <div
                  className="bg-gradient-to-r from-brand-500 to-purple-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(((credits || 0) / 10) * 100, 100)}%` }}
                />
              </div>
              <button
                onClick={handleUpgrade}
                className="w-full btn-primary text-xs py-2 justify-center"
              >
                <Crown size={13} /> Upgrade to Premium
              </button>
            </div>
          )}

          {isPremium && (
            <div className="card p-3 mb-4 border-brand-500/30 bg-brand-600/10">
              <div className="flex items-center gap-2">
                <Crown size={15} className="text-brand-400" />
                <span className="text-brand-300 text-sm font-medium">Premium Plan</span>
              </div>
              <p className="text-white/40 text-xs mt-1">Unlimited credits</p>
            </div>
          )}

          <div className="flex items-center gap-3 px-1">
            <UserButton afterSignOutUrl="/" />
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-sm font-medium truncate">{userData?.user?.name || 'User'}</p>
              <p className="text-white/40 text-xs truncate">{userData?.user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
