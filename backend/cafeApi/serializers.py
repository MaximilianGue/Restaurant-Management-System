# the way to display the models(class) in the database
from rest_framework import serializers
from .models import MenuItem, Order, Table,Customer

class MenuItemSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image:
            url = obj.image.url
            if not url.startswith("/"):
                url = "/" + url
            full_url = request.build_absolute_uri(url)
            return full_url
        return None

    class Meta:
        model = MenuItem
        fields = ["id", "name", "price", "image", "allergies"]


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

