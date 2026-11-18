// Full class names per card color (Tailwind only keeps classes it can see written out).
export interface CardColor {
  text: string;
  border: string;
  corner: string; // corner blob on cards
  routerCorner: string;
  iconBg: string;
  btnHover: string;
}

const make = (c: string): CardColor => COLOR_TABLE[c];

const COLOR_TABLE: Record<string, CardColor> = {
  green: { text: "text-green-400", border: "border-green-500/50", corner: "bg-green-500/5 group-hover:bg-green-500/10", routerCorner: "bg-green-500/10 group-hover:bg-green-500/20", iconBg: "bg-green-500/10", btnHover: "group-hover:bg-green-600" },
  indigo: { text: "text-indigo-400", border: "border-indigo-500/50", corner: "bg-indigo-500/5 group-hover:bg-indigo-500/10", routerCorner: "bg-indigo-500/10 group-hover:bg-indigo-500/20", iconBg: "bg-indigo-500/10", btnHover: "group-hover:bg-indigo-600" },
  blue: { text: "text-blue-400", border: "border-blue-500/50", corner: "bg-blue-500/5 group-hover:bg-blue-500/10", routerCorner: "bg-blue-500/10 group-hover:bg-blue-500/20", iconBg: "bg-blue-500/10", btnHover: "group-hover:bg-blue-600" },
  purple: { text: "text-purple-400", border: "border-purple-500/50", corner: "bg-purple-500/5 group-hover:bg-purple-500/10", routerCorner: "bg-purple-500/10 group-hover:bg-purple-500/20", iconBg: "bg-purple-500/10", btnHover: "group-hover:bg-purple-600" },
  red: { text: "text-red-400", border: "border-red-500/50", corner: "bg-red-500/5 group-hover:bg-red-500/10", routerCorner: "bg-red-500/10 group-hover:bg-red-500/20", iconBg: "bg-red-500/10", btnHover: "group-hover:bg-red-600" },
  yellow: { text: "text-yellow-400", border: "border-yellow-500/50", corner: "bg-yellow-500/5 group-hover:bg-yellow-500/10", routerCorner: "bg-yellow-500/10 group-hover:bg-yellow-500/20", iconBg: "bg-yellow-500/10", btnHover: "group-hover:bg-yellow-600" },
  pink: { text: "text-pink-400", border: "border-pink-500/50", corner: "bg-pink-500/5 group-hover:bg-pink-500/10", routerCorner: "bg-pink-500/10 group-hover:bg-pink-500/20", iconBg: "bg-pink-500/10", btnHover: "group-hover:bg-pink-600" },
  teal: { text: "text-teal-400", border: "border-teal-500/50", corner: "bg-teal-500/5 group-hover:bg-teal-500/10", routerCorner: "bg-teal-500/10 group-hover:bg-teal-500/20", iconBg: "bg-teal-500/10", btnHover: "group-hover:bg-teal-600" },
  orange: { text: "text-orange-400", border: "border-orange-500/50", corner: "bg-orange-500/5 group-hover:bg-orange-500/10", routerCorner: "bg-orange-500/10 group-hover:bg-orange-500/20", iconBg: "bg-orange-500/10", btnHover: "group-hover:bg-orange-600" },
  cyan: { text: "text-cyan-400", border: "border-cyan-500/50", corner: "bg-cyan-500/5 group-hover:bg-cyan-500/10", routerCorner: "bg-cyan-500/10 group-hover:bg-cyan-500/20", iconBg: "bg-cyan-500/10", btnHover: "group-hover:bg-cyan-600" },
  fuchsia: { text: "text-fuchsia-400", border: "border-fuchsia-500/50", corner: "bg-fuchsia-500/5 group-hover:bg-fuchsia-500/10", routerCorner: "bg-fuchsia-500/10 group-hover:bg-fuchsia-500/20", iconBg: "bg-fuchsia-500/10", btnHover: "group-hover:bg-fuchsia-600" },
  emerald: { text: "text-emerald-400", border: "border-emerald-500/50", corner: "bg-emerald-500/5 group-hover:bg-emerald-500/10", routerCorner: "bg-emerald-500/10 group-hover:bg-emerald-500/20", iconBg: "bg-emerald-500/10", btnHover: "group-hover:bg-emerald-600" },
  rose: { text: "text-rose-400", border: "border-rose-500/50", corner: "bg-rose-500/5 group-hover:bg-rose-500/10", routerCorner: "bg-rose-500/10 group-hover:bg-rose-500/20", iconBg: "bg-rose-500/10", btnHover: "group-hover:bg-rose-600" },
  amber: { text: "text-amber-400", border: "border-amber-500/50", corner: "bg-amber-500/5 group-hover:bg-amber-500/10", routerCorner: "bg-amber-500/10 group-hover:bg-amber-500/20", iconBg: "bg-amber-500/10", btnHover: "group-hover:bg-amber-600" },
  lime: { text: "text-lime-400", border: "border-lime-500/50", corner: "bg-lime-500/5 group-hover:bg-lime-500/10", routerCorner: "bg-lime-500/10 group-hover:bg-lime-500/20", iconBg: "bg-lime-500/10", btnHover: "group-hover:bg-lime-600" },
  sky: { text: "text-sky-400", border: "border-sky-500/50", corner: "bg-sky-500/5 group-hover:bg-sky-500/10", routerCorner: "bg-sky-500/10 group-hover:bg-sky-500/20", iconBg: "bg-sky-500/10", btnHover: "group-hover:bg-sky-600" },
  zinc: { text: "text-zinc-400", border: "border-zinc-500/50", corner: "bg-zinc-500/5 group-hover:bg-zinc-500/10", routerCorner: "bg-zinc-500/10 group-hover:bg-zinc-500/20", iconBg: "bg-zinc-500/10", btnHover: "group-hover:bg-zinc-600" },
  violet: { text: "text-violet-400", border: "border-violet-500/50", corner: "bg-violet-500/5 group-hover:bg-violet-500/10", routerCorner: "bg-violet-500/10 group-hover:bg-violet-500/20", iconBg: "bg-violet-500/10", btnHover: "group-hover:bg-violet-600" },
  gray: { text: "text-slate-400", border: "border-slate-500/50", corner: "bg-slate-500/5 group-hover:bg-slate-500/10", routerCorner: "bg-slate-500/10 group-hover:bg-slate-500/20", iconBg: "bg-slate-500/10", btnHover: "group-hover:bg-slate-600" },
};
// The website mapped "stone" to rose.
COLOR_TABLE.stone = COLOR_TABLE.rose;

export function cardColor(color?: string): CardColor {
  return (color && make(color)) || COLOR_TABLE.blue;
}
