import { formatRupees } from '../lib/format';

type Lang = 'en' | 'hi';

export interface ShareCardProps {
  totalRupees: number;
  lang: Lang;
  likelyCount: number;
}

export function ShareCard({ totalRupees, lang, likelyCount }: ShareCardProps) {
  const amount = formatRupees(totalRupees);
  const enText = `You may be missing up to ${amount}/year in government benefits.`;
  const hiText = `आप सालाना up to ${amount} तक के सरकारी लाभ से चूक सकते हैं।`;
  const shownText = lang === 'hi' ? hiText : enText;

  // Opens WhatsApp only from this click handler (user tap), never on mount.
  function shareOnWhatsApp(): void {
    const message = `${shownText} Check your eligibility: ${window.location.origin}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
      <p className="text-lg font-semibold text-emerald-900">{enText}</p>
      <p className="mt-1 text-base text-emerald-800">{hiText}</p>
      <p className="mt-3 text-xs text-slate-500">
        {lang === 'hi'
          ? `${likelyCount} संभावित रूप से पात्र योजनाओं पर आधारित। अनुमान है, गारंटी नहीं।`
          : `Based on ${likelyCount} likely-eligible schemes. Estimate, not a guarantee.`}
      </p>
      <button
        type="button"
        onClick={shareOnWhatsApp}
        className="mt-4 inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        {lang === 'hi' ? 'WhatsApp पर साझा करें' : 'Share on WhatsApp'}
      </button>
    </div>
  );
}

export default ShareCard;
