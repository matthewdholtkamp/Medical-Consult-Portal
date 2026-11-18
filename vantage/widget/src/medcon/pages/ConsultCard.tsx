import type React from "react";
import { cardColor } from "../data/colors";
import type { SiteItem } from "../data/siteContent";
import { Icon } from "../ui/Icon";

const keyOpen = (fn: () => void) => (e: React.KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fn();
  }
};

/** Card in the "All Consult Specialties" grid. */
export function ConsultCard({ item, onOpen }: { item: SiteItem; onOpen: (i: SiteItem) => void }) {
  const c = cardColor(item.color);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(item)}
      onKeyDown={keyOpen(() => onOpen(item))}
      className="card bg-gemini-800 border border-slate-700/50 rounded-2xl p-6 flex flex-col relative overflow-hidden group cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-all ${c.corner}`} />
      <h3 className="text-xl font-bold text-white mb-2 relative z-10">{item.title}</h3>
      <p className="text-slate-400 mb-6 flex-grow text-sm relative z-10">
        {item.desc}
        <br />
        <strong className={`${c.text} text-xs`}>Note Generation</strong>
      </p>
      <span className={`mt-auto w-full bg-slate-700 text-white font-medium py-2.5 px-4 rounded-xl text-center transition-all relative z-10 ${c.btnHover}`}>Start Consult</span>
    </div>
  );
}

/** "Recommended Consult" card shown under a Dr. Holtkamp answer. */
export function RecommendedCard({ item, onOpen }: { item: SiteItem; onOpen: (i: SiteItem) => void }) {
  const c = cardColor(item.color);
  return (
    <div className="mt-6 flex justify-center animate-fade-in w-full max-w-sm mx-auto">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpen(item)}
        onKeyDown={keyOpen(() => onOpen(item))}
        className={`card w-full bg-gemini-800 border-2 ${c.border} rounded-2xl p-6 flex flex-col relative overflow-hidden group cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none`}
      >
        <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-all ${c.corner}`} />
        <div className="flex items-center gap-2 mb-3 relative z-10">
          <Icon name="medical" className={c.text} size={20} />
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Recommended Consult</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2 relative z-10">{item.title}</h3>
        <p className="text-slate-400 mb-6 flex-grow text-sm relative z-10">
          {item.desc}
          <br />
          <strong className={`${c.text} text-xs`}>Note Generation</strong>
        </p>
        <span className={`mt-auto w-full bg-slate-700 text-white font-medium py-2.5 px-4 rounded-xl text-center transition-all relative z-10 ${c.btnHover}`}>Start Consult</span>
      </div>
    </div>
  );
}

/** Compact card used in the Consult Generator's router result. */
export function RouterCard({ item, onOpen }: { item: SiteItem; onOpen: (i: SiteItem) => void }) {
  const c = cardColor(item.color);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(item)}
      onKeyDown={keyOpen(() => onOpen(item))}
      className={`mt-auto card bg-gemini-800 border ${c.border} rounded-2xl p-4 flex flex-col relative overflow-hidden group cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none`}
    >
      <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full -mr-4 -mt-4 transition-all ${c.routerCorner}`} />
      <div className="flex items-center gap-2 mb-2 relative z-10">
        <Icon name="medical" className={c.text} size={20} />
        <h3 className="text-lg font-bold text-white">{item.title}</h3>
      </div>
      <p className="text-slate-400 text-xs mb-3 flex-grow relative z-10">{item.desc}</p>
      <span className={`w-full bg-slate-700 text-white font-medium py-2 px-3 rounded-lg text-sm text-center transition-all relative z-10 ${c.btnHover}`}>Start Consult</span>
    </div>
  );
}

export { keyOpen };
