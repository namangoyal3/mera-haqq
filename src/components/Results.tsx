import { useMemo, useState } from 'react';
import type { Profile, Scheme } from '../types';
import schemesData from '../data/schemes.json';
import { evaluateAll, explainCondition } from '../engine/rules';
import type { SchemeResult } from '../engine/rules';
import { formatDate, formatRupees } from '../lib/format';
import { ShareCard } from './ShareCard';

type Lang = 'en' | 'hi';

export interface ResultsProps {
  profile: Profile;
  lang: Lang;
  onTrack: (schemeId: string) => void;
  onStartOver: () => void;
}

const schemes = schemesData as Scheme[];

const FIELD_LABELS: Record<string, [string, string]> = {
  age: ['Age', 'उम्र'],
  state: ['State', 'राज्य'],
  occupation: ['Occupation', 'व्यवसाय'],
  annualIncome: ['Annual income', 'सालाना आय'],
  familySize: ['Family size', 'परिवार के सदस्य'],
  landAcres: ['Land (acres)', 'ज़मीन (एकड़)'],
  category: ['Category', 'वर्ग'],
  disability: ['Disability status', 'दिव्यांगता की स्थिति'],
  hasGirlChild: ['Girl child in family', 'घर में बेटी'],
  girlChildAge: ['Girl child age', 'बेटी की उम्र'],
  isWidow: ['Widow status', 'विधवा होने की स्थिति'],
  isPregnant: ['Pregnancy status', 'गर्भावस्था की स्थिति'],
  hasBankAccount: ['Bank account', 'बैंक खाता'],
  hasBpl: ['BPL card', 'बीपीएल कार्ड'],
  hasKisanCard: ['Kisan card', 'किसान कार्ड'],
  isBelowPovertyCardHolder: ['BPL card', 'बीपीएल कार्ड'],
  hasPuccaHouse: ['Pucca house', 'पक्का मकान'],
  gender: ['Gender', 'लिंग'],
};

function fieldLabel(key: string, lang: Lang): string {
  const pair = FIELD_LABELS[key];
  if (!pair) return key;
  return lang === 'hi' ? pair[1] : pair[0];
}

interface SchemeCardProps {
  result: SchemeResult;
  lang: Lang;
  onTrack: (schemeId: string) => void;
}

function SchemeCard({ result, lang, onTrack }: SchemeCardProps) {
  const { scheme } = result;
  const t = (en: string, hi: string): string => (lang === 'hi' ? hi : en);
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const documents = lang === 'hi' ? scheme.documents_hi : scheme.documents_en;
  const steps = lang === 'hi' ? scheme.applySteps_hi : scheme.applySteps_en;

  return (
    <article className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <header>
        <h3 className="text-lg font-semibold text-slate-900">{lang === 'hi' ? scheme.name_hi : scheme.name_en}</h3>
        <p className="text-xs text-slate-500">
          {t('Ministry: ', 'मंत्रालय: ')}
          {scheme.ministry}
        </p>
      </header>

      <div>
        <p className="text-base font-semibold text-emerald-800">{formatRupees(scheme.benefitAmountRupees)}</p>
        <p className="text-sm text-slate-700">{lang === 'hi' ? scheme.benefitDetail_hi : scheme.benefitDetail_en}</p>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-800">
          {t("Why: you matched because…", 'क्यों: आप इसलिए मेल खाते हैं क्योंकि…')}
        </p>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
          {result.matchedRules.map((c, i) => (
            <li key={`${c.field}-${i}`}>{explainCondition(c, lang)}</li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-800">{t('Documents needed', 'ज़रूरी दस्तावेज़')}</p>
        <ul className="mt-1 space-y-1 text-sm text-slate-700">
          {documents.map((doc, i) => (
            <li key={i}>
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={checked[i] ?? false}
                  onChange={(ev) => setChecked((prev) => ({ ...prev, [i]: ev.target.checked }))}
                  className="mt-1"
                />
                <span>{doc}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-800">{t('How to apply', 'आवेदन कैसे करें')}</p>
        <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-slate-700">
          {steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </div>

      <div className="space-y-1 text-sm">
        <p>
          <a
            href={scheme.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-700 underline hover:text-blue-900"
          >
            {t('Official website', 'आधिकारिक वेबसाइट')}
          </a>
        </p>
        <p className="text-xs text-slate-500">
          {t('Last verified: ', 'अंतिम जाँच: ')}
          {formatDate(scheme.lastVerified, lang)}
        </p>
        {scheme.notes && <p className="text-slate-700">{scheme.notes}</p>}
        {scheme.deadline && (
          <p className="font-medium text-amber-800">
            {t('Deadline: ', 'अंतिम तिथि: ')}
            {formatDate(scheme.deadline, lang)}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onTrack(scheme.id)}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
      >
        {t('Track this application', 'इस आवेदन को ट्रैक करें')}
      </button>
    </article>
  );
}

export function Results({ profile, lang, onTrack, onStartOver }: ResultsProps) {
  const results = useMemo(() => evaluateAll(profile, schemes), [profile]);
  const t = (en: string, hi: string): string => (lang === 'hi' ? hi : en);

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-4">
      <ShareCard totalRupees={results.totalAnnualRupees} lang={lang} likelyCount={results.likely.length} />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">{t('Likely eligible', 'संभावित रूप से पात्र')}</h2>
        {results.likely.length === 0 ? (
          <p className="text-sm text-slate-600">
            {t(
              'No likely-eligible schemes yet. Try answering more questions.',
              'अभी कोई संभावित रूप से पात्र योजना नहीं मिली। और सवालों के जवाब दें।',
            )}
          </p>
        ) : (
          results.likely.map((r) => <SchemeCard key={r.scheme.id} result={r} lang={lang} onTrack={onTrack} />)
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">
          {t('Possible — we need a bit more info', 'संभावित — थोड़ी और जानकारी चाहिए')}
        </h2>
        {results.possible.length === 0 ? (
          <p className="text-sm text-slate-600">{t('No schemes need more info.', 'किसी योजना को और जानकारी की ज़रूरत नहीं है।')}</p>
        ) : (
          <ul className="space-y-3">
            {results.possible.map((r) => (
              <li key={r.scheme.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-medium text-slate-900">{lang === 'hi' ? r.scheme.name_hi : r.scheme.name_en}</p>
                <p className="mt-1 text-sm text-slate-700">
                  {t('Missing info: ', 'ज़रूरी जानकारी: ')}
                  {r.missingFields.map((f) => fieldLabel(f, lang)).join(', ')}
                </p>
              </li>
            ))}
          </ul>
        )}
        {results.possible.length > 0 && (
          <p className="text-sm font-medium text-slate-700">
            {t('Answer more questions to check', 'जाँचने के लिए और सवालों के जवाब दें')}
          </p>
        )}
      </section>

      <div>
        <button
          type="button"
          onClick={onStartOver}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          {t('Start over', 'फिर से शुरू करें')}
        </button>
      </div>
    </div>
  );
}

export default Results;
