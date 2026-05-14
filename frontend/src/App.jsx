import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Check,
  Download,
  History,
  Link2,
  Lock,
  Palette,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

const today = new Date().toISOString().slice(0, 10)
const due   = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

const initialInvoice = {
  senderName: '', senderEmail: '', senderAddress: '',
  clientName: '', clientEmail: '', clientAddress: '',
  invoiceNumber: 'INV-2026-001',
  issueDate: today, dueDate: due,
  paymentTerms: 'Net 14', currency: 'EUR',
  taxRate: 0, discount: 0,
  notes: '', paymentDetails: '',
  footer: 'Generated with ReadyInvoice',
  brandColor: '#e05c25',
  items: [{ id: 1, description: '', quantity: 1, rate: 0 }],
}

const paidFeatures = [
  { icon: Palette,       title: 'Custom branding',   text: 'Logo, brand colours, and custom footer on every PDF.' },
  { icon: Link2,         title: 'Client portal',      text: 'Send a hosted link clients can view and revisit.' },
  { icon: CalendarClock, title: 'Recurring invoices', text: 'Schedule monthly retainers automatically.' },
  { icon: History,       title: 'History dashboard',  text: 'Track paid, unpaid, and overdue work.' },
  { icon: Sparkles,      title: 'Proposal templates', text: 'Turn scopes into accept/reject proposal links.' },
]

const pricing = [
  { name: 'Free',  price: '€0',  detail: 'Forever free',  features: ['Unlimited PDF downloads', 'No signup', 'ReadyInvoice footer'] },
  { name: 'Pro',   price: '€14', detail: 'per month',      features: ['Custom branding', 'History', 'Client portal', 'Priority support'], popular: true },
  { name: 'Team',  price: '€39', detail: 'per month',      features: ['5 seats', 'Proposals', 'All Pro features'] },
]

const brandColors = ['#e05c25','#0d9488','#2563eb','#7c3aed','#dc2626','#0f172a']

const currencies = [
  'EUR','USD','GBP','CAD','AUD','CHF',
  'DKK','SEK','NOK','JPY','BRL','MXN','INR','SGD','HKD',
]

const formSteps = [
  { id: 'details', label: 'Details' },
  { id: 'people',  label: 'People'  },
  { id: 'items',   label: 'Items'   },
  { id: 'notes',   label: 'Notes'   },
]

function formatMoney(value, currency) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 })
    .format(Number(value || 0))
}

function calculateTotals(invoice) {
  const subtotal = invoice.items.reduce((s, i) => s + Number(i.quantity || 0) * Number(i.rate || 0), 0)
  const taxable  = Math.max(0, subtotal - Number(invoice.discount || 0))
  const tax      = taxable * (Number(invoice.taxRate || 0) / 100)
  return { subtotal, tax, total: taxable + tax }
}

function Field({ label, className = '', ...props }) {
  return (
    <label className={`form-control w-full ${className}`}>
      <div className="label pb-1 pt-0">
        <span className="label-text text-[11px] font-black uppercase tracking-widest text-base-content/40">{label}</span>
      </div>
      <input
        className="input input-bordered input-sm h-10 w-full rounded-lg text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
        {...props}
      />
    </label>
  )
}

