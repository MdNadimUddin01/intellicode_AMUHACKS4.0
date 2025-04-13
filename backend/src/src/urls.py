from django.contrib import admin
from django.urls import path, include
from meeting_room import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('meeting_room.urls')),
]
