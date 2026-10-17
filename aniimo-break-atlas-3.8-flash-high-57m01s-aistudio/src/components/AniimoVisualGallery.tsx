import React, { useState } from 'react';
import { Image, Sparkles, Eye, X, ZoomIn, Swords, MapPin, ShieldAlert, ChevronRight } from 'lucide-react';
import { OFFICIAL_GALLERY_IMAGES, AniimoVisualItem, ELEMENT_ICONS } from '../data/aniimoData';
import { playUiClickSound } from '../utils/audio';

export const AniimoVisualGallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeModalItem, setActiveModalItem] = useState<AniimoVisualItem | null>(null);

  const categories = ['ALL', 'Creature', 'Combat', 'Environment', 'Raid'];

  const filteredItems = selectedCategory === 'ALL'
    ? OFFICIAL_GALLERY_IMAGES
    : OFFICIAL_GALLERY_IMAGES.filter((item) => item.category === selectedCategory);

  return (
    <section id="gallery" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-black tracking-wider uppercase mb-2">
          <Image className="w-3.5 h-3.5 text-cyan-600" />
          Official Visual Archives
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Aniimo Living World & Creature Gallery
        </h2>
        <p className="text-sm sm:text-base text-slate-600 font-medium mt-1">
          Explore high-resolution game screenshots, 3D model renders, and combat visual captures from the continent of Idyll.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => { playUiClickSound(); setSelectedCategory(cat); }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md shadow-sky-500/20 scale-105'
                : 'bg-white text-slate-600 hover:text-sky-600 border border-sky-100 hover:border-sky-200'
            }`}
          >
            {cat === 'ALL' ? 'All Visuals' : `${cat}s`}
          </button>
        ))}
      </div>

      {/* Visual Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => { playUiClickSound(); setActiveModalItem(item); }}
            className="group relative rounded-3xl bg-white border border-sky-100 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between"
          >
            {/* Image Container with Zoom Overlay */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

              {/* Category Badge */}
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/20">
                  {item.category}
                </span>
              </div>

              {/* Hover Inspect Icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-sky-950/30 backdrop-blur-[2px]">
                <div className="w-10 h-10 rounded-full bg-white text-sky-600 shadow-lg flex items-center justify-center">
                  <ZoomIn className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">
                  {item.subtitle}
                </div>
                <h3 className="font-heading font-black text-base text-slate-800 leading-snug group-hover:text-sky-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1">
                  {item.description}
                </p>
              </div>

              {/* Footer row with element / tag */}
              <div className="pt-3 border-t border-sky-50 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                {item.element && (
                  <span className="inline-flex items-center gap-1 text-slate-700">
                    <img
                      src={ELEMENT_ICONS[item.element]}
                      alt={item.element}
                      className="w-3.5 h-3.5 object-contain"
                    />
                    <span>{item.element}</span>
                  </span>
                )}
                <span className="text-sky-500 group-hover:translate-x-1 transition-transform ml-auto flex items-center gap-0.5 font-bold">
                  View Full <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Fullscreen Modal Lightbox */}
      {activeModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveModalItem(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 text-white rounded-3xl border border-sky-400/30 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => { playUiClickSound(); setActiveModalItem(null); }}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors"
              aria-label="Close image preview"
            >
              <X className="w-5 h-5" />
            </button>

            {/* High-res Image */}
            <div className="relative w-full max-h-[65vh] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={activeModalItem.imageUrl}
                alt={activeModalItem.title}
                className="w-full h-auto max-h-[65vh] object-contain"
              />
            </div>

            {/* Details Footer */}
            <div className="p-6 bg-slate-900 space-y-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-cyan-500 text-slate-950">
                  {activeModalItem.category}
                </span>
                <span className="text-xs font-bold text-sky-400">
                  {activeModalItem.subtitle}
                </span>
              </div>
              <h3 className="font-heading font-black text-2xl text-white">
                {activeModalItem.title}
              </h3>
              <p className="text-sm text-slate-300 font-medium leading-relaxed">
                {activeModalItem.description}
              </p>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
