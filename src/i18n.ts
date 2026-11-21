export type Lang = 'en' | 'hi';

export type UIKey =
  | 'appTitle'
  | 'tagline'
  | 'startButton'
  | 'next'
  | 'back'
  | 'skip'
  | 'submit'
  | 'typeAnswer'
  | 'speakAnswer'
  | 'listening'
  | 'voiceUnsupported'
  | 'notOnDeviceNote'
  | 'langToggle'
  | 'seeResults'
  | 'startOver'
  | 'stepCounter'
  | 'yes'
  | 'no'
  | 'retryHint'
  | 'invalidAnswer';

export const UI: Record<Lang, Record<UIKey, string>> = {
  en: {
    appTitle: 'Mera Haqq',
    tagline: 'Which government schemes can you claim? Answer a few questions.',
    startButton: 'Start',
    next: 'Next',
    back: 'Back',
    skip: 'Skip',
    submit: 'Send',
    typeAnswer: 'Type your answer',
    speakAnswer: 'Speak your answer',
    listening: 'Listening…',
    voiceUnsupported: 'Voice input is not supported on this browser. Please type your answer.',
    notOnDeviceNote: 'Your answers stay on this phone. Nothing is uploaded. Never enter Aadhaar.',
    langToggle: 'Language',
    seeResults: 'See results',
    startOver: 'Start over',
    stepCounter: 'Question {current} of {total}',
    yes: 'Yes',
    no: 'No',
    retryHint: "Sorry, I didn't understand that. Please try again.",
    invalidAnswer: 'Please answer in the format shown.',
  },
  hi: {
    appTitle: 'मेरा हक़',
    tagline: 'आप कौन-कौन सी सरकारी योजनाओं का लाभ ले सकते हैं? कुछ सवालों के जवाब दीजिए।',
    startButton: 'शुरू करें',
    next: 'आगे',
    back: 'पीछे',
    skip: 'छोड़ें',
    submit: 'भेजें',
    typeAnswer: 'अपना जवाब लिखें',
    speakAnswer: 'बोलकर जवाब दें',
    listening: 'सुन रहे हैं…',
    voiceUnsupported: 'इस ब्राउज़र में बोलकर जवाब देना उपलब्ध नहीं है। कृपया लिखकर जवाब दें।',
    notOnDeviceNote: 'आपके जवाब इसी फ़ोन में रहते हैं। कुछ भी अपलोड नहीं होता। आधार नंबर कभी न डालें।',
    langToggle: 'भाषा',
    seeResults: 'नतीजे देखें',
    startOver: 'फिर से शुरू करें',
    stepCounter: 'सवाल {current} / {total}',
    yes: 'हाँ',
    no: 'नहीं',
    retryHint: 'माफ़ कीजिए, यह समझ नहीं आया। कृपया फिर से कोशिश करें।',
    invalidAnswer: 'कृपया दिखाए गए तरीके से जवाब दें।',
  },
};
