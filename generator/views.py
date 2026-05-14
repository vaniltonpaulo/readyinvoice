import json
from datetime import datetime

from django.http import FileResponse, JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .pdf import generate_invoice_pdf


FREE_MONTHLY_LIMIT = 3


def index(request):
    return render(request, 'generator/index.html')


def current_month_key():
    return datetime.utcnow().strftime('%Y-%m')


def get_usage(request):
    usage = request.session.get('invoice_usage', {})
    month = current_month_key()
    if usage.get('month') != month:
        usage = {'month': month, 'count': 0}
    return usage


@csrf_exempt
@require_POST
def invoice_pdf(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid invoice payload.'}, status=400)

    usage = get_usage(request)
    is_pro = bool(data.get('proMode'))
    if not is_pro and usage['count'] >= FREE_MONTHLY_LIMIT:
        return JsonResponse(
            {
                'error': 'Free invoice limit reached.',
                'limit': FREE_MONTHLY_LIMIT,
                'upgrade': 'Upgrade to Pro for unlimited invoices, branding, history, and client portals.',
            },
            status=402,
        )

    pdf = generate_invoice_pdf(data)
    usage['count'] += 1
    request.session['invoice_usage'] = usage
    request.session.modified = True

    filename = data.get('invoiceNumber') or 'readyinvoice'
    response = FileResponse(pdf, as_attachment=True, filename=f'{filename}.pdf')
    response['X-ReadyInvoice-Usage'] = str(usage['count'])
    response['X-ReadyInvoice-Limit'] = str(FREE_MONTHLY_LIMIT)
    return response
