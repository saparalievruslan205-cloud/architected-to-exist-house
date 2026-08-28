'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowRight, Check, ChevronDown, Compass, Cpu, Menu, MoveDown, Send, Sparkles, X, Zap } from 'lucide-react';
import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { scrollState } from './scroll-state';
import './production.css';

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

type FormState = 'idle' | 'missing' | 'sending' | 'sent' | 'error';
type FormErrors = Partial<Record<'name' | 'email' | 'message', string>>;
type Option = { id: string; label: string; copy: string; delta: number };

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const selectionSpring = { type: 'spring' as const, bounce: 0, duration: 0.42 };

function validate(form: FormData): FormErrors {
  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const message = String(form.get('message') ?? '').trim();
  const errors: FormErrors = {};
  if (!name) errors.name = 'Enter your name so we know how to address you.';
  if (!email) errors.email = 'Enter an email address for the reply.';
  else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Enter a valid email address.';
  if (!message) errors.message = 'Tell us a little about the site or brief.';
  return errors;
}

export default function ProductionHome() {
  const reduceMotion = Boolean(useReducedMotion());
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const seekFrameRef = useRef<number | null>(null);
  const smoothFrameRef = useRef<number | null>(null);
  const pendingProgressRef = useRef(0);
  const smoothedProgressRef = useRef(0);
  const lastSmoothTimeRef = useRef(0);
  const pendingVideoTimeRef = useRef<number | null>(null);
  const videoSeekInFlightRef = useRef(false);
  const progressBarRef = useRef<HTMLSpanElement>(null);
  const progressTextRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLSpanElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [facade, setFacade] = useState('timber');
  const [roof, setRoof] = useState('solar');
  const [layout, setLayout] = useState('courtyard');
  const [formState, setFormState] = useState<FormState>('idle');
  const [errors, setErrors] = useState<FormErrors>({});

  const selectedFacade = facadeOptions.find((item) => item.id === facade) ?? facadeOptions[0];
  const selectedRoof = roofOptions.find((item) => item.id === roof) ?? roofOptions[0];
  const selectedLayout = layoutOptions.find((item) => item.id === layout) ?? layoutOptions[0];
  const price = useMemo(() => 420000 + selectedFacade.delta + selectedRoof.delta + selectedLayout.delta, [selectedFacade, selectedRoof, selectedLayout]);
  const summary = `${selectedFacade.label}, ${selectedRoof.label}, ${selectedLayout.label}; illustrative estimate ${usd.format(price)}.`;
  const visual = facade === 'metal' || roof === 'green'
    ? { src: '/unsplash-white-house.jpg', credit: 'RETRATO INMOBILIARIO / Unsplash', href: 'https://unsplash.com/photos/modern-white-house-with-illuminated-pathway-at-dusk-eLG6MsOeupk' }
    : { src: '/unsplash-luxury-windows.jpg', credit: 'Michael Brown / Unsplash', href: 'https://unsplash.com/photos/modern-luxury-home-with-large-windows-at-dusk-G48h926L2qo' };

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const trigger = menuButtonRef.current;
    menuRef.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    const closeOnEscape = (event: globalThis.KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', closeOnEscape); trigger?.focus(); };
  }, [menuOpen]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const video = videoRef.current;
    const flushVideoSeek = () => {
      seekFrameRef.current = null;
      const currentVideo = videoRef.current;
      const target = pendingVideoTimeRef.current;
      if (!currentVideo || target === null || !Number.isFinite(currentVideo.duration) || currentVideo.duration <= 0) return;
      if (videoSeekInFlightRef.current || currentVideo.seeking) return;
      if (Math.abs(currentVideo.currentTime - target) < 1 / 30) {
        pendingVideoTimeRef.current = null;
        return;
      }
      pendingVideoTimeRef.current = null;
      videoSeekInFlightRef.current = true;
      currentVideo.currentTime = target;
    };
    const scheduleVideoSeek = () => {
      if (seekFrameRef.current !== null) return;
      seekFrameRef.current = requestAnimationFrame(flushVideoSeek);
    };
    const continueVideoSeek = () => {
      videoSeekInFlightRef.current = false;
      if (pendingVideoTimeRef.current !== null) scheduleVideoSeek();
      if (Math.abs(pendingProgressRef.current - smoothedProgressRef.current) > .001) scheduleSmoothVideo();
    };
    function scheduleSmoothVideo() {
      if (smoothFrameRef.current !== null) return;
      smoothFrameRef.current = requestAnimationFrame((now) => {
        smoothFrameRef.current = null;
        const elapsed = Math.min(Math.max(now - lastSmoothTimeRef.current, 0), 64);
        lastSmoothTimeRef.current = now;
        const target = pendingProgressRef.current;
        const delta = target - smoothedProgressRef.current;
        const easing = 1 - Math.exp(-elapsed / 90);
        const next = Math.abs(delta) < .001 ? target : smoothedProgressRef.current + delta * easing;
        smoothedProgressRef.current = next;
        const currentVideo = videoRef.current;
        if (currentVideo && Number.isFinite(currentVideo.duration) && currentVideo.duration > 0) {
          pendingVideoTimeRef.current = next * currentVideo.duration;
          scheduleVideoSeek();
        }
        if (Math.abs(target - next) > .001) scheduleSmoothVideo();
      });
    }
    const initializeVideoSeek = () => {
      const currentVideo = videoRef.current;
      if (!currentVideo || !Number.isFinite(currentVideo.duration) || currentVideo.duration <= 0) return;
      smoothedProgressRef.current = pendingProgressRef.current;
      pendingVideoTimeRef.current = pendingProgressRef.current * currentVideo.duration;
      scheduleVideoSeek();
    };
    const update = (raw: number) => {
      const progress = Math.min(Math.max(raw, 0), 1);
      scrollState.progress = progress;
      if (progressBarRef.current) progressBarRef.current.style.transform = `scaleY(${progress})`;
      if (progressTextRef.current) progressTextRef.current.textContent = `${String(Math.round(progress * 100)).padStart(3, '0')}%`;
      if (stageRef.current) stageRef.current.textContent = progress < .3 ? '01 · BLUEPRINT — OPENING FRAME' : progress < .7 ? '02 · BUILD FILM — CONSTRUCTION' : '03 · FINAL ADDRESS — HANDOVER';
      if (reduceMotion) return;
      pendingProgressRef.current = progress;
      scheduleSmoothVideo();
    };
    if (reduceMotion) { update(1); return undefined; }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: true });
    video?.addEventListener('loadedmetadata', initializeVideoSeek);
    video?.addEventListener('seeked', continueVideoSeek);
    const trigger = ScrollTrigger.create({ trigger: hero, start: 'top top', end: 'bottom bottom', onUpdate: (self) => update(self.progress) });
    update(trigger.progress);
    ScrollTrigger.refresh();
    return () => {
      trigger.kill();
      video?.removeEventListener('loadedmetadata', initializeVideoSeek);
      video?.removeEventListener('seeked', continueVideoSeek);
      if (seekFrameRef.current !== null) cancelAnimationFrame(seekFrameRef.current);
      if (smoothFrameRef.current !== null) cancelAnimationFrame(smoothFrameRef.current);
      seekFrameRef.current = null;
      smoothFrameRef.current = null;
      pendingVideoTimeRef.current = null;
      videoSeekInFlightRef.current = false;
    };
  }, [reduceMotion]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextErrors = validate(form);
    setErrors(nextErrors);
    setFormState('idle');
    const firstError = Object.keys(nextErrors)[0] as keyof FormErrors | undefined;
    if (firstError) { document.getElementById(firstError)?.focus(); return; }
    const endpoint = (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_BUILD_ENDPOINT;
    if (!endpoint) { setFormState('missing'); return; }
    setFormState('sending');
    form.set('configuration', summary);
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(form.entries())) });
      if (!response.ok) throw new Error('Delivery failed');
      setFormState('sent');
    } catch { setFormState('error'); }
  }

  return <>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <main id="main-content" className="axiom-page">
      <header className="axiom-header">
        <a href="#overview" className="axiom-brand" aria-label="Axiom concept home"><span><Compass size={17} aria-hidden="true" /></span> AXIOM <i>/ 01</i></a>
        <nav className="desktop-nav" aria-label="Primary navigation"><a href="#overview">Overview</a><a href="#specs">Specs</a><a href="#showcase">Configure</a><a href="#brief">Brief</a></nav>
        <div className="header-actions"><a className="button secondary desktop-cta" href="#brief">Start a build</a><button ref={menuButtonRef} className="menu-trigger" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}</button></div>
      </header>
      <AnimatePresence>{menuOpen && <motion.nav ref={menuRef} id="mobile-menu" className="mobile-nav" aria-label="Mobile navigation" initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: .98 }} animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: .985 }} transition={reduceMotion ? { duration: .12 } : { type: 'spring', bounce: 0, duration: .32 }}><a href="#overview" onClick={() => setMenuOpen(false)}>Overview</a><a href="#specs" onClick={() => setMenuOpen(false)}>Technical readout</a><a href="#showcase" onClick={() => setMenuOpen(false)}>Configure the house</a><a href="#brief" onClick={() => setMenuOpen(false)}>Start a build</a></motion.nav>}</AnimatePresence>

      <section id="overview" ref={heroRef} className={`hero-scroll ${reduceMotion ? 'reduced' : ''}`}><div className="hero-sticky"><video ref={videoRef} src="/house-build.mp4" poster="/house-showcase-day.jpg" preload="auto" muted playsInline aria-hidden="true" /><div className="hero-overlay" /><div className="hero-grid" /><div className="hero-content"><div className="hero-intro"><p className="eyebrow">Axiom concept study — 01</p><h1>ARCHITECTED<br /><em>TO EXIST</em></h1><p>A modern house assembled in light, structure and time. Scroll to move from coordinate lines to a living address.</p><div className="hero-ctas"><a className="button primary" href="#specs">Technical readout <ArrowRight size={16} aria-hidden="true" /></a><a className="button ghost" href="#showcase">Configure the house <ChevronDown size={16} aria-hidden="true" /></a></div></div><div className="hero-progress"><div><span>Scroll to control film</span><strong ref={stageRef}>01 · BLUEPRINT — OPENING FRAME</strong></div><div className="progress-meter"><b ref={progressTextRef}>000%</b><i><span ref={progressBarRef} /></i></div></div><div className="hero-scroll-hint">Scroll <ArrowDown size={14} aria-hidden="true" /></div></div></div></section>

      <section id="specs" className="axiom-section specs-section"><div className="content-wrap"><p className="eyebrow">Technical readout</p><h2>Engineered<br />beyond tolerance.</h2><p className="section-copy">The house is measured twice: once as a system, and once as a feeling. Every layer is calibrated for light, comfort and long-term energy.</p><div className="spec-grid">{specs.map(([value, label, copy], index) => <motion.article key={label} className="spec-card" initial={reduceMotion ? false : { opacity: 0, y: 20 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: .35 }} transition={{ ...selectionSpring, delay: index * .05 }}><span>{index === 0 ? <Compass size={17} aria-hidden="true" /> : index === 1 ? <Sparkles size={17} aria-hidden="true" /> : index === 2 ? <Zap size={17} aria-hidden="true" /> : <Cpu size={17} aria-hidden="true" />}</span><b>{value}</b><strong>{label}</strong><p>{copy}</p></motion.article>)}</div></div></section>

      <section id="showcase" className="axiom-section showcase-section"><div className="content-wrap"><div className="section-heading"><div><p className="eyebrow">Construction showcase</p><h2>Tune the<br />composition.</h2></div><p>Choose the outer expression, the roof logic and the way the rooms open to the garden.</p></div><div className="showcase-grid"><div className="preview-card"><AnimatePresence mode="wait"><motion.img key={visual.src} src={visual.src} alt={`Preview: ${selectedFacade.label}, ${selectedRoof.label}, ${selectedLayout.label} plan`} loading="lazy" decoding="async" initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.025 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={selectionSpring} /></AnimatePresence><div className="preview-scrim" /><div className="preview-content"><div className="preview-kicker"><span>House 01 / visual study</span><b>CONCEPT</b></div><span className="preview-tag"><b>{selectedFacade.label}</b> / {selectedRoof.label}</span><div className="preview-price"><div><span>Illustrative estimate</span><b>{usd.format(price)}</b><small>{selectedLayout.label} plan / 240 m²</small><a href={visual.href} target="_blank" rel="noreferrer">Photo / {visual.credit}</a></div><i>A+ / passive</i></div></div></div><div className="controls"><OptionGroup title="Facade" name="facade" options={facadeOptions} value={facade} onChange={setFacade} /><OptionGroup title="Roof material" name="roof" options={roofOptions} value={roof} onChange={setRoof} /><OptionGroup title="Plan logic" name="layout" options={layoutOptions} value={layout} onChange={setLayout} /><div className="selection-summary"><b>Your composition</b><p>{summary}</p><a href="#brief">Continue to build brief <ArrowRight size={16} aria-hidden="true" /></a></div></div></div><p className="sr-only" aria-live="polite" aria-atomic="true">Configuration updated: {summary}</p></div></section>

      <section className="axiom-section note-section"><div className="content-wrap note-wrap"><p className="eyebrow">Design intent / 01</p><blockquote>“The most intelligent house is the one that disappears into the way you live.”</blockquote><p>This is an original interaction and visual-direction study. The architecture, people, prices and specifications shown on this page are illustrative, not an offer for construction.</p></div></section>

      <section id="brief" className="axiom-section brief-section"><div className="content-wrap brief-grid"><div><p className="eyebrow">Start your build study</p><h2>Make room<br />for next.</h2><p className="section-copy">Use this concept brief to capture a direction for the next conversation. A live contact endpoint must be configured before any message can be delivered.</p></div><form className="brief-form" noValidate onSubmit={submit}><div className="form-columns"><Field label="Name" name="name" autoComplete="name" placeholder="Your name" error={errors.name} /><Field label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" error={errors.email} /></div><Field label="Project note" name="message" multiline placeholder="Where should the house exist?" error={errors.message} /><input type="hidden" name="configuration" value={summary} /><p className="privacy-note">The form includes your configuration summary. This concept site does not store or send data until a real endpoint is connected.</p><button className="button primary" type="submit" disabled={formState === 'sending'}>{formState === 'sending' ? 'Sending…' : 'Send build brief'} <Send size={16} aria-hidden="true" /></button><div className="form-status" aria-live="polite" aria-atomic="true">{formState === 'missing' && <p><Zap size={16} aria-hidden="true" /> A delivery endpoint is not connected yet. Your message was not sent.</p>}{formState === 'error' && <p role="alert">The request could not be delivered. Check the connection and try again; your entries are still here.</p>}{formState === 'sent' && <p><Check size={16} aria-hidden="true" /> Build brief sent to the configured endpoint.</p>}</div></form></div></section>
      <footer className="axiom-footer"><div><b>AXIOM / 01</b><span>Architected to exist</span></div><nav aria-label="Footer navigation"><a href="#overview">Overview</a><a href="#specs">Specs</a><a href="#brief">Brief</a></nav><a href="#overview"><MoveDown size={14} aria-hidden="true" /> Back to top</a></footer>
    </main>
  </>;
}

