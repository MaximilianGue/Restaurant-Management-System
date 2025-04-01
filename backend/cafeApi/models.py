# Create your models(class) here.
# For example the customer Model or Order model
from django.db import models
from django.contrib.auth.models import AbstractUser

STATUS_CHOICES = [
    ('unconfirmed', 'Unconfirmed'),
    ('completed', 'Completed'),

    ## in use
    ('canceled', 'Canceled'),
    ('pending', 'Pending'),
    ('confirmed','Confirmed'),
    ('being prepared','Being prepared'),
    ('ready for pick up','Ready for pick up'),
    ('delivered','Delivered'),
    ('paid for','Paid for')
   
]

class MenuItem(models.Model):
    """
    Model to represent a menu item in the restaurant's menu.

    Attributes:
        name (str): The name of the menu item.
        price (Decimal): The price of the menu item.
        image (Image): The image associated with the menu item.
        allergies (list): A list of allergens related to the item.
        calories (Decimal): The calorie count for the menu item.
        category (list): The categories the item belongs to (e.g., appetizer, main course).
        cooking_time (int): The time required to cook the menu item (in minutes).
        availability (int): The available quantity of the menu item.
        production_cost (Decimal): The production cost of the item.

    """
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    image = models.ImageField(upload_to="menu_images/", blank=True, null=True)
    allergies = models.JSONField(default=list, blank=True)
    calories = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    category = models.JSONField(default=list, blank=True)
    cooking_time = models.IntegerField(blank=True, null=True) 
    availability= models.IntegerField(blank=True, null=True) 
    production_cost = models.DecimalField(
        max_digits=6, 
        decimal_places=2, 
        null=True, 
        blank=True, 
        default=2.00
    )

    def __str__(self):
        return f"Name: {self.name} | Price: £{self.price} | Cooking Time: {self.cooking_time} min  | availability: {self.availability} | Allergies: {', '.join(self.allergies) if self.allergies else 'None'}"

