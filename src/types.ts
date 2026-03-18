export type Language = {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  size?: string;
  status: 'ready' | 'downloadable' | 'downloading';
  progress?: number;
};

export type Message = {
  id: string;
  text: string;
  translation: string;
  fromLang: string;
  toLang: string;
  timestamp: number;
};

export type AppView = 'interpret' | 'camera' | 'offline' | 'face-to-face' | 'settings' | 'simultaneous';
