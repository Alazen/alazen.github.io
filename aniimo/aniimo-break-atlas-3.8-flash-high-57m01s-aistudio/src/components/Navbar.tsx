import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Download, ExternalLink, Menu, X, ShieldAlert, Image as ImageIcon } from 'lucide-react';
import { playUiClickSound, setAudioMuted, getAudioMuted } from '../utils/audio';

interface NavbarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  selectedCompareCount: number;
  onOpenCompare: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  selectedCompareCount,
  onOpenCompare,
}) => {
  const [muted, setMuted] = useState(getAudioMuted());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setAudioMuted(next);
    if (!next) playUiClickSound();
  };

  const navItems = [
    { id: 'tier-list', label: 'Break Tier List' },
    { id: 'simulator', label: 'Interactive Simulator' },
    { id: 'gallery', label: 'Visual Gallery' },
    { id: 'comparison', label: 'Compare Breakers' },
    { id: 'mechanics', label: 'Break Mechanics' },
    { id: 'team-builder', label: 'Team Synergy' },
    { id: 'events', label: 'Launch Events' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/85 border-b border-sky-100/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Aniimo Brand Logo */}
        <div 
          onClick={() => { playUiClickSound(); onNavigate('tier-list'); }}
          className="flex items-center gap-3 cursor-pointer group"
          role="button"
          tabIndex={0}
          aria-label="Aniimo Break Home"
        >
          <div className="relative flex items-center">
            {/* Official Logo Badge */}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 via-cyan-300 to-blue-500 p-0.5 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform overflow-hidden">
              <img
                src="https://aniimotools.dev/assets/logo-512.png"
                alt="Aniimo Logo"
                className="w-full h-full object-cover bg-white rounded-[14px]"
                onError={(e) => {
                  // Fallback to text initials if remote image fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            {/* Mascot ear dot */}
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center">
              <Sparkles className="w-2 h-2 text-white" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-black text-2xl tracking-tighter text-slate-900 group-hover:text-sky-600 transition-colors">
                ANI!MO
              </span>
              <span className="px-1.5 py-0.2 rounded-md bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-black text-[9px] tracking-wide uppercase">
                BREAK META
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 -mt-1 tracking-wider uppercase">
              Combat Stagger Database
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { playUiClickSound(); onNavigate(item.id); }}
                className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all relative ${
                  isActive
                    ? 'text-sky-600 bg-sky-50 font-black'
                    : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Icons & Buttons */}
        <div className="flex items-center gap-2">
          
          {/* Comparison Drawer Trigger Button */}
          {selectedCompareCount > 0 && (
            <button
              onClick={() => { playUiClickSound(); onOpenCompare(); }}
              className="relative px-3.5 py-1.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs shadow-xs transition-all flex items-center gap-1.5 animate-pulse"
              title="Open Break Comparison"
            >
              <span>Compare ({selectedCompareCount}/3)</span>
            </button>
          )}

          {/* Audio Synthesizer Mute Toggle */}
          <button
            onClick={toggleMute}
            className="p-2 rounded-2xl border border-slate-200 hover:border-sky-300 text-slate-600 hover:text-sky-600 transition-colors bg-white/80"
            title={muted ? 'Unmute Anime RPG Audio' : 'Mute Audio Effects'}
            aria-label={muted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-cyan-600" />}
          </button>

          {/* Official Website External Link */}
          <a
            href="https://store.steampowered.com/app/4126040/Aniimo"
            target="_blank"
            rel="noopener noreferrer"
            onClick={playUiClickSound}
            className="hidden sm:inline-flex items-center gap-1 px-4 py-2 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold text-xs shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all"
          >
            <span>Steam Store</span>
            <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
          </a>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => { playUiClickSound(); setMobileMenuOpen(!mobileMenuOpen); }}
            className="lg:hidden p-2 rounded-2xl border border-slate-200 text-slate-700 hover:text-sky-600"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-sky-100 p-4 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-150">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                playUiClickSound();
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeSection === item.id
                  ? 'bg-sky-50 text-sky-600 font-black'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100 mt-2">
            <a
              href="https://store.steampowered.com/app/4126040/Aniimo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-sky-500 text-white text-xs font-bold"
            >
              <span>View Official Steam Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
