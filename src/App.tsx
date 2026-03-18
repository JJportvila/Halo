/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  Camera, 
  Settings, 
  CheckCircle, 
  ArrowLeftRight, 
  ChevronLeft, 
  Download, 
  X, 
  Volume2, 
  RefreshCw,
  Zap,
  Check
} from 'lucide-react';
import { AppView, Language, Message } from './types';
import { LANGUAGES, DEFAULT_FROM, DEFAULT_TO } from './constants';
import { translateText } from './services/translate';

// --- Components ---

const BottomNav = ({ activeView, setView }: { activeView: AppView, setView: (v: AppView) => void }) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200/50 pb-8 pt-4 px-8 flex justify-between items-center z-50">
    <button onClick={() => setView('interpret')} className={`flex flex-col items-center gap-1 group ${activeView === 'interpret' ? 'text-sky-600' : 'text-slate-400'}`}>
      <Mic className="w-6 h-6" />
      <span className="text-[10px] font-bold uppercase">Interpret</span>
    </button>
    <button onClick={() => setView('simultaneous')} className={`flex flex-col items-center gap-1 group ${activeView === 'simultaneous' ? 'text-sky-600' : 'text-slate-400'}`}>
      <Zap className="w-6 h-6" />
      <span className="text-[10px] font-bold uppercase">Simultaneous</span>
    </button>
    <button onClick={() => setView('camera')} className={`flex flex-col items-center gap-1 group ${activeView === 'camera' ? 'text-sky-600' : 'text-slate-400'}`}>
      <Camera className="w-6 h-6" />
      <span className="text-[10px] font-bold uppercase">Camera</span>
    </button>
    <button onClick={() => setView('offline')} className={`flex flex-col items-center gap-1 group ${activeView === 'offline' ? 'text-green-600' : 'text-slate-400'}`}>
      <CheckCircle className="w-6 h-6" />
      <span className="text-[10px] font-bold uppercase">Offline</span>
    </button>
  </nav>
);

