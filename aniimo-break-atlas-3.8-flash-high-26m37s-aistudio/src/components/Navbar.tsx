import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Download, ExternalLink, Menu, X, ShieldAlert } from 'lucide-react';
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
    { id: 'comparison', label: 'Compare Breakers' },
    { id: 'mechanics', label: 'Break Mechanics' },
    { id: 'team-builder', label: 'Team Synergy' },
    { id: 'events', label: 'Launch Events' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-sky-100/80 shadow-xs">
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
            {/* Logo Icon Sparkle */}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 via-cyan-300 to-blue-500 p-0.5 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <span className="font-heading font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-cyan-500">
                  A!
                </span>
              </div>
            </div>
            {/* Mascot ear dot */}
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center">
              <Sparkles className="w-2 h-2 text-white" />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading font-black tracking-wider text-2xl text-slate-900 group-hover:text-sky-600 transition-colors">
                ANI<span className="text-cyan-500 font-extrabold">!</span>MO
              </span>
              <span className="text-xs uppercase tracking-widest font-extrabold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                BREAK META
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium tracking-tight -mt-0.5">
              Official Tier List & Stagger Visualizer
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  playUiClickSound();
                  onNavigate(item.id);
                }}
                className={`relative px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md shadow-sky-500/20'
                    : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/80'
                }`}
              >
                {item.label}
                {item.id === 'comparison' && selectedCompareCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-amber-400 text-amber-950">
                    {selectedCompareCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right CTA / Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio toggle button */}
          <button
            onClick={toggleMute}
            className="p-2 rounded-full border border-sky-200 bg-white/90 text-slate-600 hover:text-sky-600 hover:border-sky-300 transition-colors"
            title={muted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            aria-label={muted ? 'Unmute audio' : 'Mute audio'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-cyan-600" />}
          </button>

          {/* Quick Compare Trigger (Mobile / Global) */}
          {selectedCompareCount > 0 && (
            <button
              onClick={() => { playUiClickSound(); onOpenCompare(); }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold hover:bg-amber-200 transition-colors animate-pulse"
            >
              <span>Compare ({selectedCompareCount}/3)</span>
            </button>
          )}

          {/* Official Website pill matching image */}
          <a
            href="#events"
            onClick={(e) => {
              e.preventDefault();
              playUiClickSound();
              onNavigate('events');
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-sky-300 bg-white text-sky-700 text-xs font-bold tracking-wide hover:bg-sky-50 transition-all shadow-xs"
          >
            <span>Official Launch</span>
            <ExternalLink className="w-3 h-3 text-sky-500" />
          </a>

          {/* Download PC Launcher button matching image */}
          <button
            onClick={() => {
              playUiClickSound();
              onNavigate('simulator');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 text-white hover:bg-sky-600 text-xs font-bold tracking-wide transition-all shadow-sm shadow-slate-900/10 hover:shadow-sky-500/20"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xs:inline">Test</span> Simulator
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-sky-50"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-4 bg-white/95 border-b border-sky-100 shadow-xl space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                playUiClickSound();
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold ${
                activeSection === item.id
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-700 hover:bg-sky-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{item.label}</span>
                {item.id === 'comparison' && selectedCompareCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-900 text-xs font-bold">
                    {selectedCompareCount}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
