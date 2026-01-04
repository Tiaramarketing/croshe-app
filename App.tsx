
import React, { useState, useCallback, useEffect } from 'react';
import { AppState, AppStep, SkillLevel, BuildPreference, DollSize, UserPreferences } from './types';
import { GeminiService } from './geminiService';
import { fileToBase64 } from './utils';

const USAGE_LIMIT = 10;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const SHARE_URL = "https://mrskathyking.com";
const SHARE_HASHTAGS = "#mrskathyking #poweredbytiaramarketing";
const SHARE_CAPTION = `Look at my custom crochet doll! 🧶 Created with Croshé by MrsKathyKing. ${SHARE_HASHTAGS}`;

// --- Share Modal Component ---
interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, imageUrl }) => {
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageShare = async (platformName: string) => {
    if (!imageUrl) return;
    
    // 1. Download Image
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `croshe-by-mrskathyking-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 2. Copy Caption
    try {
      await navigator.clipboard.writeText(SHARE_CAPTION);
      setStatusMsg(`Image saved & Tags copied! Open ${platformName} to post.`);
    } catch (err) {
      setStatusMsg(`Image saved! (Could not copy tags)`);
    }
    
    setTimeout(() => setStatusMsg(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-24 bg-black/50 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h3 className="text-2xl font-black text-slate-800 mb-6 text-center">Share Your Pattern</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {/* Facebook */}
          <button onClick={() => handleImageShare("Facebook")} className="flex items-center justify-center space-x-2 bg-[#1877F2] text-white py-3 px-4 rounded-xl font-bold hover:opacity-90 transition">
             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
             <span>Facebook</span>
          </button>

          {/* LinkedIn */}
          <button onClick={() => handleImageShare("LinkedIn")} className="flex items-center justify-center space-x-2 bg-[#0A66C2] text-white py-3 px-4 rounded-xl font-bold hover:opacity-90 transition">
             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
             <span>LinkedIn</span>
          </button>

          {/* Instagram */}
          <button onClick={() => handleImageShare("Instagram")} className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white py-3 px-4 rounded-xl font-bold hover:opacity-90 transition">
             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
             <span>Instagram</span>
          </button>

          {/* Lemon8 */}
          <button onClick={() => handleImageShare("Lemon8")} className="flex items-center justify-center space-x-2 bg-[#FAEA05] text-black py-3 px-4 rounded-xl font-bold hover:opacity-90 transition">
             <span className="font-bold text-lg leading-none">L8</span>
             <span>Lemon8</span>
          </button>
        </div>
        
        {statusMsg && (
           <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl text-center text-sm font-bold animate-pulse">
             {statusMsg}
           </div>
        )}
      </div>
    </div>
  );
};


// Components
const WelcomeScreen: React.FC<{ 
  onNext: () => void, 
  hasKey: boolean, 
  onSelectKey: () => void,
  usesLeft: number
}> = ({ onNext, hasKey, onSelectKey, usesLeft }) => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 space-y-8 animate-fadeIn">
    <img 
      src="https://storage.googleapis.com/msgsndr/CGAvJRfxMUlcxHcYl6fo/media/6957508ec902bfc321e57ff7.png" 
      alt="Croshé Logo" 
      className="w-[150px] h-auto mx-auto"
    />
    <div className="max-w-2xl space-y-4">
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight leading-tight">
        Croshé by MrsKathyKing
        <span className="block text-2xl md:text-3xl font-bold text-pink-500 mt-2">AI Crochet Doll & Pattern Creator</span>
      </h1>
      <p className="text-xl text-slate-600 font-handwriting max-w-lg mx-auto">
        Transform your photos into adorable crochet dolls with Croshé by MrsKathyKing! Our AI instantly generates a unique Amigurumi pattern just for you.
      </p>
      <div className="pt-2">
        <span className="inline-block px-4 py-1 bg-slate-100 rounded-full text-slate-500 text-sm font-bold">
          Uses left: {usesLeft}/{USAGE_LIMIT}
        </span>
      </div>
    </div>
    
    {!hasKey ? (
      <div className="space-y-4">
        <p className="text-sm text-slate-500 max-w-xs">To use high-quality image generation, please connect your Google AI Studio API key (Paid Project required).</p>
        <button 
          onClick={onSelectKey}
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-lg shadow-xl transform transition hover:scale-105 active:scale-95 flex items-center space-x-2"
        >
          <span>Connect API Key</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
        </button>
        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="block text-xs text-indigo-500 hover:underline">Learn about billing and keys</a>
      </div>
    ) : (
      <button 
        onClick={onNext}
        className="px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-bold text-lg shadow-xl transform transition hover:scale-105 active:scale-95"
      >
        Let's Get Hooked!
      </button>
    )}
  </div>
);

const StepIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => {
  const steps = ['Photo', 'Preview', 'Questions', 'Pattern'];
  return (
    <div className="flex justify-between w-full max-w-md mx-auto mb-10">
      {steps.map((label, i) => (
        <div key={label} className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${
            i <= currentStep ? 'bg-pink-500 text-white' : 'bg-slate-200 text-slate-400'
          }`}>
            {i + 1}
          </div>
          <span className={`text-xs font-semibold ${i <= currentStep ? 'text-pink-600' : 'text-slate-400'}`}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function App() {
  const [state, setState] = useState<AppState>({
    step: 'welcome',
    originalImage: null,
    generatedPlushieUrl: null,
    preferences: null,
    finalPattern: null,
    error: null,
  });

  const [hasKey, setHasKey] = useState<boolean>(false);
  const [usageCount, setUsageCount] = useState<number>(0);

  useEffect(() => {
    updateUsageCount();
  }, []);

  const updateUsageCount = () => {
    const history = JSON.parse(localStorage.getItem('usageHistory') || '[]');
    const now = Date.now();
    const recent = history.filter((ts: number) => now - ts < THIRTY_DAYS_MS);
    localStorage.setItem('usageHistory', JSON.stringify(recent));
    setUsageCount(recent.length);
    return recent.length;
  };

  const recordGeneration = () => {
    const history = JSON.parse(localStorage.getItem('usageHistory') || '[]');
    history.push(Date.now());
    localStorage.setItem('usageHistory', JSON.stringify(history));
    setUsageCount(history.length);
  };

  const checkLimit = () => {
    const currentCount = updateUsageCount();
    if (currentCount >= USAGE_LIMIT) {
      alert("You have reached your limit of 10 free patterns for this month. Please check back later!");
      return false;
    }
    return true;
  };

 useEffect(() => {
  const checkKey = async () => {
    try {
      if (
        typeof window !== "undefined" &&
        // @ts-ignore
        window.aistudio &&
        // @ts-ignore
        typeof window.aistudio.hasSelectedApiKey === "function"
      ) {
        // @ts-ignore
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(Boolean(selected));
      } else {
        // IMPORTANT: default safely on Render
        setHasKey(false);
      }
    } catch (e) {
      console.error("Error checking key selection:", e);
      setHasKey(false);
    }
  };

  checkKey();
}, []);

const handleSelectKey = async () => {
  try {
    if (
      typeof window !== "undefined" &&
      // @ts-ignore
      window.aistudio &&
      // @ts-ignore
      typeof window.aistudio.openSelectKey === "function"
    ) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasKey(true);
    } else {
      alert(
        "API key selector is not available in this environment. Please run this app inside Google AI Studio."
      );
    }
  } catch (e) {
    console.error("Error opening key selection:", e);
    setHasKey(false);
  }
};

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!checkLimit()) return;

    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      setState(prev => ({ ...prev, originalImage: base64, step: 'generating_plushie', error: null }));
      
      const plushieUrl = await GeminiService.generatePlushiePreview(base64);
      setState(prev => ({ ...prev, generatedPlushieUrl: plushieUrl, step: 'preview_plushie' }));
    } catch (err: any) {
      console.error(err);
      let errorMsg = err.message || "An error occurred";
      
      if (errorMsg.includes("403") || errorMsg.toLowerCase().includes("permission denied") || errorMsg.includes("Requested entity was not found")) {
        setHasKey(false);
        errorMsg = "API Permission Denied. Please ensure you have selected a valid API key from a paid GCP project.";
      }
      
      setState(prev => ({ ...prev, error: errorMsg, step: 'upload' }));
    }
  };

  const handlePreferencesSubmit = async (prefs: UserPreferences) => {
    if (!checkLimit()) return;

    setState(prev => ({ ...prev, preferences: prefs, step: 'generating_pattern', error: null }));
    try {
      if (!state.originalImage || !state.generatedPlushieUrl) throw new Error("Missing visual references");
      
      const plushieBase64 = state.generatedPlushieUrl.split(',')[1];
      const pattern = await GeminiService.generatePattern(state.originalImage, plushieBase64, prefs);
      
      recordGeneration();
      setState(prev => ({ ...prev, finalPattern: pattern, step: 'result' }));
    } catch (err: any) {
      console.error(err);
      let errorMsg = err.message || "An error occurred";
      if (errorMsg.includes("403") || errorMsg.toLowerCase().includes("permission denied")) {
        setHasKey(false);
      }
      setState(prev => ({ ...prev, error: errorMsg, step: 'questions' }));
    }
  };

  const renderContent = () => {
    switch (state.step) {
      case 'welcome':
        return <WelcomeScreen 
          hasKey={hasKey} 
          onSelectKey={handleSelectKey} 
          onNext={() => setState(p => ({ ...p, step: 'upload' }))} 
          usesLeft={Math.max(0, USAGE_LIMIT - usageCount)}
        />;
      
      case 'upload':
        return (
          <div className="max-w-md mx-auto text-center space-y-6 animate-fadeIn">
            <StepIndicator currentStep={0} />
            <div className="bg-white p-10 rounded-3xl shadow-2xl border-2 border-dashed border-pink-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Step 1: Upload Your Photo</h2>
              <p className="text-slate-500 mb-8 font-handwriting">A clear front-facing photo works best!</p>
              <label className="block w-full cursor-pointer">
                <div className="bg-pink-50 text-pink-500 py-8 rounded-2xl flex flex-col items-center hover:bg-pink-100 transition-colors">
                  <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  <span className="font-bold">Choose File</span>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </label>
            </div>
            {state.error && (
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <p className="text-red-600 font-medium text-sm">{state.error}</p>
                {!hasKey && (
                  <button onClick={handleSelectKey} className="mt-2 text-red-700 font-bold underline text-sm">
                    Reconnect API Key
                  </button>
                )}
              </div>
            )}
          </div>
        );

      case 'generating_plushie':
        return (
          <div className="flex flex-col items-center justify-center space-y-6 animate-pulse p-10">
            <div className="w-24 h-24 border-8 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
            <h2 className="text-2xl font-bold text-slate-800">Knitting your 3D preview...</h2>
            <p className="text-slate-500 text-center font-handwriting">Our pattern makers are analyzing your features. This usually takes a few seconds.</p>
          </div>
        );

      case 'preview_plushie':
        return (
          <div className="max-w-xl mx-auto space-y-8 animate-fadeIn text-center">
            <StepIndicator currentStep={1} />
            <h2 className="text-3xl font-bold text-slate-800">Your Plushie Avatar!</h2>
            <div className="relative group">
              <img 
                src={state.generatedPlushieUrl!} 
                alt="Plushie Preview" 
                className="w-full rounded-3xl shadow-2xl border-4 border-white"
              />
              <div className="absolute inset-0 rounded-3xl ring-4 ring-pink-500 ring-opacity-20 pointer-events-none"></div>
            </div>
            <p className="font-bold text-[#008000] text-[24px]">Right-click on image to save it</p>
            <button 
              onClick={() => setState(p => ({ ...p, step: 'questions' }))}
              className="w-full py-4 bg-pink-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-pink-600 transition"
            >
              Next: Customize My Pattern
            </button>
          </div>
        );

      case 'questions':
        return (
          <div className="space-y-6">
            <Questionnaire onSubmit={handlePreferencesSubmit} currentStep={2} />
            {state.error && <p className="text-red-500 font-medium text-center">{state.error}</p>}
          </div>
        );

      case 'generating_pattern':
        return (
          <div className="flex flex-col items-center justify-center space-y-6 animate-pulse p-10">
             <div className="relative">
                <div className="w-32 h-32 bg-pink-100 rounded-full flex items-center justify-center">
                   <svg className="w-16 h-16 text-pink-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                </div>
             </div>
            <h2 className="text-2xl font-bold text-slate-800">Writing your custom pattern...</h2>
            <div className="max-w-xs text-slate-500 text-center space-y-2">
              <p>Calculating stitch counts...</p>
              <p>Drafting assembly instructions...</p>
              <p>Tailoring to your skill level...</p>
            </div>
          </div>
        );

      case 'result':
        return <ResultView state={state} onReset={() => setState({
          step: 'welcome',
          originalImage: null,
          generatedPlushieUrl: null,
          preferences: null,
          finalPattern: null,
          error: null,
        })} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <header className="max-w-4xl mx-auto mb-12 flex items-center justify-end">
        {state.step !== 'welcome' && (
           <button 
            onClick={() => window.location.reload()}
            className="text-slate-400 hover:text-slate-600 font-medium flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            <span>Start Over</span>
          </button>
        )}
      </header>
      
      <main className="max-w-4xl mx-auto bg-white/40 backdrop-blur-sm rounded-[3rem] p-4 sm:p-10 shadow-sm min-h-[60vh]">
        {renderContent()}
      </main>

      <footer className="max-w-4xl mx-auto mt-12 text-center text-slate-400 text-sm font-handwriting">
        Croshé by MrsKathyKing - AI Crochet Doll & Pattern Creator is provided by www.mrskathyking.com
      </footer>
    </div>
  );
}

