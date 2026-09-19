import { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios"

// ── Types ──────────────────────────────────────────────────────────────────
type Step = "upload" | "processing" | "results";

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  timestamp: string;
}

// ── Circuit Cube ────────────────────────────────────────────────────────────
function CircuitCube({ size = 180, glowing = false }: { size?: number; glowing?: boolean }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={glowing ? "cube-pulse" : ""}>
      {/* outer glow ring */}
      {glowing && (
        <circle cx="100" cy="100" r="96" fill="rgba(14,165,233,0.06)" stroke="rgba(125,211,252,0.25)" strokeWidth="2" strokeDasharray="8 6" />
      )}
      {/* cube body */}
      <rect x="28" y="28" width="144" height="144" rx="22" fill="url(#cubeGrad)" stroke="rgba(125,211,252,0.7)" strokeWidth="2" />
      {/* circuit lines */}
      <g stroke="rgba(20,184,166,0.6)" strokeWidth="1.5" strokeLinecap="round">
        <line x1="28" y1="72" x2="56" y2="72"/>
        <line x1="56" y1="72" x2="56" y2="56"/>
        <line x1="56" y1="56" x2="80" y2="56"/>
        <line x1="172" y1="72" x2="144" y2="72"/>
        <line x1="144" y1="72" x2="144" y2="56"/>
        <line x1="144" y1="56" x2="120" y2="56"/>
        <line x1="28" y1="128" x2="56" y2="128"/>
        <line x1="56" y1="128" x2="56" y2="144"/>
        <line x1="56" y1="144" x2="80" y2="144"/>
        <line x1="172" y1="128" x2="144" y2="128"/>
        <line x1="144" y1="128" x2="144" y2="144"/>
        <line x1="144" y1="144" x2="120" y2="144"/>
        <line x1="100" y1="28" x2="100" y2="52"/>
        <line x1="100" y1="172" x2="100" y2="148"/>
      </g>
      {/* corner nodes */}
      {[[56,56],[144,56],[56,144],[144,144]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="5" fill="rgba(20,184,166,0.4)" stroke="#14b8a6" strokeWidth="1.5"/>
      ))}
      {/* center glowing square */}
      <rect x="72" y="72" width="56" height="56" rx="10" fill="rgba(186,230,253,0.5)" stroke="rgba(125,211,252,0.8)" strokeWidth="1.5"/>
      <rect x="84" y="84" width="32" height="32" rx="6" fill="rgba(20,184,166,0.25)" stroke="#14b8a6" strokeWidth="1.2"/>
      {/* center dot */}
      <circle cx="100" cy="100" r="8" fill="#14b8a6" opacity="0.9"/>
      <circle cx="100" cy="100" r="4" fill="white" opacity="0.9"/>
      {/* gear top right */}
      <g transform="translate(148, 50)">
        <circle cx="0" cy="0" r="12" fill="rgba(186,230,253,0.6)" stroke="rgba(125,211,252,0.8)" strokeWidth="1.5"/>
        <circle cx="0" cy="0" r="5" fill="rgba(20,184,166,0.5)"/>
        {[0,45,90,135,180,225,270,315].map((a,i)=>(
          <rect key={i} x="-2" y="-14" width="4" height="5" rx="1" fill="rgba(125,211,252,0.9)"
            transform={`rotate(${a})`}/>
        ))}
      </g>
      {/* gear bottom left */}
      <g transform="translate(52, 150)">
        <circle cx="0" cy="0" r="10" fill="rgba(186,230,253,0.5)" stroke="rgba(125,211,252,0.7)" strokeWidth="1.5"/>
        <circle cx="0" cy="0" r="4" fill="rgba(20,184,166,0.4)"/>
        {[0,60,120,180,240,300].map((a,i)=>(
          <rect key={i} x="-2" y="-12" width="4" height="4" rx="1" fill="rgba(125,211,252,0.8)"
            transform={`rotate(${a})`}/>
        ))}
      </g>
      {/* decorative dots top */}
      <circle cx="100" cy="38" r="3.5" fill="#38bdf8" opacity="0.8"/>
      <circle cx="100" cy="162" r="3.5" fill="#38bdf8" opacity="0.8"/>
      <defs>
        <linearGradient id="cubeGrad" x1="28" y1="28" x2="172" y2="172" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(224,242,254,0.9)"/>
          <stop offset="100%" stopColor="rgba(186,230,253,0.7)"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// Open-door cube (step 3)
