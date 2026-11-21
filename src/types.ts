export type Occupation =
  | 'daily_wage'
  | 'farmer'
  | 'self_employed'
  | 'salaried'
  | 'unemployed'
  | 'student'
  | 'other';

export type Category = 'general' | 'obc' | 'sc' | 'st' | 'ews';

export type Gender = 'female' | 'male' | 'other';

export interface Profile {
  age?: number;
  state?: string;
  occupation?: Occupation;
  annualIncome?: number;
  familySize?: number;
  landAcres?: number;
  category?: Category;
  disability?: boolean;
  hasGirlChild?: boolean;
  girlChildAge?: number;
  isWidow?: boolean;
  isPregnant?: boolean;
  hasBankAccount?: boolean;
  hasBpl?: boolean;
  hasKisanCard?: boolean;
  isBelowPovertyCardHolder?: boolean;
  hasPuccaHouse?: boolean;
  gender?: Gender;
}

export type ConditionOp =
  | 'eq'
  | 'neq'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'in'
  | 'true'
  | 'false';

export interface Condition {
  field: keyof Profile;
  op: ConditionOp;
  value?: unknown;
  label_en: string;
  label_hi: string;
}

export type BenefitType =
  | 'annual_cash'
  | 'one_time'
  | 'in_kind'
  | 'subsidy'
  | 'loan'
  | 'pension_monthly';

export interface Scheme {
  id: string;
  name_en: string;
  name_hi: string;
  ministry: string;
  description_en: string;
  description_hi: string;
  benefitAmountRupees: number;
  benefitType: BenefitType;
  benefitDetail_en: string;
  benefitDetail_hi: string;
  /** All conditions must match for the scheme to be "likely eligible". */
  eligibility: Condition[];
  documents_en: string[];
  documents_hi: string[];
  applySteps_en: string[];
  applySteps_hi: string[];
  officialUrl: string;
  /** ISO date (YYYY-MM-DD) */
  lastVerified: string;
  deadline?: string;
  notes?: string;
  sourceNotes?: string;
}
