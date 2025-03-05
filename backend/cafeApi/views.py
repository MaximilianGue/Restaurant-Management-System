from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from .serializers import MenuItemSerializer, OrderSerializer, TableSerializer, CustomerSerializer, WaiterSerializer, UpdateStatusSerializer,KitchenStaffSerializer,ConfirmOrderSerializer, NotificationSerializer,UpdateAvailabilitySerializer, get_user_model, UserSerializer
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken  
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated 
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt  # Import csrf_exempt
from .models import Order, Table, MenuItem, Customer, Waiter,KitchenStaff, Notification,OrderItem
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

class MenuItemAvailabilityView(APIView):
    def get(self,pk):
        menu_item = get_object_or_404(MenuItem, pk=pk)
        serializer = MenuItemSerializer(menu_item)
        return Response({"id": menu_item.id, "availability": serializer.data["availability"]})

class AvailabilityUpdateView(generics.UpdateAPIView):
  
    queryset = MenuItem.objects.all()
    serializer_class = UpdateAvailabilitySerializer

    def perform_update(self, serializer):
        availability = self.request.data.get("availability", None)

        if availability is None:
            raise ValidationError({"availability": "This field is required."})

        serializer.save()

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
    def get(self, request):
        orders = Order.objects.all()

        orders_data = []
        for order in orders:
            order_data = {
                "id": order.id,
                "table_id": order.table.id,
                "order_date": order.order_date,
                "status": order.status,
                "total_price": order.total_price,
                "items": []
            }

            order_items = OrderItem.objects.filter(order=order).select_related('menu_item')

            for order_item in order_items:
                menu_item = order_item.menu_item
                order_data["items"].append({
                    "id": menu_item.id,
                    "name": menu_item.name,
                    "price": menu_item.price,
                    "image": request.build_absolute_uri(menu_item.image.url) if menu_item.image else None,
                    "allergies": menu_item.allergies,
                    "calories": menu_item.calories,
                    "category": menu_item.category,
                    "cooking_time": menu_item.cooking_time,
                    "availability": menu_item.availability,
                    "quantity": order_item.quantity  # <- Directly from the database, always correct
                })

            orders_data.append(order_data)

        return Response(orders_data, status=200)


    def post(self, request):
        try:
            data = json.loads(request.body)

            table_number = data.get("table_number")
            table = get_object_or_404(Table, number=table_number)

            items_data = data.get("items", [])
            if not items_data:
                return JsonResponse({"error": "No items provided"}, status=400)

            order = Order.objects.create(
                table=table,
                status=data.get("status", "pending"),
                total_price=data["total_price"]
            )

            # Loop over items and create OrderItem entries
            for item_data in items_data:
                item_id = item_data.get("item_id")
                quantity = item_data.get("quantity", 1)
                menu_item = get_object_or_404(MenuItem, id=item_id)

                OrderItem.objects.create(order=order, menu_item=menu_item, quantity=quantity)

            Notification.objects.create(
                notification_type='order_received',
                kitchen_staff=None,  # Or find a real kitchen staff
                order=order,
                message=f"New order received for Table {table.number}",
                table=table
            )


            return JsonResponse({
                "message": "Order created successfully",
                "order_id": order.id
            })

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

   
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
        


class NotificationViewSet(viewsets.ModelViewSet):
    """
    A viewset to manage notifications between waiters and kitchen staff.
    """
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['POST'])
    def notify_waiter(self, request):
        """
        Kitchen staff sends a notification to a specific waiter when an order is ready.
        """
        staff_id = request.data.get('Staff_id')
        order_id = request.data.get('order_id')
        message = request.data.get('message', '')

        if not staff_id or not order_id:
            return Response({"detail": "Staff_id and order_id are required."}, status=status.HTTP_400_BAD_REQUEST)

        kitchen_staff = KitchenStaff.objects.filter(Staff_id=staff_id).first()
        if not kitchen_staff:
            return Response({"detail": "Only kitchen staff can send order-ready notifications."}, status=status.HTTP_403_FORBIDDEN)

        order = get_object_or_404(Order, id=order_id)
        if not order.waiter:
            return Response({"detail": "No waiter assigned to this order."}, status=status.HTTP_400_BAD_REQUEST)

        notification = Notification.objects.create(
            notification_type='status_change',
            waiter=order.waiter,
            order=order,
            table=order.table,
            message=message or f"Order {order.id} is ready for pickup."
        )
        return Response(NotificationSerializer(notification).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['POST'])
    def notify_kitchen(self, request):
        """
        Waiter sends a notification to a specific kitchen staff member requesting assistance.
        """
        staff_id = request.data.get('Staff_id')
        target_staff_id = request.data.get('kitchen_staff_id')
        message = request.data.get('message', '')
        table_number = request.data.get('table_number')

        if not waiter and not kitchen_staff:
            return Response({"detail": "A notification must have either a waiter or kitchen staff recipient."}, status=status.HTTP_400_BAD_REQUEST)
        
        if not staff_id or not target_staff_id:
            return Response({"detail": "Staff_id and kitchen_staff_id are required."}, status=status.HTTP_400_BAD_REQUEST)

        waiter = Waiter.objects.filter(Staff_id=staff_id).first()
        if not waiter:
            return Response({"detail": "Only waiters can send assistance requests to kitchen staff."}, status=status.HTTP_403_FORBIDDEN)

        kitchen_staff = get_object_or_404(KitchenStaff, id=target_staff_id)

        note_message = message if message else f"Waiter {waiter.first_name} {waiter.last_name} needs assistance."
        if table_number:
            note_message += f" at Table {table_number}."

        table = Table.objects.filter(number=table_number).first() if table_number else None

        notification = Notification.objects.create(
            notification_type='waiter_call',
            kitchen_staff=kitchen_staff,
            table=table,
            message=note_message
        )
        return Response(NotificationSerializer(notification).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['GET'])
    def list_notifications(self, request):
        """
        List unread notifications for a specific recipient (waiter or kitchen staff).
        """
        waiter_id = request.query_params.get('waiter_id')
        kitchen_staff_id = request.query_params.get('kitchen_staff_id')

        if waiter_id:
            notifications = Notification.objects.filter(waiter__id=waiter_id, is_read=False)
        elif kitchen_staff_id:
            notifications = Notification.objects.filter(kitchen_staff__id=kitchen_staff_id, is_read=False)
        else:
            return Response({"detail": "Must provide either waiter_id or kitchen_staff_id."}, status=status.HTTP_400_BAD_REQUEST)

        return Response(NotificationSerializer(notifications, many=True).data)

    @action(detail=True, methods=['POST'])
    def mark_as_read(self, request, pk=None):
        """
        Marks a notification as read.
        """
        notification = get_object_or_404(Notification, pk=pk)
        notification.is_read = True
        notification.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    


class MarkNotificationRead(APIView):
    def post(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk)
        notification.is_read = True
        notification.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    


class RegisterView(generics.CreateAPIView):
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        serializer.save()

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'detail': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = get_user_model().objects.filter(username=username).first()

        if user and user.check_password(password):
            refresh = RefreshToken.for_user(user)
            return Response({
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh)
            })

        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
    

class UserListView(generics.ListAPIView):
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]