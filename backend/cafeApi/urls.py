from django.urls import path
from .views import MenuItemView, CustomerView, CustomerDetailView

urlpatterns = [
    path("menu-items/", MenuItemView.as_view(), name="menu-items"),
    
    path("customers/", CustomerView.as_view(), name="customers"),
    path("customers/<int:pk>/", CustomerDetailView.as_view(), name="customer-detail"),
    
    
]
