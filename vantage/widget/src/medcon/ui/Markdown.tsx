// Small, safe Markdown renderer (replaces marked.js, which loaded from a CDN).
// Handles headings, bold/italic, inline code, links, lists, tables, blockquotes, rules.
// Builds React elements only; never injects raw HTML.
import React from "react";

function cleanMedical(text: string): string {
  // Same clean-up the website did for LaTeX-style superscripts from the model.
  return text
    .replace(/\$\{\}\^\{(\d+)\}\$/g, "^[$1]")
    .replace(/\$\{\}\^(\d+)/g, "^[$1]")
    .replace(/\$\^\{?(\d+)\}?\$?/g, "^[$1]")
    .replace(/\$\{\^(\d+)\}\$/g, "^[$1]")
    .replace(/\$_/g, "")
    .replace(/<sup>(\d+)<\/sup>/g, "^[$1]");
}

let keySeq = 0;
const k = () => `md${keySeq++}`;

/** Optional [TAG] -> badge map, e.g. { "RCT": { label: "RCT", className: "badge badge-rct" } }. */
export type BadgeMap = Record<string, { label: string; className: string }>;
let activeBadges: BadgeMap | undefined;

function inline(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  // tokens: **bold**, *italic* / _italic_, `code`, [text](url), ^[n] superscript, [TAG] badge
  const re = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\[[^\]]+\]\([^)\s]+\)|\^\[\d+\]|\[[A-Za-z][A-Za-z: ]{0,30}\](?!\()|\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    if (t.startsWith("[") && !t.includes("](")) {
      const badge = activeBadges?.[t.slice(1, -1).trim().toUpperCase()];
      out.push(badge ? <span key={k()} className={badge.className}>{badge.label}</span> : t);
    } else if (t.startsWith("**") || t.startsWith("__")) out.push(<strong key={k()}>{inline(t.slice(2, -2))}</strong>);
    else if (t.startsWith("`")) out.push(<code key={k()}>{t.slice(1, -1)}</code>);
    else if (t.startsWith("[")) {
      const mm = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(t)!;
      const safe = /^https?:\/\//i.test(mm[2]) ? mm[2] : undefined;
      out.push(
        safe ? (
          <a key={k()} href={safe} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
            {mm[1]}
          </a>
        ) : (
          mm[1]
        ),
      );
    } else if (t.startsWith("^[")) out.push(<sup key={k()}>{t.slice(2, -1)}</sup>);
    else out.push(<em key={k()}>{inline(t.slice(1, -1))}</em>);
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const isTableSep = (l: string) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(l);
const splitRow = (l: string) =>
  l
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());

export function Markdown({ text, className = "", badges }: { text: string; className?: string; badges?: BadgeMap }) {
  activeBadges = badges;
  const lines = cleanMedical(text || "").replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const level = Math.min(h[1].length, 3);
      blocks.push(React.createElement(`h${level}`, { key: k() }, inline(h[2])));
      i++;
      continue;
    }
    if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) {
      blocks.push(<hr key={k()} className="border-slate-700 my-4" />);
      i++;
      continue;
    }
    if (line.includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const head = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) rows.push(splitRow(lines[i++]));
      blocks.push(
        <div key={k()} className="overflow-x-auto my-4">
          <table className="md-table">
            <thead>
              <tr>{head.map((c) => <th key={k()}>{inline(c)}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={k()}>{r.map((c) => <td key={k()}>{inline(c)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }
    if (/^\s*>/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) quote.push(lines[i++].replace(/^\s*>\s?/, ""));
      const qt = quote.join(" ");
      // Tiered alerts used by the Journal Club pearls: 🚨 red, ⚖️ amber, 💡 blue.
      const tone = qt.includes("🚨") ? "quote-red" : qt.includes("⚖") ? "quote-amber" : qt.includes("💡") ? "quote-blue" : undefined;
      blocks.push(
        <blockquote key={k()} className={tone}>
          {inline(qt)}
        </blockquote>,
      );
      continue;
    }
    if (/^\s*([-*+]|\d+[.)])\s+/.test(line)) {
      const ordered = /^\s*\d+[.)]\s+/.test(line);
      const items: { depth: number; text: string }[] = [];
      while (i < lines.length && /^\s*([-*+]|\d+[.)])\s+/.test(lines[i])) {
        const raw = lines[i++];
        const depth = Math.floor((raw.match(/^\s*/)![0].length || 0) / 2);
        items.push({ depth, text: raw.replace(/^\s*([-*+]|\d+[.)])\s+/, "") });
      }
      const ListTag = ordered ? "ol" : "ul";
      blocks.push(
        <ListTag key={k()}>
          {items.map((it) => (
            <li key={k()} style={it.depth ? { marginLeft: `${it.depth * 1.25}rem` } : undefined}>
              {inline(it.text)}
            </li>
          ))}
        </ListTag>,
      );
      continue;
    }
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !/^\s*>/.test(lines[i]) &&
      !/^\s*([-*+]|\d+[.)])\s+/.test(lines[i])
    ) {
      para.push(lines[i++]);
    }
    blocks.push(<p key={k()}>{inline(para.join(" "))}</p>);
  }

  return <div className={`prose-content ${className}`}>{blocks}</div>;
}
