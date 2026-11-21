import { useEffect, useRef, useState } from 'react';
import type { Profile } from '../types';
import { UI, type Lang } from '../i18n';
import { QUESTIONS, type IntakeQuestion } from '../intake/questions';
import { parseBoolean, parseChoice, parseNumber, parseStateName } from '../intake/parse';
import { isSpeechSupported, listenOnce } from '../speech';

export interface IntakeProps {
  lang: Lang;
  onDone: (profile: Profile) => void;
  onLangChange: (l: Lang) => void;
}

type Value = Profile[keyof Profile];

/** Questions that apply given the answers so far (honours `when` gates). */
function activeQuestions(answers: Profile): IntakeQuestion[] {
  return QUESTIONS.filter((q) => !q.when || q.when(answers));
}

function withAnswer(answers: Profile, id: keyof Profile, value: Value | undefined): Profile {
  return { ...answers, [id]: value } as Profile;
}

function parseAnswer(q: IntakeQuestion, text: string, lang: Lang): Value | null {
  switch (q.kind) {
    case 'number':
      return parseNumber(text);
    case 'boolean':
      return parseBoolean(text, lang);
    case 'text': {
      const name = parseStateName(text);
      return name === '' ? null : name;
    }
    case 'choice':
      return q.options ? parseChoice(text, q.options, lang) : null;
  }
}

export default function Intake({ lang, onDone }: IntakeProps) {
  const [answers, setAnswers] = useState<Profile>({});
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState('');
  const [retry, setRetry] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceNote, setVoiceNote] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);

  const t = UI[lang];
  const voiceOk = isSpeechSupported();
  const questions = activeQuestions(answers);
  const idx = Math.min(step, questions.length - 1);
  const current = questions[idx];

  useEffect(() => {
    return () => {
      stopRef.current?.();
    };
  }, []);

  function stopListening() {
    stopRef.current?.();
    stopRef.current = null;
    setListening(false);
  }

  /** Record an answer (undefined = skipped) and move on, or finish. */
  function commit(value: Value | undefined) {
    if (!current) return;
    stopListening();
    const next = withAnswer(answers, current.id, value);
    const remaining = activeQuestions(next);
    if (idx + 1 >= remaining.length) {
      onDone(next);
      return;
    }
    setAnswers(next);
    setStep(idx + 1);
    setDraft('');
    setRetry(false);
    setVoiceNote(false);
  }

  function submitText() {
    if (!current) return;
    const value = parseAnswer(current, draft, lang);
    if (value === null) {
      setRetry(true);
      return;
    }
    commit(value);
  }

  function goBack() {
    if (idx === 0) return;
    stopListening();
    setStep(idx - 1);
    setDraft('');
    setRetry(false);
    setVoiceNote(false);
  }

  function finishEarly() {
    stopListening();
    onDone(answers);
  }

  function toggleMic() {
    if (listening) {
      stopListening();
      return;
    }
    setVoiceNote(false);
    setListening(true);
    let cancelled = false;
    const stop = listenOnce(
      lang === 'hi' ? 'hi-IN' : 'en-IN',
      (text) => {
        if (cancelled) return;
        stopRef.current = null;
        setListening(false);
        setDraft(text);
        setRetry(false);
      },
      () => {
        if (cancelled) return;
        stopRef.current = null;
        setListening(false);
        setVoiceNote(true);
      },
    );
    stopRef.current = () => {
      cancelled = true;
      stop();
    };
  }

  if (!current) {
    return null;
  }

  const prompt = lang === 'hi' ? current.prompt_hi : current.prompt_en;
  const counter = t.stepCounter
    .replace('{current}', String(idx + 1))
    .replace('{total}', String(questions.length));

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-5 p-4">
      <div className="flex items-center justify-between text-sm font-medium text-stone-600">
        <span>{counter}</span>
        <button
          type="button"
          onClick={finishEarly}
          className="tap rounded-2xl px-3 font-semibold text-teal-800 underline underline-offset-4"
        >
          {t.seeResults}
        </button>
      </div>

      <h2 className="text-2xl font-semibold leading-snug text-stone-900">{prompt}</h2>

      {retry && (
        <p role="alert" className="rounded-2xl bg-amber-100 p-3 text-base text-amber-900">
          {t.retryHint}
        </p>
      )}
      {voiceNote && (
        <p role="alert" className="rounded-2xl bg-amber-100 p-3 text-base text-amber-900">
          {t.retryHint}
        </p>
      )}

      {current.kind === 'choice' && current.options && (
        <div className="grid gap-3">
          {current.options.map((o) => (
            <button
              key={String(o.value)}
              type="button"
              onClick={() => commit(o.value)}
              className="tap rounded-2xl border-2 border-teal-700 bg-white px-4 py-3 text-left text-lg font-medium text-stone-900 active:bg-teal-50"
            >
              {lang === 'hi' ? o.label_hi : o.label_en}
            </button>
          ))}
        </div>
      )}

      {current.kind === 'boolean' && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => commit(true)}
            className="tap rounded-2xl bg-teal-700 px-4 py-3 text-lg font-semibold text-white active:bg-teal-800"
          >
            {t.yes}
          </button>
          <button
            type="button"
            onClick={() => commit(false)}
            className="tap rounded-2xl border-2 border-stone-400 bg-white px-4 py-3 text-lg font-semibold text-stone-800 active:bg-stone-100"
          >
            {t.no}
          </button>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitText();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t.typeAnswer}
          aria-label={t.typeAnswer}
          inputMode={current.kind === 'number' ? 'numeric' : 'text'}
          autoComplete="off"
          className="tap min-w-0 flex-1 rounded-2xl border-2 border-stone-300 bg-white px-4 text-lg text-stone-900 focus:border-teal-600 focus:outline-none"
        />
        {voiceOk && (
          <button
            type="button"
            onClick={toggleMic}
            aria-pressed={listening}
            aria-label={listening ? t.listening : t.speakAnswer}
            className={`tap rounded-2xl px-4 text-lg font-semibold text-white ${
              listening ? 'bg-red-600 animate-pulse' : 'bg-amber-500 active:bg-amber-600'
            }`}
          >
            {listening ? t.listening : '🎤'}
          </button>
        )}
        <button
          type="submit"
          className="tap rounded-2xl bg-teal-700 px-5 text-lg font-semibold text-white active:bg-teal-800"
        >
          {t.submit}
        </button>
      </form>
      {!voiceOk && <p className="text-sm text-stone-600">{t.voiceUnsupported}</p>}

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={goBack}
          disabled={idx === 0}
          className="tap rounded-2xl px-4 text-lg font-medium text-teal-800 disabled:opacity-40"
        >
          ← {t.back}
        </button>
        <button
          type="button"
          onClick={() => commit(undefined)}
          className="tap rounded-2xl px-4 text-lg font-medium text-stone-700 underline underline-offset-4"
        >
          {t.skip}
        </button>
      </div>
    </section>
  );
}