const InterpretView = ({ onFaceToFace }: { onFaceToFace: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '你好，请问去埃法特岛的游船在哪里？',
      translation: 'Halo, weples sip i go long Efate i stap?',
      fromLang: 'Chinese',
      toLang: 'Bislama',
      timestamp: Date.now()
    }
  ]);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const [currentSpeech, setCurrentSpeech] = useState('');
  const recognitionRef = useRef<any>(null);

  const handleMicClick = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition. Please try Chrome on Android or Desktop.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN'; // Defaulting to Chinese for now
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setCurrentSpeech('');
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      setCurrentSpeech(transcript);
    };

    recognition.onend = async () => {
      setIsListening(false);
      if (currentSpeech.trim()) {
        const textToTranslate = currentSpeech;
        try {
          const translation = await translateText(textToTranslate, "Chinese", "Bislama");
          const newMessage: Message = {
            id: Date.now().toString(),
            text: textToTranslate,
            translation,
            fromLang: 'Chinese',
            toLang: 'Bislama',
            timestamp: Date.now()
          };
          setMessages(prev => [...prev, newMessage]);
        } catch (error) {
          console.error("Translation failed:", error);
        }
      }
      setCurrentSpeech('');
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-sky-50 to-emerald-50">
      <header className="pt-12 pb-4 px-6 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-800/90 text-white px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide shadow-lg">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          OFFLINE MODE ACTIVE
        </div>
        <div className="flex items-center justify-between w-full max-w-sm bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100">
          <button className="flex-1 py-2 px-4 rounded-xl bg-sky-50 text-sky-700 font-bold text-sm flex items-center justify-center gap-2">
            <span className="text-lg">🇨🇳</span> Chinese
          </button>
          <div className="px-2">
            <ArrowLeftRight className="w-5 h-5 text-slate-400" />
          </div>
          <button className="flex-1 py-2 px-4 rounded-xl text-slate-600 font-bold text-sm flex items-center justify-center gap-2">
            <span className="text-lg">🇻🇺</span> Bislama
          </button>
        </div>
        <button 
          onClick={onFaceToFace}
          className="text-xs font-bold text-sky-600 uppercase tracking-wider hover:underline"
        >
          Face-to-Face Mode
        </button>
      </header>

      <main ref={scrollRef} className="flex-1 px-6 overflow-y-auto space-y-6 pb-40 pt-4">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-4">
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase ml-2 mb-1">{msg.fromLang} (Audio)</span>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-4 rounded-2xl rounded-bl-sm shadow-sm max-w-[85%] border border-slate-100"
              >
                <p className="text-lg leading-relaxed text-slate-700">{msg.text}</p>
              </motion.div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-sky-600 uppercase mr-2 mb-1">{msg.toLang} (Translation)</span>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-sky-500 p-4 rounded-2xl rounded-br-sm shadow-md max-w-[85%] text-white"
              >
                <p className="text-lg leading-relaxed font-medium">{msg.translation}</p>
              </motion.div>
              <button className="mt-2 flex items-center gap-1 text-sky-600 text-xs font-semibold mr-1">
                <Volume2 className="w-4 h-4" />
                Play Audio
              </button>
            </div>
          </div>
        ))}
        {isListening && currentSpeech && (
          <div className="flex flex-col items-start opacity-70">
            <span className="text-[10px] font-bold text-slate-400 uppercase ml-2 mb-1">Chinese (Recognizing...)</span>
            <div className="bg-white/50 p-4 rounded-2xl rounded-bl-sm border border-dashed border-sky-300 max-w-[85%]">
              <p className="text-lg leading-relaxed text-slate-500 italic">{currentSpeech}</p>
            </div>
          </div>
        )}
        {isListening && !currentSpeech && (
          <div className="flex flex-col items-start opacity-50">
            <div className="flex items-center gap-2 mb-1 ml-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Listening...</span>
            </div>
          </div>
        )}
      </main>

      <div className="fixed bottom-24 left-0 right-0 flex justify-center pointer-events-none">
        <button 
          onClick={handleMicClick}
          className={`pointer-events-auto bg-sky-500 text-white w-20 h-20 rounded-full flex items-center justify-center shadow-2xl shadow-sky-300 border-4 border-white transition-all active:scale-95 ${isListening ? 'animate-pulse scale-110 ring-8 ring-sky-200' : ''}`}
        >
          <Mic className="w-10 h-10" />
        </button>
      </div>
    </div>
  );
};

