from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/invoices/pdf/', views.invoice_pdf, name='invoice_pdf'),
]
