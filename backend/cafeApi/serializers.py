# the way to display the models(class) in the database
from rest_framework import serializers
from .models import MenuItem, Order, Table,Customer, Waiter,KitchenStaff, Notification,User,Payment,Manager
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError

import json
from rest_framework.exceptions import ValidationError
from rest_framework import serializers
from .models import MenuItem
from .models import OrderItem


class MenuItemSerializer(serializers.ModelSerializer):
    allergies = serializers.ListField(
        child=serializers.CharField(), required=False
    )
    category = serializers.SerializerMethodField()
    category_input = serializers.ListField(child=serializers.CharField(), write_only=True, required=False)

    def get_category(self, obj):
        return obj.category if isinstance(obj.category, list) else []

    def get_allergies(self, obj):
        return obj.allergies if obj.allergies else ["none"]

    def update(self, instance, validated_data):
        if "category_input" in validated_data:
            raw_category = validated_data.pop("category_input", [])
            validated_data["category"] = raw_category

        if 'image' in validated_data and validated_data['image'] is None:
            validated_data.pop('image')
        
        if 'production_cost' in validated_data:
            instance.production_cost = validated_data.pop('production_cost')

        return super().update(instance, validated_data)

    class Meta:
        model = MenuItem
        fields = [
            "id", "name", "price", "production_cost", "image", "allergies", "calories",
            "category", "category_input", "cooking_time", "availability"
        ]



class UpdateAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = ['availability']  # Only allow updating the availability field

    def update(self, instance, validated_data):
        instance.availability = validated_data.get("availability", instance.availability)
        instance.save()
        return instance

class TableSerializer(serializers.ModelSerializer):
    waiter_name = serializers.SerializerMethodField()
    revenue = serializers.SerializerMethodField()

    class Meta:
        model = Table
        fields = ['id', 'number', 'status', 'waiter', 'waiter_name', 'estimated_time', 'capacity', 'revenue']

    def get_waiter_name(self, obj):
        return f"{obj.waiter.first_name} {obj.waiter.last_name}" if obj.waiter else None

    def get_revenue(self, obj):
        paid_orders = obj.orders.filter(status='paid for')
        return sum(order.total_price for order in paid_orders)


class OrderItemSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="menu_item.name", read_only=True)
    price = serializers.DecimalField(source="menu_item.price", max_digits=6, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ["name", "price", "quantity"]


class OrderSerializer(serializers.ModelSerializer):
    table_id = serializers.PrimaryKeyRelatedField(queryset=Table.objects.all(), source="table")
    items = OrderItemSerializer(source="orderitem_set", many=True, read_only=True)  # ✅ FIXED

    item_ids = serializers.PrimaryKeyRelatedField(
        queryset=MenuItem.objects.all(), source="items", many=True, write_only=True
    )

    class Meta:
        model = Order
        fields = [
            "id", "table_id", "order_date", "status", "total_price", "items", "item_ids"
        ]


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

        
class UpdateStatusSerializer(serializers.ModelSerializer):
    Staff_id = serializers.CharField(source = "waiter.Staff_id", allow_blank=True, required=False)
    order_id = serializers.CharField(source = "order.id", allow_blank=True, required=False)
    class Meta:
        model = Order
        fields = ['status', 'Staff_id',  'order_id']
        
    def update(self, instance, validated_data):
    
        instance.status = validated_data.get("status", instance.status)
        instance.save()
        return instance
    

        
class ConfirmOrderSerializer(serializers.ModelSerializer):
    Staff_id = serializers.CharField(source="KitchenStaff.Staff_id", allow_blank=True, required=False)
    order_id = serializers.CharField(source = "order.id", allow_blank=True, required=False)
    class Meta:
        model = Order
        fields = ['status', 'Staff_id',  'order_id']
        
    def update(self, instance, validated_data):
    
        instance.status = validated_data.get("status", instance.status)
        instance.save()
        return instance

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'




class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['username', 'password', 'role', 'staff_id']  # Include staff_id
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = get_user_model().objects.create_user(**validated_data)
        return user

class WaiterSerializer(serializers.ModelSerializer):
    role = serializers.CharField(default="Waiter")  # Add role info

    class Meta:
        model = Waiter
        fields = ['id', 'first_name', 'last_name', 'email', 'phone', 'role']

class KitchenStaffSerializer(serializers.ModelSerializer):
    role = serializers.CharField(default="Kitchen Staff")  # Add role info

    class Meta:
        model = KitchenStaff
        fields = ['id', 'first_name', 'last_name', 'email', 'phone', 'role']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["id","order" ,"table", "waiter", "amount",]

class ManagerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manager
        fields = '__all__'
