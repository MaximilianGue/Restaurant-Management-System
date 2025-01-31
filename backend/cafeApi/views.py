# Create your views here for the models created for example  the Orders or Costumer models (which are going to be  called by the  urls.py file)
from django.shortcuts import render
from .serializers import MenuItemSerializer
from .models import MenuItem
from rest_framework import generics
class MenuItemView(generics.ListCreateAPIView):
    serializer_class = MenuItemSerializer
    queryset = MenuItem.objects.all()  # it get all menu items created as json list object 