function OpenCube({ size = 200 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 220 220" fill="none">
      {/* glow */}
      <ellipse cx="110" cy="160" rx="70" ry="18" fill="rgba(20,184,166,0.12)"/>
      {/* main body */}
      <rect x="30" y="40" width="150" height="150" rx="22" fill="url(#openGrad)" stroke="rgba(125,211,252,0.7)" strokeWidth="2"/>
      {/* circuit lines */}
      <g stroke="rgba(20,184,166,0.5)" strokeWidth="1.5" strokeLinecap="round">
        <line x1="30" y1="88" x2="55" y2="88"/>
        <line x1="55" y1="88" x2="55" y2="70"/>
        <line x1="180" y1="88" x2="155" y2="88"/>
        <line x1="155" y1="88" x2="155" y2="70"/>
        <line x1="30" y1="140" x2="55" y2="140"/>
        <line x1="55" y1="140" x2="55" y2="158"/>
        <line x1="180" y1="140" x2="155" y2="140"/>
        <line x1="155" y1="140" x2="155" y2="158"/>
      </g>
      {/* door opening — glowing interior */}
      <rect x="72" y="80" width="58" height="100" rx="6" fill="url(#doorGlow)" stroke="rgba(20,184,166,0.7)" strokeWidth="1.5"/>
      {/* door panel swung open */}
      <g transform="translate(72,80) skewX(-18) scaleX(0.38)">
        <rect width="58" height="100" rx="6" fill="rgba(186,230,253,0.6)" stroke="rgba(125,211,252,0.8)" strokeWidth="1.5"/>
        <line x1="18" y1="20" x2="18" y2="80" stroke="rgba(20,184,166,0.4)" strokeWidth="1.2"/>
        <circle cx="42" cy="50" r="4" fill="rgba(20,184,166,0.5)" stroke="#14b8a6"/>
      </g>
      {/* corner nodes */}
      {[[55,70],[155,70],[55,158],[155,158]].map(([cx,cy],i)=>(
        <circle key={i} cx={cx} cy={cy} r="5" fill="rgba(20,184,166,0.35)" stroke="#14b8a6" strokeWidth="1.5"/>
      ))}
      <defs>
        <linearGradient id="openGrad" x1="30" y1="40" x2="180" y2="190" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(224,242,254,0.9)"/>
          <stop offset="100%" stopColor="rgba(186,230,253,0.7)"/>
        </linearGradient>
        <linearGradient id="doorGlow" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(20,184,166,0.5)"/>
          <stop offset="100%" stopColor="rgba(14,165,233,0.3)"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// PDF file icon
function PdfIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 90 110" fill="none">
      <rect x="4" y="4" width="68" height="88" rx="10" fill="url(#pdfGrad)" stroke="rgba(125,211,252,0.8)" strokeWidth="2"/>
      {/* folded corner */}
      <path d="M48 4 L72 28 L48 28 Z" fill="rgba(186,230,253,0.8)" stroke="rgba(125,211,252,0.6)" strokeWidth="1.5"/>
      {/* PDF label */}
      <rect x="12" y="48" width="48" height="22" rx="5" fill="rgba(14,165,233,0.85)"/>
      <text x="36" y="63" textAnchor="middle" fill="white" fontFamily="Outfit,sans-serif" fontWeight="700" fontSize="11">PDF</text>
      {/* lines */}
      <line x1="16" y1="82" x2="56" y2="82" stroke="rgba(125,211,252,0.6)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="16" y1="90" x2="44" y2="90" stroke="rgba(125,211,252,0.4)" strokeWidth="2" strokeLinecap="round"/>
      {/* glow */}
      <ellipse cx="38" cy="8" rx="20" ry="10" fill="rgba(186,230,253,0.6)" filter="url(#pdfBlur)"/>
      <defs>
        <linearGradient id="pdfGrad" x1="4" y1="4" x2="72" y2="92" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(224,242,254,0.95)"/>
          <stop offset="100%" stopColor="rgba(186,230,253,0.85)"/>
        </linearGradient>
        <filter id="pdfBlur"><feGaussianBlur stdDeviation="6"/></filter>
      </defs>
    </svg>
  );
}

// Curved arrow SVG
function Arrow({ d, delay = 0 }: { d: string; delay?: number }) {
  return (
    <svg className="absolute pointer-events-none" style={{ top: 0, left: 0, width: "100%", height: "100%", overflow: "visible" }}>
      <defs>
        <marker id={`arrow-${delay}`} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M1,1 L7,4 L1,7 Z" fill="rgba(14,165,233,0.6)"/>
        </marker>
      </defs>
      <path d={d} stroke="rgba(14,165,233,0.45)" strokeWidth="2.5" fill="none" strokeLinecap="round"
        strokeDasharray="8 5"
        markerEnd={`url(#arrow-${delay})`}
        style={{ animationDelay: `${delay}s` }}
      />
    </svg>
  );
}



