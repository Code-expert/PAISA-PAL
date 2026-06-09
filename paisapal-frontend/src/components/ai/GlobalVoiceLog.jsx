import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, X, Loader2, Globe, Volume2, VolumeX } from 'lucide-react';
import { useChatWithAIMutation } from '../../services/aiApi';
import { toast } from 'react-hot-toast';

export default function GlobalVoiceLog() {
  const [isListening, setIsListening] = useState(false);
  const [showFallbackText, setShowFallbackText] = useState(false);
  const [inputText, setInputText] = useState('');
  const [language, setLanguage] = useState('en-US'); // Default English
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const recognitionRef = useRef(null);

  const [chatWithAI, { isLoading }] = useChatWithAIMutation();

  const speakResponse = (text, lang) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    // Remove emojis and asterisks for better speech
    utterance.text = text.replace(/[\u{1F600}-\u{1F6FF}]/gu, '').replace(/\*/g, '');
    utterance.lang = lang === 'hi-IN' ? 'hi-IN' : 'en-US';
    utterance.rate = 1.0;
    
    window.speechSynthesis.speak(utterance);
  };

  const handleLogExpense = async (text) => {
    if (!text.trim()) return;
    
    try {
      const response = await chatWithAI({
        message: text,
        context: {
          transactions: [],
          budgets: [],
          user_goals: []
        }
      }).unwrap();

      const replyMsg = response.message || "Successfully logged!";
      toast.success(replyMsg, { duration: 4000 });
      speakResponse(replyMsg, language);
      
      setInputText('');
      setShowFallbackText(false);
    } catch (error) {
      toast.error("Failed to process expense. Please try again.");
      speakResponse("Failed to process. Please try again.", language);
    }
  };

  const startListening = async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error('Voice recognition unsupported. Switching to text.');
      setShowFallbackText(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error('Microphone permission error:', err);
      toast.error('Microphone blocked or not found. Please allow access.');
      setShowFallbackText(true);
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    // Stop any ongoing TTS before listening
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language; // Uses hi-IN or en-US

    recognition.onstart = () => {
      setIsListening(true);
      toast(`Listening in ${language === 'hi-IN' ? 'Hindi' : 'English'}...`, { icon: '🎙️', duration: 2000 });
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      handleLogExpense(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        toast.error('Microphone blocked. Please type instead.', { duration: 3000 });
      } else {
        toast.error(`Voice failed (${event.error}). Please type instead.`, { duration: 3000 });
      }
      setShowFallbackText(true);
    };

    recognition.onend = () => setIsListening(false);

    try {
      recognition.start();
    } catch (e) {
      setIsListening(false);
      setShowFallbackText(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleLogExpense(inputText);
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en-US' ? 'hi-IN' : 'en-US');
    toast.success(`Switched to ${language === 'en-US' ? 'Hindi' : 'English'}`, { icon: '🌐' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Settings Panel (Visible when typing fallback is shown) */}
      {showFallbackText && (
        <div className="bg-surface-container-high shadow-xl rounded-full px-4 py-2 flex items-center gap-3 border border-outline-variant animate-in slide-in-from-bottom-5 mb-2">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            <Globe className="w-4 h-4" />
            {language === 'en-US' ? 'EN' : 'HI'}
          </button>
          <div className="w-[1px] h-4 bg-outline-variant"></div>
          <button 
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            {voiceEnabled ? 'Voice On' : 'Voice Off'}
          </button>
        </div>
      )}

      {/* Fallback Text Input Bar */}
      {showFallbackText && (
        <div className="bg-surface-container-high shadow-2xl rounded-2xl p-2 flex items-center gap-2 border border-outline-variant animate-in slide-in-from-bottom-5">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={language === 'hi-IN' ? "Type 'Uber pe 500 kharch kiye'..." : "Type 'Spent 500 on Uber'..."}
            className="bg-transparent text-on-surface placeholder:text-on-surface-variant px-3 py-2 outline-none w-64"
            autoFocus
          />
          <button
            onClick={() => handleLogExpense(inputText)}
            disabled={!inputText.trim() || isLoading}
            className="p-2 bg-primary text-on-primary rounded-xl hover:brightness-110 disabled:opacity-50 transition-all"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => setShowFallbackText(false)}
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Primary FAB */}
      <button
        onClick={showFallbackText ? () => setShowFallbackText(false) : startListening}
        onContextMenu={(e) => { e.preventDefault(); toggleLanguage(); }}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          isListening 
            ? 'bg-red-500 text-white animate-pulse scale-110 shadow-red-500/50' 
            : 'bg-primary text-on-primary hover:scale-105 hover:brightness-110'
        }`}
        title="Right-click to toggle language"
      >
        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <div className="relative">
            <Mic className="w-6 h-6" />
            <span className="absolute -bottom-2 -right-2 text-[10px] font-bold bg-surface-container-highest text-on-surface rounded-full px-1">
              {language === 'hi-IN' ? 'HI' : 'EN'}
            </span>
          </div>
        )}
      </button>
    </div>
  );
}
