import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Download,
  History,
  Link2,
  Lock,
  Palette,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useMemo, useState } from 'react'

const today = new Date().toISOString().slice(0, 10)
const due = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

const initialInvoice = {
  senderName: 'Marta Silva Studio',
  senderEmail: 'hello@martasilva.co',
  senderAddress: 'Rua do Alecrim 12, Lisbon',
  clientName: 'Northstar Labs',
  clientEmail: 'finance@northstar.example',
  clientAddress: '48 Fleet Street, London',
  invoiceNumber: 'INV-2026-001',
  issueDate: today,
  dueDate: due,
  paymentTerms: 'Net 14',
  currency: 'EUR',
  taxRate: 19,
  discount: 0,
  notes: 'Thanks for the collaboration. Payment by bank transfer within the agreed terms.',
  footer: 'Generated with ReadyInvoice',
  brandColor: '#e05c25',
  items: [
    { id: 1, description: 'Brand strategy workshop', quantity: 1, rate: 900 },
    { id: 2, description: 'Landing page copy and wireframes', quantity: 2, rate: 420 },
  ],
}

const paidFeatures = [
  { icon: Palette, title: 'Custom branding', text: 'Logo, brand colours, and custom footer on every PDF.' },
  { icon: Link2, title: 'Client portal', text: 'Send a hosted link clients can view, download, and revisit.' },
  { icon: CalendarClock, title: 'Recurring invoices', text: 'Schedule monthly retainers and repeat invoices automatically.' },
  { icon: History, title: 'History dashboard', text: 'Save invoices and track paid, unpaid, and overdue work.' },
  { icon: Sparkles, title: 'Proposal templates', text: 'Turn scopes into accept/reject proposal links on Pro and Team.' },
]

const pricing = [
  { name: 'Free', price: '€0', detail: '3 invoices/month', features: ['PDF download', 'No signup', 'ReadyInvoice footer'] },
  {
    name: 'Pro',
    price: '€14',
    detail: 'per month',
    features: ['Unlimited invoices', 'Branding', 'History', 'Client portal'],
    popular: true,
  },
  { name: 'Team', price: '€39', detail: 'per month', features: ['5 seats', 'Proposals', 'Priority support'] },
]

function formatMoney(value, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}

function calculateTotals(invoice) {
  const subtotal = invoice.items.reduce((sum, item) => {
    return sum + Number(item.quantity || 0) * Number(item.rate || 0)
  }, 0)
  const taxable = Math.max(0, subtotal - Number(invoice.discount || 0))
  const tax = taxable * (Number(invoice.taxRate || 0) / 100)
  return { subtotal, tax, total: taxable + tax }
}

function Field({ label, className = '', ...props }) {
  return (
    <label className={`grid gap-1.5 text-[11px] font-black uppercase tracking-widest text-ink/40 ${className}`}>
      {label}
      <input
        className="h-10 rounded-lg border border-ink/15 bg-white px-3 text-sm font-medium text-ink outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/10"
        {...props}
      />
    </label>
  )
}

function Step({ number, title }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-orange text-[10px] font-black text-white">
        {String(number).padStart(2, '0')}
      </span>
      <h3 className="text-xs font-black uppercase tracking-widest text-ink">{title}</h3>
      <div className="h-px flex-1 bg-ink/10" />
    </div>
  )
}

