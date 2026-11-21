import { useState } from 'react';
import type { Scheme } from '../types';
import schemesData from '../data/schemes.json';
import { formatDate } from '../lib/format';

type Lang = 'en' | 'hi';

const schemes = schemesData as Scheme[];

const STORAGE_KEY = 'mera-haqq-tracker';
const DAY_MS = 86_400_000;
const STATUSES: TrackerStatus[] = ['planned', 'applied', 'approved', 'rejected'];

export type TrackerStatus = 'planned' | 'applied' | 'approved' | 'rejected';

export interface TrackerEntry {
  schemeId: string;
  status: TrackerStatus;
  /** YYYY-MM-DD */
  deadline?: string;
  /** YYYY-MM-DD */
  appliedOn?: string;
  updatedAt: string;
}

export interface TrackerProps {
  lang: Lang;
  onBack: () => void;
}

function isTrackerStatus(v: unknown): v is TrackerStatus {
  return typeof v === 'string' && (STATUSES as string[]).includes(v);
}

function isTrackerEntry(v: unknown): v is TrackerEntry {
  if (typeof v !== 'object' || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.schemeId === 'string' &&
    isTrackerStatus(r.status) &&
    typeof r.updatedAt === 'string' &&
    (r.deadline === undefined || typeof r.deadline === 'string') &&
    (r.appliedOn === undefined || typeof r.appliedOn === 'string')
  );
}

function loadEntries(): TrackerEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isTrackerEntry) : [];
  } catch {
    // Storage unavailable or corrupt: start with an empty tracker.
    return [];
  }
}

function saveEntries(entries: TrackerEntry[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage unavailable: changes stay in memory for this session only.
  }
}

/** Adds a scheme to the tracker with status 'planned'. No-op if already tracked. */
export function addToTracker(schemeId: string): void {
  const entries = loadEntries();
  if (entries.some((e) => e.schemeId === schemeId)) return;
  entries.push({ schemeId, status: 'planned', updatedAt: new Date().toISOString() });
  saveEntries(entries);
}

/** Whole days from today (local date) to an ISO date. Negative means past. */
function daysUntil(iso: string): number {
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const target = Date.parse(`${iso}T00:00:00Z`);
  return Math.round((target - today) / DAY_MS);
}

function todayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function Tracker({ lang, onBack }: TrackerProps) {
  const [entries, setEntries] = useState<TrackerEntry[]>(loadEntries);
  const [pickId, setPickId] = useState('');

  const t = (en: string, hi: string): string => (lang === 'hi' ? hi : en);

  const statusLabel = (s: TrackerStatus): string => {
    const labels: Record<TrackerStatus, [string, string]> = {
      planned: ['Planned', 'योजना बनाई'],
      applied: ['Applied', 'आवेदन किया'],
      approved: ['Approved', 'स्वीकृत'],
      rejected: ['Rejected', 'अस्वीकृत'],
    };
    const [en, hi] = labels[s];
    return t(en, hi);
  };

  const nameOf = (id: string): string => {
    const s = schemes.find((x) => x.id === id);
    if (!s) return id;
    return lang === 'hi' ? s.name_hi : s.name_en;
  };

  const commit = (next: TrackerEntry[]): void => {
    setEntries(next);
    saveEntries(next);
  };

  const updateEntry = (schemeId: string, changes: Partial<Omit<TrackerEntry, 'schemeId'>>): void => {
    const now = new Date().toISOString();
    commit(
      entries.map((e) => {
        if (e.schemeId !== schemeId) return e;
        const next: TrackerEntry = { ...e, ...changes, updatedAt: now };
        // Record the application date the first time an entry becomes 'applied'.
        if (changes.status === 'applied' && !next.appliedOn) {
          next.appliedOn = todayIso();
        }
        return next;
      }),
    );
  };

  const removeEntry = (schemeId: string): void => {
    commit(entries.filter((e) => e.schemeId !== schemeId));
  };

  const addEntry = (): void => {
    if (pickId === '' || entries.some((e) => e.schemeId === pickId)) return;
    commit([...entries, { schemeId: pickId, status: 'planned', updatedAt: new Date().toISOString() }]);
    setPickId('');
  };

  const untracked = schemes.filter((s) => !entries.some((e) => e.schemeId === s.id));
  const dueSoonCount = entries.filter((e) => e.deadline !== undefined && daysUntil(e.deadline) <= 30).length;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">{t('Application tracker', 'आवेदन ट्रैकर')}</h2>
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          {t('Back', 'वापस')}
        </button>
      </div>

      <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
        {t(
          `${dueSoonCount} deadline(s) within 30 days or overdue`,
          `${dueSoonCount} अंतिम तिथि 30 दिनों में या बीत चुकी`,
        )}
      </p>

      {entries.length === 0 ? (
        <p className="text-sm text-slate-600">
          {t('No schemes tracked yet.', 'अभी कोई योजना ट्रैक नहीं की गई है।')}
        </p>
      ) : (
        <ul className="space-y-3">
          {entries.map((e) => {
            const overdue = e.deadline !== undefined && daysUntil(e.deadline) < 0;
            return (
              <li key={e.schemeId} className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="font-medium text-slate-900">{nameOf(e.schemeId)}</p>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <label className="flex items-center gap-2">
                    <span className="text-slate-600">{t('Status', 'स्थिति')}</span>
                    <select
                      value={e.status}
                      onChange={(ev) => updateEntry(e.schemeId, { status: ev.target.value as TrackerStatus })}
                      className="rounded-md border border-slate-300 px-2 py-1"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {statusLabel(s)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-2">
                    <span className="text-slate-600">{t('Deadline', 'अंतिम तिथि')}</span>
                    <input
                      type="date"
                      value={e.deadline ?? ''}
                      onChange={(ev) => updateEntry(e.schemeId, { deadline: ev.target.value || undefined })}
                      className="rounded-md border border-slate-300 px-2 py-1"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeEntry(e.schemeId)}
                    className="rounded-md px-2 py-1 text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300"
                  >
                    {t('Remove', 'हटाएं')}
                  </button>
                </div>
                {e.deadline !== undefined && (
                  <p className={`text-sm ${overdue ? 'font-semibold text-red-600' : 'text-slate-600'}`}>
                    {overdue ? t('Overdue: ', 'बीत चुकी: ') : ''}
                    {formatDate(e.deadline, lang)}
                  </p>
                )}
                {e.appliedOn !== undefined && (
                  <p className="text-xs text-slate-500">
                    {t('Applied on ', 'आवेदन की तिथि ')}
                    {formatDate(e.appliedOn, lang)}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-slate-300 p-4">
        <label className="flex w-full items-center gap-2 text-sm">
          <span className="text-slate-600">{t('Add scheme', 'योजना जोड़ें')}</span>
          <select
            value={pickId}
            onChange={(ev) => setPickId(ev.target.value)}
            className="flex-1 rounded-md border border-slate-300 px-2 py-1"
          >
            <option value="">{t('Select a scheme', 'योजना चुनें')}</option>
            {untracked.map((s) => (
              <option key={s.id} value={s.id}>
                {lang === 'hi' ? s.name_hi : s.name_en}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={addEntry}
          disabled={pickId === ''}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {t('Add', 'जोड़ें')}
        </button>
      </div>
    </div>
  );
}

export default Tracker;
