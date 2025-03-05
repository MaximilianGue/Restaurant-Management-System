from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import MenuItemView, OrderDetailView, OrderView, CustomerDetailView, CustomerView,TableView,TableDetailView,MenuItemDetailView, WaiterView, WaiterDetailView, StatusUpdateView,KitchenStaffView,KitchenStaffDetailView,ConfirmOrderUpdateView, NotificationViewSet, MarkNotificationRead, MenuItemAvailabilityView, AvailabilityUpdateView, RegisterView, LoginView, UserListView

urlpatterns = [
    path("menu-items/", MenuItemView.as_view(), name="menu-items"),
    path("menu-items/<int:pk>/", MenuItemDetailView.as_view(), name="menu-item-detail"),
    path('menu-item/<int:pk>/availability/', MenuItemAvailabilityView.as_view(), name='menu-item-availability'),
    path('menu-item/<int:pk>/update-availability/', AvailabilityUpdateView.as_view(), name='update-menu-item-availability'),


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
    
    path("notifications/", NotificationViewSet.as_view({'get': 'list', 'post': 'create'}), name="notifications"),
    path("notifications/<int:pk>/read/", MarkNotificationRead.as_view(), name="mark-read"),

    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
