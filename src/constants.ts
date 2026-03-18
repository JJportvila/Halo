import { Language } from './types';

export const LANGUAGES: Language[] = [
  { id: 'bi', name: 'Bislama', nativeName: 'Bislama', flag: '🇻🇺', status: 'ready' },
  { id: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', status: 'downloading', progress: 65 },
  { id: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', status: 'downloadable', size: '450 MB' },
  { id: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', status: 'downloadable', size: '420 MB' },
];

export const DEFAULT_FROM = LANGUAGES[1]; // Chinese
export const DEFAULT_TO = LANGUAGES[0];   // Bislama
