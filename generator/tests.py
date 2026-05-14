import json

from django.test import TestCase
from django.urls import reverse


class InvoicePdfTests(TestCase):
    def payload(self):
        return {
            'senderName': 'Ana Studio',
            'clientName': 'Northstar GmbH',
            'invoiceNumber': 'INV-1001',
            'currency': 'EUR',
            'items': [{'description': 'Design sprint', 'quantity': 2, 'rate': 750}],
            'taxRate': 19,
        }

    def test_pdf_endpoint_returns_pdf(self):
        response = self.client.post(
            reverse('invoice_pdf'),
            data=json.dumps(self.payload()),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/pdf')

    def test_free_limit_blocks_fourth_invoice(self):
        for _ in range(3):
            self.client.post(
                reverse('invoice_pdf'),
                data=json.dumps(self.payload()),
                content_type='application/json',
            )

        response = self.client.post(
            reverse('invoice_pdf'),
            data=json.dumps(self.payload()),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 402)
