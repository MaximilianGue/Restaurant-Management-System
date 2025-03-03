# the way to display the models(class) in the database
from rest_framework import serializers
from .models import MenuItem, Order, Table,Customer, Waiter,KitchenStaff, Notification,User
from django.contrib.auth import get_user_model

class MenuItemSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image:
            url = obj.image.url
            if not url.startswith("/"):
                url = "/" + url

            return request.build_absolute_uri(url) if request else url

        return None
    class Meta:
        model = MenuItem
        fields = ["id", "name", "price", "image", "allergies","calories","category","cooking_time","availability"]


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


class WaiterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Waiter
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
    
class KitchenStaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = KitchenStaff
        fields = '__all__'
        
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