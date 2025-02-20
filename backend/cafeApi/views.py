from rest_framework import generics
from rest_framework.exceptions import ValidationError
from .serializers import MenuItemSerializer, OrderSerializer, TableSerializer, CustomerSerializer, WaiterSerializer, UpdateStatusSerializer,KitchenStaffSerializer,ConfirmOrderSerializer
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken  
from django.contrib.auth import authenticate  
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt  # Import csrf_exempt
from .models import Order, Table, MenuItem, Customer, Waiter,KitchenStaff
import json

# Views for CRUD operations on MenuItems, Tables, and Customers
class MenuItemView(generics.ListCreateAPIView):
    serializer_class = MenuItemSerializer
    queryset = MenuItem.objects.all()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

class MenuItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MenuItemSerializer
    queryset = MenuItem.objects.all()

class TableView(generics.ListCreateAPIView):
    serializer_class = TableSerializer
    queryset = Table.objects.all()

class TableDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TableSerializer
    queryset = Table.objects.all()

class CustomerView(generics.ListCreateAPIView):
    serializer_class = CustomerSerializer
    queryset = Customer.objects.all()  # It gets all customers as a JSON list object

class CustomerDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CustomerSerializer
    queryset = Customer.objects.all()  # It gets a single customer by ID, allowing update or delete


# OrderView to create an order using a POST request
class OrderView(APIView):
    @csrf_exempt
    def get(self, request):
        orders = Order.objects.all()
        serializer = OrderSerializer(orders, many=True, context={"request": request})  
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        try:
            # Parse the JSON data from the request body
            data = json.loads(request.body)
            print("Received data:", data)  # Debugging: Print request data

            # Validate the table number
            table_number = data.get("table_number")
            if not table_number:
                return JsonResponse({"error": "Table number is required"}, status=400)

            table = get_object_or_404(Table, number=table_number)

            # Validate menu items (item_ids must be provided)
            item_ids = data.get("item_ids", [])
            if not item_ids:
                return JsonResponse({"error": "No items provided in the order"}, status=400)

            # Create the order
            order = Order.objects.create(
                table=table,
                status=data.get("status", "pending"),  # Default to "pending"
                total_price=data["total_price"]
            )

            # Add items to the order
            for item_id in item_ids:
                menu_item = get_object_or_404(MenuItem, id=item_id)
                order.items.add(menu_item)

            # Return a successful response with the created order ID
            return JsonResponse({"message": "Order created successfully", "order_id": order.id})

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except KeyError as e:
            return JsonResponse({"error": f"Missing field: {str(e)}"}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"An unexpected error occurred: {str(e)}"}, status=500)


# OrderDetailView for retrieving, updating, or deleting a specific order
class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OrderSerializer
    queryset = Order.objects.all()

class WaiterView(generics.ListCreateAPIView):
    serializer_class = WaiterSerializer
    queryset = Waiter.objects.all()  # It gets all waiters as a JSON list object

class WaiterDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WaiterSerializer
    queryset = Waiter.objects.all()  # It gets a single waiter by ID, allowing update or delete
    
class StatusUpdateView(generics.UpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = UpdateStatusSerializer

    def perform_update(self, serializer):
        Staff_id = self.request.data.get("Staff_id", None)

        if not Staff_id:
            raise ValidationError({"Staff_id": "This field is required."})

        waiter = get_object_or_404(Waiter, Staff_id=Staff_id)
        serializer.instance.waiter = waiter  
        serializer.save()
class KitchenStaffView(generics.ListCreateAPIView):
    serializer_class = KitchenStaffSerializer
    queryset = KitchenStaff.objects.all()  # It gets all kitchen staff as a JSON list object

class KitchenStaffDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = KitchenStaffSerializer
    queryset = KitchenStaff.objects.all()  # It gets a single kitchen staff by ID, allowing update or delete
    
class ConfirmOrderUpdateView(generics.UpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = ConfirmOrderSerializer

    def perform_update(self, serializer):
        Staff_id = self.request.data.get("Staff_id", None)

        if not Staff_id:
            raise ValidationError({"Staff_id": "This field is required."})

        kitchenStaff = get_object_or_404(KitchenStaff, Staff_id=Staff_id)
        serializer.instance.KitchenStaff = kitchenStaff  
        serializer.save()

@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(request, username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({"access_token": str(refresh.access_token)}, status=status.HTTP_200_OK)
    return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)