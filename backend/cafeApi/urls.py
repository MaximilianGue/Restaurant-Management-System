from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from .views import get_employees
from . import views
from .views import MenuItemView, OrderDetailView, OrderView, CustomerDetailView, CustomerView,TableView,TableDetailView,MenuItemDetailView, WaiterView, WaiterDetailView, StatusUpdateView,KitchenStaffView,KitchenStaffDetailView,ConfirmOrderUpdateView, NotificationViewSet, MarkNotificationRead, MenuItemAvailabilityView, AvailabilityUpdateView, RegisterView, LoginView, UserListView,WaiterDetailView,TableStaffIDView
notification_list = NotificationViewSet.as_view({'get': 'list', 'post': 'create'})
notify_staff = NotificationViewSet.as_view({'post': 'notify_staff'})
notify_waiter = NotificationViewSet.as_view({'post': 'notify_waiter'})
# Define actions for TableView
table_list = TableView.as_view({'get': 'list'})  # 'get' -> 'list' action for tables

urlpatterns = [
    
    path("menu-items/", MenuItemView.as_view(), name="menu-items"),
    path("menu-items/<int:pk>/", MenuItemDetailView.as_view(), name="menu-item-detail"),
    path('menu-item/<int:pk>/availability/', MenuItemAvailabilityView.as_view(), name='menu-item-availability'),
    path('menu-item/<int:pk>/update-availability/', AvailabilityUpdateView.as_view(), name='update-menu-item-availability'),

    # Tables endpoint
    path('tables/', table_list, name="tables"),
    path("tables/<int:pk>/", TableDetailView.as_view(), name="table-detail"),
    path('tables/<int:table_number>/staff_id/', TableStaffIDView.as_view(), name='table-staff-id'),

    # Other endpoints...
    path("customers/", CustomerView.as_view(), name="customers"),
    path("customers/<int:pk>/", CustomerDetailView.as_view(), name="customer-detail"),

    path("waiters/", WaiterView.as_view(), name="waiters"),
    path("waiters/<int:pk>/", WaiterDetailView.as_view(), name="waiters-detail"),
    path('waiters/<str:Staff_id>/', WaiterDetailView.as_view(), name='waiter-detail'),

    path("kitchen_staff/", KitchenStaffView.as_view(), name="kitchen_staff"),
    path("kitchen_staff/<int:pk>/", KitchenStaffDetailView.as_view(), name="kitchen-detail"),
    path('kitchen_staff/<str:Staff_id>/', KitchenStaffDetailView.as_view(), name='kitchen-detail'),

    path("orders/", OrderView.as_view(), name="orders"),
    path("orders/<int:pk>/", OrderDetailView.as_view(), name="order-detail"),
    path("orders/<int:pk>/update/", StatusUpdateView.as_view(), name="order-update"),
    path("orders/<int:pk>/confirmation/", ConfirmOrderUpdateView.as_view(), name="order-confirm-update"),

    path("notifications/", NotificationViewSet.as_view({'get': 'list', 'post': 'create'}), name="notifications"),
    path("notifications/notify_staff/", notify_staff, name="notify-staff"),
    path("notifications/notify_waiter/", notify_waiter, name="notify-waiter"),
    path("notifications/<int:pk>/mark_as_read/", MarkNotificationRead.as_view(), name="mark-read"),

    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),


    path('employees/', get_employees, name='get-employees'),
    path('employee/<int:employee_id>/update/', views.update_employee, name='update_employee'),
    path('employee/<int:employee_id>/fire/', views.fire_employee, name='fire_employee')

]
