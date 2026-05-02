import { useState, useRef } from 'react';
import { Eraser, Upload, Download, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';
import { setAuthToken } from '../../utils/api';
import { useUser } from '../../context/UserContext';
import { ToolHeader, CreditsAlert, LoadingSpinner, useUpgrade } from './ToolComponents';

export default function ObjectRemover() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [objectDescription, setObjectDescription] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [noCredits, setNoCredits] = useState(false);
  const fileInputRef = useRef(null);

  const { getToken } = useAuth();
  const { refreshUser } = useUser();
  const handleUpgrade = useUpgrade();

  const handleFile = (f) => {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) return toast.error('File must be under 10MB');
    setFile(f);
    setResult('');
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const removeObject = async () => {
    if (!file) return toast.error('Please select an image first');
    if (!objectDescription.trim()) return toast.error('Please describe the object to remove');
    setLoading(true);
    setNoCredits(false);
    try {
      const token = await getToken();
      setAuthToken(token);

      const formData = new FormData();
      formData.append('image', file);
      formData.append('objectDescription', objectDescription);

      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/remove-object`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'insufficient_credits') setNoCredits(true);
        else throw new Error(data.error || 'Failed to remove object');
        return;
      }

      setResult(data.image);
      refreshUser();
      toast.success('Object removed!');
    } catch (err) {
      toast.error(err.message || 'Failed to remove object');
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    const a = document.createElement('a');
    a.href = result;
    a.download = 'object-removed.png';
    a.click();
  };

  const reset = () => { setFile(null); setPreview(''); setResult(''); setObjectDescription(''); };

  return (
    <div className="animate-fade-in">
      <ToolHeader
        icon={Eraser}
        title="Object Remover"
        desc="Describe an object in your photo and AI will erase it cleanly"
        color="from-red-500 to-rose-500"
      />

      {noCredits && <div className="mb-6"><CreditsAlert onUpgrade={handleUpgrade} /></div>}

      <div className="space-y-4">
        {!file ? (
          <div
            onClick={() => fileInputRef.current.click()}
            className="card border-dashed border-2 border-white/20 hover:border-red-500/40 p-12 text-center cursor-pointer transition-all hover:bg-red-500/5 group"
          >
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Upload size={28} className="text-red-400" />
            </div>
            <h3 className="font-display font-semibold text-white mb-2">Drop your image here</h3>
            <p className="text-white/40 text-sm">PNG, JPG, WebP up to 10MB</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/60 text-sm">Original</p>
                <button onClick={reset} className="text-white/40 hover:text-white/70"><X size={15} /></button>
              </div>
              <img src={preview} alt="Original" className="w-full rounded-lg object-contain max-h-56" />
            </div>
            <div className="card p-4">
              <p className="text-white/60 text-sm mb-3">Result</p>
              {result ? (
                <img src={result} alt="Result" className="w-full rounded-lg object-contain max-h-56" />
              ) : (
                <div className="h-48 bg-white/5 rounded-lg flex items-center justify-center">
                  {loading ? <LoadingSpinner text="Processing..." /> : <p className="text-white/30 text-sm">Result here</p>}
                </div>
              )}
            </div>
          </div>
        )}

        {file && (
          <>
            <div className="card p-5">
              <label className="block text-white/70 text-sm font-medium mb-2">
                What do you want to remove? *
              </label>
              <input
                className="input-field"
                placeholder="e.g. the red car on the left, power lines in the sky..."
                value={objectDescription}
                onChange={(e) => setObjectDescription(e.target.value)}
              />
              <p className="text-white/30 text-xs mt-2">Be specific for best results</p>
            </div>

            <div className="flex gap-3">
              {!result ? (
                <button onClick={removeObject} disabled={loading || !objectDescription.trim()} className="btn-primary flex-1 justify-center py-3 bg-red-600 hover:bg-red-500">
                  {loading ? <LoadingSpinner text="Removing object..." /> : <><Eraser size={17} /> Remove Object</>}
                </button>
              ) : (
                <>
                  <button onClick={download} className="btn-primary flex-1 justify-center py-3 bg-red-600 hover:bg-red-500">
                    <Download size={17} /> Download
                  </button>
                  <button onClick={reset} className="btn-secondary px-4 py-3"><RefreshCw size={17} /> New</button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
