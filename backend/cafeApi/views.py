from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from .serializers import MenuItemSerializer, OrderSerializer, TableSerializer, CustomerSerializer, WaiterSerializer, UpdateStatusSerializer,KitchenStaffSerializer,ConfirmOrderSerializer, NotificationSerializer,UpdateAvailabilitySerializer, get_user_model, UserSerializer,PaymentSerializer,ManagerSerializer
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken  
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated 
from django.shortcuts import get_object_or_404,redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt  # Import csrf_exempt
from .models import Order, Table, MenuItem, Customer, Waiter,KitchenStaff, Notification,OrderItem,Payment,Manager
import json
from django.db.models import Q
import stripe
from django.conf import settings
from .models import Table

stripe.api_key = settings.STRIPE_SECRET_KEY

# Views for CRUD operations on MenuItems, Tables, and Customers
class MenuItemView(generics.ListCreateAPIView):
    """
    MenuItemView class.

    Handles operations related to menu items such as creation and updates.

    Attributes:
        serializer_class (Serializer): The serializer used for menu items.
        permission_classes (list): List of permission classes applied to the view.
    """
    
    serializer_class = MenuItemSerializer
    queryset = MenuItem.objects.all()

    def post(self, request, *args, **kwargs):
        """
        Handles POST request to create a new menu item.

        Args:
            request (Request): The HTTP request containing menu item data.

        Returns:
            Response: A Response object containing the serialized menu item data or errors.
        """
        data = request.data
        image = request.FILES.get('image')  # New uploaded image
        existing_image = data.get("existing_image")  # Old image URL if no new image

        try:
            category = json.loads(data.get("category", "[]"))  # 
        except json.JSONDecodeError:
            return Response({"error": "Invalid category format"}, status=400)

        try:
            allergies_raw = data.get("allergies", "")
            if allergies_raw.strip().lower() == "none":
                allergies = []
            else:
                allergies = [a.strip() for a in allergies_raw.split(",") if a.strip()]
        except Exception as e:
            allergies = []

        menu_item = MenuItem.objects.create(
            name=data.get('name'),
            calories=data.get('calories'),
            allergies=allergies,
            category=category,
            cooking_time=data.get('cooking_time'),
            availability=data.get('availability'),
            price=data.get('price'),
            production_cost=data.get('production_cost', 0.00),
            image=image if image else existing_image
        )

        serializer = MenuItemSerializer(menu_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    serializer_class = MenuItemSerializer
    queryset = MenuItem.objects.all()

    def update(self, request, *args, **kwargs):
        """
        Handles PUT request to update a menu item.

        Args:
            request (Request): The HTTP request containing updated data.
            pk (int or str): The primary key of the menu item to update.

        Returns:
            Response: A Response object containing updated data or errors.
        """
        print("Incoming PATCH Request Data:", request.data)  # Debugging
        print(" Incoming PATCH Request Files:", request.FILES)  # Debugging file uploads

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
    """
    MenuItemDetailView class.

    Provides detailed information about a specific menu item.

    Attributes:
        queryset (QuerySet): QuerySet containing all menu items.
        serializer_class (Serializer): Serializer used for displaying item details.
    """
    serializer_class = MenuItemSerializer
    queryset = MenuItem.objects.all()

    def patch(self, request, *args, **kwargs):
        """
        Handles PATCH request to partially update a menu item.

        Args:
            request (Request): The HTTP request with partial update data.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments (includes `pk` of the item).

        Returns:
            Response: A Response object with updated data or errors.
        """
        print("Incoming PATCH Request Data:", request.data)
        print("Incoming PATCH Request Files:", request.FILES)

        instance = self.get_object()
        mutable_data = request.data.copy()

        # --- Fix category_input (stringified list to real list) ---
        if "category_input" in mutable_data:
            raw = mutable_data.get("category_input")
            try:
                # If raw is a list (from QueryDict), get the first string
                if isinstance(raw, list):
                    raw = raw[0]
                parsed_category = json.loads(raw)
                if isinstance(parsed_category, list):
                    mutable_data.setlist("category_input", parsed_category)
                else:
                    return Response({"error": "category_input must be a list"}, status=400)
            except Exception as e:
                return Response({"error": f"Invalid category_input format: {str(e)}"}, status=400)

        # --- Fix allergies (no json.loads, just pass list) ---
        allergies = request.data.getlist("allergies")
        if allergies:
            mutable_data.setlist("allergies", allergies)

        # --- Handle image ---
        if "image" in request.FILES:
            mutable_data["image"] = request.FILES["image"]
        else:
            mutable_data.pop("image", None)

        # --- Perform update ---
        serializer = self.get_serializer(instance, data=mutable_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)

        print("Serializer Errors:", serializer.errors)
        return Response(serializer.errors, status=400)


class MenuItemAvailabilityView(APIView):
    """
    MenuItemAvailabilityView class.

    Provides availability information for a specific menu item.

    Attributes:
        permission_classes (list): List of permission classes required to access the view.
    """
    def get(self,pk):
        menu_item = get_object_or_404(MenuItem, pk=pk)
        serializer = MenuItemSerializer(menu_item)
        return Response({"id": menu_item.id, "availability": serializer.data["availability"]})

class AvailabilityUpdateView(generics.UpdateAPIView):
    """
    AvailabilityUpdateView class.

    Updates the availability status of a menu item.

    Attributes:
        queryset (QuerySet): QuerySet of all menu items.
        serializer_class (Serializer): Serializer to update availability.
    """
    queryset = MenuItem.objects.all()
    serializer_class = UpdateAvailabilitySerializer

    def perform_update(self, serializer):
        """
        Custom update logic during PATCH or PUT request.

        Args:
            serializer (Serializer): The serializer instance to save.

        Returns:
            None
        """
        availability = self.request.data.get("availability", None)

        if availability is None:
            raise ValidationError({"availability": "This field is required."})

        serializer.save()

class TableView(viewsets.ModelViewSet):
    queryset = Table.objects.all()
    serializer_class = TableSerializer

class TableViewSet(viewsets.ViewSet):
    """
    TableView class.

    Manages CRUD operations for tables in the restaurant.

    Attributes:
        queryset (QuerySet): QuerySet of all tables.
        serializer_class (Serializer): Serializer used for table operations.
    """
    def list(self, request):
        # Query all tables and for each table calculate the revenue
        tables = Table.objects.all()
        
        table_revenue = []
        for table in tables:
            # Query all orders for this table and filter by "paid for" status
            orders = Order.objects.filter(table=table, status='paid for')
            
            # Calculate the total revenue for this table
            total_revenue = sum(order.total_price for order in orders)
            
            # Add the table revenue data
            table_revenue.append({
                'table_number': table.number,
                'status': table.status,
                'revenue': total_revenue,
            })

        return Response(table_revenue)

    def create(self, request):
        number = request.data.get("number")
        waiter_id = request.data.get("waiter")

        if not number or not waiter_id:
            return Response({"error": "Table number and waiter ID are required."}, status=400)

        waiter = Waiter.objects.filter(id=waiter_id).first()
        if not waiter:
            return Response({"error": "Waiter not found."}, status=404)

        #  Save waiter as FK
        table = Table.objects.create(
            number=number,
            waiter=waiter,
        )

        serializer = TableSerializer(table)
        return Response(serializer.data, status=201)


class TableDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    TableDetailView class.

    Retrieves details of a specific table.

    Attributes:
        queryset (QuerySet): QuerySet of all tables.
        serializer_class (Serializer): Serializer for displaying table details.
    """

    serializer_class = TableSerializer
    queryset = Table.objects.all()

class TableStaffIDView(APIView):
    """
    TableStaffIDView class.

    Handles fetching the waiter assigned to a particular table.
    """
    def get(self, request, table_number):
        """
        Handles GET request to retrieve waiter assigned to a specific table.

        Args:
            request (Request): The HTTP request object.
            table_id (int): ID of the table.

        Returns:
            Response: Waiter details or error if not found.
        """
        try:
            table = Table.objects.get(number=table_number)
            if table.waiter:
                return Response({"staff_id": table.waiter.Staff_id})
            else:
                return Response({"error": "No waiter is assigned to your table."}, status=status.HTTP_404_NOT_FOUND)
        except Table.DoesNotExist:
            return Response({"error": "Table does not exist."}, status=status.HTTP_404_NOT_FOUND)
            
class CustomerView(generics.ListCreateAPIView):
    """
    CustomerView class.

    Allows listing all customers and adding a new customer.

    Attributes:
        queryset (QuerySet): QuerySet of all customers.
        serializer_class (Serializer): Serializer used for customer data.
    """
    serializer_class = CustomerSerializer
    queryset = Customer.objects.all()  # It gets all customers as a JSON list object

class CustomerDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    CustomerDetailView class.

    Provides retrieval, update, and delete functionality for a single customer.

    Attributes:
        queryset (QuerySet): QuerySet of all customers.
        serializer_class (Serializer): Serializer for customer operations.
    """
    serializer_class = CustomerSerializer
    queryset = Customer.objects.all()  # It gets a single customer by ID, allowing update or delete

class OrderView(APIView):
    """
    OrderView class.

    Handles listing all orders and creating new ones.

    Attributes:
        queryset (QuerySet): QuerySet of all orders.
        serializer_class (Serializer): Serializer used for order creation and display.
    """
    def get(self, request):
        table_id = request.query_params.get("table")
        if table_id:
            orders = Order.objects.filter(table__id=table_id)
        else:
            orders = Order.objects.all()

        orders_data = []
        for order in orders:
            order_data = {
                "id": order.id,
                "table_id": order.table.id,
                "table_number":order.table.number,
                "order_date": order.order_date,
                "status": order.status,
                "total_price": order.total_price,
                "items": [],
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
                    "quantity": order_item.quantity
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
            Payment.objects.create(
                    order=order,
                    table=table,
                    amount=data["total_price"],
                    waiter=waiter,
                    status="unpaid"
                )

            return JsonResponse({
                "message": "Order created successfully",
                "order_id": order.id,
            })
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    OrderDetailView class.

    Enables retrieval, update, and deletion of a specific order.

    Attributes:
        queryset (QuerySet): QuerySet of all orders.
        serializer_class (Serializer): Serializer used for order operations.
    """
    serializer_class = OrderSerializer
    queryset = Order.objects.all()

class WaiterView(generics.ListCreateAPIView):
    """
    WaiterView class.

    Handles creation and listing of waiter profiles.

    Attributes:
        queryset (QuerySet): QuerySet of all waiters.
        serializer_class (Serializer): Serializer used for waiter data.
    """
    serializer_class = WaiterSerializer
    queryset = Waiter.objects.all()  

class WaiterDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    WaiterDetailView class.

    Retrieves, updates, or deletes a specific waiter.

    Attributes:
        queryset (QuerySet): QuerySet of all waiters.
        serializer_class (Serializer): Serializer used for waiter operations.
    """
    serializer_class = WaiterSerializer
    queryset = Waiter.objects.all()  


class WaiterDetailView(generics.RetrieveAPIView):
    queryset = Waiter.objects.all()
    serializer_class = WaiterSerializer
    lookup_field = 'Staff_id'

    
class StatusUpdateView(generics.UpdateAPIView):
    """
    StatusUpdateView class.

    Allows kitchen staff or waiters to update the status of orders.

    Attributes:
        queryset (QuerySet): QuerySet of all orders.
        serializer_class (Serializer): Serializer used for status updates.
    """
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
    """
    KitchenStaffView class.

    Lists all kitchen staff members and allows creation of new ones.

    Attributes:
        queryset (QuerySet): QuerySet of all kitchen staff.
        serializer_class (Serializer): Serializer used for kitchen staff data.
    """
    serializer_class = KitchenStaffSerializer
    queryset = KitchenStaff.objects.all()  # It gets all kitchen staff as a JSON list object

class KitchenStaffDetailView(generics.RetrieveAPIView):
    """
    KitchenStaffDetailView class.

    Retrieves, updates, or deletes a specific kitchen staff member.

    Attributes:
        queryset (QuerySet): QuerySet of all kitchen staff.
        serializer_class (Serializer): Serializer used for kitchen staff operations.
    """
    queryset = KitchenStaff.objects.all()
    serializer_class = KitchenStaffSerializer



class ConfirmOrderUpdateView(generics.UpdateAPIView):
    """
    ConfirmOrderUpdateView class.

    Allows confirmation of customer orders.

    Attributes:
        queryset (QuerySet): QuerySet of all orders.
        serializer_class (Serializer): Serializer used for confirming orders.
    """
    queryset = Order.objects.all()
    serializer_class = ConfirmOrderSerializer

    def perform_update(self, serializer):
        Staff_id = self.request.data.get("Staff_id", None)

        if not Staff_id:
            raise ValidationError({"Staff_id": "This field is required."})

        kitchenStaff = get_object_or_404(KitchenStaff, Staff_id=Staff_id)
        serializer.instance.KitchenStaff = kitchenStaff  
        serializer.save()
        
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


class NotificationViewSet(viewsets.ModelViewSet):
    """
    NotificationViewSet class.

    Handles operations related to customer/waiter/kitchen staff notifications.

    Attributes:
        queryset (QuerySet): QuerySet of all notifications.
        serializer_class (Serializer): Serializer used for notification data.
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

        waiter = Waiter.objects.filter(Staff_id=staff_id).first()
        if not waiter:
            return Response({"detail": "Only waiters can send assistance requests."}, status=status.HTTP_403_FORBIDDEN)

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

        note_message = message if message else f"Waiter {waiter.first_name} {waiter.last_name} needs assistance."
        if table_number:
            note_message += f" at Table {table_number}."

        table = Table.objects.filter(number=table_number).first() if table_number else None

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
    """
    MarkNotificationRead class.

    Marks a specific notification as read.
    """
    def post(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk)
        notification.is_read = True
        notification.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    


class RegisterView(generics.CreateAPIView):
    """
    RegisterView class.

    Handles user registration and account creation.

    Attributes:
        permission_classes (list): Permissions for open access to registration.
    """
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        serializer.save()

class LoginView(APIView):
    """
    LoginView class.

    Handles user login and JWT token generation.
    """
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
    """
    UserListView class.

    Lists all registered users.

    Attributes:
        queryset (QuerySet): QuerySet of all users.
        serializer_class (Serializer): Serializer used for user data.
    """
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class CreateStripeCheckoutSessionView(APIView):
    """
    API to create a Stripe Checkout session and store session ID.
    """
    permission_classes = [AllowAny]

    def post(self, request, pk, **kwargs):
        payment = get_object_or_404(Payment, pk=pk)

        if payment.status == "paid":
            return Response({"message": "Payment already completed."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'gbp',
                        'unit_amount': int(payment.amount*100),  
                        'product_data': {'name': f"Payment for Order {payment.order.id}"},
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=f"http://127.0.0.1:8000/cafeApi/payments/{payment.pk}/verify/",
                cancel_url=f"http://127.0.0.1:8000/cafeApi/payments/{payment.pk}/cancel/",
            )

            payment.stripe_session_id = checkout_session.id
            
            payment.save()
            
            return Response({"checkout_url": checkout_session.url}, status=status.HTTP_200_OK)

        except Exception as e:
            print("Stripe Error:", str(e))
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class StripePaymentSuccessView(APIView):
    """
    API to verify payment status using Stripe Checkout Session ID.
    After a successful payment, redirect the user to http://localhost:3000/home.
    """
    permission_classes = [AllowAny]

    def get(self, request, pk, **kwargs):
        payment = get_object_or_404(Payment, pk=pk)
        order = payment.order

        # Check if stripe_session_id exists before retrieving the session
        if not payment.stripe_session_id:
            return Response(
                {"error": "No Stripe session ID found for this payment."},
                status=400
            )

        # Optionally, check if order is already marked as paid
        if order.status == "paid for":
            return Response(
                {"message": "Order is already paid for."},
                status=200
            )

        try:
            stripe_session = stripe.checkout.Session.retrieve(payment.stripe_session_id)
            if stripe_session.payment_status == "paid":
                payment.status = "paid"
                payment.save()
                order.status = "paid for"
                order.save()
                # Redirect after successful payment processing
                return redirect("http://localhost:3000/home")
        except stripe.error.StripeError as e:
            return Response(
                {"error": str(e)},
                status=400
            )

        return Response(
            {"message": "Payment not completed yet."},
            status=400
        )


class StripePaymentCancelView(APIView):
    """
    StripePaymentCancelView class.

    Handles actions when a Stripe payment is canceled.
    """
    permission_classes = [AllowAny]

    def get(self, request, pk, **kwargs):
        payment = get_object_or_404(Payment, pk=pk)
        order = payment.order  # Directly reference the related Order

        if payment.status == "paid":
            return Response({"message": "Cannot cancel a paid payment."}, status=400)

        payment.status = "canceled"
        payment.save()
        order.status = "canceled"
        order.save()
        return Response({"message": "Payment canceled!"},status=200)

class SalesPerWaiterView(APIView):
    """
    SalesPerWaiterView class.

    Provides a report of total sales per waiter.
    """
    permission_classes =[AllowAny]

    def get(self, request, staff_id):
        waiter = get_object_or_404(Waiter, Staff_id=staff_id)
        successful_payments = Payment.objects.filter(waiter=waiter, status="paid")

        return Response({
            "waiter_name": f"{waiter.first_name} {waiter.last_name}",
            "sales_count": successful_payments.count(),
            "total_sales": sum(payment.amount for payment in successful_payments) 
        }, status=status.HTTP_200_OK)
class PaymentListView(APIView):
    """
    PaymentListView class.

    Lists all recorded payments.

    Attributes:
        queryset (QuerySet): QuerySet of all payments.
        serializer_class (Serializer): Serializer used for payment data.
    """
    permission_classes = [AllowAny] 
    def get(self, request):
        payments = Payment.objects.all()
        data = []
        for payment in payments:
            data.append({
                "order_id": payment.order.id if payment.order else None,
                "amount": str(payment.amount),
                "payment_date": payment.payment_date,
                "status": payment.status,
                "table_number": payment.table.number if payment.table else None,
                "waiter_name": f"{payment.waiter.first_name} {payment.waiter.last_name}" if payment.waiter else None,
            })
        return Response(data, status=status.HTTP_200_OK)


class ManagerListView(generics.ListAPIView):
    """
    ManagerListView class.

    Lists all users with the manager role.

    Attributes:
        queryset (QuerySet): QuerySet of manager users.
        serializer_class (Serializer): Serializer used for user data.
    """
    queryset = Manager.objects.all()
    serializer_class = ManagerSerializer
    

@api_view(['GET'])
def get_employees(request):
    """
    Retrieves all users with roles such as waiter, kitchen staff, or manager.

    Args:
        request (Request): The HTTP request object.

    Returns:
        Response: A list of filtered users based on role.
    """
    # Fetch all waiters and kitchen staff
    waiters = Waiter.objects.all()
    kitchen_staff = KitchenStaff.objects.all()

    # Serialize both datasets
    waiters_serialized = WaiterSerializer(waiters, many=True).data
    kitchen_staff_serialized = KitchenStaffSerializer(kitchen_staff, many=True).data

    # Combine the serialized results
    # Using extend to combine lists in place
    employees = waiters_serialized.copy()  # Make a copy to avoid modifying the original list
    employees.extend(kitchen_staff_serialized)
    return Response(employees)

@api_view(['PUT'])
def assign_waiter_to_table(request, table_id):
    """
    Assigns a waiter to a specific table.

    Args:
        request (Request): The HTTP request with assignment data.

    Returns:
        Response: A confirmation or error message.
    """
    try:
        table = Table.objects.get(id=table_id)
    except Table.DoesNotExist:
        return Response({"error": "Table not found."}, status=status.HTTP_404_NOT_FOUND)

    waiter_id = request.data.get("waiter_id")
    try:
        waiter = Waiter.objects.get(Staff_id=waiter_id)
    except Waiter.DoesNotExist:
        return Response({"error": "Waiter not found."}, status=status.HTTP_404_NOT_FOUND)

    table.waiter = waiter
    table.save()
    return Response({"message": f"Waiter {waiter.first_name} {waiter.last_name} assigned to Table {table.number}"}, status=status.HTTP_200_OK)


@api_view(['PUT'])
def update_employee(request, employee_id):
    """
    Updates information about a specific employee.

    Args:
        request (Request): The HTTP request containing updated data.
        user_id (int): The ID of the employee to update.

    Returns:
        Response: The updated employee data or an error.
    """
    print("Data received in PUT:", request.data)

    # Try to fetch both a waiter and kitchen staff with this ID
    waiter = Waiter.objects.filter(id=employee_id).first()
    kitchen_staff = KitchenStaff.objects.filter(id=employee_id).first()

    #  Prioritize kitchen staff if both exist with same ID
    if kitchen_staff:
        employee = kitchen_staff
        is_waiter = False
    elif waiter:
        employee = waiter
        is_waiter = True
    else:
        return Response({"detail": "Employee not found."}, status=404)

    # Update basic fields
    employee.first_name = request.data.get("first_name", employee.first_name)
    employee.last_name = request.data.get("last_name", employee.last_name)
    employee.email = request.data.get("email", employee.email)
    employee.phone = request.data.get("phone", employee.phone)

    # Handle role change
    role = request.data.get("role")
    if role:
        current_role = "waiter" if is_waiter else "kitchen staff"
        new_role = role.lower()

        if new_role != current_role:
            if new_role == "waiter" and not is_waiter:
                # Ensure no duplicate email for waiter
                if Waiter.objects.filter(email=employee.email).exists():
                    return Response({"detail": "A waiter with this email already exists."}, status=400)

                new_waiter = Waiter.objects.create(
                    first_name=employee.first_name,
                    last_name=employee.last_name,
                    email=employee.email,
                    phone=employee.phone,
                )
                kitchen_staff.delete()
                employee = new_waiter
                is_waiter = True

            elif new_role == "kitchen staff" and is_waiter:
                # Ensure no duplicate email for kitchen staff
                if KitchenStaff.objects.filter(email=employee.email).exclude(pk=employee.pk).exists():
                    return Response({"detail": "A kitchen staff member with this email already exists."}, status=400)

                new_kitchen_staff = KitchenStaff.objects.create(
                    first_name=employee.first_name,
                    last_name=employee.last_name,
                    email=employee.email,
                    phone=employee.phone,
                )
                waiter.delete()
                employee = new_kitchen_staff
                is_waiter = False

    # Save updates (if no role switch happened, or after switching)
    employee.save()

    return Response({"detail": "Employee updated successfully."}, status=200)

@api_view(['DELETE'])
def fire_employee(request, employee_id):
    """
    Removes an employee from the system.

    Args:
        request (Request): The HTTP request.
        user_id (int): The ID of the employee to remove.

    Returns:
        Response: A success message or error.
    """
    try:
        # Check if it's a waiter or kitchen staff and delete accordingly
        waiter = Waiter.objects.filter(id=employee_id).first()
        kitchen_staff = KitchenStaff.objects.filter(id=employee_id).first()

        if waiter:
            waiter.delete()  # The related payments will be automatically deleted due to cascade delete
            return JsonResponse({"message": "Waiter has been fired."}, status=200)
        elif kitchen_staff:
            kitchen_staff.delete()
            return JsonResponse({"message": "Kitchen staff has been fired."}, status=200)
        else:
            return JsonResponse({"message": "Employee not found."}, status=404)

    except Exception as e:
        print(f"Error: {str(e)}")  # Log the error to the console
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['PUT'])
def update_table(request, table_id):
    """
    Updates the details of a table.

    Args:
        request (Request): The HTTP request containing table data.
        table_id (int): ID of the table to update.

    Returns:
        Response: Updated table data or validation errors.
    """
    try:
        table = Table.objects.get(id=table_id)
    except Table.DoesNotExist:
        return Response({"error": "Table not found."}, status=status.HTTP_404_NOT_FOUND)

    number = request.data.get("number")
    status_value = request.data.get("status")
    waiter_id = request.data.get("waiter_id")  # or 'waiter' depending on your frontend

    if number is not None:
        table.number = number

    if status_value is not None:
        table.status = status_value

    if waiter_id:
        try:
            waiter = Waiter.objects.get(id=waiter_id)
            table.waiter = waiter  #  This is the fix
        except Waiter.DoesNotExist:
            return Response({"error": "Waiter not found."}, status=status.HTTP_404_NOT_FOUND)

    table.save()
    return Response({"message": "Table updated successfully."}, status=status.HTTP_200_OK)

@api_view(['POST'])
def create_employee(request):
    """
    Creates a new employee with a specific role.

    Args:
        request (Request): The HTTP request with employee details.

    Returns:
        Response: Newly created employee data or errors.
    """
    role = request.data.get("role", "").lower()
    
    if role not in ["waiter", "kitchen staff"]:
        return Response({"error": "Invalid role. Must be 'waiter' or 'kitchen staff'."}, status=400)

    required_fields = ["first_name", "last_name", "email"]
    for field in required_fields:
        if not request.data.get(field):
            return Response({"error": f"{field.replace('_', ' ').capitalize()} is required."}, status=400)

    base_data = {
        "first_name": request.data.get("first_name"),
        "last_name": request.data.get("last_name"),
        "email": request.data.get("email"),
        "phone": request.data.get("phone", ""),
        "Staff_id": f"{role.replace(' ', '')}_{request.data.get('email')}".lower(),  # auto-generate staff ID
    }

    if role == "waiter":
        if Waiter.objects.filter(email=base_data["email"]).exists():
            return Response({"error": "A waiter with this email already exists."}, status=400)
        waiter = Waiter.objects.create(**base_data)
        serializer = WaiterSerializer(waiter)
        return Response(serializer.data, status=201)

    elif role == "kitchen staff":
        if KitchenStaff.objects.filter(email=base_data["email"]).exists():
            return Response({"error": "A kitchen staff member with this email already exists."}, status=400)
        kitchen_staff = KitchenStaff.objects.create(**base_data)
        serializer = KitchenStaffSerializer(kitchen_staff)
        return Response(serializer.data, status=201)