function App() {
  const [invoice, setInvoice] = useState(initialInvoice)
  const [usage, setUsage] = useState(() => Number(localStorage.getItem('readyinvoice-usage') || 0))
  const [proMode, setProMode] = useState(false)
  const [status, setStatus] = useState('')
  const totals = useMemo(() => calculateTotals(invoice), [invoice])

  function update(field, value) {
    setInvoice((current) => ({ ...current, [field]: value }))
  }

  function updateItem(id, field, value) {
    setInvoice((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }))
  }

  function addItem() {
    setInvoice((current) => ({
      ...current,
      items: [...current.items, { id: Date.now(), description: 'New service', quantity: 1, rate: 250 }],
    }))
  }

  function removeItem(id) {
    setInvoice((current) => ({
      ...current,
      items: current.items.length > 1 ? current.items.filter((item) => item.id !== id) : current.items,
    }))
  }

  async function downloadPdf() {
    setStatus('Preparing PDF...')
    const response = await fetch('/api/invoices/pdf/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...invoice, proMode }),
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      setStatus(payload.error || 'Could not generate the invoice.')
      return
    }

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${invoice.invoiceNumber || 'readyinvoice'}.pdf`
    link.click()
    URL.revokeObjectURL(url)

    const nextUsage = proMode ? usage : Math.min(3, usage + 1)
    setUsage(nextUsage)
    localStorage.setItem('readyinvoice-usage', String(nextUsage))
    setStatus('PDF downloaded. Clean, tidy, billable.')
  }

  return (
    <main className="min-h-screen bg-cream text-ink">

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-orange text-xs font-black text-white">RI</div>
            <span className="text-base font-black tracking-tight">ReadyInvoice</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-ink/50 md:flex">
            <a href="#generator" className="transition-colors hover:text-ink">Generator</a>
            <a href="#pricing" className="transition-colors hover:text-ink">Pricing</a>
            <a href="#features" className="transition-colors hover:text-ink">Toolkit</a>
          </nav>
          <button
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-orange px-4 text-sm font-black text-white transition hover:bg-orange/90"
            onClick={() => setProMode(true)}
          >
            <BadgeCheck size={14} />
            Try Pro
          </button>
        </div>
      </header>

      {/* ── Generator ── */}
      <section id="generator" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Page headline */}
        <div className="border-b border-ink/10 py-10">
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-orange">— Invoice Generator</p>
          <div className="flex flex-wrap items-start justify-between gap-5">
            <h1 className="max-w-2xl text-5xl font-black leading-[1.05] text-ink sm:text-6xl">
              Create a professional PDF invoice{' '}
              <span className="text-orange">in under 60 seconds.</span>
            </h1>
            <div className="mt-1 shrink-0 rounded-xl border-2 border-ink bg-yellow-100 px-4 py-2.5 text-sm font-bold text-ink shadow-card">
              {proMode
                ? <>Pro <span className="text-orange">unlocked</span> for this demo</>
                : <><span className="font-black text-orange">{Math.max(0, 3 - usage)} of 3</span> free invoices left</>
              }
            </div>
          </div>
          <p className="mt-4 max-w-xl text-base leading-7 text-ink/50">
            No account. No signup. Fill the form, check the live preview, download the PDF.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_460px]">

          {/* ── Form ── */}
          <div className="space-y-10">

            {/* Step 01 — Invoice details */}
            <div>
              <Step number={1} title="Invoice details" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Invoice number" value={invoice.invoiceNumber} onChange={(e) => update('invoiceNumber', e.target.value)} />
                <Field label="Issue date" type="date" value={invoice.issueDate} onChange={(e) => update('issueDate', e.target.value)} />
                <Field label="Due date" type="date" value={invoice.dueDate} onChange={(e) => update('dueDate', e.target.value)} />
                <label className="grid gap-1.5 text-[11px] font-black uppercase tracking-widest text-ink/40">
                  Currency
                  <select
                    className="h-10 rounded-lg border border-ink/15 bg-white px-3 text-sm font-medium text-ink outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/10"
                    value={invoice.currency}
                    onChange={(e) => update('currency', e.target.value)}
                  >
                    <option>EUR</option>
                    <option>USD</option>
                    <option>GBP</option>
                  </select>
                </label>
              </div>
            </div>

            {/* Step 02 — Sender & client */}
            <div>
              <Step number={2} title="Sender and client" />
              <div className="grid gap-x-6 gap-y-3 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="mb-3 text-[11px] font-black uppercase tracking-widest text-ink/30">From you</p>
                  <div className="grid gap-3">
                    <Field label="Name or company" value={invoice.senderName} onChange={(e) => update('senderName', e.target.value)} />
                    <Field label="Email" value={invoice.senderEmail} onChange={(e) => update('senderEmail', e.target.value)} />
                    <Field label="Address" value={invoice.senderAddress} onChange={(e) => update('senderAddress', e.target.value)} />
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-[11px] font-black uppercase tracking-widest text-ink/30">Bill to</p>
                  <div className="grid gap-3">
                    <Field label="Client name" value={invoice.clientName} onChange={(e) => update('clientName', e.target.value)} />
                    <Field label="Client email" value={invoice.clientEmail} onChange={(e) => update('clientEmail', e.target.value)} />
                    <Field label="Client address" value={invoice.clientAddress} onChange={(e) => update('clientAddress', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 03 — Line items */}
            <div>
              <Step number={3} title="Line items" />
              <div className="overflow-x-auto">
                <div className="min-w-[560px]">
                  <div className="grid grid-cols-[1fr_72px_110px_36px] gap-2 border-b border-ink/10 pb-2 text-[11px] font-black uppercase tracking-widest text-ink/30">
                    <span>Description</span>
                    <span>Qty</span>
                    <span>Rate</span>
                    <span />
                  </div>
                  {invoice.items.map((item) => (
                    <div key={item.id} className="grid grid-cols-[1fr_72px_110px_36px] gap-2 border-b border-ink/5 py-2">
                      <input
                        className="h-10 rounded-lg border border-ink/15 px-3 text-sm text-ink outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/10"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      />
                      <input
                        className="h-10 rounded-lg border border-ink/15 px-3 text-sm text-ink outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/10"
                        type="number" min="0"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                      />
                      <input
                        className="h-10 rounded-lg border border-ink/15 px-3 text-sm text-ink outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/10"
                        type="number" min="0"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', e.target.value)}
                      />
                      <button
                        className="grid h-10 w-9 place-items-center rounded-lg text-ink/25 transition hover:bg-ink/5 hover:text-ink"
                        onClick={() => removeItem(item.id)}
                        aria-label="Remove line item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-ink/15 px-4 text-sm font-bold text-ink/50 transition hover:border-orange hover:text-orange"
                onClick={addItem}
              >
                <Plus size={14} />
                Add item
              </button>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <Field label="Tax rate %" type="number" value={invoice.taxRate} onChange={(e) => update('taxRate', e.target.value)} />
                <Field label="Discount" type="number" value={invoice.discount} onChange={(e) => update('discount', e.target.value)} />
                <Field label="Payment terms" value={invoice.paymentTerms} onChange={(e) => update('paymentTerms', e.target.value)} />
              </div>
            </div>

            {/* Step 04 — Notes & branding */}
            <div>
              <Step number={4} title="Notes and branding" />
              <div className="grid gap-4 md:grid-cols-[1fr_180px]">
                <label className="grid gap-1.5 text-[11px] font-black uppercase tracking-widest text-ink/40">
                  Notes
                  <textarea
                    className="min-h-[96px] rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/10"
                    value={invoice.notes}
                    onChange={(e) => update('notes', e.target.value)}
                  />
                </label>
                <div className="grid gap-3 content-start">
                  <label className="grid gap-1.5 text-[11px] font-black uppercase tracking-widest text-ink/40">
                    Brand colour
                    <input
                      type="color"
                      className="h-10 w-full rounded-lg border border-ink/15 bg-white p-1 disabled:opacity-30"
                      value={invoice.brandColor}
                      disabled={!proMode}
                      onChange={(e) => update('brandColor', e.target.value)}
                    />
                  </label>
                  <button
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-ink/15 text-sm font-bold text-ink/40 transition disabled:cursor-not-allowed disabled:bg-ink/3"
                    disabled={!proMode}
                  >
                    {!proMode && <Lock size={13} />}
                    Upload logo
                  </button>
                  {!proMode && (
                    <p className="text-[11px] text-ink/30 leading-4">Branding is a Pro feature.</p>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* ── Live preview ── */}
          <aside className="lg:sticky lg:top-[57px] lg:self-start lg:max-h-[calc(100vh-57px)] lg:overflow-y-auto">
            <div className="overflow-hidden rounded-2xl border-2 border-ink bg-white shadow-card">

              {/* Preview header */}
              <div className="flex items-center justify-between gap-2 border-b border-ink/10 px-5 py-3.5">
                <div>
                  <p className="text-sm font-black text-ink">Live preview</p>
                  <p className="text-[11px] text-ink/40">Updates as you type</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange/10 px-2.5 py-1 text-[11px] font-black text-orange">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange" />
                  Live
                </span>
              </div>

              {/* Invoice paper */}
              <div className="p-5">
                <div className="invoice-paper mx-auto bg-white p-7 shadow-document">
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-md text-base font-black text-white" style={{ background: proMode ? invoice.brandColor : '#e05c25' }}>
                      RI
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold tracking-normal">INVOICE</div>
                      <div className="mt-1 text-sm font-medium text-slate-500">{invoice.invoiceNumber}</div>
                    </div>
                  </div>

                  <div className="mt-9 grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[11px] font-bold uppercase text-slate-400">From</p>
                      <p className="mt-2 text-sm font-bold">{invoice.senderName}</p>
                      <p className="text-xs leading-5 text-slate-500">{invoice.senderEmail}</p>
                      <p className="text-xs leading-5 text-slate-500">{invoice.senderAddress}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase text-slate-400">Bill to</p>
                      <p className="mt-2 text-sm font-bold">{invoice.clientName}</p>
                      <p className="text-xs leading-5 text-slate-500">{invoice.clientEmail}</p>
                      <p className="text-xs leading-5 text-slate-500">{invoice.clientAddress}</p>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-3 gap-3 rounded-md bg-slate-50 p-3 text-xs">
                    <div><span className="block font-bold text-slate-400">Issued</span>{invoice.issueDate}</div>
                    <div><span className="block font-bold text-slate-400">Due</span>{invoice.dueDate}</div>
                    <div><span className="block font-bold text-slate-400">Terms</span>{invoice.paymentTerms}</div>
                  </div>

                  <div className="mt-7">
                    <div className="grid grid-cols-[1fr_52px_84px] gap-2 border-b border-slate-200 pb-2 text-[11px] font-bold uppercase text-slate-400">
                      <span>Description</span>
                      <span className="text-right">Qty</span>
                      <span className="text-right">Amount</span>
                    </div>
                    {invoice.items.map((item) => (
                      <div key={item.id} className="grid grid-cols-[1fr_52px_84px] gap-2 border-b border-slate-100 py-3 text-xs">
                        <span className="font-semibold text-slate-800">{item.description}</span>
                        <span className="text-right text-slate-500">{item.quantity}</span>
                        <span className="text-right font-semibold">{formatMoney(Number(item.quantity || 0) * Number(item.rate || 0), invoice.currency)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="ml-auto mt-6 grid w-56 gap-2 text-sm">
                    <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatMoney(totals.subtotal, invoice.currency)}</span></div>
                    <div className="flex justify-between text-slate-600"><span>Discount</span><span>-{formatMoney(invoice.discount, invoice.currency)}</span></div>
                    <div className="flex justify-between text-slate-600"><span>Tax</span><span>{formatMoney(totals.tax, invoice.currency)}</span></div>
                    <div className="mt-2 flex justify-between rounded-md px-3 py-2 text-base font-bold text-white" style={{ background: proMode ? invoice.brandColor : '#e05c25' }}>
                      <span>Total</span><span>{formatMoney(totals.total, invoice.currency)}</span>
                    </div>
                  </div>

                  <p className="mt-7 text-xs leading-5 text-slate-500">{invoice.notes}</p>
                  <p className="mt-8 text-center text-[11px] text-slate-400">{proMode ? invoice.footer : 'Generated with ReadyInvoice'}</p>
                </div>
              </div>

              {/* Download CTA */}
              <div className="border-t border-ink/10 bg-ink/[0.02] px-5 py-4">
                <button
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange text-sm font-black text-white transition hover:bg-orange/90 active:scale-[0.98]"
                  onClick={downloadPdf}
                >
                  <Download size={16} />
                  Download PDF
                </button>
                <p className="mt-2.5 min-h-4 text-center text-xs font-bold text-orange">{status}</p>
              </div>

            </div>
          </aside>

        </div>
      </section>

      {/* ── Features — dark section ── */}
      <section id="features" className="bg-ink text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:items-start">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-widest text-orange">— Pro toolkit</p>
              <h2 className="text-4xl font-black leading-[1.1]">
                Free users get the PDF.{' '}
                <span className="text-orange">Freelancers unlock the toolkit.</span>
              </h2>
              <p className="mt-4 text-sm leading-6 text-white/40">
                The free tier solves the one-off job. Pro removes limits and adds the workflows weekly billers actually need.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {paidFeatures.map((feature, i) => (
                <article key={feature.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-orange/40">
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-orange/20 text-orange">
                      <feature.icon size={16} strokeWidth={2.5} />
                    </span>
                    <span className="text-[11px] font-black text-white/20">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="mt-4 text-sm font-black text-white">{feature.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-white/40">{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-orange">— Pricing</p>
            <h2 className="text-4xl font-black leading-[1.1] text-ink">
              Simple pricing.{' '}
              <span className="text-orange">No surprises.</span>
            </h2>
            <p className="mt-3 text-sm text-ink/50">Free for occasional PDFs. Pro for freelancers who invoice every week.</p>
          </div>
          <div className="rounded-xl border-2 border-ink bg-yellow-100 px-4 py-2 text-sm font-bold text-ink shadow-card">
            500 Pro users = €7,000/mo recurring
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {pricing.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-2xl border-2 p-7 shadow-card ${
                plan.popular ? 'border-orange bg-orange text-white' : 'border-ink bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-[11px] font-black uppercase tracking-widest ${plan.popular ? 'text-white/60' : 'text-ink/40'}`}>
                    {plan.detail}
                  </p>
                  <h3 className="mt-1 text-2xl font-black">{plan.name}</h3>
                </div>
                {plan.popular && <BadgeCheck size={20} />}
              </div>
              <div className="mt-5 flex items-end gap-1">
                <span className="text-5xl font-black">{plan.price}</span>
                {plan.name !== 'Free' && <span className="pb-1.5 text-sm opacity-60">/mo</span>}
              </div>
              <ul className="mt-6 space-y-2.5 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <BadgeCheck size={14} className={plan.popular ? 'text-white' : 'text-orange'} />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-black transition ${
                  plan.popular ? 'bg-white text-orange hover:bg-white/90' : 'bg-orange text-white hover:bg-orange/90'
                }`}
                onClick={() => setProMode(plan.name !== 'Free')}
              >
                {plan.name === 'Free' ? 'Use free' : 'Unlock toolkit'}
                <ArrowRight size={14} />
              </button>
            </article>
          ))}
        </div>
      </section>

    </main>
  )
}

export default App
