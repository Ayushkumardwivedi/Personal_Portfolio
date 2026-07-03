import { useEffect, useRef, useState, type MouseEvent } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import ayushPhoto from "@/assets/ayush.png.asset.json";

// ============ CUSTOM CURSOR + SPIDER HERO ============
function SpiderCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 120, damping: 18, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 120, damping: 18, mass: 0.6 });
  const anchor = useRef({ x: 0, y: 0 });
  const [webs, setWebs] = useState<Array<{ id: number; x1: number; y1: number; x2: number; y2: number }>>([]);
  const [bursts, setBursts] = useState<Array<{ id: number; x: number; y: number; word: string }>>([]);
  const idRef = useRef(0);

  useEffect(() => {
    anchor.current = { x: window.innerWidth / 2, y: 0 };
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const click = (e: PointerEvent) => {
      const id = ++idRef.current;
      const words = ["THWIP!", "POW!", "ZAP!", "BAM!", "WHAM!", "SNAP!"];
      setBursts((b) => [...b, { id, x: e.clientX, y: e.clientY, word: words[Math.floor(Math.random() * words.length)] }]);
      setWebs((w) => [...w, { id, x1: anchor.current.x, y1: anchor.current.y, x2: e.clientX, y2: e.clientY }]);
      setTimeout(() => {
        setBursts((b) => b.filter((it) => it.id !== id));
        setWebs((w) => w.filter((it) => it.id !== id));
      }, 600);
      anchor.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", click);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", click);
    };
  }, [x, y]);

  return (
    <>
      {/* web lines */}
      <svg className="pointer-events-none fixed inset-0 z-[60] h-full w-full">
        {webs.map((w) => (
          <motion.line
            key={w.id}
            x1={w.x1}
            y1={w.y1}
            x2={w.x2}
            y2={w.y2}
            stroke="white"
            strokeWidth={1.5}
            initial={{ pathLength: 0, opacity: 1 }}
            animate={{ pathLength: 1, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        ))}
      </svg>

      {/* spider hero glyph */}
      <motion.div
        style={{ x: sx, y: sy }}
        className="pointer-events-none fixed left-0 top-0 z-[70] -ml-4 -mt-4 h-8 w-8"
      >
        <SpiderGlyph />
      </motion.div>

      {/* comic bursts */}
      <AnimatePresence>
        {bursts.map((b) => (
          <motion.div
            key={b.id}
            initial={{ scale: 0, rotate: -20, opacity: 0 }}
            animate={{ scale: 1.2, rotate: [-15, 10, -5, 0], opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-none fixed z-[65] -translate-x-1/2 -translate-y-1/2"
            style={{ left: b.x, top: b.y }}
          >
            <div
              className="clip-hex bg-primary px-6 py-3 font-black tracking-widest text-primary-foreground"
              style={{ fontFamily: "Orbitron", boxShadow: "var(--shadow-neon-red)" }}
            >
              {b.word}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
}

function SpiderGlyph() {
  return (
    <svg viewBox="0 0 32 32" className="h-full w-full drop-shadow-[0_0_6px_rgba(255,0,60,0.9)]">
      <g stroke="white" strokeWidth="1" fill="oklch(0.62 0.24 25)">
        <circle cx="16" cy="16" r="5" />
        <circle cx="16" cy="12" r="3" />
        {/* legs */}
        <path d="M11 14 L4 9 M11 16 L3 16 M11 18 L4 23 M21 14 L28 9 M21 16 L29 16 M21 18 L28 23" strokeWidth="1.2" fill="none" />
        {/* mask eyes */}
        <path d="M14 11 l1.5 -1 1 1.5 -1.5 1 z" fill="white" />
        <path d="M18 11 l-1.5 -1 -1 1.5 1.5 1 z" fill="white" />
      </g>
    </svg>
  );
}

// ============ RAIN / DRONES / HELICOPTERS ============
function RainLayer() {
  const drops = Array.from({ length: 80 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {drops.map((_, i) => {
        const left = Math.random() * 100;
        const dur = 0.6 + Math.random() * 1.2;
        const delay = Math.random() * -2;
        return (
          <span
            key={i}
            className="absolute top-0 h-8 w-px bg-gradient-to-b from-transparent via-white/40 to-transparent"
            style={{ left: `${left}%`, animation: `rain ${dur}s linear ${delay}s infinite` }}
          />
        );
      })}
    </div>
  );
}

function CitySkyline({ opacity = 1 }: { opacity?: number }) {
  // procedural buildings with lit windows
  const buildings = Array.from({ length: 22 }).map((_, i) => ({
    w: 40 + Math.random() * 90,
    h: 120 + Math.random() * 360,
    windows: 4 + Math.floor(Math.random() * 10),
    key: i,
  }));
  return (
    <div className="absolute inset-x-0 bottom-0 flex items-end" style={{ opacity }}>
      {buildings.map((b) => (
        <div
          key={b.key}
          className="relative shrink-0"
          style={{
            width: b.w,
            height: b.h,
            background: "linear-gradient(180deg, oklch(0.10 0.04 260), oklch(0.05 0.02 260))",
            borderLeft: "1px solid oklch(0.28 0.06 260)",
            borderRight: "1px solid oklch(0.28 0.06 260)",
            clipPath: Math.random() > 0.6 ? "polygon(0 20%, 20% 0, 80% 0, 100% 20%, 100% 100%, 0 100%)" : undefined,
          }}
        >
          <div className="absolute inset-2 grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(6, Math.max(2, Math.floor(b.w / 20)))}, 1fr)` }}>
            {Array.from({ length: b.windows * 3 }).map((_, j) => {
              const on = Math.random() > 0.35;
              const color = Math.random() > 0.8 ? "oklch(0.68 0.22 250)" : "oklch(0.85 0.15 90)";
              return (
                <span
                  key={j}
                  className="block h-2 w-full"
                  style={{
                    background: on ? color : "oklch(0.14 0.03 260)",
                    opacity: on ? 0.6 + Math.random() * 0.4 : 0.2,
                    animation: on && Math.random() > 0.9 ? `flicker ${2 + Math.random() * 4}s infinite` : undefined,
                  }}
                />
              );
            })}
          </div>
          {/* antenna */}
          {Math.random() > 0.6 && (
            <div
              className="absolute left-1/2 -top-6 h-6 w-px bg-white/40"
              style={{ transform: "translateX(-50%)" }}
            >
              <span className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_8px_oklch(0.62_0.24_25)] animate-flicker" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SkyLife() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* helicopter */}
      <div className="absolute top-[12%]" style={{ animation: "helicopter 18s linear infinite" }}>
        <div className="relative">
          <span className="block h-1 w-6 bg-white/60" />
          <span className="absolute -left-3 -top-1 h-0.5 w-12 bg-white/30" style={{ animation: "spin 0.15s linear infinite" }} />
          <span className="absolute -bottom-1 left-4 h-1 w-1 rounded-full bg-primary animate-flicker" />
        </div>
      </div>
      {/* drones */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute h-2 w-2"
          style={{
            top: `${15 + i * 12}%`,
            left: `${10 + i * 22}%`,
            animation: `float-drone ${3 + i}s ease-in-out infinite`,
          }}
        >
          <span className="block h-1 w-1 rounded-full bg-secondary shadow-[0_0_8px_oklch(0.68_0.22_250)] animate-flicker" />
        </div>
      ))}
      {/* moving clouds */}
      <div className="absolute inset-0 opacity-20" style={{
        background: "radial-gradient(ellipse at 20% 10%, oklch(0.30 0.06 260) 0%, transparent 40%), radial-gradient(ellipse at 80% 20%, oklch(0.25 0.08 25) 0%, transparent 45%)",
      }} />
    </div>
  );
}

function Billboard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`clip-slant border-2 border-primary bg-black px-4 py-2 text-sm font-bold tracking-widest text-neon-red animate-billboard ${className}`}
      style={{ fontFamily: "Share Tech Mono" }}
    >
      {children}
    </div>
  );
}

// ============ SECTION HEADER (kinetic) ============
function SectionTitle({ index, title, subtitle }: { index: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-16 flex items-end justify-between border-b-2 border-primary pb-4">
      <div>
        <div className="mb-2 flex items-center gap-3 text-xs tracking-[0.3em] text-secondary" style={{ fontFamily: "Share Tech Mono" }}>
          <span className="text-neon-blue">// SECTOR {index}</span>
          <span className="h-px w-16 bg-secondary/60" />
          {subtitle && <span className="opacity-70">{subtitle}</span>}
        </div>
        <motion.h2
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-black uppercase leading-none tracking-tight text-foreground md:text-7xl"
        >
          {title.split("").map((c, i) => (
            <span key={i} className="inline-block" style={{ textShadow: i % 3 === 0 ? "3px 3px 0 oklch(0.62 0.24 25)" : "2px 2px 0 oklch(0.68 0.22 250)" }}>{c === " " ? "\u00A0" : c}</span>
          ))}
        </motion.h2>
      </div>
      <div className="hidden md:block">
        <Billboard>LIVE ▸ NYC 03:14 AM</Billboard>
      </div>
    </div>
  );
}

// ============ HERO ============
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const midY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const fgY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  return (
    <section ref={ref} className="relative h-screen w-full overflow-hidden">
      {/* sky gradient */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, oklch(0.06 0.02 260) 0%, oklch(0.14 0.08 260) 40%, oklch(0.10 0.10 25) 100%)" }} />
      {/* stars (deterministic to avoid SSR hydration mismatch) */}
      <div className="absolute inset-0">
        {Array.from({ length: 60 }).map((_, i) => {
          const left = ((i * 97) % 100);
          const top = ((i * 53) % 60);
          const opacity = 0.3 + (((i * 37) % 70) / 100);
          return (
            <span key={i} className="absolute h-px w-px bg-white" style={{ left: `${left}%`, top: `${top}%`, opacity }} />
          );
        })}
      </div>
      <SkyLife />
      {/* moon */}
      <div className="absolute right-[10%] top-[15%] h-40 w-40 rounded-full" style={{ background: "radial-gradient(circle, oklch(0.95 0.05 90) 0%, oklch(0.7 0.15 25 / 0.4) 60%, transparent 70%)", boxShadow: "0 0 100px oklch(0.7 0.15 25 / 0.3)" }} />

      {/* parallax city layers */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 opacity-40 blur-[1px]">
        <CitySkyline opacity={0.5} />
      </motion.div>
      <motion.div style={{ y: midY }} className="absolute inset-0 opacity-70">
        <CitySkyline opacity={0.85} />
      </motion.div>

      {/* web pattern */}
      <svg className="pointer-events-none absolute right-0 top-0 h-[60vh] w-[60vh] opacity-20" viewBox="0 0 200 200">
        <g stroke="white" fill="none" strokeWidth="0.4">
          {[20, 40, 60, 80, 100].map((r) => (
            <circle key={r} cx="200" cy="0" r={r} />
          ))}
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * Math.PI) / 12;
            return <line key={i} x1="200" y1="0" x2={200 - Math.cos(a) * 100} y2={Math.sin(a) * 100} />;
          })}
        </g>
      </svg>

      <motion.div style={{ y: fgY }} className="relative z-10 mx-auto grid h-full max-w-7xl grid-cols-1 items-center gap-10 px-6 md:grid-cols-[1fr_auto]">
        <div>
        <div className="mb-6 flex items-center gap-3" style={{ fontFamily: "Share Tech Mono" }}>
          <span className="h-2 w-2 animate-flicker bg-primary" />
          <span className="text-xs tracking-[0.4em] text-secondary">TRANSMISSION // 07.02.26 // PATCHED IN</span>
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-[14vw] font-black uppercase leading-[0.85] tracking-tighter text-foreground md:text-[8rem]"
        >
          <span className="block" style={{ textShadow: "6px 6px 0 oklch(0.62 0.24 25), 12px 12px 0 oklch(0.68 0.22 250 / 0.6)" }}>AYUSH</span>
          <span className="block text-neon-red">DWIVEDI</span>
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-6 flex flex-wrap items-center gap-4"
        >
          <div className="clip-panel border-2 border-secondary bg-black/70 px-5 py-3 backdrop-blur">
            <p className="max-w-xl text-lg text-foreground/90" style={{ fontFamily: "Rajdhani", fontWeight: 500 }}>
              Computer Science Engineer passionate about Software Engineering, Artificial Intelligence, and Building scalable systems that solve Real-World Problems. Swinging between systems, delivering AI-powered software solutions.
            </p>
          </div>
        </motion.div>

        <div className="mt-10 flex flex-wrap gap-4">
          <HeroButton primary>ENTER THE CITY ▸</HeroButton>
          <a href= "/Ayush Kumar Dwivedi Resume.pdf" download="Ayush Kumar Dwivedi Resume.pdf"> <HeroButton>DOWNLOAD RESUME</HeroButton> </a>
        </div>
        </div>

        {/* PHOTO SLOT */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative mx-auto hidden md:block"
        >
          <div className="absolute -inset-3 border-2 border-primary" style={{ clipPath: "polygon(12% 0, 100% 0, 100% 88%, 88% 100%, 0 100%, 0 12%)", boxShadow: "var(--shadow-neon-red)" }} />
          <div className="absolute -inset-6 border border-secondary/60" style={{ clipPath: "polygon(12% 0, 100% 0, 100% 88%, 88% 100%, 0 100%, 0 12%)" }} />
          <div
            className="relative h-[380px] w-[300px] overflow-hidden bg-gradient-to-br from-primary/20 via-black to-secondary/20"
            style={{ clipPath: "polygon(12% 0, 100% 0, 100% 88%, 88% 100%, 0 100%, 0 12%)" }}
          >
            <img
              src="/Ayush.png"
              alt="Ayush Kumar Dwivedi"
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-[10px] tracking-[0.3em] text-neon-red" style={{ fontFamily: "Share Tech Mono" }}>
              ● SUBJECT: A. DWIVEDI
            </div>
          </div>
        </motion.div>

        <div className="absolute bottom-8 left-6 right-6 flex flex-wrap items-center justify-between gap-4">
          <Billboard>SIGNAL ACTIVE ● RESPONDING</Billboard>
          <div className="flex gap-2 text-xs text-secondary" style={{ fontFamily: "Share Tech Mono" }}>
            <span className="text-neon-blue">SCROLL ↓</span>
            <span className="opacity-60">TO PATROL ROOFTOPS</span>
          </div>
          <Billboard className="border-secondary text-neon-blue">BATTERY 100% ⚡</Billboard>
        </div>
      </motion.div>

      {/* scanning line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" style={{ animation: "scan 6s linear infinite" }} />
    </section>
  );
}

function HeroButton({ children, primary }: { children: React.ReactNode; primary?: boolean }) {
  return (
    <button
      className={`clip-slant border-2 px-8 py-4 font-bold uppercase tracking-widest transition-all hover:-translate-y-1 ${
        primary
          ? "border-primary bg-primary text-primary-foreground hover:shadow-[0_0_30px_oklch(0.62_0.24_25/0.8)]"
          : "border-secondary bg-transparent text-secondary hover:bg-secondary/10 hover:shadow-[0_0_30px_oklch(0.68_0.22_250/0.6)]"
      }`}
      style={{ fontFamily: "Orbitron" }}
    >
      {children}
    </button>
  );
}

// ============ ABOUT ============
function About() {
  return (
    <section className="relative overflow-hidden bg-background py-32">
      <div className="city-grid absolute inset-0 opacity-30" />
      <div className="relative mx-auto max-w-7xl px-6">
        <SectionTitle index="01" title="ORIGIN STORY" subtitle="WHO IS BEHIND THE MASK" />
        <div className="grid gap-8 md:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="clip-panel col-span-12 border-2 border-primary bg-card p-8 md:col-span-7"
          >
            <p className="text-2xl leading-relaxed text-foreground/90" style={{ fontFamily: "Rajdhani", fontWeight: 500 }}>
              I engineer <span className="text-neon-red">intelligent software</span> by combining AI, backend development, workflow automation, and modern cloud technologies. Whether it's building Django applications, designing LLM-powered solutions, orchestrating n8n workflows, or developing blockchain platforms, I focus on creating scalable systems that solve real-world problems.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-border pt-6">
              {[
                { k: "8+", v: "PROJECTS SHIPPED" },
                { k: "12+", v: "HACKATHONS" },
                { k: "3", v: "INDUSTRY INTERNSHIPS" },
              ].map((s) => (
                <div key={s.v} className="border-l-2 border-secondary pl-3">
                  <div className="text-3xl font-black text-neon-blue" style={{ fontFamily: "Orbitron" }}>{s.k}</div>
                  <div className="text-[10px] tracking-widest text-muted-foreground" style={{ fontFamily: "Share Tech Mono" }}>{s.v}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="col-span-12 flex flex-col gap-4 md:col-span-5"
          >
            <HoloCard label="IDENTITY" value="Ayush K. Dwivedi" />
            <HoloCard label="CLASS" value="Software Engineer / AI Engineer" />
            <HoloCard label="LOCATION" value="Earth-6116 // India" />
            <HoloCard label="STATUS" value="AVAILABLE FOR MISSIONS" glow />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HoloCard({ label, value, glow }: { label: string; value: string; glow?: boolean }) {
  return (
    <div
      className={`clip-slant-l relative border-2 bg-card/80 p-4 backdrop-blur ${glow ? "border-primary" : "border-secondary"}`}
      style={{ boxShadow: glow ? "var(--shadow-neon-red)" : undefined }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] tracking-[0.3em] text-muted-foreground" style={{ fontFamily: "Share Tech Mono" }}>
            /// {label}
          </div>
          <div
  className={`text-xl font-bold ${
    value === "AVAILABLE FOR MISSIONS"
      ? "text-green-400"
      : glow
      ? "text-neon-red"
      : "text-neon-blue"
  }`}
  style={{ fontFamily: "Orbitron" }}
>
  {value}
</div>
        </div>
        <span className={`h-3 w-3 ${glow ? "bg-primary" : "bg-secondary"} animate-flicker`} />
      </div>
    </div>
  );
}

// ============ PROJECTS ============
const PROJECTS = [
  { title: "NEURAL WEB", tag: "AI / LLM", desc: "Multi-agent RAG platform orchestrating 40k+ docs with vector recall under 80ms.", stack: ["Next.js", "Python", "pgvector", "OpenAI"] },
  { title: "CITY-SYNC", tag: "DISTRIBUTED", desc: "Real-time collab whiteboard with CRDT sync across 500+ concurrent nodes.", stack: ["Rust", "WebRTC", "Yjs"] },
  { title: "SPIDR-CLI", tag: "DEVTOOL", desc: "Terminal-native code review agent that swings through PRs and lands verdicts.", stack: ["Go", "LLM", "GitHub API"] },
  { title: "PATROL DASH", tag: "PLATFORM", desc: "Ops dashboard fusing 12 microservices into one holographic mission control.", stack: ["React", "GraphQL", "Grafana"] },
  { title: "SIGNAL-6", tag: "MOBILE / AI", desc: "On-device speech-to-intent model shipping to 20k+ nightly active users.", stack: ["Swift", "CoreML", "Whisper"] },
  { title: "WEB-SHOOTER", tag: "OPEN SOURCE", desc: "Zero-config edge-function bundler adopted across 300+ repos.", stack: ["TypeScript", "esbuild", "Wasm"] },
];

function Projects() {
  return (
    <section className="relative overflow-hidden bg-background py-32">
      <div className="web-bg absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-7xl px-6">
        <SectionTitle index="02" title="MISSION LOG" subtitle="SHIPPED FROM THE ROOFTOPS" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((p, i) => (
            <ProjectCard key={p.title} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project, index }: { project: (typeof PROJECTS)[number]; index: number }) {
  const [hover, setHover] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({ x: ((e.clientY - r.top) / r.height - 0.5) * -8, y: ((e.clientX - r.left) / r.width - 0.5) * 8 });
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      onMouseMove={onMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setTilt({ x: 0, y: 0 }); }}
      style={{ transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      className="clip-panel group relative border-2 border-border bg-card p-6 transition-colors hover:border-primary"
    >
      <div className="absolute inset-0 -z-10 opacity-0 transition-opacity group-hover:opacity-100" style={{ background: "radial-gradient(circle at 50% 0%, oklch(0.62 0.24 25 / 0.15), transparent 70%)" }} />
      <div className="mb-4 flex items-center justify-between">
        <span className="border border-secondary px-2 py-0.5 text-[10px] tracking-widest text-neon-blue" style={{ fontFamily: "Share Tech Mono" }}>
          {project.tag}
        </span>
        <span className="text-xs text-muted-foreground" style={{ fontFamily: "Share Tech Mono" }}>#{String(index + 1).padStart(3, "0")}</span>
      </div>
      <h3 className="mb-3 text-2xl font-black uppercase leading-tight text-foreground" style={{ textShadow: hover ? "2px 2px 0 oklch(0.62 0.24 25)" : undefined }}>
        {project.title}
      </h3>
      <p className="mb-6 text-sm text-muted-foreground" style={{ fontFamily: "Rajdhani", fontWeight: 400 }}>{project.desc}</p>
      <div className="flex flex-wrap gap-2">
        {project.stack.map((s) => (
          <span key={s} className="border border-border bg-muted/50 px-2 py-0.5 text-[10px] text-foreground/80" style={{ fontFamily: "Share Tech Mono" }}>{s}</span>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <span className="text-xs tracking-widest text-neon-red" style={{ fontFamily: "Share Tech Mono" }}>▸ DEPLOY LOG</span>
        <span className="text-lg text-foreground transition-transform group-hover:translate-x-2">↗</span>
      </div>
    </motion.div>
  );
}

// ============ SKILLS NETWORK ============
const SKILLS = [
  { n: "React", x: 50, y: 50, size: 40, cat: "core" },
  { n: "TypeScript", x: 22, y: 30, size: 30, cat: "core" },
  { n: "Node", x: 78, y: 32, size: 28, cat: "core" },
  { n: "Python", x: 30, y: 72, size: 30, cat: "ai" },
  { n: "Rust", x: 72, y: 74, size: 24, cat: "systems" },
  { n: "Go", x: 15, y: 55, size: 22, cat: "systems" },
  { n: "PostgreSQL", x: 85, y: 55, size: 26, cat: "data" },
  { n: "LLM Ops", x: 40, y: 18, size: 24, cat: "ai" },
  { n: "GSAP", x: 60, y: 18, size: 20, cat: "motion" },
  { n: "Three.js", x: 88, y: 82, size: 22, cat: "motion" },
  { n: "Docker", x: 12, y: 82, size: 22, cat: "infra" },
  { n: "AWS", x: 92, y: 15, size: 22, cat: "infra" },
];

function SkillsNetwork() {
  return (
    <section className="relative overflow-hidden bg-background py-32">
      <div className="relative mx-auto max-w-7xl px-6">
        <SectionTitle index="03" title="SKILL NETWORK" subtitle="CONNECTED SYSTEMS" />
        <div className="relative aspect-[16/10] w-full border-2 border-border bg-card/40 clip-panel">
          <div className="city-grid absolute inset-0 opacity-40" />
          <svg className="absolute inset-0 h-full w-full">
            {SKILLS.map((a, i) =>
              SKILLS.slice(i + 1).map((b, j) => {
                const dist = Math.hypot(a.x - b.x, a.y - b.y);
                if (dist > 35) return null;
                return (
                  <line
                    key={`${i}-${j}`}
                    x1={`${a.x}%`} y1={`${a.y}%`} x2={`${b.x}%`} y2={`${b.y}%`}
                    stroke={a.cat === b.cat ? "oklch(0.62 0.24 25)" : "oklch(0.68 0.22 250)"}
                    strokeOpacity={0.35}
                    strokeWidth={0.8}
                    strokeDasharray="3 3"
                  />
                );
              }),
            )}
          </svg>
          {SKILLS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 180 }}
              whileHover={{ scale: 1.15 }}
              className="clip-hex absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center border-2 bg-black text-center"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.size * 2.4,
                height: s.size * 2.4,
                borderColor: s.cat === "ai" || s.cat === "core" ? "oklch(0.62 0.24 25)" : "oklch(0.68 0.22 250)",
                boxShadow: s.cat === "ai" || s.cat === "core" ? "var(--shadow-neon-red)" : "var(--shadow-neon-blue)",
              }}
            >
              <span className="px-2 text-[11px] font-bold tracking-widest text-foreground" style={{ fontFamily: "Orbitron" }}>{s.n}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ TIMELINE ============
const TIMELINE = [
  { year: "2026", title: "AI Systems Engineer", org: "Independent", body: "Shipping RAG + agent infra for enterprise clients. 6 production LLM systems live." },
  { year: "2025", title: "Hackathon Grand Prize", org: "Global AI Summit", body: "Built multi-agent city-planning simulator in 36 hours. 1st of 240 teams." },
  { year: "2024", title: "Full-Stack Lead", org: "Startup Studio", body: "Led 4-engineer team, shipped 3 SaaS products, scaled to 20k MAU." },
  { year: "2023", title: "Open Source Debut", org: "GitHub", body: "Web-Shooter bundler crossed 1.2k stars; adopted by 300+ repos." },
  { year: "2022", title: "First Web Line", org: "College", body: "First hackathon win. First late-night deploy. First taste of the rooftops." },
];

function Timeline() {
  return (
    <section className="relative overflow-hidden bg-background py-32">
      <div className="relative mx-auto max-w-6xl px-6">
        <SectionTitle index="04" title="CHRONICLE" subtitle="MISSION TIMELINE" />
        <div className="relative">
          <div className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-primary via-secondary to-primary md:left-1/2" />
          {TIMELINE.map((t, i) => (
            <motion.div
              key={t.year}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.08 }}
              className={`relative mb-10 flex items-center gap-6 pl-12 md:pl-0 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
            >
              <div className="absolute left-2 h-4 w-4 rotate-45 border-2 border-primary bg-background md:left-1/2 md:-translate-x-1/2" style={{ boxShadow: "var(--shadow-neon-red)" }} />
              <div className="clip-panel w-full border-2 border-border bg-card p-6 md:w-[45%]">
                <div className="mb-1 text-xs tracking-widest text-neon-blue" style={{ fontFamily: "Share Tech Mono" }}>{t.year} ▸ {t.org}</div>
                <h3 className="mb-2 text-2xl font-black uppercase text-foreground">{t.title}</h3>
                <p className="text-sm text-muted-foreground" style={{ fontFamily: "Rajdhani" }}>{t.body}</p>
              </div>
              <div className="hidden w-[45%] md:block" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ ACHIEVEMENTS / HACKATHONS / CERTS ============
function Achievements() {
  const items = [
    { cat: "HACKATHON", list: ["Global AI Summit — 1st / 240", "SmartCity Hack — Winner", "DevJam ▸ Best UX", "OpenAI Hack ▸ Finalist"] },
    { cat: "CERTIFICATIONS", list: ["AWS Solutions Architect", "TensorFlow Developer", "MongoDB Associate", "Cloudflare Edge"] },
    { cat: "RECOGNITION", list: ["GitHub Arctic Vault Contributor", "Top 1% Kaggle Notebook", "Speaker ▸ ReactConf India", "Featured ▸ Product Hunt"] },
  ];
  return (
    <section className="relative overflow-hidden bg-background py-32">
      <div className="relative mx-auto max-w-7xl px-6">
        <SectionTitle index="05" title="TROPHY WALL" subtitle="RECEIPTS FROM THE FIELD" />
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((col, i) => (
            <motion.div
              key={col.cat}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="clip-panel border-2 border-border bg-card p-6"
            >
              <div className="mb-4 flex items-center justify-between border-b border-primary pb-2">
                <span className="text-xs tracking-[0.3em] text-neon-red" style={{ fontFamily: "Share Tech Mono" }}>{col.cat}</span>
                <span className="h-2 w-2 animate-flicker bg-primary" />
              </div>
              <ul className="space-y-3">
                {col.list.map((it) => (
                  <li key={it} className="flex items-start gap-3 text-sm text-foreground/90" style={{ fontFamily: "Rajdhani", fontWeight: 500 }}>
                    <span className="mt-1 h-2 w-2 shrink-0 rotate-45 bg-secondary" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ CONTACT ============
function Contact() {
  return (
    <section className="relative overflow-hidden bg-background py-32">
      <div className="absolute inset-x-0 bottom-0 h-1/2 opacity-40"><CitySkyline /></div>
      <div className="relative mx-auto max-w-5xl px-6">
        <SectionTitle index="06" title="SEND SIGNAL" subtitle="OPEN A COMMS CHANNEL" />
        <div className="grid gap-6 md:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="clip-panel md:col-span-3 border-2 border-primary bg-card/80 p-8 backdrop-blur"
            style={{ boxShadow: "var(--shadow-neon-red)" }}
          >
            <div className="mb-6 flex items-center gap-2 text-xs tracking-[0.3em] text-neon-red" style={{ fontFamily: "Share Tech Mono" }}>
              <span className="h-2 w-2 animate-flicker bg-primary" /> BROADCAST FORM ▸ ENCRYPTED
            </div>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <Field label="ALIAS" placeholder="Your name" />
              <Field label="FREQUENCY" placeholder="you@domain.com" />
              <Field label="TRANSMISSION" placeholder="What's the mission?" textarea />
              <button className="clip-slant border-2 border-primary bg-primary px-8 py-4 font-bold uppercase tracking-widest text-primary-foreground transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_oklch(0.62_0.24_25/0.8)]" style={{ fontFamily: "Orbitron" }}>
                LAUNCH ▸ THWIP
              </button>
            </form>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="md:col-span-2 space-y-4"
          >
            {[
              { l: "EMAIL", v: "ayushdwivedi12381@gmail.com" },
              { l: "GITHUB", v: "https://github.com/Ayushkumardwivedi" },
              { l: "LINKEDIN", v: "https://www.linkedin.com/in/ayushdwivedi-aiml/" },
              { l: "INSTAGRAM", v: "@helloyush" },
            ].map((c) => (
              <HoloCard key={c.l} label={c.l} value={c.v} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, placeholder, textarea }: { label: string; placeholder: string; textarea?: boolean }) {
  const Tag = textarea ? "textarea" : "input";
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] tracking-[0.3em] text-neon-blue" style={{ fontFamily: "Share Tech Mono" }}>/// {label}</span>
      <Tag
        placeholder={placeholder}
        rows={textarea ? 4 : undefined}
        className="block w-full border-2 border-border bg-input/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:shadow-[0_0_20px_oklch(0.62_0.24_25/0.5)]"
        style={{ fontFamily: "Rajdhani", fontWeight: 500 }}
      />
    </label>
  );
}

// ============ NAV + FOOTER ============
function Nav() {
  const [open, setOpen] = useState(false);
  const links = ["ORIGIN", "MISSIONS", "SKILLS", "CHRONICLE", "TROPHIES", "CONNECT"];
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8"><img src="/sarvagya-coders.png" /></div>
          <span className="text-sm font-black tracking-[0.3em] text-foreground" style={{ fontFamily: "Orbitron" }}>Sarvagya Coders</span>
        </div>
        <div className="hidden gap-6 md:flex">
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="group relative text-xs tracking-[0.3em] text-muted-foreground transition-colors hover:text-neon-red" style={{ fontFamily: "Share Tech Mono" }}>
              {l}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-primary transition-all group-hover:w-full" />
            </a>
          ))}
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden text-foreground text-xl">≡</button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background/95 px-6 py-4 space-y-3">
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setOpen(false)} className="block text-sm tracking-[0.3em] text-muted-foreground" style={{ fontFamily: "Share Tech Mono" }}>{l}</a>
          ))}
        </div>
      )}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="relative border-t-2 border-primary bg-black py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 md:flex-row">
        <span className="text-xs tracking-[0.3em] text-muted-foreground" style={{ fontFamily: "Share Tech Mono" }}>© 2026 A.K.D ▸ WITH GREAT CODE COMES GREAT RESPONSIBILITY</span>
        <span className="text-xs tracking-[0.3em] text-neon-red" style={{ fontFamily: "Share Tech Mono" }}>END OF TRANSMISSION ▸</span>
      </div>
    </footer>
  );
}

// ============ ROOT ============
export function SpiderPortfolio() {
  return (
    <main className="relative">
      <Nav />
      <SpiderCursor />
      <div id="origin"><Hero /></div>
      <div id="origin"><About /></div>
      <div id="missions"><Projects /></div>
      <div id="skills"><SkillsNetwork /></div>
      <div id="chronicle"><Timeline /></div>
      <div id="trophies"><Achievements /></div>
      <div id="connect"><Contact /></div>
      <Footer />
    </main>
  );
}
