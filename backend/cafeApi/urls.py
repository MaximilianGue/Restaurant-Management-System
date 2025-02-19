from django.urls import path
from .views import MenuItemView, OrderDetailView, OrderView, CustomerDetailView, CustomerView,TableView,TableDetailView,MenuItemDetailView, WaiterView, WaiterDetailView, StatusUpdateView

urlpatterns = [
    path("menu-items/", MenuItemView.as_view(), name="menu-items"),
    path("menu-items/<int:pk>/", MenuItemDetailView.as_view(), name="menu-item-detail"),

    path("tables/", TableView.as_view(), name="tables"),
    path("tables/<int:pk>/", TableDetailView.as_view(), name="table-detail"),

    path("customers/", CustomerView.as_view(), name="customers"),
    path("customers/<int:pk>/", CustomerDetailView.as_view(), name="customer-detail"),
    
    path("Waiters/", WaiterView.as_view(), name="Waiters"),
    path("waiters/<int:pk>/", WaiterDetailView.as_view(), name="waiters-detail"),
    
    path("orders/", OrderView.as_view(), name="orders"),
    path("orders/<int:pk>/", OrderDetailView.as_view(), name="order-detail"),
    path("order/<int:pk>/update/", StatusUpdateView.as_view(), name="order-update"),
]
