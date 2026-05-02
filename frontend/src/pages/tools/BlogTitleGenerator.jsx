import { useState } from 'react';
import { Hash, Copy, RefreshCw, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiCall } from '../../hooks/useApiCall';
import { useUser } from '../../context/UserContext';
import { ToolHeader, CreditsAlert, LoadingSpinner, OutputCard, useUpgrade } from './ToolComponents';

const CATEGORIES = ['General', 'Technology', 'Business', 'Health & Wellness', 'Finance', 'Marketing', 'Lifestyle', 'Travel', 'Food', 'Education'];

export default function BlogTitleGenerator() {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('General');
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noCredits, setNoCredits] = useState(false);
  const [copied, setCopied] = useState(null);

  const { callApi } = useApiCall();
  const { refreshUser } = useUser();
  const handleUpgrade = useUpgrade();

  const generate = async () => {
    if (!keyword.trim()) return toast.error('Please enter a keyword');
    setLoading(true);
    setNoCredits(false);
    try {
      const data = await callApi('post', '/api/generate-titles', { keyword, category, count: 5 });
      setTitles(data.titles);
      refreshUser();
      toast.success('Titles generated!');
    } catch (err) {
      if (err?.response?.data?.error === 'insufficient_credits') {
        setNoCredits(true);
      } else {
        toast.error(err?.response?.data?.error || 'Failed to generate titles');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyTitle = (title, idx) => {
    navigator.clipboard.writeText(title);
    setCopied(idx);
    toast.success('Title copied!');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="animate-fade-in">
      <ToolHeader
        icon={Hash}
        title="Blog Title Generator"
        desc="Generate 5 catchy, SEO-friendly blog title ideas from a keyword"
        color="from-purple-500 to-pink-500"
      />

      {noCredits && <div className="mb-6"><CreditsAlert onUpgrade={handleUpgrade} /></div>}

      <div className="card p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Keyword *</label>
            <input
              className="input-field"
              placeholder="e.g. remote work productivity"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generate()}
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    category === cat
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                      : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generate}
            disabled={loading || !keyword.trim()}
            className="btn-primary w-full justify-center py-3 bg-purple-600 hover:bg-purple-500"
            style={{ boxShadow: loading ? 'none' : '0 0 30px rgba(147,51,234,0.3)' }}
          >
            {loading ? <LoadingSpinner text="Generating titles..." /> : <><Sparkles size={17} /> Generate 5 Titles</>}
          </button>
        </div>
      </div>

      {titles.length > 0 && (
        <OutputCard>
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
            <h3 className="font-display font-semibold text-white">Generated Titles</h3>
            <button onClick={generate} disabled={loading} className="btn-secondary text-xs px-3 py-2">
              <RefreshCw size={13} /> Regenerate
            </button>
          </div>
          <div className="space-y-3">
            {titles.map((title, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-4 p-4 bg-white/5 rounded-xl group hover:bg-white/8 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="text-purple-400/60 font-mono text-sm mt-0.5 flex-shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-white/90 text-sm leading-relaxed">{title}</p>
                </div>
                <button
                  onClick={() => copyTitle(title, i)}
                  className="flex-shrink-0 p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"
                >
                  <Copy size={14} className={copied === i ? 'text-green-400' : ''} />
                </button>
              </div>
            ))}
          </div>
        </OutputCard>
      )}
    </div>
  );
}
