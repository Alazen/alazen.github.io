import React from 'react';
import { Sparkles, Shield, Heart } from 'lucide-react';
import { playUiClickSound } from '../utils/audio';

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-[#1e2538] text-slate-300 pt-16 pb-12 overflow-hidden border-t border-slate-700/60">
      
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40rem] h-48 bg-cyan-500/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        
        {/* Tagline from Screenshot: "TWINE WITH ANIIMO TO FEEL THE WORLD LIKE THEY DO." */}
        <div className="max-w-3xl mx-auto space-y-2">
          <h2 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl tracking-tight text-white/95">
            TWINE WITH ANIIMO TO{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300">
              FEEL THE WORLD LIKE THEY DO.
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-xl mx-auto">
            Official Break meta companion for Aniimo. Maximize stagger windows, shatter shields, and triumph in high-tier raid encounters.
          </p>
        </div>

        {/* Links from Aniimo screenshot */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-semibold text-slate-400">
          <button
            onClick={playUiClickSound}
            className="hover:text-cyan-400 transition-colors"
          >
            Terms of Use
          </button>
          <span>·</span>
          <button
            onClick={playUiClickSound}
            className="hover:text-cyan-400 transition-colors"
          >
            Privacy Policy
          </button>
          <span>·</span>
          <button
            onClick={playUiClickSound}
            className="hover:text-cyan-400 transition-colors"
          >
            Cookies Policy
          </button>
          <span>·</span>
          <button
            onClick={playUiClickSound}
            className="hover:text-cyan-400 transition-colors"
          >
            Probability Details (Gacha & Break Rates)
          </button>
        </div>

        {/* Legal Disclaimer matching official footer in image */}
        <div className="pt-6 border-t border-slate-700/50 text-[11px] text-slate-500 font-medium space-y-1">
          <p>
            ©2025 Pawprint Interactive Entertainment Pte. Ltd. All rights reserved.
          </p>
          <p className="text-slate-600">
            Aniimo and related logos are trademarks of Pawprint Interactive. This interactive visualization tool is designed to provide high-precision tactical Break analysis and damage modeling for the Aniimo global community.
          </p>
        </div>

      </div>
    </footer>
  );
};
