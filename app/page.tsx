'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronDown,
  Compass,
  Cpu,
  Menu,
  MoveDown,
  Send,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { scrollState } from './scroll-state';
import './globals.css';

const specs = [
  ['240 m²', 'total floor area', 'A compact footprint with generous sightlines.'],
  ['4', 'bedrooms', 'Two levels shaped around a private courtyard.'],
  ['A+', 'energy rating', 'Passive-first envelope with on-site generation.'],
  ['18 mo', 'build time', 'A precise sequence from first pour to handover.'],
] as const;

const facadeOptions = [
  { id: 'timber', label: 'Timber veil', copy: 'Warm vertical larch screens.', delta: 0 },
  { id: 'stone', label: 'Stone grid', copy: 'Calm limestone massing.', delta: 24000 },
  { id: 'metal', label: 'Metal skin', copy: 'Graphite aluminium rainscreen.', delta: 18000 },
] as const;

const roofOptions = [
  { id: 'solar', label: 'Solar array', copy: 'Integrated PV on the upper plane.', delta: 32000 },
  { id: 'green', label: 'Green roof', copy: 'Low-maintenance planted roof.', delta: 21000 },
  { id: 'slate', label: 'Slate plane', copy: 'A quiet mineral finish.', delta: 12000 },
] as const;

const layoutOptions = [
  { id: 'courtyard', label: 'Courtyard', copy: 'Light in the centre of the plan.', delta: 0 },
  { id: 'gallery', label: 'Gallery', copy: 'Long sightline from entry to garden.', delta: 14000 },
  { id: 'studio', label: 'Studio', copy: 'A flexible workroom at ground level.', delta: 9000 },
] as const;

type ChoiceId = string;
type FormState = 'idle' | 'missing' | 'sending' | 'sent' | 'error';

