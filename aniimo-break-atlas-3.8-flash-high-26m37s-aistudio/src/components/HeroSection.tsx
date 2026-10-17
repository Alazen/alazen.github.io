import React from 'react';
import { Sparkles, Play, Shield, Zap, Target, Award, ArrowRight } from 'lucide-react';
import { MILESTONES } from '../data/aniimoData';
import { playUiClickSound } from '../utils/audio';

interface HeroSectionProps {
  onExploreTierList: () => void;
  onLaunchSimulator: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreTierList,
  onLaunchSimulator,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-sky-300 via-sky-100 to-[#e9f6ff] pt-8 pb-16">
      
      {/* Decorative Beach & Water Caustics Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-200/60 blur-3xl" />
        <div className="absolute top-20 right-10 w-[30rem] h-[30rem] rounded-full bg-sky-200/60 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[40rem] h-64 bg-teal-100/50 blur-2xl" />
      </div>

      {/* Floating Animated Bubbles / Sea Sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-12 left-1/4 w-3 h-3 rounded-full bg-white/80 animate-float-slow shadow-xs" />
        <div className="absolute top-24 right-1/4 w-4 h-4 rounded-full bg-cyan-100/90 animate-float-gentle shadow-xs" />
        <div className="absolute top-40 left-12 w-2.5 h-2.5 rounded-full bg-amber-200/80 animate-float-slow shadow-xs" />
        <div className="absolute top-64 right-16 w-3 h-3 rounded-full bg-sky-200/90 animate-float-gentle shadow-xs" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Tagline Badge */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-sky-200 shadow-sm text-xs font-bold text-sky-800 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>GLOBAL LAUNCH BREAK META · PATCH 1.0.0</span>
            <span className="text-sky-300">|</span>
            <span className="text-cyan-600 font-extrabold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> OFFICIAL MECHANICS
            </span>
          </div>
        </div>

        {/* Main Title & Hero Heading */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight sm:leading-none">
            RANK THE BEST{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-cyan-500 to-blue-600">
              ANIIMO BREAK
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Twine with companions to shatter boss poise. Discover theoretical and empirical rankings,
            time-to-break speedruns, and live gauge simulations.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => { playUiClickSound(); onExploreTierList(); }}
              className="px-7 py-3.5 rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/35 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              <span>Explore Break Tier List</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>

            <button
              onClick={() => { playUiClickSound(); onLaunchSimulator(); }}
              className="px-7 py-3.5 rounded-full bg-white/90 border-2 border-sky-300 text-slate-800 font-bold text-sm tracking-wide hover:bg-sky-50 hover:border-sky-400 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 shadow-sm"
            >
              <Play className="w-4 h-4 text-cyan-600 fill-cyan-500" />
              <span>Launch Live Break Arena</span>
            </button>
          </div>

          {/* Supported Platforms (matching Official PC Launcher banner from screenshot) */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-bold text-slate-500">
            <span className="text-slate-400">Available on:</span>
            <span className="px-3 py-1 rounded-full bg-white/80 border border-slate-200">Official PC Launcher</span>
            <span className="px-3 py-1 rounded-full bg-white/80 border border-slate-200">PlayStation 5</span>
            <span className="px-3 py-1 rounded-full bg-white/80 border border-slate-200">Steam</span>
            <span className="px-3 py-1 rounded-full bg-white/80 border border-slate-200">Xbox Series X|S</span>
            <span className="px-3 py-1 rounded-full bg-white/80 border border-slate-200">Epic Games</span>
            <span className="px-3 py-1 rounded-full bg-white/80 border border-slate-200">Mobile (iOS & Android)</span>
          </div>
        </div>

        {/* Global Pre-Registration / Community Milestone Counter Section (Faithful to image!) */}
        <div className="mt-12 max-w-5xl mx-auto rounded-3xl aniimo-glass p-6 sm:p-8 relative">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-sky-100 pb-5">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-sky-600">
                | Global Milestone Tracker
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 mt-0.5">
                Total Boss Break Gauge Shatters
              </h2>
            </div>

            {/* Giant Pre-Registration style Counter */}
            <div className="flex items-baseline gap-1 bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 bg-clip-text text-transparent">
              <span className="font-heading font-black text-3xl sm:text-5xl tracking-tight font-mono-num">
                40,135,279
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-cyan-600 ml-1">SHATTERS</span>
            </div>
          </div>

          {/* Milestone Track Pills (10M, 15M, 20M, 30M, 40M) */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
            {MILESTONES.map((m) => (
              <div
                key={m.count}
                className="relative rounded-2xl bg-white/90 border border-sky-100 p-3 flex flex-col items-center text-center shadow-xs hover:border-cyan-300 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mb-1.5">
                  <Award className="w-4 h-4 text-cyan-600" />
                </div>
                <span className="font-heading font-black text-base text-slate-800">
                  {m.count}
                </span>
                <span className="text-[11px] text-slate-600 font-semibold mt-0.5 leading-snug">
                  {m.reward}
                </span>
                <span className="mt-1.5 inline-flex items-center text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ✓ UNLOCKED
                </span>
              </div>
            ))}
          </div>

          {/* Quick Highlight Stats */}
          <div className="mt-6 pt-5 border-t border-sky-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-heading font-black text-lg text-slate-800">4.1s Record</div>
                <div className="text-xs text-slate-500 font-medium">Fastest Time to Break (Inferlupa)</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-heading font-black text-lg text-slate-800">+200% DMG</div>
                <div className="text-xs text-slate-500 font-medium">Stagger State Vulnerability Multiplier</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-heading font-black text-lg text-slate-800">10 Breakers</div>
                <div className="text-xs text-slate-500 font-medium">Fully Analyzed Combat Kits</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
