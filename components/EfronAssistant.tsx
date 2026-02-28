
import React, { useState, useEffect, useRef } from 'react';
import { GeminiService } from '../services/geminiService.ts';
import { ThemeConfig } from '../types.ts';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

interface EfronAssistantProps {
  themeConfig: ThemeConfig;
}

const gemini = new GeminiService();

export default function EfronAssistant({ themeConfig }: EfronAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Olá! Eu sou Efron.IA. Como posso ajudar você hoje com suas estratégias no Venom.b55?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const responseText = await gemini.chatWithEfron(text, []);
      setIsTyping(false);

      if (responseText) {
        const assistantMessage: Message = { role: 'assistant', text: responseText };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'assistant', text: 'Desculpe, tive um erro técnico. Pode repetir?' }]);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-180px)]">
      {/* Header / Status */}
      <div className="glass-card rounded-3xl p-6 mb-4 flex items-center justify-between border-accent/20">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-black text-primary uppercase tracking-wider">Efron.IA</h2>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${isTyping ? 'bg-accent animate-pulse' : 'bg-emerald-500'}`}></span>
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                {isTyping ? 'Analisando...' : 'Online'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 px-2 mb-4 scroll-smooth"
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed relative ${
              msg.role === 'user' 
                ? 'bg-accent text-black font-bold rounded-tr-none' 
                : 'glass-card border-white/5 text-primary rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="glass-card border-white/5 rounded-2xl px-4 py-3 rounded-tl-none">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="glass-card rounded-3xl p-2 flex items-center gap-2 border-white/5">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
          placeholder="Pergunte algo sobre o mercado..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-xs px-4 py-3 text-primary placeholder:text-secondary/50"
        />
        <button 
          onClick={() => handleSend(input)}
          className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center text-black active:scale-90 transition-all shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>

      {/* Quick Suggestions */}
      <div className="flex gap-2 mt-4 overflow-x-auto pb-2 no-scrollbar">
        {[
          "Como pegar vela rosa?",
          "Dicas de gestão",
          "Melhor horário hoje",
          "O que é payout?"
        ].map((hint, i) => (
          <button 
            key={i}
            onClick={() => handleSend(hint)}
            className="whitespace-nowrap px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-secondary hover:text-accent hover:border-accent/30 transition-all active:scale-95"
          >
            {hint}
          </button>
        ))}
      </div>
    </div>
  );
}
