// Minimal typings for the browser Web Speech API. Declared locally so the
// project compiles under strict TS without @types/dom-speech-recognition.

export interface SpeechRecognitionAlternativeLike {
  readonly transcript: string;
  readonly confidence: number;
}

export interface SpeechRecognitionResultLike {
  readonly length: number;
  readonly isFinal: boolean;
  [index: number]: SpeechRecognitionAlternativeLike;
}

export interface SpeechRecognitionResultListLike {
  readonly length: number;
  [index: number]: SpeechRecognitionResultLike;
}

export interface SpeechRecognitionEventLike {
  readonly results: SpeechRecognitionResultListLike;
}

export interface SpeechRecognitionErrorEventLike {
  readonly error: string;
  readonly message?: string;
}

export interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous?: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

interface SpeechWindow {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
}

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as SpeechWindow;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** True when the browser exposes a speech recognizer. */
export function isSpeechSupported(): boolean {
  return getCtor() !== null;
}

/**
 * Listen for a single utterance using the browser's own recognizer.
 * Audio is handled by the browser; nothing is sent by this app.
 * Returns a stop function that aborts listening.
 */
export function listenOnce(
  lang: 'hi-IN' | 'en-IN',
  onResult: (text: string) => void,
  onError: (msg: string) => void,
): () => void {
  const Ctor = getCtor();
  if (!Ctor) {
    onError('Speech recognition is not supported in this browser.');
    return () => undefined;
  }

  const recognition = new Ctor();
  recognition.lang = lang;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  let gotResult = false;

  recognition.onresult = (event: SpeechRecognitionEventLike) => {
    const first = event.results[0];
    const alt = first && first[0];
    const transcript = alt ? alt.transcript.trim() : '';
    gotResult = true;
    if (transcript !== '') {
      onResult(transcript);
    } else {
      onError('empty');
    }
  };

  recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
    gotResult = true;
    onError(event.error || 'error');
  };

  recognition.onend = () => {
    if (!gotResult) {
      onError('no-speech');
    }
  };

  try {
    recognition.start();
  } catch {
    onError('Could not start the microphone.');
    return () => undefined;
  }

  return () => {
    try {
      recognition.abort();
    } catch {
      // already stopped
    }
  };
}
