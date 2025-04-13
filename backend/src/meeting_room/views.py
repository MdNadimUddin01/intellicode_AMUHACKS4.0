from rest_framework import status
from .models import Room, RoomParticipant, DataStream, CustomUser
from .serializers import RoomSerializer, RoomParticipantSerializer, DataStreamSerializer
from django.db import transaction
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from .serializers import CustomUserSerializer
import logging
from django.core.cache import cache
import json
from .models import Room, RoomParticipant

logger = logging.getLogger(__name__)

# Cache settings
FOCUS_DATA_CACHE_TIMEOUT = 60  # Cache for 1 minute


def get_cache_key(room_id, user_id=None):
    """Generate cache key for focus data"""
    if user_id:
        return f"focus_data_{room_id}_{user_id}"
    return f"focus_data_{room_id}_all"


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Endpoint to register a new user"""
    serializer = CustomUserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        print("USER: ", user, token)
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role
            }
        }, status=201)
    # Return detailed validation errors
    return Response(serializer.errors, status=400)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """Endpoint to log in a user"""
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'role': user.role  # Include the user's role in the response
            }
        }, status=200)
    return Response({'error': 'Invalid credentials'}, status=401)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_room(request):
    """Create a new room (only teachers can create rooms)"""
    # Check if the user is a teacher
    if not request.user.role == 'teacher':
        return Response(
            {"error": "You must be a teacher to create a room."},
            status=status.HTTP_403_FORBIDDEN
        )

    # Generate meeting_id if not provided
    data = request.data.copy()
    if not data.get('meeting_id'):
        import uuid
        data['meeting_id'] = str(uuid.uuid4())[:8]

    # Check if meeting_id is already taken
    if Room.objects.filter(meeting_id=data['meeting_id']).exists():
        return Response(
            {"error": "This room ID is already taken. Please try another."},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = RoomSerializer(data=data)
    if serializer.is_valid():
        room = serializer.save(teacher=request.user)
        # Add teacher as first participant
        RoomParticipant.objects.create(
            room=room, user=request.user, is_tracking=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_room(request, meeting_id):
    """Join a room using meeting_id"""
    try:
        # Fetch the room by meeting_id
        room = Room.objects.get(meeting_id=meeting_id)

        # Check if room is active
        if not room.is_active:
            return Response(
                {"error": "This room is no longer active"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user is the teacher of this room
        if room.teacher == request.user:
            return Response(
                {"error": "You are the teacher of this room. Please use the teacher dashboard."},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            participant, created = RoomParticipant.objects.get_or_create(
                room=room,
                user=request.user,
                defaults={'is_tracking': True}
            )

            if not created:
                return Response(
                    {"detail": "Already joined this room"},
                    status=status.HTTP_200_OK
                )

            return Response(
                {
                    "detail": "Successfully joined the room",
                    "room": {
                        "meeting_id": room.meeting_id,
                        "name": room.name,
                        "teacher": room.teacher.username
                    }
                },
                status=status.HTTP_201_CREATED
            )

    except Room.DoesNotExist:
        return Response(
            {"error": "Room does not exist"},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_room(request, meeting_id):
    """Leave a room"""
    try:
        room = Room.objects.get(meeting_id=meeting_id)
        participant = RoomParticipant.objects.get(room=room, user=request.user)
        participant.delete()
        return Response({"detail": "Successfully left the room"}, status=status.HTTP_200_OK)
    except Room.DoesNotExist:
        return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)
    except RoomParticipant.DoesNotExist:
        return Response({"error": "You are not in this room"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deactivate_room(request, meeting_id):
    """Deactivate a room (only teachers can deactivate)"""
    try:
        room = Room.objects.get(meeting_id=meeting_id, teacher=request.user)
    except Room.DoesNotExist:
        return Response({"error": "Room not found or you are not the teacher"}, status=status.HTTP_403_FORBIDDEN)

    room.is_active = False
    room.save()
    return Response({"detail": "Room deactivated successfully"}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_participants(request, meeting_id):
    """List all participants in a room"""
    try:
        room = Room.objects.get(meeting_id=meeting_id)
    except Room.DoesNotExist:
        return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)

    participants = RoomParticipant.objects.filter(room=room)
    serializer = RoomParticipantSerializer(participants, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_focus_data(request, meeting_id):
    """Save or update focus data for a student"""
    try:
        # Validate and get required data
        data = request.data.get('data')
        if not data:
            return Response(
                {"error": "Data is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Only students can save their own focus data
        if request.user.role != 'student':
            return Response(
                {"error": "Only students can save their own focus data"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Use select_for_update to prevent race conditions
        with transaction.atomic():
            room = Room.objects.select_for_update().get(meeting_id=meeting_id)

            # Check if user is in the room
            if not RoomParticipant.objects.filter(room=room, user=request.user).exists():
                return Response(
                    {"error": "You are not in this room"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Use update_or_create with select_for_update to handle concurrency
            data_stream, created = DataStream.objects.select_for_update().update_or_create(
                room=room,
                user=request.user,
                defaults={'data': data}
            )

        # Return minimal response to reduce bandwidth
        return Response(
            {"detail": "Saved data successfully", "created": created},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )

    except Room.DoesNotExist:
        return Response(
            {"error": "Room not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        # Log the error for debugging
        logger.error(f"Error saving focus data: {str(e)}")
        return Response(
            {"error": "Internal server error"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_focus_data(request, meeting_id):
    """Get focus data for a specific student"""
    try:
        room = Room.objects.get(meeting_id=meeting_id)
        student_username = request.query_params.get('student_username')

        if not student_username:
            return Response(
                {"error": "student_username is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Only teachers can view focus data
        if request.user.role != 'teacher':
            return Response(
                {"error": "Only teachers can view focus data"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            student = CustomUser.objects.get(username=student_username)
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "Student not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if student is in the room
        if not RoomParticipant.objects.filter(room=room, user=student).exists():
            return Response(
                {"error": "Student is not in this room"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Try to get from cache first
        cache_key = get_cache_key(room.id, student.id)
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(json.loads(cached_data))

        # If not in cache, get from database
        data_stream = DataStream.objects.filter(room=room, user=student).order_by('-timestamp').first()
        if not data_stream:
            return Response(
                {"error": "No focus data found for this student"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = DataStreamSerializer(data_stream)
        response_data = serializer.data

        # Cache the result
        cache.set(cache_key, json.dumps(response_data), FOCUS_DATA_CACHE_TIMEOUT)
        
        return Response(response_data)

    except Room.DoesNotExist:
        return Response(
            {"error": "Room not found"},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_focus_data(request, meeting_id):
    """Get focus data for all students in a room"""
    try:
        room = Room.objects.get(meeting_id=meeting_id)

        # Only teachers can view focus data
        if request.user.role != 'teacher':
            return Response(
                {"error": "Only teachers can view focus data"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Try to get from cache first
        cache_key = get_cache_key(room.id)
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(json.loads(cached_data))

        # If not in cache, get from database
        data_streams = DataStream.objects.filter(room=room).order_by('-timestamp')
        serializer = DataStreamSerializer(data_streams, many=True)
        response_data = serializer.data

        # Cache the result
        cache.set(cache_key, json.dumps(response_data), FOCUS_DATA_CACHE_TIMEOUT)
        
        return Response(response_data)

    except Room.DoesNotExist:
        return Response(
            {"error": "Room not found"},
            status=status.HTTP_404_NOT_FOUND
        )
