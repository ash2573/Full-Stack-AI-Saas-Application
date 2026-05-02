import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import { UserProvider } from './context/UserContext';

// Pages
import LandingPage from './pages/LandingPage';
import DashboardLayout from './pages/DashboardLayout';
import ArticleGenerator from './pages/tools/ArticleGenerator';
import BlogTitleGenerator from './pages/tools/BlogTitleGenerator';
import ImageGenerator from './pages/tools/ImageGenerator';
import BackgroundRemover from './pages/tools/BackgroundRemover';
import ObjectRemover from './pages/tools/ObjectRemover';
import ResumeAnalyzer from './pages/tools/ResumeAnalyzer';
import PricingPage from './pages/PricingPage';
import DashboardHome from './pages/DashboardHome';

const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a14]">
      <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!isSignedIn) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a2e',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontFamily: 'DM Sans, sans-serif',
            },
            success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="article-generator" element={<ArticleGenerator />} />
            <Route path="blog-titles" element={<BlogTitleGenerator />} />
            <Route path="image-generator" element={<ImageGenerator />} />
            <Route path="background-remover" element={<BackgroundRemover />} />
            <Route path="object-remover" element={<ObjectRemover />} />
            <Route path="resume-analyzer" element={<ResumeAnalyzer />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </UserProvider>
    </BrowserRouter>
  );
}
