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
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Ok')
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
    items = models.ManyToManyField(MenuItem, through='OrderItem')
    waiter = models.ForeignKey(Waiter, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')

    def __str__(self):
        return f"Order {self.id} | Customer: {self.customer.first_name if self.customer else 'No Customer'} {self.customer.last_name if self.customer else ''} | Status: {self.status} | Total: £{self.total_price}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1) 


class Notification(models.Model):
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
    Staff_id = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"    