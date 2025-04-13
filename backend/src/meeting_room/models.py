from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid


class CustomUser(AbstractUser):
    ROLES = (
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    )
    role = models.CharField(max_length=7, choices=ROLES)


class Room(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    teacher = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name='rooms')
    meeting_id = models.CharField(
        max_length=100, unique=True)  # Required and unique
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class RoomParticipant(models.Model):
    room = models.ForeignKey(
        Room, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name='joined_rooms')
    joined_at = models.DateTimeField(auto_now_add=True)
    is_tracking = models.BooleanField(default=False)

    class Meta:
        unique_together = ('room', 'user')

    def __str__(self):
        return f"{self.user.username} in {self.room.name}"


class DataStream(models.Model):
    """Model to store focus data for analysis"""
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='data_streams')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='focus_data')
    data = models.JSONField()
    timestamp = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('room', 'user')
        indexes = [
            models.Index(fields=['room', 'user']),
            models.Index(fields=['timestamp']),
        ]

    def __str__(self):
        return f"Focus data from {self.user.username} at {self.timestamp}"
