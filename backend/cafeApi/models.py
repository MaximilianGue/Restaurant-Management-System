# Create your models(class) here.
# For example the customer Model or Order model
from django.db import models

class MenuItem(models.Model):
    name = models.CharField(max_length=100)
    price = models.FloatField()
    image = models.URLField()  
    allergies = models.JSONField(default=list, blank=True)  

    def __str__(self):
        return f"Name: {self.name} | Price: {self.price} | Allergies: {', '.join(self.allergies) if self.allergies else 'None'}"
