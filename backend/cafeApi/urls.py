from django.urls import path
from .views import MenuItemView, OrderDetailView, OrderView, CustomerDetailView, CustomerView

urlpatterns = [
    path("menu-items/", MenuItemView.as_view(), name="menu-items"),
    
    path("customers/", CustomerView.as_view(), name="customers"),
    path("customers/<int:pk>/", CustomerDetailView.as_view(), name="customer-detail"),
    
    path("orders/", OrderView.as_view(), name="orders"),
    path("orders/<int:pk>/", OrderDetailView.as_view(), name="order-detail"),
]
