# the way to display the models(class) in the database
from rest_framework import serializers
from .models import MenuItem, Order, Table,Customer, Waiter,KitchenStaff, Notification,User
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError

import json
from rest_framework.exceptions import ValidationError
from rest_framework import serializers
from .models import MenuItem

class MenuItemSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    category_input = serializers.ListField(child=serializers.CharField(), write_only=True, required=False)

    def get_category(self, obj):
        """ Ensure the category is returned as a list. """
        if isinstance(obj.category, str):
            return obj.category.split(",")
        return obj.category or []
    
    def get_allergies(self, obj):
        """ Ensure 'None' is returned when allergies are empty. """
        return obj.allergies if obj.allergies else ["none"]  # ✅ Returns ["None"] instead of an empty list


    def update(self, instance, validated_data):
        print("🔍 Updating with validated data:", validated_data)  # Debugging

        # ✅ Ensure category is stored as JSON in the DB
        if "category_input" in validated_data:
            raw_category = validated_data.pop('category_input', [])
            validated_data["category"] = json.dumps(raw_category) if isinstance(raw_category, list) else raw_category

        # ✅ Remove 'image' field from validated_data if no new image is provided
        if 'image' in validated_data and validated_data['image'] is None:
            validated_data.pop('image')

        return super().update(instance, validated_data)

    class Meta:
        model = MenuItem
        fields = ["id", "name", "price", "image", "allergies", "calories", "category", "category_input", "cooking_time", "availability"]


class UpdateAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = ['availability']  # Only allow updating the availability field

    def update(self, instance, validated_data):
        instance.availability = validated_data.get("availability", instance.availability)
        instance.save()
        return instance


class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = ["id", "number", "status", "waiter_name", "estimated_time", "capacity"]


class OrderSerializer(serializers.ModelSerializer):
    table_id = serializers.PrimaryKeyRelatedField(
        queryset=Table.objects.all(), source="table"
    )  # Only show table ID, not full table details

    items = MenuItemSerializer(many=True, read_only=True)  # Nested items in response
    item_ids = serializers.PrimaryKeyRelatedField(
        queryset=MenuItem.objects.all(), source="items", many=True, write_only=True
    )  # Accept `item_ids` list when creating/updating an order

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