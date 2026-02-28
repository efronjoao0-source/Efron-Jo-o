
import React, { useState, useEffect, useCallback } from 'react';
import { AppScreen, CandleType, Signal, BettingHouse, SignalStatus, GraphStatus, ThemeConfig, SupportMessage, AgendaItem, PlatformNotification } from './types.ts';
import { BETTING_HOUSES } from './constants.tsx';
import Layout from './components/Layout.tsx';
import SignalHistory from './components/SignalHistory.tsx';
import EfronAssistant from './components/EfronAssistant.tsx';
import { GoogleGenAI } from "@google/genai";

const PREDEFINED_THEMES: ThemeConfig[] = [
  { id: 'venom', name: 'Venom Elite', mode: 'dark', accentColor: '#00FF9D', brightness: 100, contrast: 100 },
  { id: 'cyber', name: 'Cyber Blue', mode: 'dark', accentColor: '#00D1FF', brightness: 110, contrast: 105 },
  { id: 'royal', name: 'Royal Gold', mode: 'dark', accentColor: '#FFD700', brightness: 100, contrast: 110 },
  { id: 'neon', name: 'Neon Purple', mode: 'dark', accentColor: '#BD00FF', brightness: 100, contrast: 100 },
  { id: 'nova', name: 'Light Nova', mode: 'light', accentColor: '#00FF9D', brightness: 100, contrast: 100 }
];

const GLOBAL_ALERTS = [
  { type: 'info', message: 'Sincronização com Elephant Bet otimizada v5.5.2' },
  { type: 'alert', message: 'Volume alto detectado na Premier Bet - Ciclo de Rosa iminente!' },
  { type: 'success', message: 'Script Venom.hack-v5.5 operando com 99.4% de precisão.' },
  { type: 'critical', message: 'Instabilidade no servidor Olá Bet - Evite entradas grandes agora.' },
  { type: 'info', message: 'Agenda Elite atualizada com novos padrões de Moçambique.' }
];

const LOCAL_STRATEGIES = [
  "Aguarde 3 velas azuis seguidas para recuperação.",
  "Ciclo de retenção: Reduza banca e busque 1.50x.",
  "Padrão de escada: Momento para velas de 2.0x.",
  "O gráfico tende a corrigir após rosas.",
  "Evite entradas após velas acima de 50x.",
  "Foque em horários de pico (18h-21h).",
  "Estratégia 2 min: Entre no 2º min após roxa.",
  "Gestão: Proteja capital e jogue com lucro."
];

