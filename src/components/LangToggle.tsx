import type { Lang } from '../i18n';

interface LangToggleProps {
  lang: Lang;
  onChange: (l: Lang) => void;
}

const OPTIONS: { value: Lang; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिंदी' },
];

export default function LangToggle({ lang, onChange }: LangToggleProps) {
  return (
    <div
      role="group"
      aria-label={lang === 'hi' ? 'भाषा' : 'Language'}
      className="inline-flex overflow-hidden rounded-full border-2 border-teal-700 bg-white text-sm font-semibold"
    >
      {OPTIONS.map((o) => {
        const active = o.value === lang;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={`px-4 py-2 ${active ? 'bg-teal-700 text-white' : 'text-teal-800'}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
