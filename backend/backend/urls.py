# this is were the general urls would be made for example for authication or registration of a user  for example  cafeApi/registration 
from django.contrib import admin
from django.urls import path,include
urlpatterns = [
    path('admin/', admin.site.urls),
    path('cafeApi/',include('cafeApi.urls')),
]
