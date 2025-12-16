import React, { useState, useEffect, useRef } from 'react';
import { Message, AppState, Agent, OracleConfig } from './types';
import { INITIAL_GREETING, AGENTS as INITIAL_AGENTS } from './constants';
import { sendMessageToOracle, startNewSession } from './services/geminiService';
import { ChatBubble } from './components/ChatBubble';
import { AgentOverlay } from './components/AgentOverlay';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    
    // Lifted State for Architect Mode
    const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
    const [oracleConfig, setOracleConfig] = useState<OracleConfig>({
        temperature: 0.7,
        maxQuestions: 3,
        tone: "Professional, Diagnostic, Highly Knowledgeable, and Relationship-Focused"
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize Chat with current config
    useEffect(() => {
        const initChat = async () => {
            try {
                // Pass dynamic agents and config
                await startNewSession(agents, oracleConfig);
                
                if (messages.length === 0) {
                    setMessages([{
                        id: 'init',
                        role: 'model',
                        text: INITIAL_GREETING,
                        timestamp: new Date()
                    }]);
                }
            } catch (e) {
                console.error("Failed to init session", e);
            }
        };

        if (appState === AppState.DIAGNOSTIC) {
            initChat();
        }
        // If config/agents change while in diagnostic mode, we might want to silently re-init or just let the next message handle it?
        // Let's re-init on state entry, but we need a way to update the session if Architect changes things live.
        // We will rely on `sendMessageToOracle` checking the session or passing args.
    }, [appState]); // Depend on appState. We can handle live updates via the send function logic or separate effect.

    // Effect to restart session if Architect changes critical config
    useEffect(() => {
        if (appState === AppState.DIAGNOSTIC) {
            startNewSession(agents, oracleConfig).catch(console.error);
        }
    }, [agents, oracleConfig]);


    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isThinking]);

    const handleSend = async () => {
        if (!input.trim() || isThinking) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsThinking(true);

        // Add temporary typing indicator
        const typingMsgId = 'typing-' + Date.now();
        setMessages(prev => [...prev, {
            id: typingMsgId,
            role: 'model',
            text: '...',
            timestamp: new Date(),
            isTyping: true
        }]);

        try {
            const responseText = await sendMessageToOracle(userMsg.text, agents, oracleConfig);
            
            // Remove typing indicator and add real response
            setMessages(prev => {
                const filtered = prev.filter(m => m.id !== typingMsgId);
                return [...filtered, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: responseText,
                    timestamp: new Date()
                }];
            });
        } catch (error) {
            console.error("Error getting response", error);
        } finally {
            setIsThinking(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Architect Handlers
    const handleUpdateAgent = (updatedAgent: Agent) => {
        setAgents(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a));
    };

    const handleAddAgent = () => {
        const newAgent: Agent = {
            id: `agent-${Date.now()}`,
            name: "New Agent",
            role: "Unassigned Role",
            description: "Expert in...",
            color: "from-gray-500 to-slate-600",
            icon: "👤"
        };
        setAgents(prev => [...prev, newAgent]);
    };

    const handleDeleteAgent = (id: string) => {
        if (window.confirm("Are you sure you want to delete this agent?")) {
            setAgents(prev => prev.filter(a => a.id !== id));
        }
    };

    // Welcome Screen
    if (appState === AppState.WELCOME) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 relative overflow-hidden">
                {/* Background Atmosphere */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
                </div>

                <div className="z-10 text-center max-w-2xl animate-fade-in-up">
                    <div className="mb-8 inline-block p-4 rounded-full bg-slate-800/50 border border-slate-700/50 backdrop-blur-md shadow-2xl">
                        <span className="text-4xl">🔮</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 mb-6 tracking-tight">
                        THE ORACLE
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl mb-10 font-light leading-relaxed">
                        The Front Desk of Intelligent System Orchestration. <br />
                        Tell me your goal. I will assemble your team.
                    </p>
                    <button 
                        onClick={() => setAppState(AppState.DIAGNOSTIC)}
                        className="group relative px-8 py-4 bg-slate-100 text-slate-900 rounded-full font-bold text-lg hover:bg-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] active:scale-95"
                    >
                        Initiate Diagnosis
                        <span className="absolute -right-2 -top-2 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0f172a]"></span>
                    </button>
                </div>
            </div>
        );
    }

    // Diagnostic Chat Interface
    return (
        <div className="min-h-screen bg-[#0f172a] flex flex-col relative font-inter">
             {/* Header */}
            <header className="sticky top-0 z-20 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setAppState(AppState.WELCOME)}>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <h1 className="font-mono text-sm tracking-widest text-slate-400 uppercase">
                        The Oracle <span className="text-slate-600 mx-2">//</span> System Orchestrator
                    </h1>
                </div>
                <div className="hidden md:flex items-center gap-4">
                     {/* Mini Status Grid of Agents */}
                     <div className="flex items-center gap-3">
                        {agents.slice(1, 6).map(a => (
                            <div key={a.id} className="group relative">
                                <button 
                                    onClick={() => setSelectedAgent(a)}
                                    className={`
                                        w-9 h-9 rounded-full bg-slate-800 border border-slate-700 
                                        flex items-center justify-center text-lg
                                        grayscale opacity-60 cursor-pointer
                                        transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                                        hover:scale-110 hover:-translate-y-1 hover:grayscale-0 hover:opacity-100 hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]
                                    `}
                                >
                                    {a.icon}
                                </button>
                                {/* Tooltip */}
                                <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 
                                              opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-y-0 translate-y-2
                                              pointer-events-none z-50 w-max">
                                     <div className="flex flex-col items-center bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-lg px-3 py-2 shadow-2xl">
                                        <span className={`font-bold text-xs bg-clip-text text-transparent bg-gradient-to-r ${a.color}`}>
                                            {a.name}
                                        </span>
                                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                            {a.role}
                                        </span>
                                        {/* Little arrow */}
                                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-t border-l border-slate-700/80 transform rotate-45"></div>
                                     </div>
                                </div>
                            </div>
                        ))}
                        <div className="w-9 h-9 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center text-[10px] text-slate-500 transition-colors cursor-default">
                            +{Math.max(0, agents.length - 6)}
                        </div>
                     </div>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full scrollbar-hide">
                <div className="flex flex-col min-h-full justify-end pb-20">
                    {messages.map((msg) => (
                        <ChatBubble 
                            key={msg.id} 
                            message={msg} 
                            onTeleport={setSelectedAgent}
                            agents={agents}
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input Area */}
            <div className="sticky bottom-0 z-20 bg-gradient-to-t from-[#0f172a] via-[#0f172a] to-transparent pt-10 pb-6 px-4">
                <div className="max-w-3xl mx-auto relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 blur-xl rounded-2xl"></div>
                    <div className="relative bg-slate-800/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex items-center p-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Tell me your goal (e.g., 'I need a 5-day email sequence')..."
                            className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3 placeholder-slate-500 font-light"
                            autoFocus
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!input.trim() || isThinking}
                            className={`
                                p-3 rounded-xl transition-all duration-200
                                ${input.trim() && !isThinking
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg transform hover:scale-105' 
                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                }
                            `}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Overlays */}
            <AgentOverlay 
                agent={selectedAgent} 
                onClose={() => setSelectedAgent(null)} 
                allAgents={agents}
                config={oracleConfig}
                onUpdateAgent={handleUpdateAgent}
                onAddAgent={handleAddAgent}
                onDeleteAgent={handleDeleteAgent}
                onUpdateConfig={setOracleConfig}
            />
        </div>
    );
};

export default App;