const OfflineView = ({ onBack }: { onBack: () => void }) => (
  <div className="bg-slate-50 min-h-screen text-slate-800 pb-24">
    <header className="bg-gradient-to-br from-sky-500 to-sky-600 px-6 pt-12 pb-8 rounded-b-[40px] shadow-lg sticky top-0 z-50">
      <div className="flex items-center justify-between mb-2">
        <button onClick={onBack} className="p-2 -ml-2 text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-white tracking-tight">Offline Packages</h1>
        <div className="w-10"></div>
      </div>
      <p className="text-blue-50 text-sm opacity-90 px-2">Manage your translations without data</p>
    </header>

    <main className="px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-700">Available Languages</h2>
        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">4 Total</span>
      </div>
      
      <div className="space-y-4">
        {LANGUAGES.map((lang) => (
          <article key={lang.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${lang.status === 'ready' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                  {lang.flag}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg leading-tight">{lang.name}</h3>
                  {lang.status === 'ready' ? (
                    <p className="text-xs font-medium text-emerald-600">Ready for offline use</p>
                  ) : lang.status === 'downloading' ? (
                    <p className="text-xs font-medium text-blue-500 italic">Downloading...</p>
                  ) : (
                    <p className="text-xs font-medium text-slate-400">Size: {lang.size}</p>
                  )}
                </div>
              </div>
              
              {lang.status === 'ready' ? (
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              ) : lang.status === 'downloading' ? (
                <button className="p-2 text-slate-300">
                  <X className="w-6 h-6" />
                </button>
              ) : (
                <button className="bg-slate-100 hover:bg-slate-200 transition-colors p-3 rounded-2xl group">
                  <Download className="w-6 h-6 text-slate-600 group-active:scale-90 transition-transform" />
                </button>
              )}
            </div>

            {lang.status === 'downloading' && (
              <div className="mt-4">
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${lang.progress}%` }}></div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{lang.progress}% Complete</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">85MB remaining</span>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </main>

    <footer className="fixed bottom-24 left-0 right-0 p-6 pointer-events-none">
      <div className="pointer-events-auto max-w-md mx-auto">
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-[32px] border border-white/20 shadow-xl flex items-center justify-between px-6">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Storage Used</span>
            <span className="text-sm font-bold text-slate-700">1.2 GB / 5 GB</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-200"></div>
          <button className="text-blue-600 font-bold text-sm">Clear All</button>
        </div>
      </div>
    </footer>
  </div>
);

const CameraView = ({ onBack }: { onBack: () => void }) => (
  <div className="h-screen w-full bg-black flex flex-col overflow-hidden relative">
    <header className="fixed top-0 w-full z-30 bg-black/40 backdrop-blur-md border-b border-white/10 pt-12">
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={onBack} className="text-white p-2">
          <X className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5">
          <span className="text-sm font-medium">Bislama</span>
          <ArrowLeftRight className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium">Chinese</span>
        </div>
        <button className="text-white p-2">
          <Settings className="w-6 h-6" />
        </button>
      </div>
    </header>

    <main className="relative flex-grow flex items-center justify-center overflow-hidden">
      <img 
        alt="Camera View" 
        className="absolute inset-0 w-full h-full object-cover opacity-60" 
        src="https://picsum.photos/seed/menu/1080/1920" 
        referrerPolicy="no-referrer"
      />
      
      <div className="absolute inset-0">
        <div className="absolute bg-white/90 px-2 py-1 rounded font-medium text-black text-sm" style={{ top: '30%', left: '20%' }}>瓦努阿图传统国菜 - 500</div>
        <div className="absolute bg-white/90 px-2 py-1 rounded font-medium text-black text-sm" style={{ top: '38%', left: '20%' }}>肉末包 - 200</div>
        <div className="absolute bg-white/90 px-2 py-1 rounded font-medium text-black text-sm" style={{ top: '46%', left: '20%' }}>椰子汁 - 150</div>
      </div>

      <div className="absolute inset-10 border-2 border-white/20 rounded-xl pointer-events-none">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white/80 rounded-tl-lg"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white/80 rounded-tr-lg"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white/80 rounded-bl-lg"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white/80 rounded-br-lg"></div>
      </div>
    </main>

    <section className="absolute bottom-40 w-full flex justify-center gap-8 px-6 z-20">
      <button className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10">
          <Zap className="w-5 h-5" />
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider">Flash</span>
      </button>
      <button className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center border border-white/10">
          <Check className="w-5 h-5" />
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider text-sky-500">Auto</span>
      </button>
    </section>

    <footer className="bg-black w-full pt-4 pb-12">
      <div className="flex justify-center mb-6 overflow-hidden">
        <div className="flex gap-6 text-sm font-medium text-gray-400">
          <span>TEXT</span>
          <span className="text-white border-b-2 border-white pb-1">CAMERA</span>
          <span>VOICE</span>
        </div>
      </div>
      <div className="flex items-center justify-evenly px-6">
        <div className="w-12 h-12 rounded-lg border-2 border-white/20 overflow-hidden bg-gray-800">
          <img alt="Gallery" className="w-full h-full object-cover" src="https://picsum.photos/seed/gallery/100/100" referrerPolicy="no-referrer" />
        </div>
        <button className="p-1 border-4 border-white rounded-full">
          <div className="w-16 h-16 bg-white rounded-full"></div>
        </button>
        <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10">
          <RefreshCw className="w-6 h-6" />
        </button>
      </div>
    </footer>
  </div>
);

const FaceToFaceView = ({ onBack }: { onBack: () => void }) => (
  <div className="h-screen w-full flex flex-col overflow-hidden">
    {/* Opponent View (Flipped) */}
    <section className="flex-1 flex flex-col bg-slate-50 border-b border-sky-100 relative rotate-180">
      <header className="p-4 flex justify-between items-center bg-sky-600 text-white shadow-sm">
        <span className="text-xs uppercase tracking-widest font-bold">Opponent View</span>
        <h2 className="text-xl font-bold">Bislama</h2>
        <Settings className="w-5 h-5" />
      </header>
      <div className="flex-1 p-6 flex flex-col-reverse overflow-y-auto">
        <div className="mb-4 self-start max-w-[80%]">
          <div className="bg-sky-700 text-white p-4 rounded-2xl rounded-bl-none shadow-md">
            <p className="text-lg font-medium">Halo, nem blong mi emi Alex. Mi glad tumas blong luk yu.</p>
          </div>
          <span className="text-[10px] text-gray-500 mt-1 block px-1 uppercase tracking-tight">Translated from Chinese</span>
        </div>
        <div className="mb-4 self-end max-w-[80%]">
          <div className="bg-white text-sky-700 border border-sky-200 p-4 rounded-2xl rounded-br-none shadow-sm">
            <p className="text-lg">Mi glad blong stap ya.</p>
          </div>
        </div>
      </div>
      <div className="p-6 flex flex-col items-center gap-2">
        <button className="w-20 h-20 bg-sky-600 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
          <Mic className="w-10 h-10 text-white" />
        </button>
        <p className="text-sky-600 font-semibold text-xs uppercase">Tap to speak Bislama</p>
      </div>
    </section>

    {/* User View */}
    <section className="flex-1 flex flex-col bg-white relative">
      <header className="p-4 flex justify-between items-center bg-rose-500 text-white shadow-sm">
        <button onClick={onBack} className="p-2 bg-white/20 rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold">中文 (Chinese)</h2>
        <span className="text-xs uppercase tracking-widest font-bold">My View</span>
      </header>
      <div className="flex-1 p-6 flex flex-col-reverse overflow-y-auto">
        <div className="mb-4 self-end max-w-[80%]">
          <div className="bg-rose-500 text-white p-4 rounded-2xl rounded-br-none shadow-md">
            <p className="text-xl font-medium">你好，我的名字是亚历克斯。很高兴见到你。</p>
          </div>
        </div>
        <div className="mb-4 self-start max-w-[80%]">
          <div className="bg-gray-100 text-gray-800 p-4 rounded-2xl rounded-bl-none shadow-sm">
            <p className="text-xl">我也很高兴能在这里。</p>
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block px-1 uppercase tracking-tight">Translated from Bislama</span>
        </div>
      </div>
      <div className="p-6 flex flex-col items-center gap-2">
        <button className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
          <Mic className="w-10 h-10 text-white" />
        </button>
        <p className="text-rose-500 font-semibold text-xs uppercase">点击说话 (中文)</p>
      </div>
    </section>
  </div>
);

// --- Main App ---

const SimultaneousView = ({ onBack }: { onBack: () => void }) => {
  const [isActive, setIsActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sourceText, setSourceText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [history, setHistory] = useState<{ source: string, target: string }[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startSimultaneous = () => {
    setIsActive(true);
    setSourceText("");
    setTargetText("");
    
    // Simulate real-time flow
    const phrases = [
      { s: "你好，欢迎来到瓦努阿图。", t: "Halo, welkam long Vanuatu." },
      { s: "埃法特岛是这里最大的岛屿之一。", t: "Efate emi wan long ol bigfala aelan long ples ya." },
      { s: "你可以在这里体验到最纯正的当地文化。", t: "Yu save harem olgeta kastom blong ples ya long ples ya." },
      { s: "祝你在旅途中玩得愉快！", t: "Mi hop se yu gat wan gudfala trip!" }
    ];

    let index = 0;
    const run = async () => {
      if (index < phrases.length) {
        const current = phrases[index];
        setSourceText(current.s);
        
        // Simulate translation delay
        setTimeout(() => {
          setTargetText(current.t);
          setHistory(prev => [...prev, { source: current.s, target: current.t }]);
          index++;
          timerRef.current = setTimeout(run, 3000);
        }, 1000);
      } else {
        setIsActive(false);
      }
    };

    run();
  };

  const stopSimultaneous = () => {
    setIsActive(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <header className="pt-12 pb-4 px-6 flex items-center justify-between border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold tracking-tight">Simultaneous Interpretation</h2>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto pb-40">
        <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-white/40 uppercase">Record Session</span>
            <span className="text-xs text-white/60">Save audio and transcript</span>
          </div>
          <button 
            onClick={() => setIsRecording(!isRecording)}
            className={`w-12 h-6 rounded-full relative transition-colors ${isRecording ? 'bg-rose-500' : 'bg-white/20'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isRecording ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-sky-500 uppercase">Input (Chinese)</span>
            </div>
            <div className="min-h-[100px] text-2xl font-medium leading-relaxed text-white/90">
              {sourceText || (isActive ? "Listening..." : "Tap start to begin...")}
            </div>
          </div>

          <div className="h-[1px] bg-white/10"></div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] font-bold text-emerald-500 uppercase">Output (Bislama)</span>
            </div>
            <div className="min-h-[100px] text-2xl font-medium leading-relaxed text-emerald-400">
              {targetText}
            </div>
          </div>
        </div>

        {history.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Session History</h3>
            {history.map((item, i) => (
              <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 text-sm">
                <p className="text-white/80 mb-1">{item.source}</p>
                <p className="text-emerald-400 font-medium">{item.target}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <div className="fixed bottom-24 left-0 right-0 flex justify-center p-6">
        <button 
          onClick={isActive ? stopSimultaneous : startSimultaneous}
          className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${isActive ? 'bg-rose-500 text-white' : 'bg-sky-500 text-white'}`}
        >
          {isActive ? (
            <>
              <X className="w-6 h-6" />
              Stop Interpretation
            </>
          ) : (
            <>
              <Zap className="w-6 h-6" />
              Start Simultaneous
            </>
          )}
        </button>
      </div>

      {isRecording && isActive && (
        <div className="fixed top-24 right-6 flex items-center gap-2 bg-rose-500/20 text-rose-500 px-3 py-1 rounded-full border border-rose-500/30 animate-pulse">
          <div className="w-2 h-2 rounded-full bg-rose-500"></div>
          <span className="text-[10px] font-bold uppercase">Recording</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<AppView>('interpret');

  return (
    <div className="h-screen w-full font-sans text-slate-900 bg-white overflow-hidden">
      <AnimatePresence mode="wait">
        {view === 'interpret' && (
          <motion.div 
            key="interpret"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <InterpretView onFaceToFace={() => setView('face-to-face')} />
          </motion.div>
        )}
        {view === 'simultaneous' && (
          <motion.div 
            key="simultaneous"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="h-full"
          >
            <SimultaneousView onBack={() => setView('interpret')} />
          </motion.div>
        )}
        {view === 'camera' && (
          <motion.div 
            key="camera"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="h-full"
          >
            <CameraView onBack={() => setView('interpret')} />
          </motion.div>
        )}
        {view === 'offline' && (
          <motion.div 
            key="offline"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="h-full"
          >
            <OfflineView onBack={() => setView('interpret')} />
          </motion.div>
        )}
        {view === 'face-to-face' && (
          <motion.div 
            key="face-to-face"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="h-full"
          >
            <FaceToFaceView onBack={() => setView('interpret')} />
          </motion.div>
        )}
        {view === 'settings' && (
          <motion.div 
            key="settings"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex items-center justify-center bg-slate-50"
          >
            <div className="text-center">
              <Settings className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-800">Settings</h2>
              <p className="text-slate-500">Configuration options coming soon.</p>
              <button onClick={() => setView('interpret')} className="mt-6 px-6 py-2 bg-sky-500 text-white rounded-full font-bold">Back</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {view !== 'camera' && view !== 'face-to-face' && view !== 'simultaneous' && (
        <BottomNav activeView={view} setView={setView} />
      )}
    </div>
  );
}

