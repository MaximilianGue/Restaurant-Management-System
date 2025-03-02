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
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    image = models.ImageField(upload_to="menu_images/", blank=True, null=True)
    allergies = models.JSONField(default=list, blank=True)
    calories = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    category = models.JSONField(default=list, blank=True)
    cooking_time = models.IntegerField(blank=True, null=True) 
    availability= models.IntegerField(blank=True, null=True) 

    def __str__(self):
        return f"Name: {self.name} | Price: £{self.price} | Cooking Time: {self.cooking_time} min  | availability: {self.availability} | Allergies: {', '.join(self.allergies) if self.allergies else 'None'}"

class Table(models.Model):
    number = models.IntegerField(unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    waiter_name = models.CharField(max_length=100, blank=True, null=True)
    estimated_time = models.IntegerField(blank=True, null=True)
    capacity = models.IntegerField(default=4)

    def __str__(self):
        return f"Table {self.number} | Status: {self.status} | Capacity: {self.capacity}"
 


class Customer(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    table = models.ForeignKey(Table, on_delete=models.CASCADE, related_name="customers") 

    def __str__(self):
        return f"{self.first_name} {self.last_name} | Email: {self.email} | Phone: {self.phone or 'None'}" 

class Waiter(models.Model):
    Staff_id = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return f"Staff_id {self.Staff_id} | Name: {self.first_name} {self.last_name} | Email: {self.email} | Phone: {self.phone if self.phone else 'None'}"

class KitchenStaff(models.Model):
    Staff_id = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return f"Staff_id {self.Staff_id} | Name: {self.first_name} {self.last_name} | Email: {self.email} | Phone: {self.phone if self.phone else 'None'}"

class Order(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    table = models.ForeignKey(Table, on_delete=models.CASCADE, related_name="orders")
    order_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    items = models.ManyToManyField(MenuItem, related_name="orders")
    waiter = models.ForeignKey(Waiter, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')

    def __str__(self):
        return f"Order {self.id} | Customer: {self.customer.first_name} {self.customer.last_name} | Status: {self.status} | Total: £{self.total_price}"
    #def getTableNumber(self):
    #    return self.table.number


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('waiter_call', 'Waiter Call'),
        ('order_received', 'Order Received'),
        ('status_change', 'Status Change'),
        ('payment', 'Payment'),
    ]
    
    RECIPIENT_CHOICES = [
        ('waiter', 'Waiter'),
        ('kitchen', 'Kitchen Staff'),
        ('both', 'Both'),
    ]

    table = models.ForeignKey(Table, on_delete=models.CASCADE, null=True, blank=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True, blank=True)
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    recipient = models.CharField(max_length=20, choices=RECIPIENT_CHOICES)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.notification_type} - Table {self.table.number if self.table else 'N/A'}"


class User(AbstractUser):
    ROLE_CHOICES = [
        ('waiter', 'Waiter'),
        ('kitchen_staff', 'Kitchen Staff'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)  # Added role field
    staff_id = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return f"{self.username} ({self.role}) - Staff ID: {self.staff_id}"
    
    