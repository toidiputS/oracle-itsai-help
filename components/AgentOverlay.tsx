import React, { useState, useEffect } from 'react';
import { Agent, OracleConfig } from '../types';

interface AgentOverlayProps {
    agent: Agent | null;
    onClose: () => void;
    // Architect Props
    allAgents: Agent[];
    config: OracleConfig;
    onUpdateAgent: (agent: Agent) => void;
    onAddAgent: () => void;
    onDeleteAgent: (id: string) => void;
    onUpdateConfig: (config: OracleConfig) => void;
}

export const AgentOverlay: React.FC<AgentOverlayProps> = ({ 
    agent, 
    onClose, 
    allAgents, 
    config, 
    onUpdateAgent, 
    onAddAgent, 
    onDeleteAgent,
    onUpdateConfig
}) => {
    const [clickCount, setClickCount] = useState(0);
    const [secretInput, setSecretInput] = useState('');
    const [isArchitectUnlocked, setIsArchitectUnlocked] = useState(false);
    const [activeTab, setActiveTab] = useState<'oracle' | 'agents'>('oracle');
    const [editingAgentId, setEditingAgentId] = useState<string | null>(null);

    // Reset state when overlay opens/closes
    useEffect(() => {
        if (!agent) {
            setClickCount(0);
            setSecretInput('');
            setIsArchitectUnlocked(false);
            setEditingAgentId(null);
        }
    }, [agent]);

    const handleImageClick = () => {
        setClickCount(prev => prev + 1);
    };

    const handleSecretSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (secretInput === 'trad34') {
            setIsArchitectUnlocked(true);
        } else {
            setClickCount(0); // Reset on failure
            setSecretInput('');
        }
    };

    if (!agent) return null;

    // --- ARCHITECT VIEW ---
    if (isArchitectUnlocked) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
                <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                    
                    {/* Architect Header */}
                    <div className="p-6 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <span className="text-emerald-500">⚡</span> Architect's Console
                            </h2>
                            <p className="text-xs text-slate-500 font-mono mt-1">SYSTEM_OVERRIDE_ACTIVE</p>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white p-2">✕</button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-800 bg-slate-900">
                        <button 
                            onClick={() => setActiveTab('oracle')}
                            className={`flex-1 py-3 font-medium text-sm transition-colors ${activeTab === 'oracle' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Oracle Config
                        </button>
                        <button 
                            onClick={() => setActiveTab('agents')}
                            className={`flex-1 py-3 font-medium text-sm transition-colors ${activeTab === 'agents' ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-400/5' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Agent Network ({allAgents.length})
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-slate-900">
                        
                        {/* ORACLE CONFIG TAB */}
                        {activeTab === 'oracle' && (
                            <div className="space-y-8 max-w-2xl mx-auto">
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-slate-300">System Temperature (Creativity)</label>
                                    <input 
                                        type="range" 
                                        min="0" max="1" step="0.1" 
                                        value={config.temperature}
                                        onChange={(e) => onUpdateConfig({...config, temperature: parseFloat(e.target.value)})}
                                        className="w-full accent-cyan-500"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500 font-mono">
                                        <span>Precise (0.0)</span>
                                        <span className="text-cyan-400">{config.temperature}</span>
                                        <span>Creative (1.0)</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-slate-300">Tone of Voice</label>
                                    <select 
                                        value={config.tone}
                                        onChange={(e) => onUpdateConfig({...config, tone: e.target.value})}
                                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:border-cyan-500"
                                    >
                                        <option value="Professional, Diagnostic, Highly Knowledgeable, and Relationship-Focused">Default (Professional)</option>
                                        <option value="Casual, friendly, bro-talk, like a close startup founder friend">Casual / Startup Bro</option>
                                        <option value="Direct, military-style brevity, no fluff, purely tactical">Military / Tactical</option>
                                        <option value="Mystical, enigmatic, slightly cryptic but wise">Mystical Oracle</option>
                                        <option value="Sarcastic, witty, slightly dry humor">Sarcastic</option>
                                    </select>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-slate-300">Max Diagnostic Questions</label>
                                    <input 
                                        type="number" 
                                        value={config.maxQuestions}
                                        onChange={(e) => onUpdateConfig({...config, maxQuestions: parseInt(e.target.value)})}
                                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:border-cyan-500"
                                    />
                                    <p className="text-xs text-slate-500">Approximate number of questions before generating a plan.</p>
                                </div>
                            </div>
                        )}

                        {/* AGENTS TAB */}
                        {activeTab === 'agents' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-slate-400 text-sm uppercase tracking-wider">Active Agents</h3>
                                    <button 
                                        onClick={onAddAgent}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors"
                                    >
                                        + Add New Agent
                                    </button>
                                </div>

                                <div className="grid gap-4">
                                    {allAgents.map(a => (
                                        <div key={a.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 transition-all hover:border-slate-600">
                                            {editingAgentId === a.id ? (
                                                <div className="space-y-3">
                                                    <div className="flex gap-2">
                                                        <div className="w-12 h-12 flex items-center justify-center bg-slate-700 rounded-lg text-2xl">
                                                            <input 
                                                                value={a.icon} 
                                                                onChange={(e) => onUpdateAgent({...a, icon: e.target.value})}
                                                                className="w-full bg-transparent text-center outline-none"
                                                            />
                                                        </div>
                                                        <div className="flex-1 space-y-2">
                                                            <input 
                                                                value={a.name} 
                                                                onChange={(e) => onUpdateAgent({...a, name: e.target.value})}
                                                                className="w-full bg-slate-700 text-white px-3 py-2 rounded text-sm font-bold placeholder-slate-500"
                                                                placeholder="Agent Name"
                                                            />
                                                            <input 
                                                                value={a.role} 
                                                                onChange={(e) => onUpdateAgent({...a, role: e.target.value})}
                                                                className="w-full bg-slate-700 text-slate-300 px-3 py-2 rounded text-xs placeholder-slate-500"
                                                                placeholder="Role"
                                                            />
                                                        </div>
                                                    </div>
                                                    <textarea 
                                                        value={a.description} 
                                                        onChange={(e) => onUpdateAgent({...a, description: e.target.value})}
                                                        className="w-full bg-slate-700 text-slate-300 px-3 py-2 rounded text-xs min-h-[60px]"
                                                        placeholder="Description"
                                                    />
                                                    <div className="flex justify-end gap-2 mt-2">
                                                        <button onClick={() => onDeleteAgent(a.id)} className="text-red-400 hover:text-red-300 text-xs px-3 py-1">Delete</button>
                                                        <button onClick={() => setEditingAgentId(null)} className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-4 py-2 rounded-lg font-bold">Done</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-xl">
                                                            {a.icon}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-white text-sm">{a.name}</h4>
                                                            <p className="text-xs text-slate-400">{a.role}</p>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => setEditingAgentId(a.id)}
                                                        className="text-slate-500 hover:text-white p-2"
                                                    >
                                                        ✎
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // --- STANDARD USER VIEW ---
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl transform transition-all animate-scale-up">
                
                {/* Header Background */}
                <div className={`h-32 bg-gradient-to-br ${agent.color} relative`}>
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-colors z-10"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer transition-transform active:scale-95" onClick={handleImageClick}>
                        <div className="w-20 h-20 rounded-2xl bg-slate-800 border-4 border-slate-900 flex items-center justify-center text-4xl shadow-xl select-none">
                            {agent.icon}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="pt-12 pb-8 px-8 text-center">
                    <h2 className="text-2xl font-bold text-white mb-1">{agent.name}</h2>
                    <p className={`text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r ${agent.color} mb-4 uppercase tracking-wider`}>
                        {agent.role}
                    </p>
                    <p className="text-slate-400 leading-relaxed mb-6 text-sm">
                        {agent.description}
                    </p>
                    
                    <button className={`w-full py-3 rounded-xl font-bold text-white shadow-lg bg-gradient-to-r ${agent.color} hover:opacity-90 transition-all`}>
                        Enter {agent.name}'s Domain
                    </button>

                    {/* Secret Input */}
                    {clickCount >= 10 && (
                        <form onSubmit={handleSecretSubmit} className="mt-6 animate-fade-in-up">
                             <input 
                                type="text"
                                value={secretInput}
                                onChange={(e) => setSecretInput(e.target.value)}
                                placeholder="Enter Access Code"
                                className="w-32 bg-slate-800 border border-slate-700 text-xs text-center py-1 rounded text-white focus:border-red-500 outline-none"
                                autoFocus
                             />
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};