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
from django.db.models import Q

# Views for CRUD operations on MenuItems, Tables, and Customers
class MenuItemView(generics.ListCreateAPIView):
    serializer_class = MenuItemSerializer
    queryset = MenuItem.objects.all()

    def post(self, request, *args, **kwargs):
        data = request.data
        image = request.FILES.get('image')  # New uploaded image
        existing_image = data.get("existing_image")  # Old image URL if no new image

        # Convert category back into a string for storage
        category = json.loads(data.get("category", "[]"))
        category_str = ",".join(category)  

        menu_item = MenuItem.objects.create(
            name=data.get('name'),
            calories=data.get('calories'),
            allergies=data.get('allergies'),
            category=category_str,
            cooking_time=data.get('cooking_time'),
            availability=data.get('availability'),
            price=data.get('price'),
            image=image if image else existing_image  # Use old image if no new one
        )
        serializer = MenuItemSerializer(menu_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)



    serializer_class = MenuItemSerializer
    queryset = MenuItem.objects.all()

    def update(self, request, *args, **kwargs):
        print("🔍 Incoming PATCH Request Data:", request.data)  # Debugging
        print("📂 Incoming PATCH Request Files:", request.FILES)  # Debugging file uploads

        instance = self.get_object()
        
        # Convert QueryDict to mutable dictionary
        mutable_data = request.data.copy()

        # Ensure category is a list, not a string
        if 'category_input' in mutable_data:
            try:
                mutable_data['category'] = json.loads(mutable_data.pop('category_input'))
            except json.JSONDecodeError:
                return Response({"error": "Invalid category format"}, status=status.HTTP_400_BAD_REQUEST)

        # Only update the image if a new one is provided
        if 'image' in request.FILES:
            mutable_data['image'] = request.FILES['image']
        else:
            mutable_data.pop('image', None)

        serializer = self.get_serializer(instance, data=mutable_data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class MenuItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MenuItemSerializer
    queryset = MenuItem.objects.all()

    def patch(self, request, *args, **kwargs):
        print("🔍 Incoming PATCH Request Data:", request.data)  # Debugging
        print("📂 Incoming PATCH Request Files:", request.FILES)  # Debugging file uploads

        mutable_data = request.data.copy()  # Ensure it's mutable

        # ✅ Fix `category_input` Handling (Ensure it's a string before JSON parsing)
        if "category_input" in mutable_data:
            try:
                category_raw = mutable_data.pop("category_input")

                if isinstance(category_raw, list):  # Handle list case
                    category_raw = category_raw[0]  # Extract first value if it's a list

                if isinstance(category_raw, str):  # Ensure it's a string before JSON parsing
                    mutable_data["category"] = json.loads(category_raw)
                else:
                    return Response({"error": "Invalid category format"}, status=status.HTTP_400_BAD_REQUEST)

            except json.JSONDecodeError:
                return Response({"error": "Invalid JSON format in category_input"}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Fix `allergies` Field Handling (Ensure list format)
        if "allergies" in mutable_data:
            allergies_raw = mutable_data["allergies"]

            if isinstance(allergies_raw, str):  # Convert string to list
                mutable_data["allergies"] = [allergies_raw] if allergies_raw.lower() != "none" else []
            elif isinstance(allergies_raw, list):
                mutable_data["allergies"] = allergies_raw
            else:
                return Response({"error": "Invalid format for allergies"}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Fix Image Handling (Preserve Old Image if Not Updated)
        if "image" in request.FILES:
            mutable_data["image"] = request.FILES["image"]
        else:
            mutable_data.pop("image", None)  # 🔥 Remove from update if no new image is provided

        # ✅ Apply Update
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=mutable_data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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

class TableStaffIDView(APIView):
    """
    Fetches the staff_id for a given table number.
    """
    def get(self, request, table_number):
        try:
            table = Table.objects.get(number=table_number)
            waiter_name = table.waiter_name

            if not waiter_name:
                return Response({"detail": "No waiter assigned to this table."}, status=status.HTTP_404_NOT_FOUND)

            # Split "John Doe" into first and last name
            try:
                first_name, last_name = waiter_name.split(" ", 1)
            except ValueError:
                return Response({"detail": "Invalid waiter name format in table data."}, status=status.HTTP_400_BAD_REQUEST)

            # Find the waiter in the system
            waiter = Waiter.objects.filter(first_name=first_name, last_name=last_name).first()

            if not waiter:
                return Response({"detail": "No matching waiter found for this table."}, status=status.HTTP_404_NOT_FOUND)

            # Return the staff_id
            return Response({"staff_id": waiter.Staff_id}, status=status.HTTP_200_OK)

        except Table.DoesNotExist:
            return Response({"detail": "Table not found."}, status=status.HTTP_404_NOT_FOUND)

class CustomerView(generics.ListCreateAPIView):
    serializer_class = CustomerSerializer
    queryset = Customer.objects.all()  # It gets all customers as a JSON list object

class CustomerDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CustomerSerializer
    queryset = Customer.objects.all()  # It gets a single customer by ID, allowing update or delete

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
                "items": [],
                # Include waiter details if available
                "waiter": {
                    "Staff_id": order.waiter.Staff_id,
                    "first_name": order.waiter.first_name,
                    "last_name": order.waiter.last_name,
                } if order.waiter else None,
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
            staff_id = data.get("Staff_id")
            waiter = get_object_or_404(Waiter, Staff_id=staff_id)
            items_data = data.get("items", [])
            if not items_data:
                return JsonResponse({"error": "No items provided"}, status=400)
            order = Order.objects.create(
                table=table,
                status=data.get("status", "pending"),
                total_price=data["total_price"],
                waiter=waiter
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


class WaiterDetailView(generics.RetrieveAPIView):
    queryset = Waiter.objects.all()
    serializer_class = WaiterSerializer
    lookup_field = 'Staff_id'

    
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

    def get_queryset(self):
            staff_id = self.request.query_params.get('staff_id')
            if staff_id:
                return Notification.objects.filter(
                    Q(waiter__Staff_id=staff_id) |
                    Q(kitchen_staff__Staff_id=staff_id) |
                    (Q(notification_type="order_received") & Q(kitchen_staff__isnull=True)),
                    is_read=False
                )
            return Notification.objects.none()

    @action(detail=False, methods=['POST'])
    def notify_waiter(self, request):
        """
        Kitchen staff sends a notification to a specific waiter when an order is ready.
        """
        staff_id = request.data.get('Staff_id')
        order_id = request.data.get('order_id')
        message = request.data.get('message', '')
        notification_type=request.data.get('notification_type')

        if not staff_id or not order_id:
            return Response({"detail": "Staff_id and order_id are required."}, status=status.HTTP_400_BAD_REQUEST)

        waiter = Waiter.objects.filter(Staff_id=staff_id).first()
        if not waiter:
            return Response({"detail": "Only waiters can send assistance requests."}, status=status.HTTP_403_FORBIDDEN)


        order = get_object_or_404(Order, id=order_id)
        if not order.waiter:
            return Response({"detail": "No waiter assigned to this order."}, status=status.HTTP_400_BAD_REQUEST)

        notification = Notification.objects.create(
             notification_type=notification_type,
             waiter=order.waiter,
             order=order,
             table=order.table,
             message= message if message else (
                f"Order {order.id} is ready for pickup." if notification_type == "order_ready"
                else "Waiter needed for assistance/service."
    )
        )
        return Response(NotificationSerializer(notification).data, status=status.HTTP_201_CREATED)
  
    @action(detail=False, methods=['POST'])
    def notify_staff(self, request):
        """
        Waiter sends a notification to any other staff member (kitchen staff or waiter) requesting assistance.
        """
        staff_id = request.data.get('Staff_id')
        target_staff_id = request.data.get('target_staff_id')  # generalized from kitchen_staff_id
        message = request.data.get('message', '')
        table_number = request.data.get('table_number')

        if not staff_id or not target_staff_id:
            return Response({"detail": "Staff_id and target_staff_id are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Confirm sender is a waiter
        waiter = Waiter.objects.filter(Staff_id=staff_id).first()
        if not waiter:
            return Response({"detail": "Only waiters can send assistance requests."}, status=status.HTTP_403_FORBIDDEN)

        # Try to find target staff — it could be either a waiter or kitchen staff
        target_staff = None
        is_kitchen_staff = False

        kitchen_staff = KitchenStaff.objects.filter(Staff_id=target_staff_id).first()

        if kitchen_staff:
            target_staff = kitchen_staff
            is_kitchen_staff = True
        else:
            target_waiter = Waiter.objects.filter(Staff_id=target_staff_id).first()
            if target_waiter:
                target_staff = target_waiter

        if not target_staff:
            return Response({"detail": "Target staff member not found."}, status=status.HTTP_404_NOT_FOUND)

        # Build message
        note_message = message if message else f"Waiter {waiter.first_name} {waiter.last_name} needs assistance."
        if table_number:
            note_message += f" at Table {table_number}."

        # Look up table if provided
        table = Table.objects.filter(number=table_number).first() if table_number else None

        # Create notification (with flexible target)
        notification = Notification.objects.create(
            notification_type='alert',
            kitchen_staff=kitchen_staff if is_kitchen_staff else None,
            waiter=target_waiter if not is_kitchen_staff else None,
            table=table,
            message=note_message
        )

        return Response(NotificationSerializer(notification).data, status=status.HTTP_201_CREATED)

 
    @action(detail=False, methods=['GET'])
    def list_notifications(self, request):
        """
        List unread notifications for a specific recipient (waiter or kitchen staff)
        using the staff_id query parameter.
        """
        staff_id = request.query_params.get('staff_id')
        if not staff_id:
            return Response({"detail": "Must provide staff_id."}, status=status.HTTP_400_BAD_REQUEST)
        
        notifications = Notification.objects.filter(
            Q(waiter__Staff_id=staff_id) | Q(kitchen_staff__Staff_id=staff_id),
            is_read=False
        )
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
                'refresh_token': str(refresh),
                'staff_id': user.staff_id,
            })
        
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
    

class UserListView(generics.ListAPIView):
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

@api_view(['GET'])
def get_employees(request):
    waiters = Waiter.objects.all()
    kitchen_staff = KitchenStaff.objects.all()

    waiters_serialized = WaiterSerializer(waiters, many=True).data
    kitchen_staff_serialized = KitchenStaffSerializer(kitchen_staff, many=True).data

    print("📢 Waiters:", waiters_serialized)  
    print("📢 Kitchen Staff:", kitchen_staff_serialized) 

    employees = waiters_serialized + kitchen_staff_serialized 
    return Response(employees)
