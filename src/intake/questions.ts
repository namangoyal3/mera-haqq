import type { Profile } from '../types';
import { parseAgeNumber, parseAnnualIncome, parseLandAcres } from './parse';

export interface ChoiceOption {
  value: string | number | boolean;
  label_en: string;
  label_hi: string;
}

export interface IntakeQuestion {
  id: keyof Profile;
  kind: 'number' | 'choice' | 'boolean' | 'text';
  prompt_en: string;
  prompt_hi: string;
  /** Optional small muted line shown under the prompt. */
  hint_en?: string;
  hint_hi?: string;
  options?: ChoiceOption[];
  /** Optional custom parser; when set, Intake uses it instead of the kind default. */
  parse?: (text: string, lang: 'en' | 'hi') => Profile[keyof Profile] | null;
  /** Optional gate: question is only asked when this returns true for the answers so far. */
  when?: (answers: Profile) => boolean;
}

const genderOptions: ChoiceOption[] = [
  { value: 'female', label_en: 'Female', label_hi: 'महिला' },
  { value: 'male', label_en: 'Male', label_hi: 'पुरुष' },
  { value: 'other', label_en: 'Other', label_hi: 'अन्य' },
];

const occupationOptions: ChoiceOption[] = [
  { value: 'daily_wage', label_en: 'Daily wage labour', label_hi: 'दिहाड़ी मज़दूर' },
  { value: 'farmer', label_en: 'Farmer', label_hi: 'किसान' },
  { value: 'self_employed', label_en: 'Self-employed / shop', label_hi: 'स्वरोज़गार / दुकान' },
  { value: 'salaried', label_en: 'Salaried job', label_hi: 'नौकरी (वेतन)' },
  { value: 'unemployed', label_en: 'Not working', label_hi: 'बेरोज़गार' },
  { value: 'student', label_en: 'Student', label_hi: 'छात्र' },
  { value: 'other', label_en: 'Other', label_hi: 'अन्य' },
];

const categoryOptions: ChoiceOption[] = [
  { value: 'general', label_en: 'General', label_hi: 'सामान्य' },
  { value: 'obc', label_en: 'OBC', label_hi: 'ओबीसी' },
  { value: 'sc', label_en: 'SC', label_hi: 'एससी' },
  { value: 'st', label_en: 'ST', label_hi: 'एसटी' },
  { value: 'ews', label_en: 'EWS', label_hi: 'ईडब्ल्यूएस' },
];

export const QUESTIONS: IntakeQuestion[] = [
  {
    id: 'age',
    kind: 'number',
    prompt_en: 'How old are you?',
    prompt_hi: 'आपकी उम्र कितनी है?',
    parse: parseAgeNumber,
  },
  {
    id: 'gender',
    kind: 'choice',
    prompt_en: 'What is your gender?',
    prompt_hi: 'आपका लिंग क्या है?',
    options: genderOptions,
  },
  {
    id: 'state',
    kind: 'text',
    prompt_en: 'Which state do you live in?',
    prompt_hi: 'आप किस राज्य में रहते हैं?',
  },
  {
    id: 'occupation',
    kind: 'choice',
    prompt_en: 'What kind of work do you do?',
    prompt_hi: 'आप क्या काम करते हैं?',
    options: occupationOptions,
  },
  {
    id: 'annualIncome',
    kind: 'number',
    prompt_en: 'What is your family’s total income per year, in rupees? (for example 1,20,000 or 1.2 lakh)',
    prompt_hi: 'आपके परिवार की कुल सालाना आमदनी कितने रुपये है? (जैसे 1,20,000 या 1.2 लाख)',
    hint_en: 'Yearly income in rupees. You can also say monthly, e.g. 8000 per month.',
    hint_hi: 'सालाना आय रुपये में। महीने की आय भी बता सकते हैं, जैसे 8000 महीना।',
    parse: parseAnnualIncome,
  },
  {
    id: 'familySize',
    kind: 'number',
    prompt_en: 'How many people live in your family, including you?',
    prompt_hi: 'आपके परिवार में कुल कितने लोग रहते हैं, आप सहित?',
  },
  {
    id: 'landAcres',
    kind: 'number',
    prompt_en: 'How many acres of farmland do you own? (enter 0 if none)',
    prompt_hi: 'आपके पास कितने एकड़ खेती की ज़मीन है? (न हो तो 0 लिखें)',
    parse: parseLandAcres,
  },
  {
    id: 'category',
    kind: 'choice',
    prompt_en: 'What is your social category?',
    prompt_hi: 'आपकी सामाजिक श्रेणी क्या है?',
    options: categoryOptions,
  },
  {
    id: 'disability',
    kind: 'boolean',
    prompt_en: 'Does anyone in your family have a disability?',
    prompt_hi: 'क्या परिवार में किसी को विकलांगता है?',
  },
  {
    id: 'hasGirlChild',
    kind: 'boolean',
    prompt_en: 'Do you have a daughter (girl child)?',
    prompt_hi: 'क्या आपकी कोई बेटी है?',
  },
  {
    id: 'girlChildAge',
    kind: 'number',
    prompt_en: 'How old is your daughter?',
    prompt_hi: 'आपकी बेटी की उम्र कितनी है?',
    parse: parseAgeNumber,
    when: (a) => a.hasGirlChild === true,
  },
  {
    id: 'isWidow',
    kind: 'boolean',
    prompt_en: 'Are you a widow?',
    prompt_hi: 'क्या आप विधवा हैं?',
  },
  {
    id: 'isPregnant',
    kind: 'boolean',
    prompt_en: 'Are you currently pregnant?',
    prompt_hi: 'क्या आप अभी गर्भवती हैं?',
  },
  {
    id: 'hasBankAccount',
    kind: 'boolean',
    prompt_en: 'Do you have a bank account in your name?',
    prompt_hi: 'क्या आपका अपने नाम पर बैंक खाता है?',
  },
  {
    id: 'hasBpl',
    kind: 'boolean',
    prompt_en: 'Do you have a BPL (below poverty line) card?',
    prompt_hi: 'क्या आपके पास बीपीएल (गरीबी रेखा से नीचे) कार्ड है?',
  },
  {
    id: 'hasLpgConnection',
    kind: 'boolean',
    prompt_en: 'Does your household have an LPG gas connection?',
    prompt_hi: 'क्या आपके घर में LPG गैस कनेक्शन है?',
  },
  {
    id: 'hasSchoolChildren',
    kind: 'boolean',
    prompt_en: 'Do you have a child in school (class 1 to 10)?',
    prompt_hi: 'क्या आपके घर में कोई बच्चा स्कूल (कक्षा 1 से 10) में पढ़ता है?',
  },
  {
    id: 'hasKisanCard',
    kind: 'boolean',
    prompt_en: 'Do you have a Kisan Credit Card?',
    prompt_hi: 'क्या आपके पास किसान क्रेडिट कार्ड है?',
  },
  {
    id: 'hasPuccaHouse',
    kind: 'boolean',
    prompt_en: 'Does your family have a pucca (permanent) house?',
    prompt_hi: 'क्या आपके परिवार के पास पक्का मकान है?',
  },
];
