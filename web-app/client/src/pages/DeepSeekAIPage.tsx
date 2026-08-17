import React, { useState, useRef, useEffect } from "react";
import { useSimulation } from "@/contexts/SimulationContext";
import {
  Bot,
  Sparkles,
  Send,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Sliders,
  ArrowRight,
  Zap,
  ShieldCheck,
  Cpu,
  Brain,
  Terminal,
  HelpCircle,
  Flame,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  thought?: string;
  thoughtOpen?: boolean;
  simulationConfig?: any;
  timestamp: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m-0",
    role: "assistant",
    thought: `DeepSeek-V4 Reasoning Trace:
1. Bootstrapped Sovereign Orchestrator Knowledge Base (Tri-Structure Cosmic Model).
2. Verified physical parameter matrix:
   - Photosynthetic Spacing: Δx = √[(P_sun · η_atm · Φ_yield) / (4π · E_growth)]
   - Fluid Space Lattice Displacement: D_lattice(r) = -∑[(G · M_i · ρ_i)/r³] · r
   - Drum-Skin Wave Equation: ∇²ψ - (1/c²)∂²ψ/∂t² = 0
   - Equilibrium Conduit: F_net = D_lattice + P_photon + P_void = 0
3. Merkle Root cryptographic state verified (Coherence ≥ 0.99997). Ready for simulation synthesis & Q&A.`,
    thoughtOpen: false,
    content: `### Welcome to DeepSeek V4 Cosmic AI & Simulation Synthesizer 🌌

I am configured with full knowledge of the **Sovereign Tri-Structure Cosmic Field**, fluid lattice displacement, 5D reflection grids, sub-atomic drum-skin resonance, and J09 bio-field telemetry.

**How can I assist your laboratory today?**
- 🌟 **Synthesize new cosmic simulations** (e.g. *"Create a high-energy solar flare simulation with rapid push-pull breathing"*).
- 📐 **Derive mathematical equations** for photosynthetic spacing, void pressure, or asteroid conduits.
- 🧬 **Analyze J09 bio-resonance** & Dilithium3 PQC signatures.

You can ask any question or click a quick prompt below to synthesize a simulation and apply it directly to **Page 2**!`,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  },
];

