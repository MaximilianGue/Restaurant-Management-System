# the way to display the models(class) in the database
from rest_framework import serializers
from .models import MenuItem, Order, Table,Customer, Waiter,KitchenStaff, Notification,User
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError

class MenuItemSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    category_input = serializers.ListField(child=serializers.CharField(), write_only=True, required=False)

    def get_category(self, obj):
        if isinstance(obj.category, str):
            return obj.category.split(",")  # Ensure it's returned as a list
        return obj.category or []

    def update(self, instance, validated_data):
        print("🔍 Updating with validated data:", validated_data)  # Debugging

        try:
            # Handle category updates correctly
            if 'category_input' in validated_data:
                raw_category = validated_data.pop('category_input', [])
                
                # ✅ Ensure proper conversion
                try:
                    category_list = json.loads(raw_category) if isinstance(raw_category, str) else raw_category
                except json.JSONDecodeError:
                    category_list = []  # Fallback to empty list on error

                validated_data['category'] = category_list  

            # Handle image correctly
            if "image" in validated_data and validated_data["image"] is None:
                validated_data.pop("image")

            for attr, value in validated_data.items():
                setattr(instance, attr, value)

            instance.save()
            return instance  
        except Exception as e:
            print("❌ Update failed due to:", str(e))  # Debugging
            raise ValidationError({"error": str(e)})  

    class Meta:
        model = MenuItem
        fields = ["id", "name", "price", "image", "allergies", "calories", "category", "category_input", "cooking_time", "availability"]

    category = serializers.SerializerMethodField()
    category_input = serializers.ListField(child=serializers.CharField(), write_only=True, required=False)

    def get_category(self, obj):
        if isinstance(obj.category, str):
            return obj.category.split(",")  # Ensure it's returned as a list
        return obj.category or []

    def update(self, instance, validated_data):
        print("🔍 Updating with validated data:", validated_data)  # Debugging

        try:
            # Handle category updates correctly
            if 'category_input' in validated_data:
                raw_category = validated_data.pop('category_input', [])
                
                # ✅ Ensure proper conversion
                try:
                    category_list = json.loads(raw_category) if isinstance(raw_category, str) else raw_category
                except json.JSONDecodeError:
                    category_list = []  # Fallback to empty list on error

                validated_data['category'] = category_list  

            # Handle image correctly
            if "image" in validated_data and validated_data["image"] is None:
                validated_data.pop("image")

            for attr, value in validated_data.items():
                setattr(instance, attr, value)

            instance.save()
            return instance  
        except Exception as e:
            print("❌ Update failed due to:", str(e))  # Debugging
            raise ValidationError({"error": str(e)})  

    class Meta:
        model = MenuItem
        fields = ["id", "name", "price", "image", "allergies", "calories", "category", "category_input", "cooking_time", "availability"]

    category = serializers.SerializerMethodField()
    category_input = serializers.ListField(child=serializers.CharField(), write_only=True, required=False)

    def get_category(self, obj):
        if isinstance(obj.category, str):
            return obj.category.split(",")  # Ensure it's returned as a list
        return obj.category or []

    def update(self, instance, validated_data):
        print("🔍 Updating with validated data:", validated_data)  # Debugging

        try:
            # Handle category updates correctly
            if 'category_input' in validated_data:
                raw_category = validated_data.pop('category_input', [])
                if isinstance(raw_category, str):  
                    category_list = json.loads(raw_category)  # Fix JSON decoding issue
                else:
                    category_list = raw_category
                validated_data['category'] = category_list  # Ensure stored correctly

            # Remove empty image field to prevent issues
            if "image" in validated_data and validated_data["image"] is None:
                validated_data.pop("image")

            for attr, value in validated_data.items():
                setattr(instance, attr, value)

            instance.save()
            return instance  
        except Exception as e:
            print("❌ Update failed due to:", str(e))  # Debugging
            raise ValidationError({"error": str(e)})  # Return error message

    class Meta:
        model = MenuItem
        fields = ["id", "name", "price", "image", "allergies", "calories", "category", "category_input", "cooking_time", "availability"]

    category = serializers.SerializerMethodField()
    category_input = serializers.ListField(child=serializers.CharField(), write_only=True, required=False)

    def get_category(self, obj):
        if isinstance(obj.category, str):
            return obj.category.split(",")  # Ensure category is a list when retrieved
        return obj.category or []

    def update(self, instance, validated_data):
        print("Updating with validated data:", validated_data)  # Debugging

        try:
            # Ensure category_input is stored as an array
            if 'category_input' in validated_data:
                raw_category = validated_data.pop('category_input', [])
                if isinstance(raw_category, str):
                    category_list = json.loads(raw_category)
                else:
                    category_list = raw_category
                validated_data['category'] = category_list  # Store properly

            # Handle image updates properly
            if "image" in validated_data:
                if validated_data["image"] is None:
                    validated_data.pop("image")  # Prevent setting image to null accidentally

            for attr, value in validated_data.items():
                setattr(instance, attr, value)

            instance.save()
            return instance  
        except Exception as e:
            print("❌ Update failed due to:", str(e))  # Debugging
            raise ValidationError({"error": str(e)})  # Return error message

    class Meta:
        model = MenuItem
        fields = ["id", "name", "price", "image", "allergies", "calories", "category", "category_input", "cooking_time", "availability"]

    category = serializers.SerializerMethodField()
    category_input = serializers.ListField(child=serializers.CharField(), write_only=True, required=False)

    def get_category(self, obj):
        if isinstance(obj.category, str):
            return obj.category.split(",")  
        return obj.category or []

    def update(self, instance, validated_data):
        print("Updating with validated data:", validated_data)  # Debugging

        try:
            # 🔹 Fix `category_input` handling
            if 'category_input' in validated_data:
                raw_category = validated_data.pop('category_input', [])
                if isinstance(raw_category, str):  # 🔥 It's coming as a string, so fix it!
                    category_list = json.loads(raw_category)
                else:
                    category_list = raw_category
                validated_data['category'] = category_list  # 🔹 Ensure stored correctly

            for attr, value in validated_data.items():
                setattr(instance, attr, value)

            instance.save()
            return instance  
        except Exception as e:
            print("❌ Update failed due to:", str(e))  # Debugging
            raise ValidationError({"error": str(e)})  # Return error message

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