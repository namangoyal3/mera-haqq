import type { Condition, Profile, Scheme } from '../types';

export type Lang = 'en' | 'hi';

export type SchemeStatus = 'likely' | 'possible' | 'no';

export interface SchemeEvaluation {
  status: SchemeStatus;
  matchedRules: Condition[];
  failedRules: Condition[];
  missingFields: string[];
}

export interface SchemeResult extends SchemeEvaluation {
  scheme: Scheme;
}

export interface AllResults {
  likely: SchemeResult[];
  possible: SchemeResult[];
  /** Sum of annual value of likely schemes: annual_cash as-is, pension_monthly x 12. */
  totalAnnualRupees: number;
}

/** True when the profile has no value for the condition's field. */
export function conditionMissing(profile: Profile, c: Condition): boolean {
  return profile[c.field] === undefined;
}

/**
 * Returns whether the condition holds for the profile.
 * An undefined field fails every op except 'false', which matches when the field is false or undefined.
 */
export function evaluateCondition(profile: Profile, c: Condition): boolean {
  const actual = profile[c.field];

  if (c.op === 'false') {
    return actual === false || actual === undefined;
  }
  if (actual === undefined) {
    return false;
  }

  switch (c.op) {
    case 'true':
      return actual === true;
    case 'eq':
      return actual === c.value;
    case 'neq':
      return actual !== c.value;
    case 'in':
      return Array.isArray(c.value) && c.value.includes(actual);
    case 'lt':
    case 'lte':
    case 'gt':
    case 'gte': {
      if (typeof actual !== 'number' || typeof c.value !== 'number') {
        return false;
      }
      if (c.op === 'lt') return actual < c.value;
      if (c.op === 'lte') return actual <= c.value;
      if (c.op === 'gt') return actual > c.value;
      return actual >= c.value;
    }
    default:
      return false;
  }
}

/** Human-readable rule text in the requested language. */
export function explainCondition(c: Condition, lang: Lang): string {
  return lang === 'hi' ? c.label_hi : c.label_en;
}

/**
 * Evaluates one scheme's eligibility rules.
 * - 'likely': every rule passes and none is missing.
 * - 'possible': no rule fails, but at least one field is missing.
 * - 'no': at least one rule fails.
 */
export function evaluateScheme(profile: Profile, scheme: Scheme): SchemeEvaluation {
  const matchedRules: Condition[] = [];
  const failedRules: Condition[] = [];
  const missingFields: string[] = [];

  for (const c of scheme.eligibility) {
    if (conditionMissing(profile, c)) {
      if (!missingFields.includes(c.field)) missingFields.push(c.field);
      continue;
    }
    if (evaluateCondition(profile, c)) {
      matchedRules.push(c);
    } else {
      failedRules.push(c);
    }
  }

  let status: SchemeStatus;
  if (failedRules.length > 0) {
    status = 'no';
  } else if (missingFields.length > 0) {
    status = 'possible';
  } else {
    status = 'likely';
  }

  return { status, matchedRules, failedRules, missingFields };
}

/**
 * Annual rupee value of a scheme for totals.
 * Counts annual_cash as-is, pension_monthly x 12, and one_time as a single amount.
 * Excludes in_kind, loan, subsidy, and schemes with no fixed amount.
 */
export function annualValueRupees(scheme: Scheme): number {
  const amount = scheme.benefitAmountRupees;
  if (!amount) return 0;

  switch (scheme.benefitType) {
    case 'annual_cash':
      return amount;
    case 'pension_monthly':
      return amount * 12;
    case 'one_time':
      return amount;
    default:
      return 0;
  }
}

/** Evaluates all schemes and groups likely and possible ones. */
export function evaluateAll(profile: Profile, schemes: Scheme[]): AllResults {
  const likely: SchemeResult[] = [];
  const possible: SchemeResult[] = [];
  let totalAnnualRupees = 0;

  for (const scheme of schemes) {
    const evaluation = evaluateScheme(profile, scheme);
    const result: SchemeResult = { scheme, ...evaluation };

    if (evaluation.status === 'likely') {
      likely.push(result);
      totalAnnualRupees += annualValueRupees(scheme);
    } else if (evaluation.status === 'possible') {
      possible.push(result);
    }
  }

  return { likely, possible, totalAnnualRupees };
}
