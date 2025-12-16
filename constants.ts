import { Agent } from './types';

export const SYSTEM_NAME = "The Oracle";

export const AGENTS: Agent[] = [
  {
    id: "oracle",
    name: "The Oracle",
    role: "System Orchestrator",
    description: "The Front Desk. Diagnoses needs and builds workflows.",
    color: "from-cyan-500 to-blue-600",
    icon: "🔮"
  },
  {
    id: "alpha",
    name: "Alpha",
    role: "Strategic Leadership",
    description: "High-level business strategy and visionary planning.",
    color: "from-amber-500 to-orange-600",
    icon: "👑"
  },
  {
    id: "beta",
    name: "Beta",
    role: "Technical Architect",
    description: "Code structure, tech stack decisions, and implementation.",
    color: "from-emerald-500 to-green-600",
    icon: "⚡"
  },
  {
    id: "gamma",
    name: "Gamma",
    role: "Content Engine",
    description: "High-volume content generation and blog strategy.",
    color: "from-pink-500 to-rose-600",
    icon: "📚"
  },
  {
    id: "delta",
    name: "Delta",
    role: "Copywriting Specialist",
    description: "Direct response copy, email sequences, and sales pages.",
    color: "from-blue-500 to-indigo-600",
    icon: "✍️"
  },
  {
    id: "epsilon",
    name: "Epsilon",
    role: "Market Analyst",
    description: "Audience research, pain point identification, and competitor audits.",
    color: "from-violet-500 to-purple-600",
    icon: "📊"
  },
  {
    id: "zeta",
    name: "Zeta",
    role: "Social Media Manager",
    description: "Viral hooks, thread composition, and engagement strategy.",
    color: "from-sky-400 to-cyan-500",
    icon: "🐦"
  },
  {
    id: "eta",
    name: "Eta",
    role: "Visual Designer",
    description: "UI/UX principles, aesthetics, and branding direction.",
    color: "from-fuchsia-500 to-pink-600",
    icon: "🎨"
  },
  {
    id: "theta",
    name: "Theta",
    role: "Operations & Logic",
    description: "Workflow automation, SOPs, and system efficiency.",
    color: "from-slate-500 to-gray-600",
    icon: "⚙️"
  },
  {
    id: "anakritis",
    name: "Anakritis",
    role: "The Critic",
    description: "Unbiased feedback, stress-testing, and optimization auditing.",
    color: "from-red-500 to-red-700",
    icon: "⚖️"
  }
];

export const INITIAL_GREETING = "Welcome to the Nexus. I am The Oracle. I'm here to build your customized execution stack. Tell me, what is the single most important outcome you need to achieve right now?";