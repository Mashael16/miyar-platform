#This code registers your User and Task models with the built-in Django Admin Panel,
# effectively making them visible and manageable through the graphical interface at /admin/; without these registration lines,
# you wouldn't be able to manually create, edit, or delete records from your database using the browser-based dashboard.


from django.contrib import admin
from .models import User, Task

admin.site.register(User)
admin.site.register(Task)
