import { useState } from 'react';
import { Image, Download, RefreshCw, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiCall } from '../../hooks/useApiCall';
import { useUser } from '../../context/UserContext';
import { ToolHeader, CreditsAlert, LoadingSpinner, useUpgrade } from './ToolComponents';

const SIZES = ['1024x1024', '1792x1024', '1024x1792'];
const STYLES = ['vivid', 'natural'];
const EXAMPLE_PROMPTS = [
  'A futuristic city skyline at sunset, cinematic lighting',
  'A cozy coffee shop in autumn, oil painting style',
  'An astronaut surfing on Saturn\'s rings, photorealistic',
  'A magical forest with glowing mushrooms, fantasy art',
];

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('1024x1024');
  const [style, setStyle] = useState('vivid');
  const [imageUrl, setImageUrl] = useState('');
  const [revisedPrompt, setRevisedPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [noCredits, setNoCredits] = useState(false);

  const { callApi } = useApiCall();
  const { refreshUser } = useUser();
  const handleUpgrade = useUpgrade();

  const generate = async () => {
    if (!prompt.trim()) return toast.error('Please enter an image prompt');
    setLoading(true);
    setNoCredits(false);
    setImageUrl('');
    try {
      const data = await callApi('post', '/api/generate-image', { prompt, size, style });
      setImageUrl(data.imageUrl);
      setRevisedPrompt(data.revisedPrompt || '');
      refreshUser();
      toast.success('Image generated!');
    } catch (err) {
      if (err?.response?.data?.error === 'insufficient_credits') {
        setNoCredits(true);
      } else {
        toast.error(err?.response?.data?.error || 'Failed to generate image');
      }
    } finally {
      setLoading(false);
    }
  };

  const download = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quickai-image.png';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download image');
    }
  };

  return (
    <div className="animate-fade-in">
      <ToolHeader
        icon={Image}
        title="Image Generator"
        desc="Create stunning AI images with DALL-E 3 from a text description"
        color="from-orange-500 to-amber-500"
      />

      {noCredits && <div className="mb-6"><CreditsAlert onUpgrade={handleUpgrade} /></div>}

      <div className="card p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Image Prompt *</label>
            <textarea
              className="input-field resize-none h-24"
              placeholder="Describe the image you want to create..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="mt-2">
              <p className="text-white/30 text-xs mb-2">Example prompts:</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPrompt(p)}
                    className="text-xs bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 px-2 py-1 rounded-lg border border-white/10 transition-all text-left"
                  >
                    {p.slice(0, 40)}...
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Size</label>
              <div className="space-y-2">
                {SIZES.map((s) => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="size"
                      value={s}
                      checked={size === s}
                      onChange={() => setSize(s)}
                      className="accent-orange-500"
                    />
                    <span className="text-white/70 text-sm">
                      {s === '1024x1024' ? '1:1 Square' : s === '1792x1024' ? '16:9 Landscape' : '9:16 Portrait'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Style</label>
              {STYLES.map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="radio"
                    name="style"
                    value={s}
                    checked={style === s}
                    onChange={() => setStyle(s)}
                    className="accent-orange-500"
                  />
                  <span className="text-white/70 text-sm capitalize">{s}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={generate}
            disabled={loading || !prompt.trim()}
            className="btn-primary w-full justify-center py-3 bg-orange-600 hover:bg-orange-500"
            style={{ boxShadow: loading ? 'none' : '0 0 30px rgba(234,88,12,0.3)' }}
          >
            {loading ? <LoadingSpinner text="Creating image... (this may take ~20 seconds)" /> : <><Sparkles size={17} /> Generate Image</>}
          </button>
        </div>
      </div>

      {loading && (
        <div className="card p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-white/60 text-sm">DALL-E 3 is creating your image...</p>
          </div>
        </div>
      )}

      {imageUrl && !loading && (
        <div className="card p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-white">Generated Image</h3>
            <div className="flex gap-2">
              <button onClick={download} className="btn-secondary text-xs px-3 py-2">
                <Download size={13} /> Download
              </button>
              <button onClick={generate} disabled={loading} className="btn-secondary text-xs px-3 py-2">
                <RefreshCw size={13} /> Regenerate
              </button>
            </div>
          </div>
          <img src={imageUrl} alt="AI Generated" className="w-full rounded-xl" />
          {revisedPrompt && (
            <div className="mt-4 p-3 bg-white/5 rounded-lg">
              <p className="text-white/40 text-xs mb-1">Revised prompt by DALL-E:</p>
              <p className="text-white/60 text-xs">{revisedPrompt}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