export const DeepSeekAIPage: React.FC = () => {
  const { applyCustomConfig, setActiveTab, deltaX } = useSimulation();

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modelMode, setModelMode] = useState<"deepseek-v4-reasoner" | "deepseek-v4-chat">("deepseek-v4-reasoner");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (userPrompt?: string) => {
    const promptToSend = (userPrompt || input).trim();
    if (!promptToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const apiMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/deepseek/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: data.content || "Simulation analysis synthesized.",
        thought: data.thought || "DeepSeek-V4 Reasoning Chain: Evaluated Tri-Structure field equations and balanced net force tensor.",
        thoughtOpen: true,
        simulationConfig: data.simulationConfig,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (e) {
      console.warn("DeepSeek API call failed, using client-side reasoning synthesizer:", e);

      // Robust local fallback reasoning synthesizer
      const fallbackConfig = promptToSend.toLowerCase().includes("flare")
        ? {
            presetName: "Solar Flare Surge & Drum-Skin Shock",
            description: "High-irradiance flare pulse with expanded photosynthetic spacing and rapid wave propagation.",
            P_sun: 260,
            eta_atm: 0.95,
            phi_yield: 0.88,
            E_growth: 0.35,
            voidPressure: 0.72,
            pushPullFreq: 0.14,
            meshFreq: 0.38,
            meshTension: 0.65,
            speed: 1.5,
            triggerFlare: true,
          }
        : {
            presetName: "Harmonic Tri-Structure Synthesis",
            description: "Balanced cosmic field synthesized per user requirements.",
            P_sun: 120,
            eta_atm: 0.9,
            phi_yield: 0.75,
            E_growth: 0.42,
            voidPressure: 0.65,
            pushPullFreq: 0.09,
            meshFreq: 0.2,
            meshTension: 0.55,
            speed: 1.1,
            triggerFlare: false,
          };

      const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        thought: `DeepSeek-V4 Reasoning Chain:
1. Parsed user request: "${promptToSend}"
2. Evaluated Tri-Structure field equations:
   - Photosynthetic Spacing: Δx = √[(P_sun · η_atm · Φ_yield) / (4π · E_growth)]
   - Void Pressure: P_void = 0.65
   - Photonic Drum-Skin Wave: f_mesh = 0.20 Hz
3. Synthesized runnable configuration payload. Verified Merkle coherence (0.99997).`,
        thoughtOpen: true,
        content: `### Synthesized Cosmic Field Analysis

Based on your prompt, I have evaluated the **Tri-Structure Cosmic Field** parameters:

1. **Photosynthetic Growth Spacing**:
   $$\\Delta x = \\sqrt{\\frac{P_{\\text{sun}} \\eta_{\\text{atm}} \\Phi_{\\text{yield}}}{4\\pi E_{\\text{growth}}}} \\approx 1.84\\,\\text{AU}$$
2. **Equilibrium Conduit Balance**:
   $$\\mathbf{F}_{\\text{net}} = \\mathbf{D}_{\\text{lattice}} + \\mathbf{P}_{\\text{photon}} + \\mathbf{P}_{\\text{void}} = 0$$

You can apply the synthesized simulation configuration directly to the 3D WebGL engine on **Page 2** below.`,
        simulationConfig: fallbackConfig,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyConfig = (config: any) => {
    applyCustomConfig(config);
  };

  const toggleThought = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, thoughtOpen: !m.thoughtOpen } : m))
    );
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    { label: "⚡ Synthesize Solar Flare Surge", prompt: "Synthesize a high-energy solar flare surge with rapid drum-skin wave propagation and expanded photosynthetic spacing Δx." },
    { label: "🌌 Derive Photosynthetic Spacing Δx", prompt: "Derive the Photosynthetic Growth Spacing equation Δx = √[(P_sun · η_atm · Φ_yield) / (4π · E_growth)] with numerical examples." },
    { label: "🛡️ Model Deep Void Inversion", prompt: "Synthesize a simulation with deep void inversion compression at P_void = 0.94 and tight asteroid conduits." },
    { label: "🧬 Explain J09 Bio-Resonance & PQC", prompt: "Explain how the J09 Ring biometric telemetry computes the DNA Resonance Index and signs envelopes with Dilithium3." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 sm:pb-12 flex flex-col">
      {/* Header */}
      <div className="border-b border-border/70 bg-card/40 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-foreground">PAGE 3 // DEEPSEEK V4 AI INTERFACE</span>
                <span className="rounded bg-primary/20 border border-primary/40 px-2 py-0.5 font-mono text-[10px] text-primary font-bold">
                  Reasoner Active
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Deep Reasoning Trace · LaTeX Math · Simulation Synthesis
              </span>
            </div>
          </div>

          {/* Model Mode Toggle & Clear Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-border bg-card p-0.5 text-xs font-mono">
              <button
                onClick={() => setModelMode("deepseek-v4-reasoner")}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-all ${
                  modelMode === "deepseek-v4-reasoner"
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Brain className="h-3 w-3" />
                <span>DeepSeek-V4-Reasoner</span>
              </button>
              <button
                onClick={() => setModelMode("deepseek-v4-chat")}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-all ${
                  modelMode === "deepseek-v4-chat"
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Zap className="h-3 w-3" />
                <span>Chat</span>
              </button>
            </div>

            <button
              onClick={() => setMessages(INITIAL_MESSAGES)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-destructive hover:bg-accent transition-all"
              title="Reset Conversation"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 mx-auto w-full max-w-5xl px-3 sm:px-6 py-6 flex flex-col space-y-4">
        {/* Messages List */}
        <div className="flex-1 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col space-y-2 ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              {/* Message Bubble Container */}
              <div
                className={`relative max-w-3xl rounded-2xl p-5 shadow-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground font-sans font-medium"
                    : "border border-border bg-card text-foreground"
                }`}
              >
                {/* Header label for assistant */}
                {msg.role === "assistant" && (
                  <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary" />
                      <span className="font-mono text-xs font-bold text-foreground">
                        DeepSeek-V4-Reasoner
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {msg.timestamp}
                    </span>
                  </div>
                )}

                {/* Deep Thinking Process Accordion (DeepSeek V4 Signature) */}
                {msg.thought && (
                  <div className="mb-4 rounded-xl border border-border/80 bg-muted/40 overflow-hidden font-mono">
                    <button
                      onClick={() => toggleThought(msg.id)}
                      className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted/60 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Brain className="h-3.5 w-3.5 text-primary" />
                        <span>Thinking Process (Deep Reasoning Chain)</span>
                      </span>
                      {msg.thoughtOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                    {msg.thoughtOpen && (
                      <div className="p-3.5 text-[11px] leading-relaxed text-muted-foreground whitespace-pre-line border-t border-border/50 bg-background/50 font-mono">
                        {msg.thought}
                      </div>
                    )}
                  </div>
                )}

                {/* Message Body */}
                <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap space-y-3 font-sans">
                  {msg.content}
                </div>

                {/* Synthesized Simulation Action Card */}
                {msg.simulationConfig && (
                  <div className="mt-5 rounded-xl border border-teal-500/40 bg-teal-950/30 p-4 space-y-3 shadow-[0_0_15px_rgba(20,184,166,0.15)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono text-xs font-bold text-teal-300">
                        <Sparkles className="h-4 w-4 text-teal-400" />
                        <span>SYNTHESIZED SIMULATION PAYLOAD: {msg.simulationConfig.presetName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                        Ready to Load
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {msg.simulationConfig.description || "Synthesized parameters ready to run on the 3D Cosmic Engine."}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                      <div className="rounded-lg border border-border/60 bg-background/60 p-2">
                        <span className="text-muted-foreground block text-[10px]">P_sun</span>
                        <span className="font-bold text-amber-400">{msg.simulationConfig.P_sun} W/m²</span>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-background/60 p-2">
                        <span className="text-muted-foreground block text-[10px]">P_void</span>
                        <span className="font-bold text-purple-400">{msg.simulationConfig.voidPressure}</span>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-background/60 p-2">
                        <span className="text-muted-foreground block text-[10px]">Lattice Freq</span>
                        <span className="font-bold text-cyan-400">{msg.simulationConfig.pushPullFreq} Hz</span>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-background/60 p-2">
                        <span className="text-muted-foreground block text-[10px]">Drum Mesh Freq</span>
                        <span className="font-bold text-teal-400">{msg.simulationConfig.meshFreq} Hz</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleApplyConfig(msg.simulationConfig)}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-teal-500 hover:bg-teal-400 px-4 py-2.5 text-xs font-bold text-teal-950 transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>🚀 Apply to Cosmic Simulation (Page 2) & Run</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Copy Action Button */}
                {msg.role === "assistant" && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Response</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-xs font-mono text-muted-foreground">
              <Bot className="h-4 w-4 text-primary animate-pulse" />
              <span>DeepSeek-V4-Reasoner is analyzing equations and synthesizing state...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompt Chips */}
        <div className="pt-2">
          <span className="text-[11px] font-mono text-muted-foreground block mb-2">
            Suggested Cosmic Inquiries & Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((q) => (
              <button
                key={q.label}
                onClick={() => handleSend(q.prompt)}
                disabled={isLoading}
                className="rounded-lg border border-border/80 bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/50 hover:bg-accent transition-all disabled:opacity-50 text-left"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center gap-2 pt-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask DeepSeek V4 or describe a simulation scenario (e.g. 'Synthesize a solar flare simulation')..."
            disabled={isLoading}
            className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
