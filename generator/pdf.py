from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas


TWOPLACES = Decimal('0.01')


def money(value):
    try:
        return Decimal(str(value or 0)).quantize(TWOPLACES, rounding=ROUND_HALF_UP)
    except (InvalidOperation, ValueError):
        return Decimal('0.00')


def currency_amount(value, currency):
    return f'{currency} {money(value):,.2f}'


def calculate_totals(data):
    subtotal = Decimal('0.00')
    for item in data.get('items', []):
        quantity = money(item.get('quantity', 1))
        rate = money(item.get('rate', 0))
        subtotal += quantity * rate

    discount = money(data.get('discount', 0))
    taxable = max(Decimal('0.00'), subtotal - discount)
    tax_rate = money(data.get('taxRate', 0))
    tax = (taxable * tax_rate / Decimal('100')).quantize(TWOPLACES, rounding=ROUND_HALF_UP)
    total = taxable + tax
    return {
        'subtotal': subtotal.quantize(TWOPLACES, rounding=ROUND_HALF_UP),
        'discount': discount,
        'tax': tax,
        'total': total.quantize(TWOPLACES, rounding=ROUND_HALF_UP),
    }


def draw_label(pdf, text, x, y):
    pdf.setFillColor(colors.HexColor('#64748b'))
    pdf.setFont('Helvetica', 8)
    pdf.drawString(x, y, text.upper())


def draw_value(pdf, text, x, y, size=10):
    pdf.setFillColor(colors.HexColor('#0f172a'))
    pdf.setFont('Helvetica', size)
    pdf.drawString(x, y, str(text or ''))


