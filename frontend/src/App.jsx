import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Download,
  FileText,
  History,
  Link2,
  Lock,
  Palette,
  Plus,
  Send,
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
  brandColor: '#0f766e',
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
    <label className={`grid gap-1.5 text-[13px] font-medium text-slate-600 ${className}`}>
      {label}
      <input
        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-teal focus:ring-4 focus:ring-teal/10"
        {...props}
      />
    </label>
  )
}

function SectionTitle({ icon: Icon, title, action }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-slate-100 text-teal">
          <Icon size={17} strokeWidth={2.2} />
        </span>
        <h2 className="text-base font-semibold text-ink">{title}</h2>
      </div>
      {action}
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
    <main className="min-h-screen bg-white text-ink">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-md bg-teal text-sm font-black text-white">RI</div>
            <span className="text-lg font-semibold tracking-normal">ReadyInvoice</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#generator" className="hover:text-ink">Generator</a>
            <a href="#pricing" className="hover:text-ink">Pricing</a>
            <a href="#features" className="hover:text-ink">Toolkit</a>
          </nav>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            onClick={() => setProMode(true)}
          >
            <BadgeCheck size={16} />
            Try Pro
          </button>
        </div>
      </header>

      <section id="generator" className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)] lg:px-8">
        <div className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <h1 className="max-w-2xl text-3xl font-semibold leading-tight text-ink sm:text-4xl">
                Create a professional PDF invoice in under 60 seconds.
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Fill the form, check the live preview, download the PDF. No account or signup needed.
              </p>
            </div>
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              {proMode ? 'Pro unlocked for this demo' : `${Math.max(0, 3 - usage)} of 3 free invoices left`}
            </div>
          </div>

          <div className="grid gap-5">
            <section className="rounded-md border border-slate-200 bg-white p-4">
              <SectionTitle icon={FileText} title="Invoice details" />
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Invoice number" value={invoice.invoiceNumber} onChange={(e) => update('invoiceNumber', e.target.value)} />
                <Field label="Issue date" type="date" value={invoice.issueDate} onChange={(e) => update('issueDate', e.target.value)} />
                <Field label="Due date" type="date" value={invoice.dueDate} onChange={(e) => update('dueDate', e.target.value)} />
                <label className="grid gap-1.5 text-[13px] font-medium text-slate-600">
                  Currency
                  <select
                    className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-teal focus:ring-4 focus:ring-teal/10"
                    value={invoice.currency}
                    onChange={(e) => update('currency', e.target.value)}
                  >
                    <option>EUR</option>
                    <option>USD</option>
                    <option>GBP</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="rounded-md border border-slate-200 bg-white p-4">
              <SectionTitle icon={Send} title="Sender and client" />
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="grid gap-3">
                  <Field label="Your name or company" value={invoice.senderName} onChange={(e) => update('senderName', e.target.value)} />
                  <Field label="Your email" value={invoice.senderEmail} onChange={(e) => update('senderEmail', e.target.value)} />
                  <Field label="Your address" value={invoice.senderAddress} onChange={(e) => update('senderAddress', e.target.value)} />
                </div>
                <div className="grid gap-3">
                  <Field label="Client name" value={invoice.clientName} onChange={(e) => update('clientName', e.target.value)} />
                  <Field label="Client email" value={invoice.clientEmail} onChange={(e) => update('clientEmail', e.target.value)} />
                  <Field label="Client address" value={invoice.clientAddress} onChange={(e) => update('clientAddress', e.target.value)} />
                </div>
              </div>
            </section>

            <section className="rounded-md border border-slate-200 bg-white p-4">
              <SectionTitle
                icon={FileText}
                title="Line items"
                action={
                  <button className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-ink hover:bg-slate-50" onClick={addItem}>
                    <Plus size={15} />
                    Add item
                  </button>
                }
              />
              <div className="mt-4 overflow-x-auto">
                <div className="min-w-[660px]">
                  <div className="grid grid-cols-[1fr_90px_130px_42px] gap-2 border-b border-slate-200 pb-2 text-xs font-bold uppercase text-slate-500">
                    <span>Description</span>
                    <span>Qty</span>
                    <span>Rate</span>
                    <span></span>
                  </div>
                  {invoice.items.map((item) => (
                    <div key={item.id} className="grid grid-cols-[1fr_90px_130px_42px] gap-2 border-b border-slate-100 py-2">
                      <input className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-teal focus:ring-4 focus:ring-teal/10" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} />
                      <input className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-teal focus:ring-4 focus:ring-teal/10" type="number" min="0" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} />
                      <input className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-teal focus:ring-4 focus:ring-teal/10" type="number" min="0" value={item.rate} onChange={(e) => updateItem(item.id, 'rate', e.target.value)} />
                      <button className="grid h-10 w-10 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-ink" onClick={() => removeItem(item.id)} aria-label="Remove line item">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Field label="Tax rate %" type="number" value={invoice.taxRate} onChange={(e) => update('taxRate', e.target.value)} />
                <Field label="Discount" type="number" value={invoice.discount} onChange={(e) => update('discount', e.target.value)} />
                <Field label="Payment terms" value={invoice.paymentTerms} onChange={(e) => update('paymentTerms', e.target.value)} />
              </div>
            </section>

            <section className="rounded-md border border-slate-200 bg-white p-4">
              <SectionTitle icon={Palette} title="Branding and notes" />
              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px]">
                <label className="grid gap-1.5 text-[13px] font-medium text-slate-600">
                  Notes
                  <textarea
                    className="min-h-24 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition focus:border-teal focus:ring-4 focus:ring-teal/10"
                    value={invoice.notes}
                    onChange={(e) => update('notes', e.target.value)}
                  />
                </label>
                <div className="grid gap-3">
                  <label className="grid gap-1.5 text-[13px] font-medium text-slate-600">
                    Brand colour
                    <input
                      type="color"
                      className="h-10 w-full rounded-md border border-slate-200 bg-white p-1 disabled:opacity-50"
                      value={invoice.brandColor}
                      disabled={!proMode}
                      onChange={(e) => update('brandColor', e.target.value)}
                    />
                  </label>
                  <button
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 text-sm font-semibold text-slate-600 disabled:bg-slate-50"
                    disabled={!proMode}
                  >
                    {!proMode && <Lock size={15} />}
                    Upload logo
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-600">Live preview</p>
                <p className="text-xs text-slate-500">Updates as you type</p>
              </div>
              <button
                className="inline-flex h-10 items-center gap-2 rounded-md bg-teal px-4 text-sm font-bold text-white shadow-sm transition hover:bg-teal/90"
                onClick={downloadPdf}
              >
                <Download size={16} />
                Download PDF
              </button>
            </div>

            <div className="invoice-paper mx-auto bg-white p-7 shadow-document">
              <div className="flex items-start justify-between gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-md text-base font-black text-white" style={{ background: proMode ? invoice.brandColor : '#0f766e' }}>
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
                <div className="mt-2 flex justify-between rounded-md px-3 py-2 text-base font-bold text-white" style={{ background: proMode ? invoice.brandColor : '#0f766e' }}>
                  <span>Total</span><span>{formatMoney(totals.total, invoice.currency)}</span>
                </div>
              </div>
              <p className="mt-7 text-xs leading-5 text-slate-500">{invoice.notes}</p>
              <p className="mt-8 text-center text-[11px] text-slate-400">{proMode ? invoice.footer : 'Generated with ReadyInvoice'}</p>
            </div>

            <p className="mt-4 min-h-5 text-sm font-semibold text-slate-600">{status}</p>
          </div>
        </aside>
      </section>

      <section id="features" className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-[0.75fr_1.25fr] md:items-start">
            <div>
              <h2 className="text-2xl font-semibold text-ink">Free users get the PDF. Freelancers unlock the toolkit.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">The free tier solves the one-off job. Pro removes limits and adds the workflows weekly billers need.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {paidFeatures.map((feature) => (
                <article key={feature.title} className="rounded-md border border-slate-200 bg-white p-4">
                  <feature.icon className="text-teal" size={20} />
                  <h3 className="mt-3 text-sm font-bold text-ink">{feature.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-ink">Simple pricing for weekly invoicing.</h2>
            <p className="mt-2 text-sm text-slate-600">Free for occasional PDFs. Pro for freelancers who invoice every week.</p>
          </div>
          <div className="text-sm font-semibold text-teal">500 Pro users = €7,000/mo recurring</div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {pricing.map((plan) => (
            <article key={plan.name} className={`rounded-md border p-5 ${plan.popular ? 'border-teal bg-teal text-white' : 'border-slate-200 bg-white'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <p className={`mt-1 text-sm ${plan.popular ? 'text-teal-50' : 'text-slate-500'}`}>{plan.detail}</p>
                </div>
                {plan.popular && <BadgeCheck size={20} />}
              </div>
              <div className="mt-5 flex items-end gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.name !== 'Free' && <span className="pb-1 text-sm opacity-80">/mo</span>}
              </div>
              <ul className="mt-5 space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <BadgeCheck size={15} />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md text-sm font-bold ${plan.popular ? 'bg-white text-teal' : 'bg-ink text-white'}`}
                onClick={() => setProMode(plan.name !== 'Free')}
              >
                {plan.name === 'Free' ? 'Use free' : 'Unlock toolkit'}
                <ArrowRight size={15} />
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