const INITIAL_AGENDA_DATA: AgendaItem[] = BETTING_HOUSES.map(h => {
  const paying = 45 + Math.random() * 45;
  return {
    id: h.id,
    house: h.name,
    logo: h.logo,
    paying: paying,
    reclining: 100 - paying,
    graphStatus: (paying > 75 ? 'BOM' : paying > 55 ? 'RAZOAVEL' : 'RUIM') as GraphStatus,
    graphAnalysis: 'Ativo',
    efronInsight: LOCAL_STRATEGIES[Math.floor(Math.random() * LOCAL_STRATEGIES.length)],
    isAnalyzing: false,
    isGraphAnalyzing: false
  };
});

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<AppScreen>(AppScreen.HOUSE_SELECTION);
  const [selectedHouse, setSelectedHouse] = useState<BettingHouse | null>(null);
  const [selectedCandle, setSelectedCandle] = useState<CandleType>(CandleType.PURPLE);
  const [numSignals, setNumSignals] = useState<number>(10);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [notifications, setNotifications] = useState<PlatformNotification[]>([]);
  const [toast, setToast] = useState<{ show: boolean, message: string }>({ show: false, message: '' });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [agendaData, setAgendaData] = useState<AgendaItem[]>([]);

  const [settings, setSettings] = useState({
    precision: 99.4,
    minInterval: 2,
    autoScan: true,
    algorithm: 'Venom.hack-v5.5'
  });

  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(PREDEFINED_THEMES[0]);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    };
    checkApiKey();
  }, []);

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  useEffect(() => {
    setAgendaData(INITIAL_AGENDA_DATA);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (themeConfig.mode === 'dark') {
      root.style.setProperty('--bg-color', '#05070a');
      root.style.setProperty('--card-bg', 'rgba(15, 23, 42, 0.4)');
      root.style.setProperty('--text-primary', '#f8fafc');
      root.style.setProperty('--text-secondary', '#94a3b8');
    } else {
      root.style.setProperty('--bg-color', '#f8fafc');
      root.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.8)');
      root.style.setProperty('--text-primary', '#0f172a');
      root.style.setProperty('--text-secondary', '#475569');
    }
    root.style.setProperty('--accent-color', themeConfig.accentColor);
    root.style.setProperty('--brightness', `${themeConfig.brightness}%`);
    root.style.setProperty('--contrast', `${themeConfig.contrast}%`);
  }, [themeConfig]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const triggerRandomAlert = () => {
      const alertTemplate = GLOBAL_ALERTS[Math.floor(Math.random() * GLOBAL_ALERTS.length)];
      const newNotif: PlatformNotification = {
        id: Math.random().toString(36).substring(7),
        type: alertTemplate.type as any,
        message: alertTemplate.message,
        timestamp: Date.now()
      };
      setNotifications(prev => [newNotif, ...prev].slice(0, 3));
      
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
      }, 8000);
    };

    const interval = setInterval(triggerRandomAlert, 25000);
    setTimeout(triggerRandomAlert, 2000);
    return () => clearInterval(interval);
  }, []);

  const triggerToast = (message: string) => {
    setToast({ show: true, message: message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const analyzeManually = (id: string) => {
    setAgendaData(prev => prev.map(h => h.id === id ? { ...h, isGraphAnalyzing: true } : h));
    setTimeout(() => {
      setAgendaData(prev => prev.map(h => {
        if (h.id === id) {
          const newPaying = 30 + Math.random() * 65;
          return {
            ...h,
            paying: newPaying,
            reclining: 100 - newPaying,
            graphStatus: (newPaying > 75 ? 'BOM' : newPaying > 55 ? 'RAZOAVEL' : 'RUIM') as GraphStatus,
            isGraphAnalyzing: false
          };
        }
        return h;
      }));
      triggerToast("Análise de Ciclo Concluída!");
    }, 1200);
  };

  const analyzeAll = () => {
    setIsGlobalLoading(true);
    setTimeout(() => {
      setAgendaData(prev => prev.map(h => {
        const newPaying = 35 + Math.random() * 60;
        return {
          ...h,
          paying: newPaying,
          reclining: 100 - newPaying,
          graphStatus: (newPaying > 75 ? 'BOM' : newPaying > 55 ? 'RAZOAVEL' : 'RUIM') as GraphStatus,
          efronInsight: LOCAL_STRATEGIES[Math.floor(Math.random() * LOCAL_STRATEGIES.length)]
        };
      }));
      setIsGlobalLoading(false);
      triggerToast("Agenda Recalculada!");
    }, 1500);
  };

  const copyQuickAgenda = (item: AgendaItem) => {
    const text = `🏛️ *CASA:* ${item.house}\n📈 *PAYOUT:* ${item.paying.toFixed(0)}%\n📊 *STATUS:* ${item.graphStatus}\n🕒 *HORA:* ${new Date().toLocaleTimeString()}\n\n🤖 *venom.b55(hack)*`;
    navigator.clipboard.writeText(text);
    triggerToast("Status Copiado!");
  };

  const copyAgendaFull = (item: AgendaItem) => {
    const text = `💎 *VENOM.HACK - AGENDA* 💎\n\n🏛️ *CASA:* ${item.house.toUpperCase()}\n📊 *STATUS:* ${item.graphStatus}\n📈 *PAYOUT:* ${item.paying.toFixed(0)}%\n🛡️ *INSIGHT:* "${item.efronInsight}"\n🕒 *HORA:* ${new Date().toLocaleTimeString()}\n\n🤖 *venom.b55(hack)*`;
    navigator.clipboard.writeText(text);
    triggerToast("Agenda Pro Copiada!");
  };

  const shareAgendaFull = () => {
    const text = `💎 *VENOM.HACK - STATUS* 💎\n\n` + 
      agendaData.map(item => `🏛️ ${item.house}: ${item.paying.toFixed(0)}% [${item.graphStatus}]`).join('\n') + 
      `\n\n🤖 *venom.b55(hack) Pro*`;
    if (navigator.share) {
      navigator.share({ title: 'Status Venom', text: text }).catch(() => triggerToast("Erro ao compartilhar"));
    } else {
      navigator.clipboard.writeText(text);
      triggerToast("Copiado!");
    }
  };

  const generateSignals = useCallback(() => {
    if (!selectedHouse) return;
    const finalNum = Math.min(5600, numSignals);
    setIsGlobalLoading(true);
    setTimeout(() => {
      const newSignals: Signal[] = [];
      const now = new Date();
      
      // Ajuste de intervalo para velas de 5x (PINK)
      // Velas de 5x são mais raras, então aumentamos o intervalo para parecer mais "calculado"
      const baseInterval = selectedCandle === CandleType.PINK ? 12 : settings.minInterval;
      const initialOffset = selectedCandle === CandleType.PINK ? 8 : 2;
      const basePrecision = selectedCandle === CandleType.PINK ? 99.7 : settings.precision;

      for (let i = 0; i < finalNum; i++) {
        const randomSeconds = Math.floor(Math.random() * 60);
        // Adicionamos uma pequena variação aleatória no intervalo para não ser perfeitamente linear
        const jitter = selectedCandle === CandleType.PINK ? Math.floor(Math.random() * 5) : 0;
        const time = new Date(now.getTime() + (i * baseInterval + initialOffset + jitter) * 60000 + (randomSeconds * 1000));
        
        newSignals.push({
          id: Math.random().toString(36).substring(7),
          time: time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          timestamp: time.getTime(),
          house: selectedHouse.name,
          type: selectedCandle,
          probability: basePrecision + (Math.random() * (99.9 - basePrecision)),
          multiplier: selectedCandle === CandleType.PINK ? "5.0x+" : "2.0x+",
          status: SignalStatus.WAITING
        });
      }
      setSignals(newSignals);
      setIsGlobalLoading(false);
      triggerToast(selectedCandle === CandleType.PINK ? "Hack de Alta Precisão Ativado!" : "Sinais Gerados!");
      setActiveScreen(AppScreen.VIRTUAL_BOT);
    }, 1500);
  }, [selectedHouse, selectedCandle, numSignals, settings, triggerToast]);

  const copySignal = (sig: Signal) => {
    const text = `💎 *VENOM HACK - SINAL CONFIRMADO* 💎\n\n🏛️ *CASA:* ${sig.house.toUpperCase()}\n⏰ *HORARIO:* ${sig.time}\n🎯 *ALVO:* ${sig.multiplier}\n🔥 *ASSERTIVIDADE:* ${sig.probability.toFixed(1)}%\n\n✅ *ENTRADA AUTORIZADA*\n🤖 *venom.b55 (hack) Pro*`;
    navigator.clipboard.writeText(text);
    triggerToast("Sinal Copiado!");
  };

  const copyAllSignals = () => {
    if (signals.length === 0) return;
    const houseName = selectedHouse?.name.toUpperCase() || "SISTEMA";
    const body = signals.slice(0, 50).map(sig => `⏰ ${sig.time} -> ${sig.multiplier}`).join('\n');
    navigator.clipboard.writeText(`💎 *VENOM HACK - LISTA DE SINAIS* 💎\n\n🏛️ *CASA:* ${houseName}\n\n${body}\n\n🤖 *venom.b55 (hack) Pro*`);
    triggerToast("Lista Copiada!");
  };

  const shareAllSignals = () => {
    if (signals.length === 0) return;
    const houseName = selectedHouse?.name.toUpperCase() || "SISTEMA";
    const body = signals.slice(0, 50).map(sig => `⏰ ${sig.time} -> ${sig.multiplier}`).join('\n');
    const text = `💎 *VENOM HACK - LISTA DE SINAIS* 💎\n\n🏛️ *CASA:* ${houseName}\n\n${body}\n\n🤖 *venom.b55 (hack) Pro*`;
    if (navigator.share) {
      navigator.share({ title: `Sinais ${houseName}`, text: text }).catch(() => triggerToast("Erro ao compartilhar"));
    } else {
      navigator.clipboard.writeText(text);
      triggerToast("Copiados!");
    }
  };

  const generateMotivationalMessage = useCallback(async () => {
    setIsGlobalLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Gere uma mensagem curta de motivação e estratégia para um usuário de um bot de sinais de apostas crash em Moçambique. Use um tom de mentor "hacker" elite, seja direto e impactante. Mencione disciplina ou gestão de banca.'
      });
      
      const text = response.text?.trim() || "Mantenha a disciplina, o lucro real vem com paciência e gestão.";
      
      const newMsg: SupportMessage = {
        id: Math.random().toString(36).substring(7),
        text: text,
        timestamp: Date.now()
      };
      
      setSupportMessages(prev => [newMsg, ...prev]);
      triggerToast("Insight do Mentor Recebido!");
    } catch (err) {
      console.error("Gemini Error:", err);
      triggerToast("Falha ao sincronizar com mentor.");
    } finally {
      setIsGlobalLoading(false);
    }
  }, []);

  const onLogoClick = () => setActiveScreen(AppScreen.SETTINGS);

  return (
    <Layout 
      activeScreen={activeScreen} 
      setScreen={setActiveScreen} 
      title={activeScreen === AppScreen.EFRON_ASSISTANT ? 'Efron.IA' : selectedHouse?.name} 
      themeConfig={themeConfig}
      onLogoClick={onLogoClick}
    >
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[999] w-[90%] max-w-[380px] pointer-events-none flex flex-col gap-2">
        {notifications.map(notif => (
          <div 
            key={notif.id}
            className={`pointer-events-auto p-4 rounded-2xl glass-card flex items-start gap-3 shadow-2xl animate-in slide-in-from-top-10 duration-500 border-l-4 ${
              notif.type === 'info' ? 'border-l-blue-500' : 
              notif.type === 'alert' ? 'border-l-yellow-500' : 
              notif.type === 'success' ? 'border-l-emerald-500' : 'border-l-rose-600'
            }`}
          >
            <div className={`mt-1 w-2 h-2 rounded-full ${
              notif.type === 'info' ? 'bg-blue-500' : 
              notif.type === 'alert' ? 'bg-yellow-500' : 
              notif.type === 'success' ? 'bg-emerald-500' : 'bg-rose-600 animate-pulse'
            }`} />
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-60 mb-1">Sistema Venom Alerta</p>
              <p className="text-[11px] font-bold text-primary leading-tight">{notif.message}</p>
            </div>
          </div>
        ))}
      </div>

      {toast.show && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] bg-white text-black px-5 py-2 rounded-full font-black text-[9px] uppercase shadow-2xl animate-in zoom-in">
          {toast.message}
        </div>
      )}

      {isGlobalLoading && (
        <div className="fixed inset-0 bg-[#05070a]/95 z-[2000] flex flex-col items-center justify-center p-12">
          <div className="w-12 h-12 border-t-2 border-accent rounded-full animate-spin mb-6"></div>
          <p className="text-accent font-mono text-[8px] uppercase tracking-[1em] animate-pulse">Scanning...</p>
        </div>
      )}

      {activeScreen === AppScreen.SETTINGS && (
        <div className="px-5 space-y-6 pb-20 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-primary">System <span className="text-accent">Elite</span></h2>
          </div>

          <div className="space-y-4">
            <div className="glass-card p-5 rounded-3xl space-y-4">
              <h3 className="text-[9px] font-black text-accent uppercase tracking-widest border-b border-white/5 pb-2">Configurações de API</h3>
              <p className="text-[10px] text-secondary leading-relaxed">
                Se você estiver atingindo limites de cota (429), você pode usar sua própria chave de API do Google Cloud paga.
              </p>
              <button 
                onClick={handleOpenKeySelector}
                className={`w-full py-3 rounded-xl font-bold text-[9px] uppercase tracking-wider border transition-all flex items-center justify-center gap-2 ${hasApiKey ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-white/5 text-secondary border-white/5'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                {hasApiKey ? 'Chave de API Vinculada' : 'Vincular Chave de API Própria'}
              </button>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[8px] text-accent underline block text-center uppercase tracking-widest"
              >
                Saiba mais sobre faturamento
              </a>
            </div>

            <div className="glass-card p-5 rounded-3xl space-y-4">
              <h3 className="text-[9px] font-black text-accent uppercase tracking-widest border-b border-white/5 pb-2">Selecione o Visual</h3>
              <div className="grid grid-cols-2 gap-2">
                {PREDEFINED_THEMES.map(t => (
                  <button key={t.id} onClick={() => setThemeConfig(t)} 
                    className={`py-2.5 rounded-xl font-bold text-[9px] uppercase tracking-wider border transition-all ${themeConfig.id === t.id ? 'bg-accent text-black border-accent' : 'bg-white/5 text-secondary border-white/5'}`}>
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card p-5 rounded-3xl space-y-4">
              <h3 className="text-[9px] font-black text-accent uppercase tracking-widest border-b border-white/5 pb-2">Criar Customizado</h3>
              <div className="space-y-4">
                 <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {['#00FF9D', '#00D1FF', '#BD00FF', '#FF3B3B', '#FFD700', '#FF8A00', '#FF007A', '#FFFFFF'].map(c => (
                      <button key={c} onClick={() => setThemeConfig({...themeConfig, accentColor: c, id: 'custom', name: 'Custom Theme'})}
                        style={{ backgroundColor: c }} className={`min-w-[32px] h-8 rounded-lg border-2 ${themeConfig.accentColor === c ? 'border-accent' : 'border-white/10'}`} />
                    ))}
                 </div>
                 <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[9px] font-bold text-secondary uppercase">Brilho <span>{themeConfig.brightness}%</span></div>
                      <input type="range" min="50" max="150" value={themeConfig.brightness} onChange={e => setThemeConfig({...themeConfig, brightness: parseInt(e.target.value)})} className="w-full h-1 bg-white/5 rounded-full accent-accent" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[9px] font-bold text-secondary uppercase">Contraste <span>{themeConfig.contrast}%</span></div>
                      <input type="range" min="50" max="150" value={themeConfig.contrast} onChange={e => setThemeConfig({...themeConfig, contrast: parseInt(e.target.value)})} className="w-full h-1 bg-white/5 rounded-full accent-accent" />
                    </div>
                 </div>
              </div>
            </div>

            <button onClick={() => { triggerToast("Acessando..."); setActiveScreen(AppScreen.HOUSE_SELECTION); }} 
              className="w-full py-4 bg-accent text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all">Sincronizar Protocolo</button>
          </div>
        </div>
      )}

      {activeScreen === AppScreen.HOUSE_SELECTION && (
        <div className="px-4 space-y-6 pb-20 animate-in fade-in duration-500">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-primary tracking-tight">Tools <span className="text-accent">Selection</span></h2>
            <p className="text-[8px] text-secondary uppercase tracking-[0.3em] font-black">Moçambique Intelligence Hub</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {BETTING_HOUSES.map(h => (
              <button key={h.id} onClick={() => { setSelectedHouse(h); setActiveScreen(AppScreen.BOT_DASHBOARD); }}
                className="glass-card p-4 rounded-3xl flex flex-col items-center text-center gap-3 transition-all hover:bg-white/[0.05] hover:scale-[1.03] active:scale-95 border border-white/5 group">
                <div className={`w-14 h-14 ${h.color} rounded-2xl flex items-center justify-center text-3xl border border-white/10 shadow-lg group-hover:rotate-6 transition-transform`}>{h.logo}</div>
                <div className="space-y-1">
                  <span className="text-xs font-black text-primary block tracking-tight">{h.name}</span>
                  <div className="flex items-center justify-center gap-1 opacity-60">
                    <span className="w-1 h-1 rounded-full bg-accent animate-pulse"></span>
                    <span className="text-[7px] font-mono text-accent uppercase tracking-widest font-bold">Online</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeScreen === AppScreen.BOT_DASHBOARD && (
        <div className="px-5 space-y-6 pb-20 animate-in zoom-in-95">
           <div className="flex items-center gap-3">
              <button onClick={() => setActiveScreen(AppScreen.HOUSE_SELECTION)} className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-secondary border border-white/5">←</button>
              <h3 className="font-black text-lg text-primary">{selectedHouse?.name}</h3>
           </div>

           <div className="glass-card p-6 rounded-[2rem] space-y-8 border border-white/5 relative">
              <div className="space-y-4">
                 <span className="text-[9px] text-secondary uppercase tracking-[0.2em] font-black block text-center">Definir Caçada (Multiplicador)</span>
                 <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setSelectedCandle(CandleType.PURPLE)} 
                      className={`py-6 rounded-2xl border-2 font-black transition-all flex flex-col items-center gap-2 ${selectedCandle === CandleType.PURPLE ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'bg-[#080b15] border-white/5 text-secondary opacity-50'}`}
                    >
                      <span className="text-2xl">🟣</span>
                      <span className="text-[12px] uppercase tracking-tighter">VELA 2X+</span>
                      <span className="text-[7px] font-bold opacity-60">CONSERVADOR</span>
                    </button>
                    <button 
                      onClick={() => setSelectedCandle(CandleType.PINK)} 
                      className={`py-6 rounded-2xl border-2 font-black transition-all flex flex-col items-center gap-2 ${selectedCandle === CandleType.PINK ? 'bg-pink-600/20 border-pink-500 text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.2)]' : 'bg-[#080b15] border-white/5 text-secondary opacity-50'}`}
                    >
                      <span className="text-2xl">🌸</span>
                      <span className="text-[12px] uppercase tracking-tighter">VELA 5X+</span>
                      <span className="text-[7px] font-bold opacity-60">AGRESSIVO</span>
                    </button>
                 </div>
              </div>

              <div className="space-y-4 text-center border-t border-white/5 pt-8">
                 <span className="text-[9px] text-secondary uppercase tracking-[0.2em] font-black block">Quantidade de Entradas</span>
                 <div className="flex flex-col items-center gap-4">
                   <input 
                      type="number" 
                      min="1" 
                      max="5600"
                      value={numSignals} 
                      onChange={e => setNumSignals(Math.min(5600, parseInt(e.target.value) || 0))}
                      className="w-full bg-transparent font-black text-6xl text-center text-primary outline-none tabular-nums" 
                      placeholder="10"
                   />
                   <div className="flex flex-wrap justify-center gap-2">
                      {[10, 25, 50, 100, 500, 1000].map(v => (
                        <button key={v} onClick={() => setNumSignals(v)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[8px] font-black text-secondary hover:text-accent uppercase transition-all">{v}</button>
                      ))}
                   </div>
                 </div>
              </div>

              <button onClick={generateSignals} className="w-full py-5 bg-accent text-black rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all">Hackear Sinais</button>
           </div>
        </div>
      )}

      {activeScreen === AppScreen.VIRTUAL_BOT && (
        <div className="px-5 space-y-6 pb-20 animate-in fade-in">
          <div className="text-center space-y-1">
             <div className="inline-block px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
                <p className="text-[7px] text-accent uppercase tracking-widest font-black">Hack venom.b55 Confirmado</p>
             </div>
             <h2 className="text-2xl font-black text-primary italic">Live <span className="text-accent">Signals</span></h2>
             {selectedHouse && (
               <div className="flex items-center justify-center gap-2 mt-2">
                 <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Casa Ativa:</span>
                 <span className="text-[10px] font-black text-accent uppercase tracking-widest">{selectedHouse.name}</span>
               </div>
             )}
          </div>

          <div className="grid grid-cols-2 gap-2">
              <button onClick={copyAllSignals} className="py-3.5 bg-white text-black rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all">Copiar Tudo</button>
              <button onClick={shareAllSignals} className="py-3.5 bg-accent text-black rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all">Enviar Todos</button>
          </div>

          <div className="space-y-4">
            {signals.slice(0, 40).map((s) => (
              <div key={s.id} className="glass-card p-5 rounded-[2.2rem] flex items-center justify-between border border-white/5 group transition-all hover:bg-white/[0.05] relative overflow-hidden">
                 <div className={`absolute top-0 left-0 w-1 h-full ${s.type === CandleType.PINK ? 'bg-pink-500' : 'bg-purple-600'}`}></div>
                 <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-black text-primary tabular-nums tracking-tighter leading-none">{s.time}</span>
                      <span className="text-[7px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded uppercase">Verified</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${s.type === CandleType.PINK ? 'bg-pink-500/20 text-pink-500' : 'bg-purple-600/20 text-purple-600'}`}>
                        {s.multiplier}
                      </span>
                      <span className="text-[8px] font-mono text-secondary opacity-40 uppercase">#{s.id.substring(0,4)}</span>
                    </div>
                 </div>
                 <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-[8px] font-black text-emerald-500 uppercase">{s.probability.toFixed(1)}% Acc</span>
                    </div>
                    <button onClick={() => copySignal(s)} className="px-5 py-2.5 bg-white/5 border border-white/10 text-primary rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-accent hover:text-black transition-all active:scale-90">COPIAR</button>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeScreen === AppScreen.AGENDA && (
        <div className="px-4 space-y-6 pb-20 animate-in slide-in-from-bottom-5">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-primary italic">Elite <span className="text-accent">Agenda</span></h2>
            <p className="text-[8px] text-secondary font-mono uppercase tracking-[0.3em] font-black">Ciclos Pagadores</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={analyzeAll} className="py-3 bg-white/5 text-secondary rounded-xl font-black text-[9px] uppercase tracking-widest border border-white/5 transition-all active:scale-95">Recalcular</button>
            <button onClick={shareAgendaFull} className="py-3 bg-accent text-black rounded-xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-95">Relatório</button>
          </div>

          <div className="space-y-3">
            {agendaData.map(item => (
              <div key={item.id} className="glass-card rounded-[1.8rem] p-4 space-y-4 border border-white/5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-2xl border border-white/5">{item.logo}</div>
                    <div>
                       <h3 className="font-black text-sm text-primary tracking-tight">{item.house}</h3>
                       <div className="flex items-center gap-1.5">
                         <span className={`w-1 h-1 rounded-full ${item.graphStatus === 'BOM' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                         <span className="text-[7px] font-black text-secondary uppercase tracking-widest">{item.graphStatus}</span>
                       </div>
                    </div>
                  </div>
                  <button onClick={() => analyzeManually(item.id)} className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-secondary hover:text-accent transition-all ${item.isGraphAnalyzing ? 'animate-spin' : ''}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#080b15] p-2.5 rounded-xl border border-white/[0.03] text-center">
                    <span className="text-[7px] font-bold text-secondary uppercase block">Pagar</span>
                    <span className="text-xl font-black text-emerald-400">{item.paying.toFixed(0)}%</span>
                  </div>
                  <div className="bg-[#080b15] p-2.5 rounded-xl border border-white/[0.03] text-center">
                    <span className="text-[7px] font-bold text-secondary uppercase block">Retenção</span>
                    <span className="text-xl font-black text-rose-500">{item.reclining.toFixed(0)}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button onClick={() => copyQuickAgenda(item)} className="py-2.5 bg-white/5 text-secondary text-[8px] font-black uppercase rounded-lg">Quick</button>
                  <button onClick={() => copyAgendaFull(item)} className="py-2.5 bg-white text-black text-[8px] font-black uppercase rounded-lg">Elite</button>
                  <button onClick={() => { setSelectedHouse(BETTING_HOUSES.find(h => h.id === item.id) || null); setActiveScreen(AppScreen.BOT_DASHBOARD); }} className="py-2.5 bg-accent text-black text-[8px] font-black uppercase rounded-lg">Start</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeScreen === AppScreen.SIGNAL_ROOM && (
        <div className="px-5 pb-20">
          <div className="mb-8 text-center space-y-1">
             <h2 className="text-xl font-black text-primary">System <span className="text-accent">Logs</span></h2>
             <p className="text-[8px] text-secondary font-mono uppercase tracking-[0.4em] font-bold">Terminal Moçambique</p>
          </div>
          <SignalHistory history={signals} onRemove={id => setSignals(s => s.filter(x => x.id !== id))} onClearAll={() => setSignals([])} onCopy={() => triggerToast("Copiado!")} currentTime={currentTime} />
        </div>
      )}

      {activeScreen === AppScreen.SUPPORT && (
        <div className="px-5 space-y-6 pb-20 animate-in fade-in">
          <div className="text-center space-y-3">
             <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/10 shadow-lg">
                <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
             </div>
             <h2 className="text-xl font-black text-primary italic">Mentor <span className="text-accent">Protocol</span></h2>
          </div>

          <div className="space-y-4">
            <button onClick={generateMotivationalMessage} className="w-full py-4 bg-accent text-black rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Sincronizar Apoio</button>
            <div className="grid grid-cols-1 gap-3">
              {supportMessages.map(msg => (
                <div key={msg.id} className="glass-card p-5 rounded-3xl space-y-4 border border-white/5">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-primary italic uppercase leading-relaxed opacity-90">"{msg.text}"</p>
                    <p className="text-[7px] font-black text-accent uppercase tracking-[0.3em] text-right">Venom hack</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { navigator.clipboard.writeText(`${msg.text}\n\nVenom hack`); triggerToast("Copiado!"); }} className="flex-1 py-2 bg-white/5 border border-white/5 text-primary text-[8px] font-black uppercase rounded-lg">Copiar</button>
                    <button onClick={() => { if(navigator.share) navigator.share({text: `${msg.text}\n\nVenom hack`}); }} className="flex-1 py-2 bg-accent/10 border border-accent/20 text-accent text-[8px] font-black uppercase rounded-lg">Share</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeScreen === AppScreen.EFRON_ASSISTANT && (
        <div className="px-5 pb-20 animate-in fade-in">
          <EfronAssistant themeConfig={themeConfig} />
        </div>
      )}
    </Layout>
  );
};

export default App;
