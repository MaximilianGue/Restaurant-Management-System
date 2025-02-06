# the way to display the models(class) in the database
from rest_framework import serializers
from .models import MenuItem, Order, Customer

class MenuItemSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image:
            url = obj.image.url
            if not url.startswith("/"):
                url = "/" + url
            full_url = request.build_absolute_uri(url)
            print("Full image URL:", full_url)  # Debug print; remove in production
            return full_url
        return None


    class Meta:
        model = MenuItem
        fields = ["id", "name", "price", "image", "allergies"]


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'
