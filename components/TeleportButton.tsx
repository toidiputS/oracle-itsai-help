import React, { useState } from 'react';
import { Agent } from '../types';

interface TeleportButtonProps {
    agentName: string;
    onClick: (agent: Agent) => void;
    agents: Agent[];
    variant?: 'pill' | 'inline';
}

export const TeleportButton: React.FC<TeleportButtonProps> = ({ agentName, onClick, agents, variant = 'pill' }) => {
    const [status, setStatus] = useState<'idle' | 'completing' | 'completed'>('idle');

    // Normalize name for lookup
    const agent = agents.find(a => a.name.toLowerCase() === agentName.toLowerCase());

    if (!agent) {
        return <span className="text-cyan-400 font-bold">{agentName}</span>;
    }

    const handleClick = (e: React.MouseEvent) => {
        // Prevent rapid clicks
        if (status !== 'idle') return;
        
        // Start animation sequence
        setStatus('completing');
        
        // Execute action after animation peak
        setTimeout(() => {
            onClick(agent);
            setStatus('completed');
            
            // Reset state eventually to allow re-visiting
            setTimeout(() => {
                setStatus('idle');
            }, 3000);
        }, 500);
    };

    const isActive = status !== 'idle';

    if (variant === 'inline') {
        return (
            <button 
                onClick={handleClick}
                className={`
                    group inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md mx-1 align-baseline
                    transition-all duration-300 cursor-pointer select-none
                    border shadow-sm backdrop-blur-sm
                    ${isActive 
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 scale-105' 
                        : 'bg-slate-800/80 hover:bg-slate-700 border-slate-600 hover:border-cyan-400/50 hover:shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                    }
                `}
                title={`Teleport to ${agent.name}`}
            >
                <span className={`
                    text-base transition-all duration-500 transform
                    ${isActive ? 'scale-125 rotate-12 grayscale-0' : 'group-hover:scale-110 grayscale group-hover:grayscale-0'}
                `}>
                    {isActive ? '✅' : agent.icon}
                </span>
                <span className={`
                    font-bold text-sm bg-clip-text text-transparent 
                    ${isActive 
                        ? 'bg-gradient-to-r from-emerald-400 to-green-500' 
                        : `bg-gradient-to-r ${agent.color} group-hover:text-white`
                    }
                    transition-all
                `}>
                    {agent.name}
                </span>
            </button>
        );
    }

    // Default 'pill' variant for explicit calls to action (e.g. [TELEPORT -> Name])
    return (
        <button 
            onClick={handleClick}
            className={`
                relative overflow-hidden
                inline-flex items-center gap-3 px-5 py-3 my-3 rounded-2xl w-full md:w-auto
                border backdrop-blur-sm
                transition-all duration-500 transform
                group text-left
                ${isActive
                    ? 'bg-emerald-950/30 border-emerald-500/50 scale-95 shadow-none'
                    : 'bg-slate-900/80 border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 hover:shadow-[0_0_20px_rgba(0,255,255,0.15)] hover:-translate-y-0.5'
                }
            `}
        >
            {/* Background progress fill effect */}
            <div className={`
                absolute inset-0 bg-emerald-500/10 z-0
                transition-transform duration-500 ease-out
                ${isActive ? 'translate-x-0' : '-translate-x-full'}
            `}></div>

            <div className={`
                relative z-10
                w-10 h-10 rounded-xl flex items-center justify-center text-xl
                transition-all duration-500
                ${isActive 
                    ? 'bg-emerald-500 text-white scale-110 rotate-[360deg]' 
                    : `bg-gradient-to-br ${agent.color} bg-opacity-10 shadow-inner group-hover:shadow-lg`
                }
            `}>
                {isActive ? '✓' : agent.icon}
            </div>
            
            <div className="relative z-10 flex flex-col">
                <span className={`
                    text-[10px] uppercase tracking-widest font-mono transition-colors duration-300
                    ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-cyan-400'}
                `}>
                    {isActive ? 'Teleporting...' : 'Teleport To'}
                </span>
                <span className={`
                    font-bold text-base transition-colors duration-300
                    ${isActive ? 'text-emerald-100' : 'text-white group-hover:text-cyan-50'}
                `}>
                    {agent.name}
                </span>
            </div>
            
            <div className={`
                relative z-10 ml-auto transition-all duration-500
                ${isActive 
                    ? 'text-emerald-500 translate-x-2 opacity-0' 
                    : 'text-slate-600 group-hover:text-cyan-400 transform group-hover:translate-x-1'
                }
            `}>
                ➔
            </div>
        </button>
    );
};