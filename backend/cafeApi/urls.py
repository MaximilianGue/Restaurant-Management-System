from django.urls import path
from .views import MenuItemView

urlpatterns = [
    path("menu-items/", MenuItemView.as_view(), name="menu-items"),
]
