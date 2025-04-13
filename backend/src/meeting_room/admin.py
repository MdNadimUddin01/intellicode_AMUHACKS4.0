from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Room, CustomUser, RoomParticipant, DataStream
# from django.contrib.auth.models import Token


class RoomAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at', 'is_active')
    search_fields = ('name',)
    list_filter = ('is_active', 'created_at')
    ordering = ('-created_at',)
    list_per_page = 20
    date_hierarchy = 'created_at'


class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'is_active')
    search_fields = ('username', 'email')
    list_filter = ('role', 'is_active')
    ordering = ('-date_joined',)
    list_per_page = 20
    date_hierarchy = 'date_joined'


class RoomParticipantAdmin(admin.ModelAdmin):
    list_display = ('room', 'user', 'is_tracking')
    search_fields = ('room__name', 'user__username')
    list_filter = ('is_tracking',)
    ordering = ('-room__created_at',)
    list_per_page = 20
    date_hierarchy = 'room__created_at'


class DataStreamAdmin(admin.ModelAdmin):
    list_display = ('room', 'user', 'timestamp')
    search_fields = ('room__name', 'user__username')
    ordering = ('-timestamp',)
    list_per_page = 20
    date_hierarchy = 'timestamp'


# Register our models
admin.site.register(Room, RoomAdmin)
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(RoomParticipant, RoomParticipantAdmin)
admin.site.register(DataStream, DataStreamAdmin)

# Register Token model with default admin
# admin.site.register(Token)
