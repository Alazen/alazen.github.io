import React, { useState } from 'react';
import { BookOpen, Swords, Sparkles, Volume2, VolumeX, ArrowUp, ChevronRight, ChevronLeft } from 'lucide-react';
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
            title="Active Companion 1: Prismana Inferlupa"
            role="button"
            tabIndex={0}
            aria-label="Active Companion 1: Prismana Inferlupa"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 p-0.5 shadow-md group-hover:scale-110 transition-transform">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-heading font-black text-xs text-orange-600">
                Lupa
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-slate-900 text-[9px] font-mono-num font-black text-amber-300 border border-white">
              28
            </span>
          </div>

          {/* Party Companion Slot 2 (Wavwal) */}
          <div
            onClick={() => { playUiClickSound(); onNavigate('simulator'); }}
            className="group relative cursor-pointer"
            title="Active Companion 2: Prismana Wavwal"
            role="button"
            tabIndex={0}
            aria-label="Active Companion 2: Prismana Wavwal"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 p-0.5 shadow-md group-hover:scale-110 transition-transform">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-heading font-black text-xs text-cyan-600">
                Wav
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-slate-900 text-[9px] font-mono-num font-black text-cyan-300 border border-white">
              28
            </span>
          </div>

          {/* Divider */}
          <div className="w-8 h-px bg-sky-100" />

          {/* Quick Jump: Tier List */}
          <button
            onClick={() => { playUiClickSound(); onNavigate('tier-list'); }}
            className="w-10 h-10 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-700 flex flex-col items-center justify-center transition-colors"
            title="Aniimo Tier List"
            aria-label="Aniimo Tier List"
          >
            <Sparkles className="w-4 h-4 text-cyan-600" />
            <span className="text-[8px] font-extrabold text-slate-600">Aniimo</span>
          </button>

          {/* Quick Jump: Arena Sim */}
          <button
            onClick={() => { playUiClickSound(); onNavigate('simulator'); }}
            className="w-10 h-10 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-700 flex flex-col items-center justify-center transition-colors"
            title="Break Arena Simulator"
            aria-label="Break Arena Simulator"
          >
            <Swords className="w-4 h-4 text-cyan-600" />
            <span className="text-[8px] font-extrabold text-slate-600">Train</span>
          </button>

          {/* Quick Jump: Mechanics Guide */}
          <button
            onClick={() => { playUiClickSound(); onNavigate('mechanics'); }}
            className="w-10 h-10 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-700 flex flex-col items-center justify-center transition-colors"
            title="Break Mechanics Guide"
            aria-label="Break Mechanics Guide"
          >
            <BookOpen className="w-4 h-4 text-cyan-600" />
            <span className="text-[8px] font-extrabold text-slate-600">Guide</span>
          </button>

          {/* Audio toggle */}
          <button
            onClick={toggleMute}
            className="w-10 h-10 rounded-2xl bg-sky-50 hover:bg-sky-100 text-slate-600 flex items-center justify-center transition-colors"
            title={muted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label={muted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-cyan-600" />}
          </button>

          {/* Scroll to Top */}
          <button
            onClick={scrollToTop}
            className="w-10 h-10 rounded-2xl bg-slate-900 text-white hover:bg-sky-600 flex items-center justify-center transition-colors shadow-sm"
            title="Scroll to Top"
            aria-label="Scroll to Top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>

        </div>
      )}

    </aside>
  );
};