export default function Home() {
  const reduced = Boolean(useReducedMotion());
  const heroRef = useRef<HTMLElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLSpanElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const structureRef = useRef<HTMLDivElement>(null);
  const finalRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [heroActive, setHeroActive] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [facade, setFacade] = useState<ChoiceId>('timber');
  const [roof, setRoof] = useState<ChoiceId>('solar');
  const [layout, setLayout] = useState<ChoiceId>('courtyard');
  const [formState, setFormState] = useState<FormState>('idle');

  const price = useMemo(() => {
    const facadeDelta = facadeOptions.find((item) => item.id === facade)?.delta ?? 0;
    const roofDelta = roofOptions.find((item) => item.id === roof)?.delta ?? 0;
    const layoutDelta = layoutOptions.find((item) => item.id === layout)?.delta ?? 0;
    return 420000 + facadeDelta + roofDelta + layoutDelta;
  }, [facade, roof, layout]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const updateUi = (progress: number) => {
      const value = Math.min(Math.max(progress, 0), 1);
      scrollState.progress = value;
      const video = videoRef.current;
      if (video && Number.isFinite(video.duration) && video.duration > 0) {
        const targetTime = value * video.duration;
        if (Math.abs(video.currentTime - targetTime) > 0.025) {
          if (typeof video.fastSeek === 'function') video.fastSeek(targetTime);
          else video.currentTime = targetTime;
        }
      }
      if (progressBarRef.current) progressBarRef.current.style.height = `${value * 100}%`;
      if (progressTextRef.current) progressTextRef.current.textContent = `${String(Math.round(value * 100)).padStart(3, '0')}%`;
      if (stageRef.current) stageRef.current.textContent = value < 0.3 ? '01 · BLUEPRINT — OPENING FRAME' : value < 0.7 ? '02 · BUILD FILM — CONSTRUCTION' : '03 · FINAL ADDRESS — HANDOVER';

      const assembly = value < 0.3 ? 0 : Math.min((value - 0.3) / 0.4, 1);
      const final = value < 0.7 ? 0 : Math.min((value - 0.7) / 0.3, 1);
      const cardFade = value < 0.68 ? 1 : Math.max(0, 1 - (value - 0.68) / 0.12);
      if (orbitRef.current) {
        orbitRef.current.style.opacity = `${1 - Math.min(value / 0.26, 1)}`;
        orbitRef.current.style.transform = `translateY(${value * -24}px)`;
      }
      if (structureRef.current) {
        structureRef.current.style.opacity = `${Math.min(assembly * 1.7, 1) * cardFade}`;
        structureRef.current.style.transform = `translateY(${18 - assembly * 18 - final * 12}px)`;
      }
      if (finalRef.current) {
        finalRef.current.style.opacity = `${Math.min(final * 1.6, 1)}`;
        finalRef.current.style.transform = `translateY(${24 - final * 24}px)`;
      }
    };

    const observer = new IntersectionObserver(([entry]) => setHeroActive(entry.isIntersecting), { threshold: 0.01 });
    observer.observe(hero);

    gsap.registerPlugin(ScrollTrigger);
    if (reduced) {
      updateUi(1);
      return () => observer.disconnect();
    }

    const trigger = ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => updateUi(self.progress),
    });
    updateUi(0);
    ScrollTrigger.refresh();
    updateUi(trigger.progress);

    return () => {
      trigger.kill();
      observer.disconnect();
    };
  }, [reduced]);

  const submitBuildRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const endpoint = (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_BUILD_ENDPOINT;
    if (!endpoint) {
      setFormState('missing');
      return;
    }
    setFormState('sending');
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error('Request failed');
      setFormState('sent');
    } catch {
      setFormState('error');
    }
  };

  return (
    <main className="min-h-screen overflow-x-clip bg-[#03070b] text-[#edf5f5]">
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-white/[0.08] bg-[#03070b]/80 px-5 backdrop-blur-xl sm:px-10">
        <a href="#overview" className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.3em]" aria-label="Architected to Exist home"><span className="grid h-8 w-8 place-items-center rounded-lg border border-cyan-300/40 bg-cyan-300/10 text-cyan-200"><Compass size={15} /></span><span>AXIOM <span className="text-cyan-300">/ 01</span></span></a>
        <nav className="hidden items-center gap-8 text-[10px] uppercase tracking-[0.28em] text-white/55 md:flex" aria-label="Primary"><a href="#overview" className="transition-colors hover:text-white">Overview</a><a href="#specs" className="transition-colors hover:text-white">Specs</a><a href="#showcase" className="transition-colors hover:text-white">Showcase</a><a href="#preorder" className="transition-colors hover:text-white">Brief</a></nav>
        <div className="flex items-center gap-3"><a href="#preorder" className="hidden rounded-full border border-cyan-200/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-100 transition hover:bg-cyan-200 hover:text-[#061015] sm:inline-flex">Start a build</a><button type="button" className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-white md:hidden" aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen((value) => !value)}>{menuOpen ? <X size={17} /> : <Menu size={17} />}</button></div>
      </header>

      <AnimatePresence>{menuOpen && <motion.nav id="mobile-menu" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="fixed inset-x-4 top-20 z-50 rounded-2xl border border-white/10 bg-[#091117]/95 p-5 shadow-2xl backdrop-blur-xl md:hidden" aria-label="Mobile"><div className="flex flex-col gap-5 text-xs uppercase tracking-[0.22em] text-white/70"><a href="#overview" onClick={() => setMenuOpen(false)}>Overview</a><a href="#specs" onClick={() => setMenuOpen(false)}>Specs</a><a href="#showcase" onClick={() => setMenuOpen(false)}>Showcase</a><a href="#preorder" onClick={() => setMenuOpen(false)}>Brief</a></div></motion.nav>}</AnimatePresence>

      <section id="overview" ref={heroRef} className="relative h-[300vh]"><div className="sticky top-0 h-screen overflow-hidden"><div className="relative h-full bg-[#050a0e]"><video ref={videoRef} className="absolute inset-0 h-full w-full object-cover object-center opacity-80" src="/house-build.mp4" preload={heroActive ? 'auto' : 'none'} muted playsInline aria-hidden="true" onLoadedMetadata={(event) => { const video = event.currentTarget; if (Number.isFinite(video.duration) && video.duration > 0) { const targetTime = scrollState.progress * video.duration; video.currentTime = targetTime; void video.play().then(() => { video.pause(); video.currentTime = targetTime; }).catch(() => { video.currentTime = targetTime; }); } }} /><div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(3,7,11,.74)_0%,rgba(3,7,11,.12)_34%,rgba(3,7,11,.28)_68%,rgba(3,7,11,.92)_100%)]" /><div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_45%,transparent_0%,rgba(3,7,11,.12)_48%,rgba(3,7,11,.82)_100%)]" /><div className="pointer-events-none absolute inset-0 z-[1] opacity-25 [background-image:linear-gradient(rgba(72,202,220,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(72,202,220,.07)_1px,transparent_1px)] [background-size:72px_72px]" /><div className="relative z-20 flex h-full flex-col justify-center px-5 pt-16 sm:px-10">
        <div ref={orbitRef} className="pointer-events-none mx-auto max-w-5xl text-center transition-none"><p className="mb-6 text-[10px] uppercase tracking-[0.38em] text-cyan-200/80">Axiom Instruments — 01</p><h1 className="text-[clamp(3.3rem,11vw,9.6rem)] font-semibold leading-[0.84] tracking-[-0.09em]">ARCHITECTED<br /><span className="text-cyan-200">TO EXIST</span></h1><p className="mx-auto mt-8 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">A modern house assembled in light, structure and time. Scroll to move from coordinate lines to a living address.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><a href="#specs" className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-cyan-200 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#061015] transition hover:bg-white">Technical readout <ArrowRight size={14} /></a><a href="#showcase" className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/75 transition hover:border-cyan-200/60 hover:text-white">Configure the house <ChevronDown size={14} /></a></div></div>
        <div ref={structureRef} className="pointer-events-none absolute inset-x-5 top-[38%] mx-auto hidden max-w-6xl justify-between opacity-0 transition-none sm:inset-x-10 sm:flex"><div className="max-w-[240px] rounded-2xl border border-cyan-200/20 bg-[#07141b]/75 p-5 backdrop-blur-xl"><div className="mb-4 flex items-center gap-2 text-cyan-200"><LayersIcon /><span className="text-[10px] uppercase tracking-[0.25em]">Build layer 03</span></div><p className="text-2xl tracking-[-0.04em]">STRUCTURAL<br />FRAME</p><p className="mt-3 text-xs leading-relaxed text-white/45">Columns and slabs find their exact rhythm.</p></div><div className="mt-24 max-w-[240px] rounded-2xl border border-cyan-200/20 bg-[#07141b]/75 p-5 backdrop-blur-xl"><div className="mb-4 flex items-center gap-2 text-cyan-200"><Zap size={15} /><span className="text-[10px] uppercase tracking-[0.25em]">Build layer 05</span></div><p className="text-2xl tracking-[-0.04em]">PASSIVE<br />ENERGY</p><p className="mt-3 text-xs leading-relaxed text-white/45">Solar planes and thermal mass reduce the load.</p></div><div className="hidden max-w-[240px] rounded-2xl border border-cyan-200/20 bg-[#07141b]/75 p-5 backdrop-blur-xl lg:block"><div className="mb-4 flex items-center gap-2 text-cyan-200"><Cpu size={15} /><span className="text-[10px] uppercase tracking-[0.25em]">Build layer 06</span></div><p className="text-2xl tracking-[-0.04em]">INTELLIGENT<br />SYSTEMS</p><p className="mt-3 text-xs leading-relaxed text-white/45">Services stay visible until the final assembly.</p></div></div>
        <div ref={finalRef} className="pointer-events-none absolute inset-x-5 bottom-[17%] mx-auto max-w-6xl text-center opacity-0 sm:inset-x-10"><p className="text-[10px] uppercase tracking-[0.38em] text-cyan-200">Assembly complete</p><p className="mt-4 text-[clamp(2.8rem,8vw,7rem)] font-semibold leading-[0.86] tracking-[-0.08em]">BUILD COMPLETE</p><p className="mt-5 text-sm uppercase tracking-[0.3em] text-white/55">Your next address</p></div>
        <div className="absolute inset-x-5 bottom-7 flex items-end justify-between sm:inset-x-10 sm:bottom-9"><div><span className="mb-2 block text-[10px] uppercase tracking-[0.28em] text-white/40">Scroll to control film</span><span ref={stageRef} className="text-[10px] uppercase tracking-[0.22em] text-cyan-100/80">01 · BLUEPRINT — OPENING FRAME</span></div><div className="flex items-center gap-3 text-white/50"><span ref={progressTextRef} className="font-mono text-xs text-cyan-100">000%</span><div className="relative h-24 w-px bg-white/15"><div ref={progressBarRef} className="absolute inset-x-0 bottom-0 bg-cyan-200 transition-[height] duration-100" style={{ height: '0%' }} /></div></div></div><div className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/40 sm:flex"><span>Scroll</span><ArrowDown size={13} className="text-cyan-200" /></div>
      </div></div></div></section>

      <section id="specs" className="relative border-t border-white/[0.08] bg-[#050b10] px-5 py-28 sm:px-10 sm:py-40"><div className="mx-auto max-w-6xl"><div className="max-w-3xl"><p className="text-[10px] uppercase tracking-[0.38em] text-cyan-200/80">Technical readout</p><h2 className="mt-6 text-5xl font-medium leading-[0.9] tracking-[-0.07em] sm:text-8xl">Engineered<br />beyond tolerance.</h2><p className="mt-8 max-w-xl text-base leading-relaxed text-white/50 sm:text-lg">The house is measured twice: once as a system, and once as a feeling. Every layer is calibrated for light, comfort and long-term energy.</p></div><div className="mt-20 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{specs.map(([value, label, copy], index) => <motion.article key={label} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ delay: index * 0.07, duration: 0.5 }} className="min-h-[220px] rounded-2xl border border-white/10 bg-white/[0.025] p-6"><span className="grid h-9 w-9 place-items-center rounded-lg border border-cyan-200/20 bg-cyan-200/10 text-cyan-200">{index === 0 ? <Compass size={15} /> : index === 1 ? <Sparkles size={15} /> : index === 2 ? <Zap size={15} /> : <Cpu size={15} />}</span><p className="mt-12 text-4xl tracking-[-0.06em]">{value}</p><p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-cyan-200/65">{label}</p><p className="mt-5 text-sm leading-relaxed text-white/45">{copy}</p></motion.article>)}</div></div></section>

      <section id="showcase" className="border-t border-white/[0.08] bg-[#071117] px-5 py-28 sm:px-10 sm:py-40"><div className="mx-auto max-w-6xl"><div className="flex flex-col justify-between gap-10 md:flex-row md:items-end"><div><p className="text-[10px] uppercase tracking-[0.38em] text-cyan-200/80">Construction showcase</p><h2 className="mt-6 max-w-3xl text-5xl font-medium leading-[0.9] tracking-[-0.07em] sm:text-8xl">Tune the<br />composition.</h2></div><p className="max-w-xs text-sm leading-relaxed text-white/45">Choose the outer expression, the roof logic and the way the rooms open to the garden.</p></div><div className="mt-20 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]"><div className="relative min-h-[480px] overflow-hidden rounded-3xl border border-white/10 bg-[#0a1c24] p-8"><div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(79,209,227,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(79,209,227,.08)_1px,transparent_1px)] [background-size:48px_48px]" /><div className="relative z-10 flex h-full flex-col justify-between"><div className="flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-white/45"><span>House 01 / configuration</span><span className="font-mono text-cyan-200">LIVE</span></div><div className="mx-auto mt-8 w-full max-w-[500px] rounded-[28px] border border-cyan-200/25 bg-[#102a32]/60 p-8 shadow-[0_0_80px_rgba(69,220,237,.1)]"><div className="relative h-56"><div className="absolute inset-x-10 bottom-5 h-24 rounded-[12px] border border-cyan-100/50 bg-gradient-to-b from-[#65767a] to-[#24373e] shadow-[0_20px_50px_rgba(0,0,0,.4)]" /><div className="absolute left-20 right-20 top-8 h-28 border border-cyan-100/55 bg-[#183f4a]/60" /><div className="absolute left-10 right-10 top-1 h-5 rounded border border-cyan-100/45 bg-[#71878b]" /><div className="absolute bottom-8 left-1/2 h-20 w-10 -translate-x-1/2 border border-amber-200/60 bg-amber-100/20" /><div className="absolute bottom-4 left-4 h-20 w-16 border border-cyan-100/35 bg-[#123440]" /><div className="absolute bottom-4 right-4 h-20 w-16 border border-cyan-100/35 bg-[#123440]" /></div><div className="mt-5 flex items-end justify-between border-t border-white/10 pt-5"><div><p className="text-[10px] uppercase tracking-[0.24em] text-white/40">Estimated build</p><p className="mt-2 text-3xl tracking-[-0.06em]">${price.toLocaleString()}</p></div><span className="rounded-full border border-cyan-200/30 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-100">A+ / passive</span></div></div><p className="text-xs uppercase tracking-[0.28em] text-white/35">Every selection stays architectural.</p></div></div><div className="space-y-8"><Configurator title="Facade" options={facadeOptions} value={facade} onChange={setFacade} /><Configurator title="Roof material" options={roofOptions} value={roof} onChange={setRoof} /><Configurator title="Plan logic" options={layoutOptions} value={layout} onChange={setLayout} /></div></div></div></section>

      <section id="testimonial" className="border-t border-white/[0.08] bg-[#03070b] px-5 py-28 sm:px-10 sm:py-40"><div className="mx-auto max-w-5xl"><div className="mb-10 flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-cyan-200/75"><span className="h-px w-10 bg-cyan-200/60" /> Field note / 01</div><blockquote className="max-w-5xl text-4xl leading-[0.95] tracking-[-0.07em] text-white/90 sm:text-7xl">“The most intelligent house is the one that disappears into the way you live.”</blockquote><div className="mt-12 flex items-center gap-4"><div className="grid h-11 w-11 place-items-center rounded-full border border-cyan-200/30 bg-cyan-200/10 text-cyan-100">AR</div><div><p className="text-sm">Anika Rao</p><p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-white/40">Lead architect / Axiom Studio</p></div></div></div></section>

      <section id="preorder" className="border-t border-white/[0.08] bg-[#08171d] px-5 py-28 sm:px-10 sm:py-40"><div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[1fr_0.8fr] lg:items-end"><div><p className="text-[10px] uppercase tracking-[0.38em] text-cyan-200/80">Start your build</p><h2 className="mt-6 text-6xl font-medium leading-[0.87] tracking-[-0.08em] sm:text-9xl">Make room<br />for next.</h2><p className="mt-8 max-w-md text-base leading-relaxed text-white/50">Tell us where you are, what you are building towards and when the first line should be drawn.</p></div><form className="rounded-3xl border border-white/10 bg-[#0b2028]/70 p-6 sm:p-8" onSubmit={submitBuildRequest}><div className="grid gap-4 sm:grid-cols-2"><label className="text-[10px] uppercase tracking-[0.22em] text-white/45">Name<input required name="name" className="mt-3 w-full border-b border-white/20 bg-transparent py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-200" placeholder="Your name" /></label><label className="text-[10px] uppercase tracking-[0.22em] text-white/45">Email<input required type="email" name="email" className="mt-3 w-full border-b border-white/20 bg-transparent py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-200" placeholder="you@example.com" /></label></div><label className="mt-8 block text-[10px] uppercase tracking-[0.22em] text-white/45">Project note<textarea required name="message" rows={4} className="mt-3 w-full resize-none border-b border-white/20 bg-transparent py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-200" placeholder="Where should the house exist?" /></label><button type="submit" disabled={formState === 'sending'} className="mt-8 inline-flex items-center gap-2 rounded-full bg-cyan-200 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#061015] transition hover:bg-white disabled:cursor-wait disabled:opacity-60">{formState === 'sending' ? 'Sending…' : 'Send build brief'} <Send size={14} /></button>{formState === 'missing' && <p className="mt-5 flex items-center gap-2 text-xs text-amber-200"><Zap size={14} /> Build endpoint is not connected yet. No request was sent.</p>}{formState === 'error' && <p className="mt-5 text-xs text-rose-200">The endpoint did not accept the request. Nothing was marked as successful.</p>}{formState === 'sent' && <p className="mt-5 flex items-center gap-2 text-xs text-emerald-200"><Check size={14} /> Request sent to the configured build endpoint.</p>}</form></div></section>

      <footer className="flex flex-col gap-8 border-t border-white/[0.08] bg-[#03070b] px-5 py-10 text-[10px] uppercase tracking-[0.25em] text-white/35 sm:flex-row sm:items-center sm:justify-between sm:px-10"><div><span className="text-white/75">AXIOM / 01</span><span className="ml-4">Architected to exist</span></div><div className="flex gap-5"><a href="#overview" className="hover:text-white">Overview</a><a href="#specs" className="hover:text-white">Specs</a><a href="#preorder" className="hover:text-white">Brief</a></div><a href="#overview" className="flex items-center gap-2 hover:text-white"><MoveDown size={13} /> Back to top</a></footer>
    </main>
  );
}

function LayersIcon() {
  return <span className="grid h-4 w-4 place-items-center"><span className="h-3 w-3 border border-current" /></span>;
}

function Configurator({ title, options, value, onChange }: { title: string; options: readonly { id: string; label: string; copy: string; delta: number }[]; value: string; onChange: (id: string) => void }) {
  return <fieldset><legend className="mb-3 text-[10px] uppercase tracking-[0.3em] text-white/45">{title}</legend><div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">{options.map((option) => <button key={option.id} type="button" aria-pressed={value === option.id} onClick={() => onChange(option.id)} className={`group rounded-2xl border p-4 text-left transition ${value === option.id ? 'border-cyan-200/65 bg-cyan-200/[0.08]' : 'border-white/10 bg-white/[0.02] hover:border-white/25'}`}><span className="flex items-center justify-between text-sm text-white/85">{option.label}<span className={`h-2 w-2 rounded-full transition ${value === option.id ? 'bg-cyan-200 shadow-[0_0_12px_#8eeaff]' : 'bg-white/15'}`} /></span><span className="mt-2 block text-xs leading-relaxed text-white/40">{option.copy}</span></button>)}</div></fieldset>;
}
