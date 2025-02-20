from django.urls import path
from .views import MenuItemView, OrderDetailView, OrderView, CustomerDetailView, CustomerView,TableView,TableDetailView,MenuItemDetailView, WaiterView, WaiterDetailView, StatusUpdateView,KitchenStaffView,KitchenStaffDetailView,ConfirmOrderUpdateView, call_waiter

urlpatterns = [
    path("menu-items/", MenuItemView.as_view(), name="menu-items"),
    path("menu-items/<int:pk>/", MenuItemDetailView.as_view(), name="menu-item-detail"),

    path("tables/", TableView.as_view(), name="tables"),
    path("tables/<int:pk>/", TableDetailView.as_view(), name="table-detail"),

    path("customers/", CustomerView.as_view(), name="customers"),
    path("customers/<int:pk>/", CustomerDetailView.as_view(), name="customer-detail"),
    
    path("waiters/", WaiterView.as_view(), name="waiters"),
    path("waiters/<int:pk>/", WaiterDetailView.as_view(), name="waiters-detail"),

    path("KitchenStaff/", KitchenStaffView.as_view(), name="KitchenStaff"),
    path("KitchenStaff/<int:pk>/", KitchenStaffDetailView.as_view(), name="Kitchen-detail"),
    
    path("orders/", OrderView.as_view(), name="orders"),
    path("orders/<int:pk>/", OrderDetailView.as_view(), name="order-detail"),
    path("orders/<int:pk>/update/", StatusUpdateView.as_view(), name="order-update"),
    path("orders/<int:pk>/confirmation/", ConfirmOrderUpdateView.as_view(), name="order-confirm-update"),
    
    path("call-waiter/", call_waiter, name="call-waiter"),

]