/* ── Hero invoice sample (static, shows what output looks like) ── */
function HeroInvoice() {
  return (
    <div className="w-full max-w-[340px] rotate-1 rounded-2xl bg-white p-6 shadow-[0_40px_100px_rgba(0,0,0,0.45)]">
      <div className="flex items-start justify-between">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-orange font-black text-white">RI</div>
        <div className="text-right">
          <p className="text-xl font-bold tracking-wide text-slate-800">INVOICE</p>
          <p className="text-xs text-slate-400">INV-2026-042</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">From</p>
          <p className="mt-1 text-xs font-bold text-slate-800">Marta Silva Studio</p>
          <p className="text-[10px] text-slate-500">hello@martasilva.co</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bill to</p>
          <p className="mt-1 text-xs font-bold text-slate-800">Northstar Labs</p>
          <p className="text-[10px] text-slate-500">finance@northstar.co</p>
        </div>
      </div>
      <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
        {[['Brand strategy workshop', '€900.00'], ['Landing page design', '€840.00']].map(([desc, amt]) => (
          <div key={desc} className="flex justify-between text-xs">
            <span className="text-slate-600">{desc}</span>
            <span className="font-semibold text-slate-800">{amt}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-lg bg-orange px-4 py-2.5 text-sm font-bold text-white">
        <span>Total</span>
        <span>€2,070.60</span>
      </div>
      <p className="mt-3 text-center text-[10px] text-slate-300">Generated with ReadyInvoice</p>
    </div>
  )
}

/* ── Pro modal ── */
function ProModal({ onClose, onDemo }) {
  const [email, setEmail]         = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!email) return
    localStorage.setItem('readyinvoice-waitlist', email)
    setSubmitted(true)
  }

  return (
    <dialog className="modal modal-open">
      <div className="modal-box relative max-w-md rounded-2xl border-2 border-secondary bg-base-100 p-8 shadow-card">
        <button className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3" onClick={onClose}>
          <X size={16} />
        </button>
        {submitted ? (
          <div className="py-4 text-center">
            <span className="inline-grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
              <Check size={24} strokeWidth={2.5} />
            </span>
            <h2 className="mt-4 text-2xl font-black">You're on the list.</h2>
            <p className="mt-2 text-sm text-base-content/50">We'll email you at launch with an early access discount.</p>
            <button className="btn btn-ghost btn-sm mt-6 gap-1.5 text-primary" onClick={onDemo}>
              Try Pro features now (demo) <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs font-black uppercase tracking-widest text-primary">— Coming soon</p>
            <h2 className="mt-2 text-3xl font-black">Pro is <span className="text-primary">almost here.</span></h2>
            <p className="mt-3 text-sm leading-6 text-base-content/60">
              Custom branding, client portal, recurring billing. Join the waitlist —
              get <span className="font-black">30% off</span> at launch.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 grid gap-3">
              <label className="form-control w-full">
                <div className="label pb-1 pt-0">
                  <span className="label-text text-[11px] font-black uppercase tracking-widest text-base-content/40">Your email</span>
                </div>
                <input type="email" required placeholder="you@example.com" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-bordered h-11 w-full rounded-lg text-sm focus:border-primary focus:outline-none" />
              </label>
              <button type="submit" className="btn btn-primary h-11 w-full rounded-xl text-sm font-black">
                Join the waitlist <ArrowRight size={14} />
              </button>
            </form>
            <button className="btn btn-ghost btn-sm mt-2 w-full text-base-content/40" onClick={onDemo}>
              Just try Pro features now (demo)
            </button>
          </>
        )}
      </div>
      <div className="modal-backdrop bg-secondary/60 backdrop-blur-sm" onClick={onClose} />
    </dialog>
  )
}

/* ── App ── */
export default function App() {
  const [invoice, setInvoice] = useState(() => {
    try {
      const s = localStorage.getItem('readyinvoice-draft')
      return s ? { ...initialInvoice, ...JSON.parse(s) } : initialInvoice
    } catch { return initialInvoice }
  })
  const [proMode,      setProMode]      = useState(false)
  const [status,       setStatus]       = useState('')
  const [showProModal, setShowProModal] = useState(false)
  const totals = useMemo(() => calculateTotals(invoice), [invoice])

  useEffect(() => { localStorage.setItem('readyinvoice-draft', JSON.stringify(invoice)) }, [invoice])

  const update     = (f, v) => setInvoice((c) => ({ ...c, [f]: v }))
  const updateItem = (id, f, v) => setInvoice((c) => ({ ...c, items: c.items.map((i) => i.id === id ? { ...i, [f]: v } : i) }))
  const addItem    = () => setInvoice((c) => ({ ...c, items: [...c.items, { id: Date.now(), description: '', quantity: 1, rate: 0 }] }))
  const removeItem = (id) => setInvoice((c) => ({ ...c, items: c.items.length > 1 ? c.items.filter((i) => i.id !== id) : c.items }))
  const clearDraft = () => { localStorage.removeItem('readyinvoice-draft'); setInvoice(initialInvoice) }
  const openPro    = () => setShowProModal(true)
  const activateDemo = () => { setShowProModal(false); setProMode(true) }
  const accentStyle  = { background: proMode ? invoice.brandColor : '#e05c25' }

  async function downloadPdf() {
    setStatus('Preparing…')
    const res = await fetch('/api/invoices/pdf/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...invoice, proMode }),
    })
    if (!res.ok) { setStatus((await res.json().catch(() => ({}))).error || 'Error'); return }
    const url = URL.createObjectURL(await res.blob())
    Object.assign(document.createElement('a'), {
      href: url, download: `${invoice.invoiceNumber || 'invoice'}.pdf`
    }).click()
    URL.revokeObjectURL(url)
    setStatus('Downloaded. Clean, tidy, billable.')
  }

  return (
    <main className="min-h-screen bg-base-100 text-base-content">
      {showProModal && <ProModal onClose={() => setShowProModal(false)} onDemo={activateDemo} />}

      {/* ══ HEADER ══ */}
      <header className="navbar sticky top-0 z-20 border-b border-base-content/10 bg-base-100/95 backdrop-blur px-4 sm:px-8">
        <div className="navbar-start gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-xs font-black text-white">RI</div>
          <span className="text-base font-black tracking-tight">ReadyInvoice</span>
        </div>
        <div className="navbar-center hidden md:flex gap-6">
          {['Generator','Pricing','Toolkit'].map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="text-sm font-semibold text-base-content/50 hover:text-base-content transition-colors">{l}</a>
          ))}
        </div>
        <div className="navbar-end">
          <button className="btn btn-primary btn-sm gap-2 rounded-lg" onClick={openPro}>
            <BadgeCheck size={14} /> Try Pro
          </button>
        </div>
      </header>

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden bg-secondary text-white">
        {/* Decorative orange glow */}
        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary opacity-10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-[300px] w-[300px] rounded-full bg-primary opacity-5 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-28">
          {/* Left: copy */}
          <div>
            <p className="mb-4 text-xs font-black uppercase tracking-widest text-primary">— Free invoice generator</p>
            <h1 className="text-6xl font-black leading-[1.0] lg:text-7xl">
              Invoice your clients.<br />
              <span className="text-primary">Get paid.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-7 text-white/50">
              Create a professional PDF invoice in under 60 seconds. No account. No card. No friction.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="#generator" className="btn btn-primary btn-lg gap-2 rounded-xl font-black shadow-[4px_4px_0px_rgba(255,255,255,0.15)]">
                Build your invoice <ArrowRight size={16} />
              </a>
              <span className="flex items-center gap-1.5 text-sm text-white/40">
                <BadgeCheck size={15} className="text-primary" /> Free forever
              </span>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
              {['No account', 'No card', 'Instant PDF', '2,400+ freelancers'].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-xs text-white/30">
                  <Check size={10} className="text-primary" strokeWidth={3} />{t}
                </span>
              ))}
            </div>
          </div>

          {/* Right: invoice card */}
          <div className="flex items-center justify-center lg:justify-end">
            <HeroInvoice />
          </div>
        </div>
      </section>

      {/* ══ GENERATOR ══ */}
      <section id="generator" className="mx-auto max-w-7xl px-4 pb-28 sm:px-8 lg:pb-12">

        {/* Section header */}
        <div className="flex items-center justify-between border-b border-base-content/10 py-8">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-primary">— Your invoice</p>
            <h2 className="mt-1 text-2xl font-black">Fill in the details below.</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="badge badge-warning border border-base-content/20 px-3 py-3 text-xs font-bold">
              {proMode ? <><span className="text-primary">Pro</span> unlocked</> : 'Unlimited free downloads'}
            </span>
            <button onClick={clearDraft} className="btn btn-ghost btn-xs text-base-content/30">Clear draft</button>
          </div>
        </div>

        {/* 3-column layout */}
        <div className="grid gap-0 lg:grid-cols-[120px_minmax(0,1fr)_minmax(460px,500px)]">

          {/* ── Step sidebar ── */}
          <aside className="hidden py-10 pr-4 lg:block lg:sticky lg:top-[57px] lg:self-start">
            <nav className="space-y-6">
              {formSteps.map((step, i) => (
                <a key={step.id} href={`#${step.id}`}
                  className="group flex flex-col gap-0.5 transition-opacity hover:opacity-100 opacity-60 hover:opacity-100">
                  <span className="text-3xl font-black text-primary/30 leading-none group-hover:text-primary transition-colors">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-base-content/40 group-hover:text-base-content transition-colors">
                    {step.label}
                  </span>
                </a>
              ))}
            </nav>
          </aside>

          {/* ── Form ── */}
          <div className="space-y-12 py-10 lg:px-8">

            {/* 01 — Invoice details */}
            <div id="details">
              <div className="mb-6 flex items-center gap-3">
                <span className="text-xs font-black text-primary opacity-50">01</span>
                <h3 className="text-sm font-black uppercase tracking-widest">Invoice details</h3>
                <div className="h-px flex-1 bg-base-content/8" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Invoice number" value={invoice.invoiceNumber} onChange={(e) => update('invoiceNumber', e.target.value)} />
                <Field label="Issue date" type="date" value={invoice.issueDate} onChange={(e) => update('issueDate', e.target.value)} />
                <Field label="Due date"   type="date" value={invoice.dueDate}   onChange={(e) => update('dueDate', e.target.value)} />
                <label className="form-control w-full">
                  <div className="label pb-1 pt-0">
                    <span className="label-text text-[11px] font-black uppercase tracking-widest text-base-content/40">Currency</span>
                  </div>
                  <select className="select select-bordered select-sm h-10 w-full rounded-lg text-sm font-medium focus:border-primary focus:outline-none"
                    value={invoice.currency} onChange={(e) => update('currency', e.target.value)}>
                    {currencies.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </label>
              </div>
            </div>

            {/* 02 — Sender & client */}
            <div id="people">
              <div className="mb-6 flex items-center gap-3">
                <span className="text-xs font-black text-primary opacity-50">02</span>
                <h3 className="text-sm font-black uppercase tracking-widest">Sender and client</h3>
                <div className="h-px flex-1 bg-base-content/8" />
              </div>
              <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
                <div>
                  <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-base-content/20">From you</p>
                  <div className="grid gap-3">
                    <Field label="Name or company" value={invoice.senderName}    onChange={(e) => update('senderName', e.target.value)} />
                    <Field label="Email"           value={invoice.senderEmail}   onChange={(e) => update('senderEmail', e.target.value)} />
                    <Field label="Address"         value={invoice.senderAddress} onChange={(e) => update('senderAddress', e.target.value)} />
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-base-content/20">Bill to</p>
                  <div className="grid gap-3">
                    <Field label="Client name"    value={invoice.clientName}    onChange={(e) => update('clientName', e.target.value)} />
                    <Field label="Client email"   value={invoice.clientEmail}   onChange={(e) => update('clientEmail', e.target.value)} />
                    <Field label="Client address" value={invoice.clientAddress} onChange={(e) => update('clientAddress', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            {/* 03 — Line items */}
            <div id="items">
              <div className="mb-6 flex items-center gap-3">
                <span className="text-xs font-black text-primary opacity-50">03</span>
                <h3 className="text-sm font-black uppercase tracking-widest">Line items</h3>
                <div className="h-px flex-1 bg-base-content/8" />
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[480px]">
                  <div className="grid grid-cols-[1fr_72px_110px_36px] gap-2 border-b border-base-content/10 pb-2 text-[11px] font-black uppercase tracking-widest text-base-content/30">
                    <span>Description</span><span>Qty</span><span>Rate</span><span />
                  </div>
                  {invoice.items.map((item) => (
                    <div key={item.id} className="grid grid-cols-[1fr_72px_110px_36px] gap-2 border-b border-base-content/5 py-2">
                      <input className="input input-bordered input-sm h-10 rounded-lg text-sm focus:border-primary focus:outline-none" placeholder="Service or product" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} />
                      <input className="input input-bordered input-sm h-10 rounded-lg text-sm focus:border-primary focus:outline-none" type="number" min="0" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} />
                      <input className="input input-bordered input-sm h-10 rounded-lg text-sm focus:border-primary focus:outline-none" type="number" min="0" value={item.rate} onChange={(e) => updateItem(item.id, 'rate', e.target.value)} />
                      <button className="btn btn-ghost btn-sm h-10 w-9 rounded-lg p-0 text-base-content/20 hover:text-error" onClick={() => removeItem(item.id)}><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
              <button className="btn btn-outline btn-sm mt-4 gap-2 rounded-lg border-base-content/15 text-base-content/40 hover:border-primary hover:text-primary hover:bg-transparent" onClick={addItem}>
                <Plus size={14} /> Add item
              </button>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <Field label="Tax rate %" type="number" value={invoice.taxRate}      onChange={(e) => update('taxRate', e.target.value)} />
                <Field label="Discount"   type="number" value={invoice.discount}     onChange={(e) => update('discount', e.target.value)} />
                <Field label="Payment terms"            value={invoice.paymentTerms} onChange={(e) => update('paymentTerms', e.target.value)} />
              </div>
            </div>

            {/* 04 — Notes & branding */}
            <div id="notes">
              <div className="mb-6 flex items-center gap-3">
                <span className="text-xs font-black text-primary opacity-50">04</span>
                <h3 className="text-sm font-black uppercase tracking-widest">Notes and branding</h3>
                <div className="h-px flex-1 bg-base-content/8" />
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="form-control w-full">
                  <div className="label pb-1 pt-0"><span className="label-text text-[11px] font-black uppercase tracking-widest text-base-content/40">Notes</span></div>
                  <textarea className="textarea textarea-bordered min-h-[88px] w-full rounded-lg text-sm focus:border-primary focus:outline-none"
                    placeholder="e.g. Payment by bank transfer within the agreed terms."
                    value={invoice.notes} onChange={(e) => update('notes', e.target.value)} />
                </label>
                <label className="form-control w-full">
                  <div className="label pb-1 pt-0"><span className="label-text text-[11px] font-black uppercase tracking-widest text-base-content/40">Payment details</span></div>
                  <textarea className="textarea textarea-bordered min-h-[88px] w-full rounded-lg text-sm focus:border-primary focus:outline-none"
                    placeholder={'Bank: Revolut\nIBAN: GB00 0000 0000\nRef: ' + invoice.invoiceNumber}
                    value={invoice.paymentDetails} onChange={(e) => update('paymentDetails', e.target.value)} />
                </label>
              </div>

              {/* Brand colour */}
              <div className="mt-5 flex flex-wrap items-end gap-6">
                <div>
                  <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-base-content/40">Brand colour</p>
                  {proMode ? (
                    <div className="flex gap-2">
                      {brandColors.map((color) => (
                        <button key={color} className="relative h-8 w-8 rounded-full transition hover:scale-110"
                          style={{ background: color, outline: invoice.brandColor === color ? `3px solid ${color}` : 'none', outlineOffset: '2px' }}
                          onClick={() => update('brandColor', color)}>
                          {invoice.brandColor === color && <Check size={13} className="absolute inset-0 m-auto text-white" strokeWidth={3} />}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">{brandColors.map((c) => <div key={c} className="h-8 w-8 rounded-full opacity-20" style={{ background: c }} />)}</div>
                      <button className="btn btn-ghost btn-xs mt-2 gap-1 text-primary" onClick={openPro}><Lock size={11} />Unlock with Pro</button>
                    </div>
                  )}
                </div>
                <button className="btn btn-outline btn-sm gap-2 rounded-lg border-base-content/15 text-base-content/40" disabled={!proMode} onClick={!proMode ? openPro : undefined}>
                  {!proMode && <Lock size={13} />} Upload logo
                </button>
              </div>
            </div>

          </div>

          {/* ── Live preview ── */}
          <aside className="hidden lg:block lg:sticky lg:top-[57px] lg:self-start lg:max-h-[calc(100vh-57px)] lg:overflow-y-auto lg:py-10">
            <div className="overflow-hidden rounded-2xl border-2 border-secondary shadow-card">

              {/* Header */}
              <div className="flex items-center justify-between border-b border-base-content/10 bg-base-100 px-5 py-3.5">
                <div>
                  <p className="text-sm font-black">Live preview</p>
                  <p className="text-[11px] text-base-content/40">Updates as you type</p>
                </div>
                <div className="badge badge-primary gap-1.5 rounded-full px-3 py-3 text-[11px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />Live
                </div>
              </div>

              {/* Paper */}
              <div className="bg-slate-100 px-5 py-6">
                <div className="invoice-paper mx-auto overflow-hidden bg-white p-8 shadow-document">
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-md font-black text-white text-sm" style={accentStyle}>RI</div>
                    <div className="text-right">
                      <p className="text-3xl font-bold tracking-wide text-slate-800">INVOICE</p>
                      <p className="mt-0.5 text-sm text-slate-400">{invoice.invoiceNumber}</p>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-6">
                    {[['From', invoice.senderName, invoice.senderEmail, invoice.senderAddress],
                      ['Bill to', invoice.clientName, invoice.clientEmail, invoice.clientAddress]].map(([label, name, email, address]) => (
                      <div key={label}>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                        <p className="mt-1.5 text-sm font-bold text-slate-800">{name || '—'}</p>
                        <p className="text-xs leading-5 text-slate-500">{email}</p>
                        <p className="text-xs leading-5 text-slate-500">{address}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3 text-xs">
                    {[['Issued', invoice.issueDate], ['Due', invoice.dueDate], ['Terms', invoice.paymentTerms]].map(([l, v]) => (
                      <div key={l}><span className="block font-bold text-slate-400">{l}</span>{v}</div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <div className="grid grid-cols-[1fr_44px_80px] gap-2 border-b border-slate-200 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <span>Description</span><span className="text-right">Qty</span><span className="text-right">Amount</span>
                    </div>
                    {invoice.items.map((item) => (
                      <div key={item.id} className="grid grid-cols-[1fr_44px_80px] gap-2 border-b border-slate-100 py-2.5 text-xs">
                        <span className="font-medium text-slate-700">{item.description || <span className="text-slate-300">—</span>}</span>
                        <span className="text-right text-slate-400">{item.quantity}</span>
                        <span className="text-right font-semibold text-slate-700">{formatMoney(Number(item.quantity||0)*Number(item.rate||0), invoice.currency)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="ml-auto mt-5 grid w-52 gap-1.5 text-xs">
                    {[['Subtotal', totals.subtotal], ['Discount', -invoice.discount], ['Tax', totals.tax]].map(([l, v]) => (
                      <div key={l} className="flex justify-between text-slate-500"><span>{l}</span><span>{formatMoney(v, invoice.currency)}</span></div>
                    ))}
                    <div className="mt-2 flex justify-between rounded-md px-3 py-2 text-sm font-bold text-white" style={accentStyle}>
                      <span>Total</span><span>{formatMoney(totals.total, invoice.currency)}</span>
                    </div>
                  </div>

                  {invoice.notes && <p className="mt-5 break-all text-xs leading-5 text-slate-500">{invoice.notes}</p>}
                  {invoice.paymentDetails && (
                    <div className="mt-4 rounded-lg bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Payment details</p>
                      <p className="mt-1 whitespace-pre-line break-all text-xs leading-5 text-slate-600">{invoice.paymentDetails}</p>
                    </div>
                  )}
                  <p className="mt-6 text-center text-[10px] text-slate-300">{proMode ? invoice.footer : 'Generated with ReadyInvoice'}</p>
                </div>
              </div>

              {/* CTA */}
              <div className="border-t border-base-content/10 bg-base-100 px-5 py-4">
                <button className="btn btn-primary h-12 w-full rounded-xl text-sm font-black active:scale-[0.98]" onClick={downloadPdf}>
                  <Download size={16} /> Download PDF
                </button>
                <p className="mt-3 text-center text-[11px] text-base-content/30">Your data never leaves your browser.</p>
                {status && <p className="mt-1.5 text-center text-xs font-bold text-primary">{status}</p>}
              </div>

            </div>
          </aside>

        </div>
      </section>

      {/* ── Mobile sticky bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t-2 border-secondary bg-base-100 px-4 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-base-content/30">{invoice.invoiceNumber}</p>
            <p className="text-xl font-black">{formatMoney(totals.total, invoice.currency)}</p>
          </div>
          <button className="btn btn-primary flex-1 rounded-xl active:scale-[0.98]" onClick={downloadPdf}>
            <Download size={16} /> Download PDF
          </button>
        </div>
        {status && <p className="mt-1.5 text-center text-xs font-bold text-primary">{status}</p>}
      </div>

      {/* ══ FEATURES ══ */}
      <section id="toolkit" className="bg-secondary text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:items-start">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-widest text-primary">— Pro toolkit</p>
              <h2 className="text-4xl font-black leading-[1.1]">
                Free users get the PDF.{' '}
                <span className="text-primary">Freelancers unlock the toolkit.</span>
              </h2>
              <p className="mt-4 text-sm leading-6 text-white/40">Pro removes limits and adds the workflows weekly billers actually need.</p>
              <button className="btn btn-primary mt-6 gap-2 rounded-lg" onClick={openPro}>Join the waitlist <ArrowRight size={14} /></button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {paidFeatures.map((f, i) => (
                <article key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-primary/40">
                  <div className="flex items-start justify-between">
                    <span className="inline-grid h-9 w-9 place-items-center rounded-lg bg-primary/20 text-primary"><f.icon size={16} strokeWidth={2.5} /></span>
                    <span className="text-[11px] font-black text-white/20">{String(i+1).padStart(2,'0')}</span>
                  </div>
                  <h3 className="mt-4 text-sm font-black">{f.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-white/40">{f.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
        <p className="mb-3 text-xs font-black uppercase tracking-widest text-primary">— Pricing</p>
        <h2 className="text-4xl font-black leading-[1.1]">Simple pricing. <span className="text-primary">No surprises.</span></h2>
        <p className="mt-3 text-sm text-base-content/50">Free for occasional PDFs. Pro for freelancers who invoice every week.</p>
        <p className="mt-1 text-sm font-semibold text-base-content/40">Trusted by <span className="font-black text-base-content">2,400+</span> freelancers.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {pricing.map((plan) => (
            <article key={plan.name} className={`card border-2 shadow-card ${plan.popular ? 'border-primary bg-primary text-white' : 'border-secondary bg-base-100'}`}>
              <div className="card-body gap-0 p-7">
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-[11px] font-black uppercase tracking-widest ${plan.popular ? 'text-white/60' : 'text-base-content/40'}`}>{plan.detail}</p>
                    <h3 className="mt-1 text-2xl font-black">{plan.name}</h3>
                  </div>
                  {plan.popular && <BadgeCheck size={20} />}
                </div>
                <p className="mt-5 text-5xl font-black">{plan.price}<span className="text-sm font-normal opacity-60">{plan.name !== 'Free' && '/mo'}</span></p>
                <ul className="mt-6 space-y-2.5 text-sm">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5">
                      <BadgeCheck size={14} className={plan.popular ? 'text-white' : 'text-primary'} />{feat}
                    </li>
                  ))}
                </ul>
                <div className="card-actions mt-7">
                  <button className={`btn w-full rounded-xl font-black ${plan.popular ? 'bg-white text-primary hover:bg-white/90 border-none' : 'btn-primary'}`}
                    onClick={plan.name !== 'Free' ? openPro : undefined}>
                    {plan.name === 'Free' ? 'Use free' : 'Join waitlist'} <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="border-t border-base-content/10 px-4 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-[10px] font-black text-white">RI</div>
            <span className="text-sm font-black">ReadyInvoice</span>
          </div>
          <p className="text-xs text-base-content/40">Your data never leaves your browser. No tracking, no storage, no account.</p>
          <p className="text-xs text-base-content/30">© {new Date().getFullYear()} ReadyInvoice</p>
        </div>
      </footer>

    </main>
  )
}