// Sub-components
interface QuestionnaireProps {
  onSubmit: (prefs: UserPreferences) => void;
  currentStep: number;
}

const Questionnaire: React.FC<QuestionnaireProps> = ({ onSubmit, currentStep }) => {
  const [skill, setSkill] = useState<SkillLevel | null>(null);
  const [build, setBuild] = useState<BuildPreference | null>(null);
  const [size, setSize] = useState<DollSize | null>(null);

  const handleSubmit = () => {
    if (skill && build && size) {
      onSubmit({ skillLevel: skill, buildPreference: build, dollSize: size });
    }
  };

  const isComplete = skill && build && size;

  const OptionButton: React.FC<{ 
    label: string, 
    isSelected: boolean, 
    onClick: () => void 
  }> = ({ label, isSelected, onClick }) => (
    <button
      onClick={onClick}
      className={`group relative p-5 rounded-2xl text-left border-2 transition-all duration-200 transform hover:translate-x-1 ${
        isSelected 
          ? 'bg-pink-50 border-pink-500 ring-2 ring-pink-500 ring-opacity-20 shadow-lg scale-[1.02]' 
          : 'bg-white border-slate-100 hover:border-pink-200 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`font-bold text-lg ${isSelected ? 'text-pink-700' : 'text-slate-700'}`}>
          {label}
        </span>
        {isSelected && (
          <div className="bg-pink-500 rounded-full p-1 animate-scaleIn">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
    </button>
  );

  return (
    <div className="space-y-12 animate-fadeIn py-4">
      <StepIndicator currentStep={currentStep} />
      
      <div className="space-y-10">
        <div className="space-y-4">
          <h3 className="text-2xl font-black text-slate-800 flex items-center">
            <span className="bg-pink-100 text-pink-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3">1</span>
            What is your crochet skill level?
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {Object.values(SkillLevel).map(val => (
              <OptionButton 
                key={val} 
                label={val} 
                isSelected={skill === val} 
                onClick={() => setSkill(val)} 
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-black text-slate-800 flex items-center">
            <span className="bg-pink-100 text-pink-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3">2</span>
            How do you prefer to build your doll?
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {Object.values(BuildPreference).map(val => (
              <OptionButton 
                key={val} 
                label={val} 
                isSelected={build === val} 
                onClick={() => setBuild(val)} 
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-black text-slate-800 flex items-center">
            <span className="bg-pink-100 text-pink-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3">3</span>
            What is your preferred doll size?
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {Object.values(DollSize).map(val => (
              <OptionButton 
                key={val} 
                label={val} 
                isSelected={size === val} 
                onClick={() => setSize(val)} 
              />
            ))}
          </div>
        </div>
      </div>

      <button 
        disabled={!isComplete}
        onClick={handleSubmit}
        className={`w-full py-6 rounded-[2rem] font-black text-2xl transition-all shadow-xl active:scale-95 ${
          isComplete 
            ? 'bg-pink-500 text-white hover:bg-pink-600 hover:shadow-pink-200' 
            : 'bg-slate-100 text-slate-300 cursor-not-allowed opacity-50'
        }`}
      >
        {isComplete ? 'Generate My Custom Pattern' : 'Please finish the questions!'}
      </button>
    </div>
  );
};

const ResultView: React.FC<{ state: AppState, onReset: () => void }> = ({ state, onReset }) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <div className="space-y-10 animate-fadeIn relative">
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        imageUrl={state.generatedPlushieUrl}
      />

      <div className="flex flex-col md:flex-row gap-10">
        <div className="md:w-1/3 space-y-6">
          <div className="bg-white p-4 rounded-3xl shadow-lg border border-pink-50">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Your Custom Croshé</h4>
            <img src={state.generatedPlushieUrl!} className="w-full rounded-2xl" alt="Finished Avatar" />
          </div>
          <div className="bg-pink-500 p-6 rounded-3xl text-white shadow-lg space-y-4">
            <h4 className="font-bold flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Pattern Stats
            </h4>
            <div className="text-sm space-y-2 opacity-90">
              <p>Difficulty: <span className="font-bold">{state.preferences?.skillLevel.split(' (')[0]}</span></p>
              <p>Type: <span className="font-bold">{state.preferences?.buildPreference.split(' (')[0]}</span></p>
              <p>Size: <span className="font-bold">{state.preferences?.dollSize.split(' (')[0]}</span></p>
            </div>
          </div>
          <div className="space-y-4">
            <button 
              onClick={() => window.print()}
              className="w-full py-4 bg-pink-500 text-white rounded-2xl font-bold hover:bg-pink-600 transition shadow-lg"
            >
              Print Pattern
            </button>
            
            <button 
               onClick={() => setIsShareModalOpen(true)}
               className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-bold hover:bg-indigo-600 transition shadow-lg flex items-center justify-center space-x-2"
            >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
               <span>Share Result</span>
            </button>

            <div className="space-y-3">
              <p className="font-bold text-[#008000] text-[18pt] leading-tight text-center">Right click on image to save</p>
              <p className="text-black text-xs text-center leading-relaxed">
                Croshé by MrsKathyKing - AI Crochet Doll & Pattern Creator is provided by <a href="https://mrskathyking.com" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-pink-500">www.mrskathyking.com</a>
              </p>
            </div>
          </div>
        </div>

        <div className="md:w-2/3">
          <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border border-slate-50 prose prose-pink max-w-none">
             <div className="mb-10 pb-6 border-b border-slate-100 flex items-center justify-between">
               <div>
                 <h1 className="text-4xl font-black text-slate-800 mb-2">The Pattern</h1>
                 <p className="text-slate-500 font-handwriting">Follow these steps to create your miniature twin.</p>
               </div>
               <div className="bg-pink-50 p-4 rounded-2xl">
                 <svg className="w-8 h-8 text-pink-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
               </div>
             </div>
             
             <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-sans text-lg pattern-container">
                {state.finalPattern?.split('\n').map((line, idx) => {
                  if (line.startsWith('- [ ]')) {
                    const rowContent = line.replace('- [ ]', '').trim();
                    return (
                      <div key={idx} className="flex items-start space-x-3 mb-2 group">
                        <input type="checkbox" className="mt-1.5 w-5 h-5 rounded border-slate-300 text-pink-500 focus:ring-pink-500 cursor-pointer" />
                        <span className="flex-1">{rowContent}</span>
                      </div>
                    );
                  }
                  if (line.startsWith('>')) {
                    return <blockquote key={idx} className="border-l-4 border-pink-200 pl-4 py-2 my-4 italic text-slate-600 bg-pink-50/50 rounded-r-xl">{line.replace('>', '').trim()}</blockquote>;
                  }
                  if (line.startsWith('---')) {
                    return <hr key={idx} className="my-8 border-slate-100" />;
                  }
                  if (line.startsWith('#')) {
                    const level = line.match(/^#+/)?.[0].length || 1;
                    const text = line.replace(/^#+/, '').trim();
                    const sizes = ['text-3xl font-black', 'text-2xl font-bold', 'text-xl font-bold'];
                    return <div key={idx} className={`${sizes[level-1] || 'text-lg'} text-slate-800 mt-8 mb-4`}>{text}</div>;
                  }
                  return <p key={idx} className="mb-4">{line}</p>;
                })}
             </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center pt-10">
         <button 
            onClick={onReset}
            className="text-slate-500 hover:text-pink-500 font-bold underline"
         >
           Create another one?
         </button>
      </div>
    </div>
  );
};
