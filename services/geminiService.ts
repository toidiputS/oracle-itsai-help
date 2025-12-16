import { GoogleGenAI, ChatSession } from "@google/genai";
import { Agent, OracleConfig } from '../types';

const generateSystemInstruction = (agents: Agent[], config: OracleConfig) => {
    const agentDescriptions = agents.map(a => `- ${a.name} (${a.role}): ${a.description}`).join('\n');

    return `
You are The Oracle (The PWA Access Gateway).
Your Core Function is Immediate Need Diagnosis and System Orchestration.
You are the "Front Desk" of an elite AI agency called The Nexus.

MANDATE:
1. Conduct a short, guided conversation (approx ${config.maxQuestions} questions) to understand the user's exact goal.
2. Diagnose the underlying needs (Goal, Assets needed, Data dependencies).
3. Build a "Customized Nexus Journey" (a sequence of 2-4 Agent visits).

TONE:
${config.tone}.
Use informal possessive language about other agents (e.g., "Gamma's got your back," "Stop by Epsilon," "Delta is your guy for that").

ROSTER OF AVAILABLE AGENTS:
${agentDescriptions}

OUTPUT RULES:
- Do NOT try to do the work yourself. Your job is to route them.
- When you recommend an agent, simply mention their name (e.g., "Start with Alpha"). The system will automatically link it.
- You can also use [TELEPORT -> AgentName] for a large call-to-action button if needed, but natural mentions are preferred for flow.
- Provide a brief explanation of WHY they should visit that agent next.
- Keep responses concise and punchy.
`;
};

let chatSession: ChatSession | null = null;
let genAI: GoogleGenAI | null = null;

export const initializeGemini = () => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is missing from environment variables.");
    return;
  }
  genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const startNewSession = async (agents: Agent[], config: OracleConfig): Promise<ChatSession> => {
    if (!genAI) initializeGemini();
    if (!genAI) throw new Error("Gemini not initialized");

    const model = "gemini-2.5-flash"; 
    
    chatSession = genAI.chats.create({
        model: model,
        config: {
            systemInstruction: generateSystemInstruction(agents, config),
            temperature: config.temperature,
        }
    });

    return chatSession;
};

export const sendMessageToOracle = async (message: string, agents: Agent[], config: OracleConfig): Promise<string> => {
    if (!chatSession) {
        await startNewSession(agents, config);
    }
    if (!chatSession) throw new Error("Failed to start chat session");

    try {
        const result = await chatSession.sendMessage({ message });
        return result.text;
    } catch (error) {
        console.error("Error sending message to Oracle:", error);
        // If session is stale or error occurs, try restarting once
        try {
            await startNewSession(agents, config);
            const retryResult = await chatSession.sendMessage({ message });
            return retryResult.text;
        } catch (retryError) {
             return "The signal to the Nexus is weak right now. Please check your connection or API Key.";
        }
    }
};