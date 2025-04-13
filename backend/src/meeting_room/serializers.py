from rest_framework import serializers
from .models import Room, RoomParticipant, CustomUser, DataStream
from django.contrib.auth.hashers import make_password


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'role']
        extra_kwargs = {
            # Password should not be returned in responses
            'password': {'write_only': True},
        }

    def validate_role(self, value):
        """Ensure the role is either 'teacher' or 'student'."""
        if value not in ['teacher', 'student']:
            raise serializers.ValidationError(
                "Role must be either 'teacher' or 'student'.")
        return value

    def create(self, validated_data):
        """Create and return a new user."""
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)


class RoomSerializer(serializers.ModelSerializer):
    teacher = serializers.CharField(source='teacher.username', read_only=True)

    class Meta:
        model = Room
        fields = ['id', 'name', 'teacher', 'description',
                  'created_at', 'is_active', 'meeting_id']
        read_only_fields = ['id', 'created_at']

    def validate_meeting_id(self, value):
        """Ensure the meeting_id is unique."""
        if Room.objects.filter(meeting_id=value).exists():
            raise serializers.ValidationError(
                "This meeting ID is already taken.")
        return value


class RoomParticipantSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = RoomParticipant
        fields = ['user', 'username', 'joined_at', 'is_tracking']
        read_only_fields = ['joined_at']


class DataStreamSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    room_name = serializers.CharField(source='room.name', read_only=True)

    class Meta:
        model = DataStream
        fields = ['room', 'room_name', 'user', 'username', 'data', 'timestamp']
        read_only_fields = ['timestamp']
