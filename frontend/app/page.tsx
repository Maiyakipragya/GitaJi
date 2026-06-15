'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Volume2, BookOpen, LogIn, Menu, X, Mic } from 'lucide-react';

type MessageType = 'user' | 'ai';
type Theme = 'peacock' | 'ancient' | 'dark' | 'light';
type Language = 'en' | 'hi' | 'sa';

interface Message {
  id: string;
  type: MessageType;
  content: string;
}

const TRANSLATIONS = {
  en: { placeholder: "Type your thoughts here...", greeting: "RAADHEY RAADHEY! I am GitaJi. How may I guide your path today?", login: "Welcome to GitaJi", email: "Email", pass: "Password", name: "Name", signIn: "Sign In", signUp: "Sign Up" },
  hi: { placeholder: "अपने विचार यहाँ लिखें...", greeting: "राधे राधे! मैं गीताजी हूँ। आज मैं आपका मार्गदर्शन कैसे कर सकती हूँ?", login: "गीताजी में आपका स्वागत है", email: "ईमेल", pass: "पासवर्ड", name: "पूरा नाम", signIn: "लॉग इन", signUp: "खाता बनाएं" },
  sa: { placeholder: "भवान् अत्र स्वविचारान् लिखतु...", greeting: "राधे राधे! अहं गीताजी अस्मि।", login: "स्वागतम्", email: "ईपत्रम्", pass: "सङ्केतशब्दः", name: "पूर्णं नाम", signIn: "प्रविशतु", signUp: "पञ्जीकरणं करोतु" }
};

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');
  const [messages, setMessages] = useState<Message[]>([{ id: '0', type: 'ai', content: TRANSLATIONS['en'].greeting }]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<Theme>('peacock');
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
  const [neurodivergentMode, setNeurodivergentMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 1 && messages[0].id === '0') {
      setMessages([{ id: '0', type: 'ai', content: TRANSLATIONS[language].greeting }]);
    }
  }, [language]);

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setInputValue(currentTranscript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = inputValue;
    setMessages((prev) => [...prev, { id: Date.now().toString(), type: 'user', content: userMsg }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Network Error');
      
      setMessages((prev) => [...prev, { id: Date.now().toString(), type: 'ai', content: data.response }]);

      if (voiceOutputEnabled) {
        const utterance = new SpeechSynthesisUtterance(data.response);
        window.speechSynthesis.speak(utterance);
      }
    } catch (error: any) {
      setMessages((prev) => [...prev, { id: Date.now().toString(), type: 'ai', content: "I am unable to reach the wisdom servers at this moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const isLight = theme === 'light';
  const getBackgroundStyle = () => {
    if (neurodivergentMode) return 'bg-[#FFFDD0] text-black'; 
    if (theme === 'peacock') return 'bg-gradient-to-br from-emerald-950 via-blue-950 to-indigo-950 text-white';
    if (theme === 'ancient') return 'bg-gradient-to-br from-amber-950 via-yellow-900 to-orange-950 text-white';
    if (isLight) return 'bg-slate-50 text-slate-900';
    return 'bg-gray-950 text-white'; 
  };

  const getBubbleStyle = (type: MessageType) => {
    if (neurodivergentMode) return type === 'user' ? 'bg-blue-200 border-2 border-black text-black' : 'bg-white border-2 border-black text-black';
    if (isLight) return type === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-slate-800';
    return type === 'user' ? 'bg-blue-600 bg-opacity-40 border border-blue-500 text-white' : 'bg-gray-800 bg-opacity-60 border border-gray-600 text-white';
  };

  const headerBg = isLight ? 'bg-white border-gray-300' : 'bg-black bg-opacity-10 backdrop-blur-md border-gray-500 text-white';

  return (
    <div className={`flex h-screen w-full transition-all duration-300 ${getBackgroundStyle()}`}>
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white p-8 rounded-2xl w-96 text-slate-900">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{TRANSLATIONS[language].login}</h2>
              <button onClick={() => setShowLoginModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{TRANSLATIONS[language].email}</label>
                <input type="email" required className="w-full px-4 py-2 border rounded-lg outline-none" />
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                {TRANSLATIONS[language].signIn}
              </button>
            </form>
          </div>
        </div>
      )}

      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} flex-shrink-0 transition-all duration-300 ${isLight ? 'bg-slate-100' : 'bg-black bg-opacity-20'} border-r overflow-hidden`}>
        <div className="p-4 space-y-4 w-64">
          <h2 className="text-xl font-bold">History</h2>
          <button
  onClick={() =>
    setMessages([
      {
        id: '0',
        type: 'ai',
        content: TRANSLATIONS[language].greeting,
      },
    ])
  }
  className="w-full p-2 rounded-lg bg-blue-600 text-white font-bold"
>
  + New Chat
</button>
          {!isLoggedIn ? (
            <button onClick={() => setShowLoginModal(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-bold">
              <LogIn size={18} /> Login
            </button>
          ) : (
            <div className="p-3 bg-green-500 bg-opacity-20 text-green-700 rounded-lg text-center font-medium">✓ Logged In</div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className={`flex justify-between items-center p-4 border-b z-10 ${headerBg}`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen ? <X size={24} /> : <Menu size={24} />}</button>
            <h1 className="text-2xl font-bold">🕉️ GitaJi</h1>
          </div>
          <div className="flex items-center gap-3">
            <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="p-2 rounded border bg-white text-black outline-none">
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="sa">संस्कृत</option>
            </select>
            <button onClick={() => setVoiceOutputEnabled(!voiceOutputEnabled)} className={`p-2 rounded-lg border ${voiceOutputEnabled ? 'bg-blue-500' : 'border-transparent'}`}><Volume2 size={24} /></button>
            <button onClick={() => setNeurodivergentMode(!neurodivergentMode)} className={`p-2 rounded-lg border ${neurodivergentMode ? 'bg-amber-500' : 'border-transparent'}`}><BookOpen size={24} /></button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl px-5 py-4 rounded-2xl ${getBubbleStyle(message.type)}`}>
                <p className={`whitespace-pre-wrap ${neurodivergentMode ? 'font-serif text-xl' : 'text-base'}`}>{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </main>

        <footer className={`p-4 border-t z-10 ${headerBg}`}>
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto">
            <button type="button" onClick={startListening} className={`p-3 rounded flex items-center gap-2 ${isListening ? 'bg-red-600 text-white' : 'hover:bg-gray-500 hover:bg-opacity-30'}`}>
              <Mic size={20} />
            </button>
            <input 
              type="text" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
              disabled={isLoading}
              placeholder={TRANSLATIONS[language].placeholder} 
              className={`flex-1 px-4 py-3 rounded-lg border outline-none ${neurodivergentMode ? 'bg-white text-black font-serif text-lg border-black border-2' : 'bg-transparent'}`} 
            />
            <button type="submit" disabled={!inputValue.trim() || isLoading} className="px-6 py-3 rounded-lg font-bold bg-blue-600 text-white disabled:opacity-50">
              <Send size={20} />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}