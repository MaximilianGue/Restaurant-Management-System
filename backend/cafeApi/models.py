# Create your models(class) here.
# For example the customer Model or Order model
from django.db import models

class MenuItem(models.Model):
    name = models.CharField(max_length=100)
    price = models.FloatField()
    image = models.ImageField(upload_to="menu_images/", blank=True, null=True)  # Store images in `media/menu_images/`
    allergies = models.JSONField(default=list, blank=True)  

    def __str__(self):
        return f"{self.name} - £{self.price}"
 

    def __str__(self):
        return f"Name: {self.name} | Price: {self.price} | Allergies: {', '.join(self.allergies) if self.allergies else 'None'}"

class Customer(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return f"Name: {self.first_name} {self.last_name} | Email: {self.email} | Phone: {self.phone if self.phone else 'None'}"

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('canceled', 'Canceled'),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='orders')
    order_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Order ID: {self.id} | Customer: {self.customer.first_name} {self.customer.last_name} | Status: {self.status} | Total Price: ${self.total_price}"