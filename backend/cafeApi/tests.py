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
            "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSBhXlCvgfEoFhk-GEkrWS23uhIHPSsfJUhA&s",
            "allergies": ["Gluten"]
        }

    def test_create_menu_item(self):
        # Test creating a MenuItem via API
        response = self.client.post("/cafeApi/menu-items/", self.menu_item_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Tacos")
        self.assertEqual(response.data["price"], 9.99)
        self.assertEqual(response.data["allergies"], ["Gluten"])

    def test_get_menu_items(self):
        # Test retrieving menu items via API
        # First, create a menu item
        MenuItem.objects.create(
            name="Burrito",
            price=10.00,
            image="https://media.istockphoto.com/id/1313361282/photo/mexican-rice-and-chorizo-sausage-wrap.jpg?s=612x612&w=0&k=20&c=7BgOT-kuluQIlZ50l-p-DNvajA66EeB_HIUvW6O_GPM=",
            allergies=["Diary","Gluten"]
        )
        response = self.client.get("/cafeApi/menu-items/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Burrito")
        self.assertEqual(response.data[0]["allergies"], ["Diary","Gluten"])
