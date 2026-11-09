import React, { useState } from 'react';
import { BookOpen, Swords, Sparkles, Volume2, VolumeX, ArrowUp, ChevronRight, ChevronLeft, Image as ImageIcon } from 'lucide-react';
import { playUiClickSound, getAudioMuted, setAudioMuted } from '../utils/audio';

interface QuickCompanionDockProps {
  onNavigate: (section: string) => void;
}

export const QuickCompanionDock: React.FC<QuickCompanionDockProps> = ({ onNavigate }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(getAudioMuted());

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(min-width: 768px)');
      setIsExpanded(mq.matches);
      const handler = (e: MediaQueryListEvent) => setIsExpanded(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, []);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setAudioMuted(next);
    if (!next) playUiClickSound();
  };

  const scrollToTop = () => {
    playUiClickSound();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <aside aria-label="Quick Navigation Dock" className="fixed right-2 sm:right-3 bottom-4 sm:bottom-6 z-40 flex flex-col items-end gap-2 pointer-events-auto">
      
      {/* Toggle collapse tab - hidden on desktop, toggleable on mobile */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-8 h-8 rounded-full bg-white/95 border border-sky-300 shadow-md flex items-center justify-center text-slate-600 hover:text-sky-600 transition-colors"
        aria-label={isExpanded ? 'Collapse Companion Bar' : 'Expand Companion Bar'}
      >
        {isExpanded ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <div className="flex flex-col items-center gap-2.5 p-2 rounded-3xl bg-white/95 backdrop-blur-md border border-sky-200 shadow-xl animate-in slide-in-from-right duration-200">
          
          {/* Party Companion Slot 1 (Inferlupa) */}
          <div
            onClick={() => { playUiClickSound(); onNavigate('simulator'); }}
            className="group relative cursor-pointer"
            title="Active Companion 1: Prismana Inferlupa (Fire / S+)"
            role="button"
            tabIndex={0}
            aria-label="Active Companion 1: Prismana Inferlupa"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 p-0.5 shadow-md group-hover:scale-110 transition-transform overflow-hidden">
              <img
                src="https://aniimotools.dev/assets/creatures/inferlupa.webp"
                alt="Inferlupa"
                className="w-full h-full object-contain bg-white rounded-full p-0.5"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-slate-900 text-[9px] font-mono-num font-black text-amber-300 border border-white">
              28
            </span>
          </div>

          {/* Party Companion Slot 2 (Wavwal) */}
          <div
            onClick={() => { playUiClickSound(); onNavigate('simulator'); }}
            className="group relative cursor-pointer"
            title="Active Companion 2: Prismana Wavwal (Water / S)"
            role="button"
            tabIndex={0}
            aria-label="Active Companion 2: Prismana Wavwal"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-400 to-cyan-400 p-0.5 shadow-md group-hover:scale-110 transition-transform overflow-hidden">
              <img
                src="https://aniimotools.dev/assets/creatures/wavwal.webp"
                alt="Wavwal"
                className="w-full h-full object-contain bg-white rounded-full p-0.5"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-slate-900 text-[9px] font-mono-num font-black text-cyan-300 border border-white">
              25
            </span>
          </div>

          {/* Party Companion Slot 3 (Leafy Mascot / Acrofox) */}
          <div
            onClick={() => { playUiClickSound(); onNavigate('tier-list'); }}
            className="group relative cursor-pointer"
            title="Active Companion 3: Leafy Mascot"
            role="button"
            tabIndex={0}
            aria-label="Active Companion 3: Leafy Mascot"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-400 p-0.5 shadow-md group-hover:scale-110 transition-transform overflow-hidden">
              <img
                src="https://aniimotools.dev/assets/creatures/avatar/leafy.webp"
                alt="Leafy"
                className="w-full h-full object-contain bg-white rounded-full p-0.5"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-slate-900 text-[9px] font-mono-num font-black text-emerald-300 border border-white">
              22
            </span>
          </div>

          <div className="w-8 h-px bg-slate-200 my-0.5" />

          {/* Quick Action 1: Gallery */}
          <button
            onClick={() => { playUiClickSound(); onNavigate('gallery'); }}
            className="w-10 h-10 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-600 flex items-center justify-center transition-colors"
            title="Open Visual Gallery"
            aria-label="Open Visual Gallery"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* Quick Action 2: Team Synergy */}
          <button
            onClick={() => { playUiClickSound(); onNavigate('team-builder'); }}
            className="w-10 h-10 rounded-2xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 flex items-center justify-center transition-colors"
            title="Open Team Builder"
            aria-label="Open Team Builder"
          >
            <Swords className="w-4 h-4" />
          </button>

          {/* Quick Action 3: Mechanics Formula */}
          <button
            onClick={() => { playUiClickSound(); onNavigate('mechanics'); }}
            className="w-10 h-10 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-600 flex items-center justify-center transition-colors"
            title="Break Mechanics & Formulas"
            aria-label="Break Mechanics"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Quick Action 4: Audio Mute */}
          <button
            onClick={toggleMute}
            className="w-10 h-10 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors"
            title={muted ? 'Unmute Audio' : 'Mute Audio'}
            aria-label={muted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-cyan-600" />}
          </button>

          {/* Scroll to Top */}
          <button
            onClick={scrollToTop}
            className="w-10 h-10 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center shadow-md transition-colors"
            title="Back to Top"
            aria-label="Back to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>

        </div>
      )}

    </aside>
  );
};