def generate_invoice_pdf(data):
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    currency    = data.get('currency', 'EUR')
    brand_color = data.get('brandColor') or '#e05c25'
    totals      = calculate_totals(data)

    try:
        accent = colors.HexColor(brand_color)
    except Exception:
        accent = colors.HexColor('#e05c25')

    margin = 22 * mm
    y = height - margin

    pdf.setFillColor(accent)
    pdf.roundRect(margin, y - 15, 34, 34, 5, stroke=0, fill=1)
    pdf.setFillColor(colors.white)
    pdf.setFont('Helvetica-Bold', 15)
    pdf.drawCentredString(margin + 17, y + 6, 'RI')

    pdf.setFillColor(colors.HexColor('#0f172a'))
    pdf.setFont('Helvetica-Bold', 28)
    pdf.drawRightString(width - margin, y + 7, 'INVOICE')
    pdf.setFont('Helvetica', 10)
    pdf.setFillColor(colors.HexColor('#475569'))
    pdf.drawRightString(width - margin, y - 9, data.get('invoiceNumber', 'INV-0001'))

    y -= 55
    draw_label(pdf, 'From', margin, y)
    draw_label(pdf, 'Bill to', width / 2, y)
    y -= 14
    draw_value(pdf, data.get('senderName', 'Your Business'), margin, y, 11)
    draw_value(pdf, data.get('clientName', 'Client Name'), width / 2, y, 11)
    y -= 14
    draw_value(pdf, data.get('senderEmail', ''), margin, y, 9)
    draw_value(pdf, data.get('clientEmail', ''), width / 2, y, 9)
    y -= 14
    draw_value(pdf, data.get('senderAddress', ''), margin, y, 9)
    draw_value(pdf, data.get('clientAddress', ''), width / 2, y, 9)

    y -= 36
    draw_label(pdf, 'Issue date', margin, y)
    draw_label(pdf, 'Due date', margin + 52 * mm, y)
    draw_label(pdf, 'Terms', margin + 104 * mm, y)
    y -= 14
    draw_value(pdf, data.get('issueDate', ''), margin, y, 10)
    draw_value(pdf, data.get('dueDate', ''), margin + 52 * mm, y, 10)
    draw_value(pdf, data.get('paymentTerms', 'Due on receipt'), margin + 104 * mm, y, 10)

    y -= 34
    table_x = margin
    table_w = width - 2 * margin
    pdf.setFillColor(colors.HexColor('#f8fafc'))
    pdf.roundRect(table_x, y - 10, table_w, 25, 4, stroke=0, fill=1)
    pdf.setFillColor(colors.HexColor('#334155'))
    pdf.setFont('Helvetica-Bold', 8)
    pdf.drawString(table_x + 10, y, 'DESCRIPTION')
    pdf.drawRightString(table_x + table_w - 112, y, 'QTY')
    pdf.drawRightString(table_x + table_w - 54, y, 'RATE')
    pdf.drawRightString(table_x + table_w - 10, y, 'AMOUNT')

    y -= 22
    pdf.setFont('Helvetica', 9)
    for item in data.get('items', [])[:12]:
        quantity = money(item.get('quantity', 1))
        rate = money(item.get('rate', 0))
        amount = quantity * rate
        pdf.setFillColor(colors.HexColor('#0f172a'))
        pdf.drawString(table_x + 10, y, str(item.get('description') or 'Service'))
        pdf.drawRightString(table_x + table_w - 112, y, f'{quantity:g}')
        pdf.drawRightString(table_x + table_w - 54, y, currency_amount(rate, currency))
        pdf.drawRightString(table_x + table_w - 10, y, currency_amount(amount, currency))
        pdf.setStrokeColor(colors.HexColor('#e2e8f0'))
        pdf.line(table_x + 10, y - 8, table_x + table_w - 10, y - 8)
        y -= 22

    y -= 8
    total_x = width - margin - 75 * mm
    label_x = width - margin - 35 * mm
    value_x = width - margin
    rows = [
        ('Subtotal', totals['subtotal']),
        ('Discount', -totals['discount']),
        (f"Tax ({money(data.get('taxRate', 0)):g}%)", totals['tax']),
    ]
    pdf.setFont('Helvetica', 10)
    for label, value in rows:
        pdf.setFillColor(colors.HexColor('#475569'))
        pdf.drawString(total_x, y, label)
        pdf.setFillColor(colors.HexColor('#0f172a'))
        pdf.drawRightString(value_x, y, currency_amount(value, currency))
        y -= 17

    pdf.setFillColor(accent)
    pdf.roundRect(label_x - 4, y - 10, 39 * mm, 24, 4, stroke=0, fill=1)
    pdf.setFillColor(colors.white)
    pdf.setFont('Helvetica-Bold', 11)
    pdf.drawString(label_x, y, 'Total')
    pdf.drawRightString(value_x - 4, y, currency_amount(totals['total'], currency))

    notes = data.get('notes')
    if notes:
        y -= 44
        draw_label(pdf, 'Notes', margin, y)
        y -= 14
        pdf.setFillColor(colors.HexColor('#334155'))
        pdf.setFont('Helvetica', 9)
        text = pdf.beginText(margin, y)
        for line in str(notes).splitlines()[:4]:
            text.textLine(line[:95])
        pdf.drawText(text)
        y -= 14 * min(len(str(notes).splitlines()), 4)

    payment_details = data.get('paymentDetails')
    if payment_details:
        y -= 24
        draw_label(pdf, 'Payment details', margin, y)
        y -= 14
        pdf.setFillColor(colors.HexColor('#475569'))
        pdf.setFont('Helvetica', 9)
        text = pdf.beginText(margin, y)
        for line in str(payment_details).splitlines()[:5]:
            text.textLine(line[:95])
        pdf.drawText(text)

    footer = data.get('footer') or 'Generated with ReadyInvoice'
    pdf.setFont('Helvetica', 8)
    pdf.setFillColor(colors.HexColor('#94a3b8'))
    pdf.drawCentredString(width / 2, 18 * mm, footer)
    pdf.showPage()
    pdf.save()
    buffer.seek(0)
    return buffer
