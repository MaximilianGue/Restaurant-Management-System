# Create your views here for the models created for example  the Orders or Costumer models (which are going to be  called by the  urls.py file)
from django.shortcuts import render
from .serializers import MenuItemSerializer, CustomerSerializer
from .models import MenuItem, Customer
from rest_framework import generics

class MenuItemView(generics.ListCreateAPIView):
    serializer_class = MenuItemSerializer
    queryset = MenuItem.objects.all()  # it get all menu items created as json list object 

class CustomerView(generics.ListCreateAPIView):
    serializer_class = CustomerSerializer
    queryset = Customer.objects.all()  # It gets all customers as a JSON list object

class CustomerDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CustomerSerializer
    queryset = Customer.objects.all()  # It gets a single customer by ID, allowing update or delete