// ── Upload Step ─────────────────────────────────────────────────────────────
function UploadStep({ onUpload }: { onUpload: (file:File) => void }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) onUpload(f);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onUpload(f);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Step header */}
      <div className="text-center">
        <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#0ea5e9" }}>Step 1</p>
        <h2 className="step-label text-3xl md:text-4xl" style={{ color: "#0c4a6e" }}>
          <span className="italic">CATCH</span> the file!
        </h2>
      </div>

      {/* Main illustration row */}
      <div className="relative w-full flex items-end justify-center gap-8 md:gap-16" style={{ minHeight: 220 }}>
        {/* Upload box */}
        <div className="flex flex-col items-center gap-2">
          <div
            className={`upload-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer ${dragOver ? "drag-over" : ""}`}
            style={{ width: 130, height: 110 }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p className="text-xs font-semibold mt-2" style={{ color: "#0369a1" }}>DROP FILE</p>
            <p className="text-[10px] mt-0.5" style={{ color: "#7dd3fc" }}>or click to browse</p>
          </div>
          <p className="mono text-[10px] tracking-widest uppercase" style={{ color: "#7dd3fc" }}>Upload Area.</p>
          <input ref={inputRef} type="file" className="hidden" onChange={handleFile} accept=".pdf,.doc,.docx,.txt,.csv"/>
        </div>

        {/* Floating PDF */}
        <div className="float-slow relative flex items-center justify-center my-auto">
          <div style={{ filter: "drop-shadow(0 8px 24px rgba(14,165,233,0.35))" }}>
            <PdfIcon size={72}/>
          </div>
        </div>

        {/* Vault cube */}
        <div className="relative">
          <div className="absolute -inset-4 rounded-full" style={{ background: "radial-gradient(circle, rgba(125,211,252,0.25) 0%, transparent 70%)" }}/>
          <CircuitCube size={130} glowing />
          <div className="absolute -top-3 left-0 right-0 flex justify-center">
            <div className="result-dot"/>
          </div>
        </div>
      </div>

      {/* Step 2 label */}
      <div className="text-right w-full pr-4 md:pr-16">
        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#0ea5e9" }}>Step 2</p>
        <h3 className="step-label text-xl md:text-2xl" style={{ color: "#0c4a6e" }}>
          <span className="italic">PROCESS</span>
          <br/>in the data vault!
        </h3>
      </div>


    </div>
  );
}

