import { useState } from 'react';
import { FileText, Copy, Download, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { useApiCall } from '../../hooks/useApiCall';
import { useUser } from '../../context/UserContext';
import { ToolHeader, CreditsAlert, LoadingSpinner, OutputCard, useUpgrade } from './ToolComponents';

const TONES = ['professional', 'casual', 'academic', 'conversational', 'persuasive'];

export default function ArticleGenerator() {
  const [title, setTitle] = useState('');
  const [wordCount, setWordCount] = useState(500);
  const [tone, setTone] = useState('professional');
  const [article, setArticle] = useState('');
  const [loading, setLoading] = useState(false);
  const [noCredits, setNoCredits] = useState(false);

  const { callApi } = useApiCall();
  const { refreshUser } = useUser();
  const handleUpgrade = useUpgrade();

  const generate = async () => {
    if (!title.trim()) return toast.error('Please enter an article title');
    setLoading(true);
    setNoCredits(false);
    try {
      const data = await callApi('post', '/api/generate-article', { title, wordCount, tone });
      setArticle(data.article);
      refreshUser();
      toast.success('Article generated!');
    } catch (err) {
      if (err?.response?.data?.error === 'insufficient_credits') {
        setNoCredits(true);
      } else {
        toast.error(err?.response?.data?.error || 'Failed to generate article');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(article);
    toast.success('Copied to clipboard!');
  };

  const downloadText = () => {
    const blob = new Blob([article], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.slice(0, 30).replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in">
      <ToolHeader
        icon={FileText}
        title="Article Generator"
        desc="Generate a full, well-structured article from a title in seconds"
        color="from-blue-500 to-cyan-500"
      />

      {noCredits && <div className="mb-6"><CreditsAlert onUpgrade={handleUpgrade} /></div>}

      <div className="card p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Article Title *</label>
            <input
              className="input-field"
              placeholder="e.g. The Future of Artificial Intelligence in Healthcare"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generate()}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Word Count: <span className="text-brand-400">{wordCount}</span>
              </label>
              <input
                type="range"
                min="100"
                max="3000"
                step="100"
                value={wordCount}
                onChange={(e) => setWordCount(Number(e.target.value))}
                className="w-full accent-brand-500"
              />
              <div className="flex justify-between text-white/30 text-xs mt-1">
                <span>100</span>
                <span>3000</span>
              </div>
            </div>

            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Tone</label>
              <select
                className="input-field"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                {TONES.map((t) => (
                  <option key={t} value={t} className="bg-surface-50 capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={generate}
            disabled={loading || !title.trim()}
            className="btn-primary w-full justify-center py-3"
          >
            {loading ? <LoadingSpinner text="Writing article..." /> : <><FileText size={17} /> Generate Article</>}
          </button>
        </div>
      </div>

      {article && (
        <OutputCard>
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
            <h3 className="font-display font-semibold text-white">Generated Article</h3>
            <div className="flex gap-2">
              <button onClick={copyText} className="btn-secondary text-xs px-3 py-2">
                <Copy size={13} /> Copy
              </button>
              <button onClick={downloadText} className="btn-secondary text-xs px-3 py-2">
                <Download size={13} /> Download
              </button>
              <button onClick={generate} disabled={loading} className="btn-secondary text-xs px-3 py-2">
                <RefreshCw size={13} /> Regenerate
              </button>
            </div>
          </div>
          <div className="ai-output max-h-[600px] overflow-y-auto pr-2">
            <ReactMarkdown>{article}</ReactMarkdown>
          </div>
        </OutputCard>
      )}
    </div>
  );
}
