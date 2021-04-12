from django.urls import path
from base.views import order_views as views

urlpatterns = [
    #pre-tekst je api/orders
   path('add/', views.addOrderItems, name='orders-add'),
   path('<str:pk>/', views.getOrderById, name='user-order'),
]