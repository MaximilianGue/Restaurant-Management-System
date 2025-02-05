# Create your models(class) here.
# For example the customer Model or Order model
from django.db import models

class MenuItem(models.Model):
    name = models.CharField(max_length=100)
    price = models.FloatField()
    image = models.URLField(blank=True, null=True)
    allergies = models.JSONField(default=list, blank=True)  

    def __str__(self):
        return f"Name: {self.name} | Price: {self.price} | Allergies: {', '.join(self.allergies) if self.allergies else 'None'}"
    
class Customer(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return f"Name: {self.first_name} {self.last_name} | Email: {self.email} | Phone: {self.phone if self.phone else 'None'}"
    
