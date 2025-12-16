import React, { useMemo } from 'react';
import { Message, Agent } from '../types';
import { TeleportButton } from './TeleportButton';

interface ChatBubbleProps {
    message: Message;
    onTeleport: (agent: Agent) => void;
    agents: Agent[];
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onTeleport, agents }) => {
    const isUser = message.role === 'user';
    
    // Create regex pattern to match explicit [TELEPORT -> Name] OR standalone Agent Names
    const parsePattern = useMemo(() => {
        // Sort names by length descending to ensure "The Oracle" is matched before "Oracle"
        const agentNames = agents.map(a => a.name).sort((a, b) => b.length - a.length);
        // Escape special regex characters in names just in case
        const escapedNames = agentNames.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
        
        // Group 1: Explicit syntax [TELEPORT -> Name]
        // Group 2: Standalone mentions (word boundary check)
        return new RegExp(`(\\[TELEPORT\\s*->\\s*[^\\]]+\\])|\\b(${escapedNames})\\b`, 'gi');
    }, [agents]);

    const renderContent = (text: string) => {
        // Split text by the pattern. 
        const parts = text.split(parsePattern);
        
        const result = [];
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            
            if (!part) continue; // Skip undefined/empty captures

            // Check if it's an explicit TELEPORT tag (Group 1 match)
            if (part.match(/^\[TELEPORT\s*->/i)) {
                const match = part.match(/\[TELEPORT\s*->\s*([^\]]+)\]/i);
                if (match) {
                    const agentName = match[1].trim();
                    result.push(
                        <TeleportButton 
                            key={`teleport-${i}`} 
                            agentName={agentName} 
                            onClick={onTeleport} 
                            agents={agents}
                            variant="pill" 
                        />
                    );
                } else {
                    result.push(<span key={i}>{part}</span>);
                }
            } 
            // Check if it's a standalone agent name (Group 2 match)
            else if (agents.some(a => a.name.toLowerCase() === part.toLowerCase())) {
                result.push(
                    <TeleportButton 
                        key={`inline-${i}`} 
                        agentName={part} 
                        onClick={onTeleport}
                        agents={agents}
                        variant="inline" 
                    />
                );
            } 
            // Regular text
            else {
                result.push(<span key={i}>{part}</span>);
            }
        }
        return result;
    };

    return (
        <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-fade-in-up`}>
            {!isUser && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-sm mr-3 shadow-lg shadow-cyan-500/20 flex-shrink-0">
                    🔮
                </div>
            )}
            
            <div className={`
                max-w-[85%] md:max-w-[70%] p-4 rounded-2xl text-sm md:text-base leading-relaxed
                ${isUser 
                    ? 'bg-slate-700 text-white rounded-tr-none' 
                    : 'bg-slate-800/80 backdrop-blur-md border border-slate-700/50 text-slate-200 rounded-tl-none shadow-xl'
                }
            `}>
                <div className="whitespace-pre-wrap">
                    {message.isTyping ? (
                        <div className="flex space-x-2 p-2">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-0"></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-300"></div>
                        </div>
                    ) : (
                        renderContent(message.text)
                    )}
                </div>
            </div>
        </div>
    );
};