function OptionGroup({ title, name, options, value, onChange }: { title: string; name: string; options: readonly Option[]; value: string; onChange: (value: string) => void }) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(event.key)) return;
    event.preventDefault();
    const index = options.findIndex((option) => option.id === value);
    const next = options[(index + (event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1) + options.length) % options.length];
    onChange(next.id);
    document.getElementById(`${name}-${next.id}`)?.focus();
  };
  return <fieldset className="option-group"><legend>{title}</legend><div className="option-list" onKeyDown={onKeyDown}>{options.map((option) => <label key={option.id} className="option"><input id={`${name}-${option.id}`} name={name} type="radio" value={option.id} checked={option.id === value} onChange={() => onChange(option.id)} /><span><b>{option.label}</b><i>{option.delta === 0 ? 'Included' : `+${usd.format(option.delta)}`}</i><p>{option.copy}</p><em><Check size={14} aria-hidden="true" /> {option.id === value ? 'Selected' : 'Choose option'}</em></span></label>)}</div></fieldset>;
}

function Field({ label, name, type = 'text', autoComplete, placeholder, error, multiline = false }: { label: string; name: 'name' | 'email' | 'message'; type?: string; autoComplete?: string; placeholder: string; error?: string; multiline?: boolean }) {
  const description = error ? `${name}-error` : `${name}-hint`;
  return <label className={`field ${multiline ? 'message-field' : ''}`} htmlFor={name}><span>{label} <b aria-hidden="true">*</b></span>{multiline ? <textarea id={name} required name={name} rows={4} placeholder={placeholder} aria-invalid={Boolean(error)} aria-describedby={description} /> : <input id={name} required name={name} type={type} autoComplete={autoComplete} placeholder={placeholder} aria-invalid={Boolean(error)} aria-describedby={description} />}{error ? <small id={`${name}-error`} role="alert">{error}</small> : <small id={`${name}-hint`} className="sr-only">Required field</small>}</label>;
}
