from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import MenuItem, Notification, Order, Table, Waiter, KitchenStaff
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

# API Tests
class MenuItemAPITestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.menu_item_data = {
            "name": "Tacos",
            "price": 9.99,
            "image": "menu_images/taco.jpg", 
            "allergies": ["Gluten"]
        }

    def test_create_menu_item(self):
        response = self.client.post("/cafeApi/menu-items/", self.menu_item_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Tacos")
        self.assertEqual(response.data["price"], 9.99)
        self.assertEqual(response.data["allergies"], ["Gluten"])

    def test_get_menu_items(self):
        MenuItem.objects.create(
            name="Burrito",
            price=10.00,
            image="menu_images/burrito.jpg", 
            allergies=["Dairy", "Gluten"]     
        )
        response = self.client.get("/cafeApi/menu-items/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Burrito")
        self.assertEqual(response.data[0]["allergies"], ["Dairy", "Gluten"])


class NotificationAPITestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.waiter = Waiter.objects.create(Staff_id="W123", first_name="John", last_name="Doe")
        self.kitchen_staff = KitchenStaff.objects.create(Staff_id="K456", first_name="Jane", last_name="Smith")
        self.table = Table.objects.create(number=5)
        self.order = Order.objects.create(table=self.table, waiter=self.waiter, status="pending", total_price=20.0)
        self.notification_data = {
            "notification_type": "order_ready",
            "waiter": self.waiter.id,
            "order": self.order.id,
            "table": self.table.id,
            "message": "Order is ready for pickup."
        }

    def test_create_notification(self):
        response = self.client.post("/cafeApi/notifications/", self.notification_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["message"], "Order is ready for pickup.")

    def test_mark_notification_as_read(self):
        notification = Notification.objects.create(notification_type="order_ready", waiter=self.waiter, order=self.order, table=self.table, message="Order is ready.")
        response = self.client.post(f"/cafeApi/notifications/{notification.id}/mark_as_read/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        notification.refresh_from_db()
        self.assertTrue(notification.is_read)

