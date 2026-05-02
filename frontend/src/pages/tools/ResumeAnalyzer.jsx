import { useState, useRef } from 'react';
import { FileSearch, Upload, RefreshCw, X, CheckCircle, AlertCircle, Target, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';
import { setAuthToken } from '../../utils/api';
import { useUser } from '../../context/UserContext';
import { ToolHeader, CreditsAlert, LoadingSpinner, useUpgrade } from './ToolComponents';

const ScoreRing = ({ score, label }) => {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto mb-2">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="15.9" fill="none"
            stroke={color} strokeWidth="3"
            strokeDasharray={`${score} 100`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-white font-display font-bold text-lg">
          {score}
        </span>
      </div>
      <p className="text-white/50 text-xs">{label}</p>
    </div>
  );
};

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [noCredits, setNoCredits] = useState(false);
  const fileInputRef = useRef(null);

  const { getToken } = useAuth();
  const { refreshUser } = useUser();
  const handleUpgrade = useUpgrade();

  const handleFile = (f) => {
    if (!f || f.type !== 'application/pdf') return toast.error('Please upload a PDF file');
    if (f.size > 5 * 1024 * 1024) return toast.error('File must be under 5MB');
    setFile(f);
    setAnalysis(null);
  };

  const analyze = async () => {
    if (!file) return toast.error('Please upload your resume PDF');
    setLoading(true);
    setNoCredits(false);
    try {
      const token = await getToken();
      setAuthToken(token);

      const formData = new FormData();
      formData.append('resume', file);

      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/analyze-resume`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'insufficient_credits') setNoCredits(true);
        else throw new Error(data.error || 'Failed to analyze resume');
        return;
      }

      setAnalysis(data.analysis);
      refreshUser();
      toast.success('Resume analyzed!');
    } catch (err) {
      toast.error(err.message || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  const atsColor = analysis?.atsCompatibility === 'High' ? 'text-green-400' : analysis?.atsCompatibility === 'Medium' ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="animate-fade-in">
      <ToolHeader
        icon={FileSearch}
        title="Resume Analyzer"
        desc="Upload your PDF resume and get detailed AI-powered feedback & scoring"
        color="from-indigo-500 to-violet-500"
      />

      {noCredits && <div className="mb-6"><CreditsAlert onUpgrade={handleUpgrade} /></div>}

      <div className="card p-6 mb-6">
        {!file ? (
          <div
            onClick={() => fileInputRef.current.click()}
            className="border-dashed border-2 border-white/20 hover:border-indigo-500/40 rounded-xl p-10 text-center cursor-pointer transition-all hover:bg-indigo-500/5 group"
          >
            <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Upload size={24} className="text-indigo-400" />
            </div>
            <h3 className="font-display font-semibold text-white mb-1">Upload Resume PDF</h3>
            <p className="text-white/40 text-sm">Click to browse · PDF only, max 5MB</p>
            <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <FileSearch size={18} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">{file.name}</p>
                <p className="text-white/40 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button onClick={() => { setFile(null); setAnalysis(null); }} className="text-white/40 hover:text-white/70">
              <X size={16} />
            </button>
          </div>
        )}

        {file && (
          <button
            onClick={analyze}
            disabled={loading}
            className="btn-primary w-full justify-center py-3 mt-4 bg-indigo-600 hover:bg-indigo-500"
            style={{ boxShadow: loading ? 'none' : '0 0 30px rgba(99,102,241,0.3)' }}
          >
            {loading ? <LoadingSpinner text="Analyzing resume... (may take ~30 seconds)" /> : <><FileSearch size={17} /> Analyze Resume</>}
          </button>
        )}
      </div>

      {analysis && (
        <div className="space-y-4 animate-fade-in">
          {/* Score overview */}
          <div className="card p-6">
            <h3 className="font-display font-semibold text-white mb-6">Overall Score</h3>
            <div className="flex items-center justify-around flex-wrap gap-4">
              <ScoreRing score={analysis.overallScore} label="Overall" />
              {analysis.sectionScores && Object.entries(analysis.sectionScores).map(([key, val]) => (
                <ScoreRing key={key} score={val} label={key.charAt(0).toUpperCase() + key.slice(1)} />
              ))}
            </div>
            <div className="mt-4 p-3 bg-white/5 rounded-lg">
              <p className="text-white/70 text-sm leading-relaxed">{analysis.summary}</p>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-white/40 text-xs">ATS Compatibility:</span>
              <span className={`font-medium text-sm ${atsColor}`}>{analysis.atsCompatibility}</span>
              {analysis.atsNotes && <span className="text-white/40 text-xs">— {analysis.atsNotes}</span>}
            </div>
          </div>

          {/* Strengths */}
          {analysis.strengths?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle size={16} className="text-green-400" /> Strengths
              </h3>
              <ul className="space-y-2">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {analysis.weaknesses?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                <AlertCircle size={16} className="text-yellow-400" /> Areas to Improve
              </h3>
              <ul className="space-y-2">
                {analysis.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="text-yellow-400 mt-0.5 flex-shrink-0">!</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {analysis.suggestions?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                <Target size={16} className="text-brand-400" /> Actionable Suggestions
              </h3>
              <ul className="space-y-2">
                {analysis.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="text-brand-400 flex-shrink-0 mt-0.5 font-mono text-xs">{String(i+1).padStart(2,'0')}</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Keywords */}
          {(analysis.keywordsFound?.length > 0 || analysis.missingKeywords?.length > 0) && (
            <div className="card p-6">
              <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                <Award size={16} className="text-purple-400" /> Keywords Analysis
              </h3>
              {analysis.keywordsFound?.length > 0 && (
                <div className="mb-3">
                  <p className="text-white/40 text-xs mb-2">Found in resume:</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywordsFound.map((k) => (
                      <span key={k} className="px-2 py-1 bg-green-500/15 text-green-300 text-xs rounded-lg border border-green-500/20">{k}</span>
                    ))}
                  </div>
                </div>
              )}
              {analysis.missingKeywords?.length > 0 && (
                <div>
                  <p className="text-white/40 text-xs mb-2">Consider adding:</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingKeywords.map((k) => (
                      <span key={k} className="px-2 py-1 bg-red-500/15 text-red-300 text-xs rounded-lg border border-red-500/20">{k}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <button onClick={() => { setFile(null); setAnalysis(null); }} className="btn-secondary w-full justify-center">
            <RefreshCw size={16} /> Analyze Another Resume
          </button>
        </div>
      )}
    </div>
  );
}