// ── Processing Step ─────────────────────────────────────────────────────────
function ProcessingStep({ fileName, processingDone , onDone }:
   { fileName: string; processingDone : boolean; onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("uploading document…");

  useEffect(() => {
    if(!processingDone){
    const phases = ["Uploading document…", "Chunking text…", "Generating embeddings…", "Indexing vectors…", "Ready!"];

    const interval = setInterval((prev) =>{
      setInterval((prev: number) =>{
        const next = Math.min(prev, Math.random() * 8 + 2, 95);

        const index = Math.min(Math.floor((next/100) * phases.length), phases.length -1);

        setPhase(phases[index])

        return next
      })
    }, 500)
    
    return () => clearInterval(interval)
    
  }

  setProgress(100)
  setPhase("Ready")

  const timeout = setTimeout(() =>{
    onDone()
  }, 800)
    
  return () => clearTimeout(timeout)
  }, [processingDone ,onDone]);

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="text-center">
        <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#0ea5e9" }}>Step 2</p>
        <h2 className="step-label text-3xl md:text-4xl" style={{ color: "#0c4a6e" }}>
          <span className="italic">PROCESS</span> in the data vault!
        </h2>
        <p className="text-sm mt-1" style={{ color: "#0369a1" }}>{fileName}</p>
      </div>

      <p>{phase}</p>

      <div className="w-full">
        <div
          className="h-2 rounded-full"
          style={{
            width: `${progress}%`,
            transition: "width 0.3s ease",
          }}
        />
      </div>

      <p>{Math.round(progress)}%</p>

      {/* Animated cube */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)", width: 280, height: 280, left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}/>
        {/* orbit rings */}
        <div className="absolute w-56 h-56 rounded-full border-2 border-dashed spin-anim"
          style={{ borderColor: "rgba(125,211,252,0.35)" }}/>
        <div className="absolute w-72 h-72 rounded-full border border-dashed"
          style={{ borderColor: "rgba(20,184,166,0.2)", animationDirection: "reverse", animation: "spin 6s linear infinite reverse" }}/>
        <CircuitCube size={180} glowing/>
        {/* orbiting dot */}
        <div className="absolute w-4 h-4 rounded-full"
          style={{ background: "#38bdf8", boxShadow: "0 0 12px #38bdf8", top: "10%", left: "50%", transform: "translateX(-50%)", animation: "spin 2.2s linear infinite" }}/>
      </div>

      {/* Progress */}
      <div className="glass-strong rounded-2xl p-5 w-full max-w-sm">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold" style={{ color: "#0369a1", fontFamily: "Outfit,sans-serif" }}>{phase}</span>
          <span className="mono text-sm font-bold" style={{ color: "#0ea5e9" }}>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 rounded-full" style={{ background: "rgba(125,211,252,0.2)" }}>
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg,#38bdf8,#14b8a6)", boxShadow: "0 0 10px rgba(14,165,233,0.5)" }}/>
        </div>
        <div className="flex justify-between mt-2">
          {["Parse","Chunk","Embed","Index"].map((label, i) => (
            <span key={label} className="mono text-[10px]"
              style={{ color: progress > i * 25 ? "#0ea5e9" : "#94a3b8" }}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Results Step ────────────────────────────────────────────────────────────
function ResultsStep({ fileName, messages, onRestart }:
  { fileName: string; messages: ChatMessage[]; onRestart: () => void }) {
  const msgEnd = useRef<HTMLDivElement>(null);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    msgEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-5xl mx-auto">
      <div className="text-center">
        <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#0ea5e9" }}>Step 3</p>
        <h2 className="step-label text-3xl md:text-4xl" style={{ color: "#0c4a6e" }}>
          <span className="italic">GIVE</span> the results!
        </h2>
        <p className="text-sm mt-1" style={{ color: "#0369a1" }}>{fileName} · Indexed</p>
      </div>

      {/* Layout row: Open cube on left + Larger Chat card on right */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-10 w-full px-4">
        {/* Open cube */}
        <div className="float-anim flex items-center justify-center shrink-0">
          <OpenCube size={210}/>
        </div>

        {/* Chat card - Expanded and shifted right */}
        <div className="glass-strong rounded-3xl shadow-2xl flex-1 w-full max-w-2xl flex flex-col overflow-hidden slide-up"
          style={{ border: "1.5px solid rgba(125,211,252,0.6)", minHeight: 380, maxHeight: 500 }}>
          {/* Card header */}
          <div className="px-5 py-3.5 flex items-center justify-between border-b" style={{ borderColor: "rgba(125,211,252,0.25)" }}>
            <div className="flex items-center gap-3">
              
              <div>
                <p className="text-sm font-bold" style={{ color: "#0369a1", fontFamily: "Outfit,sans-serif" }}>AI Assistant</p>
                <div className="flex items-center gap-1.5">
                  <div className="result-dot" style={{ width: 6, height: 6 }}/>
                  <span className="text-xs" style={{ color: "#14b8a6" }}>Ready · {fileName}</span>
                </div>
              </div>
            </div>

            <button onClick={onRestart} className="pill-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.1"/>
              </svg>
              RESTART UPLOAD
            </button>
          </div>

          {/* Messages */}
         <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" style={{ maxHeight: 400 }}>
                {messages.map(m => (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.role === "user" ? "justify-end" : "justify-start"
                    } slide-up`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 max-w-[85%] text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-sky-100/80 text-sky-950 border border-sky-200/80 shadow-sm"
                          : "bg-white/80 text-slate-800 border border-sky-100/90 shadow-sm ml-3"
                      }`}
                      style={{ fontFamily: "Inter,sans-serif" }}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
            {typing && (
              <div className="flex justify-start items-center gap-2 ml-2">
                
                <div className="flex gap-1.5 px-4 py-2.5 rounded-2xl bg-white/70 border border-sky-100/80">
                  <div className="w-2 h-2 rounded-full bg-sky-400 t1"/>
                  <div className="w-2 h-2 rounded-full bg-sky-400 t2"/>
                  <div className="w-2 h-2 rounded-full bg-sky-400 t3"/>
                </div>
              </div>
            )}
            <div ref={msgEnd}/>
          </div>
        </div>
      </div>
  );
}

// ── Root App ────────────────────────────────────────────────────────────────
const INITIAL_AI = "Hello, friend! I've read your file. Feel free to ask me anything. 😉"

export default function App() {
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [replyIdx, setReplyIdx] = useState(0);
  const [processingDone, setProcessingDone] = useState(false);

  const handleUpload = useCallback(async(file : File) => {

      try{
        setProcessingDone(false)
        setStep("processing")
        const formData = new FormData()
        formData.append("file",file)

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/upload_file`,
          formData
        )
        console.log(response.data)

        setProcessingDone(true)

      } catch (error){
        console.error("Upload failed", error)
      }
  }, []);

  const handleProcessingDone = useCallback(() => {
    setMessages([{
      id: "ai-0",
      role: "ai",
      text: INITIAL_AI,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    }]);
    setStep("results");
  }, []);

  const sendMessage = useCallback(async () => {
    const text = chatInput.trim();
    if (!text) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages(prev => [...prev, userMsg]);
    setChatInput("");
    
    try{
     const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/ask_query`,
            {
                question: text
            }
        );

        console.log("API RESPONSE:", response.data);

        const aiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "ai",
            text: response.data.answer,
            timestamp: new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };

        setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
        console.error("Question failed:", error);
    }
}, [chatInput]);

  const handleRestart = useCallback(() => {
    setStep("upload");
    setFileName("");
    setMessages([]);
    setChatInput("");
    setReplyIdx(0);
  }, []);

  const handleBarSend =  () => {
    if (step === "results") {
      sendMessage();
    } else if (step === "upload") {
      if (chatInput.trim()) {
        setFileName("sample-data.pdf");
        setStep("processing");
      }
    }
  };

  return (
    <div className="page-bg min-h-screen flex flex-col">
      {/* Top nav bar */}
      <nav className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(125,211,252,0.25)" }}>
        <div className="flex items-center gap-2.5">
        </div>
        <div className="flex items-center gap-3">
          {step !== "upload" && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass"
              style={{ border: "1px solid rgba(125,211,252,0.4)" }}>
              <div className="result-dot"/>
              <span className="text-xs font-medium" style={{ color: "#0369a1", fontFamily: "Outfit,sans-serif" }}>
                {step === "processing" ? "Processing…" : "Indexed"}
              </span>
            </div>
          )}
          <div className="w-8 h-8 rounded-full"
            style={{ background: "linear-gradient(135deg,#38bdf8,#14b8a6)", boxShadow: "0 0 12px rgba(14,165,233,0.3)" }}/>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 py-8 gap-8">
        {/* Step progress dots */}
        <div className="flex items-center gap-3">
          {(["upload","processing","results"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${step === s ? "scale-125" : ""}`}
                style={{
                  background: step === s ? "#0ea5e9" : ["upload","processing","results"].indexOf(step) > i ? "#14b8a6" : "rgba(125,211,252,0.35)",
                  boxShadow: step === s ? "0 0 10px rgba(14,165,233,0.6)" : "none",
                }}/>
              {i < 2 && <div className="w-8 h-px" style={{ background: "rgba(125,211,252,0.35)" }}/>}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div key={step} className="w-full max-w-5xl step-enter">
          {step === "upload" && (<UploadStep onUpload={handleUpload} />)}
          {step === "processing" && <ProcessingStep fileName={fileName} processingDone = {processingDone} onDone={handleProcessingDone}/>}
          {step === "results" && (
            <ResultsStep
              fileName={fileName}
              messages={messages}
              onRestart={handleRestart}
            />
          )}
        </div>

      </main>

      {/* Bottom search bar — always visible like in design */}
      <footer className="px-4 pb-6 pt-2 flex justify-center">
        <div className="search-pill rounded-full w-full max-w-xl flex items-center gap-3 px-5 py-3">
          {/* left dots like in image */}
          <div className="flex gap-1.5 shrink-0">
            <div className="w-2 h-2 rounded-full" style={{ background: "rgba(125,211,252,0.5)" }}/>
            <div className="result-dot" style={{ width: 8, height: 8 }}/>
          </div>

          <input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleBarSend()}
            placeholder="Ask me anything about the data!"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "#0369a1", fontFamily: "Inter,sans-serif" }}
          />

          {/* right dots */}
          <div className="flex gap-1.5 shrink-0">
            <div className="result-dot" style={{ width: 8, height: 8 }}/>
            <div className="w-2 h-2 rounded-full" style={{ background: "rgba(125,211,252,0.5)" }}/>
          </div>

          <button onClick={handleBarSend} className="send-btn w-9 h-9 rounded-full flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
}
