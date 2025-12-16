export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  color: string;
  icon: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isTyping?: boolean;
}

export enum AppState {
  WELCOME = 'WELCOME',
  DIAGNOSTIC = 'DIAGNOSTIC',
  NEXUS_MAP = 'NEXUS_MAP'
}

export interface OracleConfig {
  temperature: number;
  maxQuestions: number;
  tone: string;
}