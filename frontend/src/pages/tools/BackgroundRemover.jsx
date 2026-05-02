import { useState, useRef } from 'react';
import { Scissors, Upload, Download, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';
import { setAuthToken } from '../../utils/api';
import { useUser } from '../../context/UserContext';
import { ToolHeader, CreditsAlert, LoadingSpinner, useUpgrade } from './ToolComponents';

export default function BackgroundRemover() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
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

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) handleFile(f);
  };

  const removeBackground = async () => {
    if (!file) return toast.error('Please select an image first');
    setLoading(true);
    setNoCredits(false);
    try {
      const token = await getToken();
      setAuthToken(token);

      const formData = new FormData();
      formData.append('image', file);

      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/remove-background`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'insufficient_credits') {
          setNoCredits(true);
        } else {
          throw new Error(data.error || 'Failed to remove background');
        }
        return;
      }

      setResult(data.image);
      refreshUser();
      toast.success('Background removed!');
    } catch (err) {
      toast.error(err.message || 'Failed to remove background');
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    const a = document.createElement('a');
    a.href = result;
    a.download = 'background-removed.png';
    a.click();
  };

  const reset = () => {
    setFile(null);
    setPreview('');
    setResult('');
  };

  return (
    <div className="animate-fade-in">
      <ToolHeader
        icon={Scissors}
        title="Background Remover"
        desc="Remove backgrounds from images instantly using AI"
        color="from-green-500 to-emerald-500"
      />

      {noCredits && <div className="mb-6"><CreditsAlert onUpgrade={handleUpgrade} /></div>}

      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current.click()}
          className="card border-dashed border-2 border-white/20 hover:border-green-500/40 p-12 text-center cursor-pointer transition-all hover:bg-green-500/5 group"
        >
          <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Upload size={28} className="text-green-400" />
          </div>
          <h3 className="font-display font-semibold text-white mb-2">Drop your image here</h3>
          <p className="text-white/40 text-sm">or click to browse · PNG, JPG, WebP up to 10MB</p>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/60 text-sm font-medium">Original</p>
                <button onClick={reset} className="text-white/40 hover:text-white/70 transition-colors">
                  <X size={15} />
                </button>
              </div>
              <img src={preview} alt="Original" className="w-full rounded-lg object-contain max-h-64" />
              <p className="text-white/30 text-xs mt-2 truncate">{file.name}</p>
            </div>

            <div className="card p-4">
              <p className="text-white/60 text-sm font-medium mb-3">Result</p>
              {result ? (
                <>
                  <div className="rounded-lg overflow-hidden" style={{ background: 'repeating-conic-gradient(#333 0% 25%, #222 0% 50%) 0 0 / 16px 16px' }}>
                    <img src={result} alt="Result" className="w-full object-contain max-h-64" />
                  </div>
                </>
              ) : (
                <div className="h-48 bg-white/5 rounded-lg flex items-center justify-center">
                  {loading ? (
                    <LoadingSpinner text="Removing background..." />
                  ) : (
                    <p className="text-white/30 text-sm">Result will appear here</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            {!result ? (
              <button onClick={removeBackground} disabled={loading} className="btn-primary flex-1 justify-center py-3 bg-green-600 hover:bg-green-500">
                {loading ? <LoadingSpinner text="Removing background..." /> : <><Scissors size={17} /> Remove Background</>}
              </button>
            ) : (
              <>
                <button onClick={download} className="btn-primary flex-1 justify-center py-3 bg-green-600 hover:bg-green-500">
                  <Download size={17} /> Download PNG
                </button>
                <button onClick={reset} className="btn-secondary px-4 py-3">
                  <RefreshCw size={17} /> New Image
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