class Table(models.Model):

    """
    Model to represent a table in the restaurant.
    
    Attributes:
        number (int): Unique identifier for the table.
        status (str): Current status of the table (e.g., pending, confirmed).
        waiter (ForeignKey): The waiter assigned to the table.
        estimated_time (int): Estimated time for the table to be ready.
        capacity (int): The seating capacity of the table.
    """


    number = models.IntegerField(unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    waiter = models.ForeignKey('Waiter', on_delete=models.SET_NULL, null=True, blank=True, related_name='tables')
    estimated_time = models.IntegerField(blank=True, null=True, default=5)
    capacity = models.IntegerField(default=4)

    def __str__(self):
        return f"Table {self.number} | Status: {self.status} | Capacity: {self.capacity}"


class Customer(models.Model):

    """
    Model to represent a customer in the restaurant.

    Attributes:
        first_name (str): The first name of the customer.
        last_name (str): The last name of the customer.
        email (str): The email address of the customer.
        phone (str): The phone number of the customer.
        table (ForeignKey): The table assigned to the customer.
    """

    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    table = models.ForeignKey(Table, on_delete=models.CASCADE, related_name="customers") 

    def __str__(self):
        return f"{self.first_name} {self.last_name} | Email: {self.email} | Phone: {self.phone or 'None'}" 

class Waiter(models.Model):

    """
    Model to represent a waiter in the restaurant.

    Attributes:
        staff_id (str): Unique staff identifier.
        first_name (str): First name of the waiter.
        last_name (str): Last name of the waiter.
        email (str): Email address of the waiter.
        phone (str): Phone number of the waiter.
    """

    Staff_id = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return f"Staff_id {self.Staff_id} | Name: {self.first_name} {self.last_name} | Email: {self.email} | Phone: {self.phone if self.phone else 'None'}"
    
    @property
    def role(self):
        return "Waiter"

class KitchenStaff(models.Model):

    """
    Model to represent kitchen staff in the restaurant.

    Attributes:
        staff_id (str): Unique staff identifier.
        first_name (str): First name of the kitchen staff.
        last_name (str): Last name of the kitchen staff.
        email (str): Email address of the kitchen staff.
        phone (str): Phone number of the kitchen staff.
    """

    Staff_id = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return f"Staff_id {self.Staff_id} | Name: {self.first_name} {self.last_name} | Email: {self.email} | Phone: {self.phone if self.phone else 'None'}"
    
    @property
    def role(self):
        return "Kitchen Staff"

class Order(models.Model):

    """
    Model to represent an order placed by a customer in the restaurant.
    
    Attributes:
        customer (ForeignKey): The customer who placed the order.
        table (ForeignKey): The table where the order was placed.
        order_date (DateTimeField): The date and time when the order was created.
        status (str): The current status of the order (e.g., pending, completed).
        total_price (Decimal): The total price of the order.
        items (ManyToManyField): The menu items included in the order, through the OrderItem model.
        waiter (ForeignKey): The waiter who is responsible for the order.
    """

    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    table = models.ForeignKey(Table, on_delete=models.CASCADE, related_name="orders")
    order_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    items = models.ManyToManyField(MenuItem, through='OrderItem')
    waiter = models.ForeignKey(Waiter, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')

    def save(self, *args, **kwargs):
        if not self.total_price:
            self.total_price = sum(item.menu_item.price * item.quantity for item in self.orderitem_set.all())
        super(Order, self).save(*args, **kwargs)


    def __str__(self):
        return f"Order {self.id} | Customer: {self.customer.first_name if self.customer else 'No Customer'} {self.customer.last_name if self.customer else ''} | Status: {self.status} | Total: £{self.total_price}"

class OrderItem(models.Model):

    """
    Model to represent an item in an order.

    Attributes:
        order (ForeignKey): The order to which the item belongs.
        menu_item (ForeignKey): The menu item included in the order.
        quantity (int): The quantity of the menu item in the order.
    """

    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.menu_item.name} (Order ID: {self.order.id})"

class Notification(models.Model):

    """
    Model to represent notifications for different actions related to orders, waiters, or kitchen staff.

    Attributes:
        waiter (ForeignKey): The waiter to whom the notification is directed.
        kitchen_staff (ForeignKey): The kitchen staff to whom the notification is directed.
        table (ForeignKey): The table related to the notification.
        order (ForeignKey): The order related to the notification.
        notification_type (str): The type of notification (e.g., waiter call, order received).
        message (str): The message content of the notification.
        created_at (DateTimeField): The date and time when the notification was created.
        is_read (bool): Flag to indicate whether the notification has been read.
    """

    NOTIFICATION_TYPES = [
        ('waiter_call', 'Waiter Call'),
        ('order_received', 'Order Received'),
        ('payment', 'Payment'),
        ('alert','Alert'),
        ('order_ready', 'Order_ready'),
    ]
    waiter = models.ForeignKey(Waiter, on_delete=models.CASCADE, null=True, blank=True)
    kitchen_staff = models.ForeignKey(KitchenStaff, on_delete=models.CASCADE, null=True, blank=True)
    table = models.ForeignKey(Table, on_delete=models.CASCADE, null=True, blank=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True, blank=True)
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    message = models.TextField(blank=True, default="") 
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        waiter_name = self.waiter.first_name if self.waiter else "No Waiter"
        kitchen_staff_name = self.kitchen_staff.first_name if self.kitchen_staff and isinstance(self.kitchen_staff, KitchenStaff) else "No Kitchen Staff"

        if self.waiter:
            target = f"Waiter {waiter_name}"
        elif self.kitchen_staff:
            target = f"KitchenStaff {kitchen_staff_name}"
        else:
            target = "Unknown recipient"  # Prevents crashing if no recipient exists

        table_number = self.table.number if self.table else "N/A"
        return f"{self.notification_type} to {target} - Table {table_number}"

class User(AbstractUser):

    """
    Model to represent notifications for different actions related to orders, waiters, or kitchen staff.

    Attributes:
        waiter (ForeignKey): The waiter to whom the notification is directed.
        kitchen_staff (ForeignKey): The kitchen staff to whom the notification is directed.
        table (ForeignKey): The table related to the notification.
        order (ForeignKey): The order related to the notification.
        notification_type (str): The type of notification (e.g., waiter call, order received).
        message (str): The message content of the notification.
        created_at (DateTimeField): The date and time when the notification was created.
        is_read (bool): Flag to indicate whether the notification has been read.
    """

    ROLE_CHOICES = [
        ('waiter', 'Waiter'),
        ('kitchen_staff', 'Kitchen Staff'),
        ('manager', 'Manager'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES) 
    staff_id = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return f"{self.username} ({self.role}) - Staff ID: {self.staff_id}"
    
class Manager(models.Model):

    """
    Model to represent a manager in the restaurant.
    
    Attributes:
        staff_id (str): The unique staff identifier for the manager.
        first_name (str): The first name of the manager.
        last_name (str): The last name of the manager.
        email (str): The email address of the manager.
        phone (str): The phone number of the manager.
    """

    Staff_id = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"    

class Payment(models.Model):

    """
    Model to represent payment information for an order.

    Attributes:
        order (OneToOneField): The order associated with the payment.
        amount (Decimal): The payment amount.
        payment_date (DateTimeField): The date and time of payment.
        table (ForeignKey): The table associated with the payment.
        waiter (ForeignKey): The waiter associated with the payment.
        status (str): The status of the payment (paid or unpaid).
        stripe_session_id (str): The Stripe session ID for the payment.
    """

    PAYMENT_CHOICES = [
        ('paid', 'Paid'),
        ('unpaid', 'Unpaid'),
    ]
    
    order = models.OneToOneField(Order, primary_key=True, on_delete=models.CASCADE) 
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateTimeField(auto_now_add=True)
    table = models.ForeignKey(Table, on_delete=models.CASCADE, null=True, blank=True)
    waiter = models.ForeignKey(Waiter, on_delete=models.CASCADE, null=True, blank=True)
    status = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default='unpaid')
    stripe_session_id = models.CharField(max_length=255, null=True, blank=True)  

    def __str__(self): 
        return f"Order {self.order.id} | Amount: £{self.amount} | Status: {self.status} | Waiter: {self.waiter.first_name if self.waiter else 'None'}"
