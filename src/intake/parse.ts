import type { Lang } from '../i18n';
import type { ChoiceOption } from './questions';

const HINDI_DIGIT_BASE = 0x0966; // ० (U+0966) .. ९ (U+096F)

/** Convert Devanagari digits to ASCII digits. */
function normalizeDigits(text: string): string {
  return text.replace(/[\u0966-\u096F]/g, (ch) =>
    String(ch.charCodeAt(0) - HINDI_DIGIT_BASE),
  );
}

/** Lowercase, trim, drop trailing punctuation and collapse whitespace. */
function normalize(text: string): string {
  return normalizeDigits(text)
    .toLowerCase()
    .replace(/[.!?,;:।]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const WORD_NUMBERS: Record<string, number> = {
  zero: 0,
  shunya: 0,
  शून्य: 0,
  one: 1,
  ek: 1,
  एक: 1,
  two: 2,
  do: 2,
  दो: 2,
  three: 3,
  teen: 3,
  तीन: 3,
  four: 4,
  char: 4,
  चार: 4,
  five: 5,
  paanch: 5,
  पाँच: 5,
  पांच: 5,
  six: 6,
  chhe: 6,
  छह: 6,
  seven: 7,
  saat: 7,
  सात: 7,
  eight: 8,
  aath: 8,
  आठ: 8,
  nine: 9,
  nau: 9,
  नौ: 9,
  ten: 10,
  das: 10,
  दस: 10,
  pachaas: 50,
  पचास: 50,
};

const MULTIPLIERS: { match: RegExp; factor: number }[] = [
  { match: /crore|करोड़|करोड/, factor: 10_000_000 },
  { match: /lakh|lac|लाख/, factor: 100_000 },
  { match: /hazar|hazaar|thousand|हज़ार|हजार/, factor: 1_000 },
  { match: /\d\s*k\b|\bk\b/, factor: 1_000 },
];

/**
 * Parse a number from free text. Handles ASCII and Devanagari digits, commas
 * (Indian grouping like 1,20,000), decimals, "lakh"/"crore"/"hazar" multipliers,
 * and a few spelled-out small numbers. Returns null when nothing usable is found.
 */
export function parseNumber(text: string): number | null {
  const norm = normalize(text);
  if (norm === '') return null;

  let factor = 1;
  for (const m of MULTIPLIERS) {
    if (m.match.test(norm)) {
      factor = m.factor;
      break;
    }
  }

  // Strip grouping commas and currency markers before looking for digits.
  const cleaned = norm.replace(/,/g, '').replace(/₹|rs\.?|rupees?|रुपये|रुपए|रु\.?/g, ' ');
  const digitMatch = cleaned.match(/\d+(\.\d+)?/);
  if (digitMatch) {
    const base = Number(digitMatch[0]);
    if (!Number.isFinite(base)) return null;
    return Math.round(base * factor * 100) / 100;
  }

  // Spelled-out number: first token that is a known word.
  for (const token of cleaned.split(' ')) {
    const word = WORD_NUMBERS[token];
    if (word !== undefined) {
      return Math.round(word * factor * 100) / 100;
    }
  }
  return null;
}

const TRUE_TOKENS = ['yes', 'y', 'yeah', 'yep', 'haan', 'ha', 'han', 'ji', 'हाँ', 'हां'];
const FALSE_TOKENS = ['no', 'n', 'nope', 'nahi', 'nahin', 'na', 'नहीं', 'नही'];

/**
 * Parse a yes/no answer by its LEADING token, so "yes, one daughter aged 6"
 * → true and "no, not yet" → false. Whole-word, case-insensitive. Returns
 * null when the answer does not start with a yes/no token.
 */
export function parseBoolean(text: string, _lang: Lang): boolean | null {
  const norm = normalize(text);
  if (norm === '') return null;
  const first = norm.split(' ')[0];
  if (TRUE_TOKENS.includes(first)) return true;
  if (FALSE_TOKENS.includes(first)) return false;
  return null;
}


/**
 * Match a free-text answer to one of the options. Accepts the option's label
 * (English or Hindi), its value, or its 1-based position number.
 */
export function parseChoice(
  text: string,
  options: ChoiceOption[],
  lang: Lang,
): ChoiceOption['value'] | null {
  const norm = normalize(text);
  if (norm === '') return null;

  if (/^\d+$/.test(norm)) {
    const index = Number(norm) - 1;
    const picked = options[index];
    return picked ? picked.value : null;
  }

  const labelKey: 'label_en' | 'label_hi' = lang === 'hi' ? 'label_hi' : 'label_en';
  const otherKey: 'label_en' | 'label_hi' = lang === 'hi' ? 'label_en' : 'label_hi';

  const exact = options.find((o) => {
    const candidates = [normalize(o[labelKey]), normalize(o[otherKey]), normalize(String(o.value))];
    return candidates.includes(norm);
  });
  if (exact) return exact.value;

  // Fall back to a single option whose label appears inside the answer.
  const contained = options.filter((o) => {
    const candidates = [normalize(o.label_en), normalize(o.label_hi)];
    return candidates.some((c) => c.length >= 3 && norm.includes(c));
  });
  if (contained.length === 1) return contained[0].value;

  return null;
}

/** Trim, collapse spaces and title-case ASCII words. Hindi text is returned unchanged in shape. */
export function parseStateName(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word) =>
      word.length > 0 && /^[a-z]/.test(word)
        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : word,
    )
    .join(' ');
}


const LAND_ZERO_PHRASES = [
  'no land',
  'none',
  'nil',
  'zero',
  'kuch nahi',
  'kuch bhi nahi',
  'koi nahi',
  'nahi hai',
  'no',
  'nahi',
  '0',
];
const LAND_ZERO_RE = new RegExp(`(^| )(${LAND_ZERO_PHRASES.join('|')})( |$)`);

/**
 * Parse land holding in acres. "none", "no land", "kuch nahi", "0" etc. → 0.
 * A zero phrase only wins when no positive number is present, so "no, 3 acres"
 * still returns 3.
 */
export function parseLandAcres(text: string): number | null {
  const norm = normalize(text);
  const n = parseNumber(text);
  if (LAND_ZERO_RE.test(norm) && (n === null || n === 0)) return 0;
  return n;
}

const ANNUAL_INCOME_MONTHLY_HINTS = [
  'month',
  'mahine',
  'mahina',
  'monthly',
  'per month',
  '/month',
  'महीने',
  'महीना',
];

/**
 * Parse annual household income. If the answer is given per month, multiply
 * by 12 ("8000 per month" → 96000).
 */
export function parseAnnualIncome(text: string): number | null {
  const n = parseNumber(text);
  if (n === null) return null;
  const lower = text.toLowerCase();
  if (ANNUAL_INCOME_MONTHLY_HINTS.some((h) => lower.includes(h))) return n * 12;
  return n;
}

const AGE_LEAD_RE = /(?:aged|age|umar|उम्र|saal|years|yrs)\s*:?\s*(\d+)/;

/**
 * Parse an age in years. Prefers a number that follows "aged"/"age"/"umar"/
 * "saal"/"years"/"yrs"; otherwise the first integer in the text.
 */
export function parseAgeNumber(text: string): number | null {
  const norm = normalize(text);
  const lead = norm.match(AGE_LEAD_RE);
  if (lead) return Number(lead[1]);
  const first = norm.match(/\d+/);
  return first ? Number(first[0]) : null;
}

