import { SignInButton, SignUpButton, useAuth } from '@clerk/clerk-react';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import {
  FileText, Hash, Image, Scissors, Eraser, FileSearch,
  Zap, Shield, Star, ArrowRight, Sparkles, ChevronRight
} from 'lucide-react';

const TOOLS = [
  { icon: FileText, title: 'Article Generator', desc: 'Generate full articles from a title in seconds', color: 'from-blue-500 to-cyan-500' },
  { icon: Hash, title: 'Blog Title Generator', desc: '5 click-worthy titles for any keyword', color: 'from-purple-500 to-pink-500' },
  { icon: Image, title: 'Image Generator', desc: 'DALL-E powered AI image creation', color: 'from-orange-500 to-amber-500' },
  { icon: Scissors, title: 'Background Remover', desc: 'Remove backgrounds from images instantly', color: 'from-green-500 to-emerald-500' },
  { icon: Eraser, title: 'Object Remover', desc: 'Erase unwanted objects from photos', color: 'from-red-500 to-rose-500' },
  { icon: FileSearch, title: 'Resume Analyzer', desc: 'AI-powered resume feedback & scoring', color: 'from-indigo-500 to-violet-500' },
];

export default function LandingPage() {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) navigate('/dashboard');
  }, [isSignedIn]);

  return (
    <div className="min-h-screen bg-[#0a0a14] overflow-hidden relative">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-600/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">QuickAI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/pricing" className="text-white/60 hover:text-white transition-colors text-sm font-medium">
            Pricing
          </Link>
          <SignInButton mode="modal">
            <button className="btn-secondary text-sm px-4 py-2">Sign In</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="btn-primary text-sm px-4 py-2">Get Started</button>
          </SignUpButton>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center pt-24 pb-20 px-4 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-brand-600/20 border border-brand-500/30 text-brand-300 text-sm px-4 py-2 rounded-full mb-8 animate-fade-in">
          <Zap size={14} />
          <span>6 Powerful AI Tools in One Place</span>
        </div>

        <h1 className="font-display text-6xl md:text-7xl font-bold text-white mb-6 leading-tight animate-slide-up">
          Create Anything with
          <br />
          <span className="gradient-text">AI Superpowers</span>
        </h1>

        <p className="text-white/60 text-xl max-w-2xl mx-auto mb-10 font-body leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Generate articles, create images, remove backgrounds, analyze resumes — everything you need to work 10x faster.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <SignUpButton mode="modal">
            <button className="btn-primary text-base px-8 py-4">
              Start for Free <ArrowRight size={18} />
            </button>
          </SignUpButton>
          <Link to="/pricing" className="btn-secondary text-base px-8 py-4">
            View Pricing
          </Link>
        </div>

        <div className="flex items-center justify-center gap-6 mt-8 text-white/40 text-sm animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <span className="flex items-center gap-1.5"><Shield size={14} /> No credit card required</span>
          <span className="flex items-center gap-1.5"><Star size={14} /> 10 free credits</span>
          <span className="flex items-center gap-1.5"><Zap size={14} /> Instant access</span>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="text-center mb-14">
          <h2 className="font-display text-4xl font-bold text-white mb-4">Everything You Need</h2>
          <p className="text-white/50 text-lg">Six AI-powered tools ready to transform your workflow</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TOOLS.map((tool, i) => (
            <div
              key={tool.title}
              className="card-hover p-6 group cursor-pointer animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <tool.icon size={22} className="text-white" />
              </div>
              <h3 className="font-display font-semibold text-white text-lg mb-2 flex items-center gap-2">
                {tool.title}
                <ChevronRight size={16} className="text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">{tool.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24 text-center">
        <div className="card p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 to-purple-600/20" />
          <div className="relative z-10">
            <h2 className="font-display text-4xl font-bold text-white mb-4">Ready to get started?</h2>
            <p className="text-white/60 text-lg mb-8">Join thousands of creators using QuickAI every day.</p>
            <SignUpButton mode="modal">
              <button className="btn-primary text-base px-10 py-4">
                Create Free Account <ArrowRight size={18} />
              </button>
            </SignUpButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-white/30 text-sm">
        <p>© 2024 QuickAI. Built with React, Node.js & OpenAI.</p>
      </footer>
    </div>
  );
}
