from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import MenuItem
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
