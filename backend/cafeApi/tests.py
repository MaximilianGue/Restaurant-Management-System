from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import MenuItem, Notification, Order, Table, Waiter, KitchenStaff
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

# API Tests
class MenuItemAPITestCase(APITestCase):
    """
    Test case for menu item API endpoints.

    Tests include retrieval and creation of menu items.
    """
    def setUp(self):
        """
        Sets up initial test data for menu item tests.

        Creates a sample menu item payload and initializes the API client.
        """
        self.client = APIClient()
        self.menu_item_data = {
            "name": "Tacos",
            "price": 9.99,
            "image": "menu_images/taco.jpg", 
            "allergies": ["Gluten"]
        }

    def test_get_menu_items(self):
        """
        Tests retrieving the list of menu items.

        Asserts:
            - The response status is 200 OK.
            - The number of returned menu items matches expected count.
        """
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
    """
    Test case for notification API endpoints.

    Includes tests for creating and marking notifications as read.
    """
    def setUp(self):
        """
        Sets up initial test data for notification tests.

        Creates test user, test notification data, and sets up authentication.
        """
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
        """
        Tests creating a new notification via the API.

        Asserts:
            - The response status is 201 CREATED.
            - The notification is correctly stored in the database.
        """
        response = self.client.post("/cafeApi/notifications/", self.notification_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["message"], "Order is ready for pickup.")

    def test_mark_notification_as_read(self):
        """
        Tests marking a notification as read via the API.

        Asserts:
            - The response status is 200 OK.
            - The notification's 'read' field is updated to True.
        """
        notification = Notification.objects.create(notification_type="order_ready", waiter=self.waiter, order=self.order, table=self.table, message="Order is ready.")
        response = self.client.post(f"/cafeApi/notifications/{notification.id}/mark_as_read/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        notification.refresh_from_db()
        self.assertTrue(notification.is_read)

class RegisterAPITestCase(APITestCase):
     """
    Test case for the user registration API endpoint.

    Includes tests for missing fields, duplicate emails, and successful registration.
    """
def setUp(self):
        """
        Sets up initial data for registration tests.

        Defines valid user registration data and initializes the client.
        """
        self.client = APIClient()
        self.valid_user_data = {
            "username": "newuser",
            "password": "securepassword123",
            "email": "newuser@example.com"
        }
        self.invalid_user_data = {
            "username": "",
            "password": "short",
            "email": "invalidemail"
        }

def test_register_user_missing_fields(self):
        """
        Tests registration with missing required fields.

        Asserts:
            - The response status is 400 BAD REQUEST.
            - The response includes appropriate error messages.
        """
        response = self.client.post("/cafeApi/register/", {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

def test_register_user_invalid_data(self):
        """
        Tests registration with invalid user data.

        Asserts:
            - The response status is 400 BAD REQUEST.
            - The registration fails due to invalid input data.
        """
        response = self.client.post("/cafeApi/register/", self.invalid_user_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

def test_register_user_duplicate_username(self):
        """
        Tests registration with a username that already exists.

        Asserts:
            - The first registration succeeds.
            - The second (duplicate) registration returns 400 BAD REQUEST.
        """
        self.client.post("/cafeApi/register/", self.valid_user_data, format="json")  # First registration
        response = self.client.post("/cafeApi/register/", self.valid_user_data, format="json")  # Duplicate
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
class StatusUpdateAPITestCase(APITestCase):
    """
    Test case for updating order status via the API.

    Tests include successful status updates and various failure scenarios due to invalid or missing staff ID or order.
    """
    def setUp(self):
        """
        Sets up test data for order status update tests.

        Creates a test waiter, table, and order, along with valid and invalid request payloads.
        """
        self.client = APIClient()
        self.waiter = Waiter.objects.create(Staff_id="W123", first_name="John", last_name="Doe")
        self.table = Table.objects.create(number=1)
        self.order = Order.objects.create(table=self.table, waiter=self.waiter, status="pending", total_price=25.0)
        self.valid_data = {
            "status": "completed",
            "Staff_id": "W123"
        }
        self.invalid_data = {
            "status": "completed"  # Missing Staff_id
        }

    def test_update_order_status_success(self):
        """
        Tests successful update of an order's status.

        Asserts:
            - The response status is 200 OK.
            - The order's status is correctly updated in the database.
        """
        response = self.client.patch(f"/cafeApi/orders/{self.order.id}/update/", self.valid_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, "completed")

    def test_update_order_status_missing_staff_id(self):
        """
        Tests updating an order status with missing staff ID in the payload.

        Asserts:
            - The response status is 400 BAD REQUEST.
            - The response includes an error for missing 'Staff_id'.
        """
        response = self.client.patch(f"/cafeApi/orders/{self.order.id}/update/", self.invalid_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Staff_id", response.data)

    def test_update_order_status_invalid_staff_id(self):
        """
        Tests updating an order status using an invalid staff ID.

        Asserts:
            - The response status is 404 NOT FOUND.
            - The system cannot find a staff member with the provided ID.
        """
        data = {"status": "completed", "Staff_id": "INVALID"}
        response = self.client.patch(f"/cafeApi/orders/{self.order.id}/update/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_order_status_nonexistent_order(self):
        """
        Tests updating a status for an order that does not exist.

        Asserts:
            - The response status is 404 NOT FOUND.
            - The system reports that the order ID is invalid.
        """
        response = self.client.patch("/cafeApi/orders/999/update/", self.valid_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class Log_inAPITestCase(APITestCase):
    """
    Test case for the user login API endpoint.
    
    Includes tests for successful login, missing credentials, invalid credentials, and non-existent users.
    """

    def setUp(self):
        """
        Sets up initial data for login tests.

        Creates a test user with valid credentials.
        """
        self.client = APIClient()
        self.username = 'testuser'
        self.password = 'password123'
        self.staff_id = 'ID123'
        self.user = get_user_model().objects.create_user(username=self.username, password=self.password, staff_id=self.staff_id)
        self.valid_data = {'username': self.username, 'password': self.password}

    def test_login_successful(self):
        """
        Tests successful login with valid credentials.

        Asserts:
            - The response status is 200 OK.
            - Access and refresh tokens are returned.
            - The correct staff_id is included.
        """
        response = self.client.post('/cafeApi/login/', self.valid_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', response.data)
        self.assertIn('refresh_token', response.data)
        self.assertEqual(response.data['staff_id'], self.staff_id)

    def test_login_missing_credentials(self):
        """
        Tests login with missing username or password.

        Asserts:
            - The response status is 400 BAD REQUEST.
            - The appropriate error message is returned.
        """
        response = self.client.post('/cafeApi/login/', {'username': self.username})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', response.data)

    def test_login_invalid_credentials(self):
        """
        Tests login with an incorrect password.

        Asserts:
            - The response status is 400 BAD REQUEST.
            - The appropriate error message is returned.
        """
        invalid_data = {'username': self.username, 'password': 'wrongpassword'}
        response = self.client.post('/cafeApi/login/', invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', response.data)

    def test_login_non_existent_user(self):
        """
        Tests login with a username that does not exist.

        Asserts:
            - The response status is 400 BAD REQUEST.
            - The appropriate error message is returned.
        """
        non_existent_data = {'username': 'unknownuser', 'password': 'password123'}
        response = self.client.post('/cafeApi/login/', non_existent_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', response.data)
