# Create your views here for the models created for example  the Orders or Costumer models (which are going to be  called by the  urls.py file)
from django.shortcuts import render
from .serializers import MenuItemSerializer, OrderSerializer, CustomerSerializer
from .models import MenuItem, Order, Customer
from rest_framework import generics

class MenuItemView(generics.ListCreateAPIView):
    serializer_class = MenuItemSerializer
    queryset = MenuItem.objects.all()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context
class CustomerView(generics.ListCreateAPIView):
    serializer_class = CustomerSerializer
    queryset = Customer.objects.all()  # It gets all customers as a JSON list object

class CustomerDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CustomerSerializer
    queryset = Customer.objects.all()  # It gets a single customer by ID, allowing update or delete

class OrderView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    queryset = Order.objects.all()  # It gets all orders as a JSON list object

class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OrderSerializer
    queryset = Order.objects.all()  # It gets a single order by ID, allowing update or delete
