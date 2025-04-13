import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Room, RoomParticipant


class RoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.meeting_id = self.scope['url_route']['kwargs']['meeting_id']
        self.room_group_name = f'room_{self.meeting_id}'
        self.user = self.scope['user']

        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        # Check if room exists and user is a participant
        if not await self.is_valid_participant():
            await self.close()
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Accept the connection
        await self.accept()

        # Get current participants
        connected_users = await self.get_connected_users()

        # Send current participants list to the new user
        await self.send(text_data=json.dumps({
            'type': 'connected_users',
            'users': connected_users
        }))

        # Notify others that user has connected
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_connect',
                'message': f'{self.user.username} has joined the room',
                'username': self.user.username,
                'role': self.user.role
            }
        )

    @database_sync_to_async
    def get_connected_users(self):
        """Get list of currently connected users in the room"""
        try:
            room = Room.objects.get(meeting_id=self.meeting_id)
            participants = RoomParticipant.objects.filter(room=room)
            return [{
                'username': p.user.username,
                'role': p.user.role
            } for p in participants]
        except Room.DoesNotExist:
            return []

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type', 'message')
            
            # If it's an admin command
            if message_type == 'admin_command' and await self.is_teacher():
                await self.process_admin_command(data)
                return

            # For regular messages and data
            if message_type == 'message':
                # Broadcast the chat message to the room
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': data.get('message', ''),
                        'username': self.user.username,
                        'timestamp': data.get('timestamp', '')
                    }
                )
            elif message_type == 'data':
                # Send data message to the room
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'data_message',
                        'data': data.get('data', {}),
                        'username': self.user.username,
                        'timestamp': data.get('timestamp', '')
                    }
                )
        except json.JSONDecodeError:
            print(f"Invalid JSON received from {self.user.username}")
        except Exception as e:
            print(f"Error processing message from {self.user.username}: {str(e)}")

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        # Notify others that user has disconnected
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_disconnect',
                'message': f'{self.user.username} has left the room',
                'username': self.user.username
            }
        )

    async def data_message(self, event):
        """Send data to WebSocket"""
        data = event['data']
        username = event.get('username', 'Anonymous')
        user_id = event.get('user_id', None)

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'data',
            'data': data,
            'username': username,
            'user_id': user_id
        }))

    async def user_connect(self, event):
        """Send user connected message to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'user_connect',
            'message': event['message'],
            'username': event['username'],
            'role': event['role']
        }))

    async def chat_message(self, event):
        """Send chat message to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
            'username': event['username'],
            'timestamp': event['timestamp']
        }))

    async def user_disconnect(self, event):
        """Send user disconnected message to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'user_disconnect',
            'message': event['message'],
            'username': event['username']
        }))

    async def admin_command_result(self, event):
        """Send command result to admin"""
        await self.send(text_data=json.dumps({
            'type': 'command_result',
            'success': event['success'],
            'message': event['message'],
            'command': event['command']
        }))

    @database_sync_to_async
    def is_valid_participant(self):
        """Check if room exists and user is a participant"""
        try:
            room = Room.objects.get(meeting_id=self.meeting_id, is_active=True)
            RoomParticipant.objects.get(room=room, user=self.user)
            return True
        except (Room.DoesNotExist, RoomParticipant.DoesNotExist):
            return False

    @database_sync_to_async
    def is_teacher(self):
        """Check if user is teacher for this room"""
        try:
            participant = RoomParticipant.objects.get(
                room__meeting_id=self.meeting_id,
                user=self.user
            )
            return participant.user.role == 'teacher'
        except RoomParticipant.DoesNotExist:
            return False

    # @database_sync_to_async
    # def store_data_stream(self, data):
    #     """Store data in database"""
    #     try:
    #         room = Room.objects.get(id=self.meeting_id)
    #         DataStream.objects.create(
    #             room=room,
    #             user=self.user,
    #             data=data
    #         )
    #     except Room.DoesNotExist:
    #         pass

    async def process_admin_command(self, data):
        """Process admin commands"""
        command = data.get('command')

        if command == 'kick_user':
            user_id = data.get('user_id')
            if user_id:
                success, message = await self.kick_user(user_id)

                # Send result back to admin
                await self.send(text_data=json.dumps({
                    'type': 'command_result',
                    'success': success,
                    'message': message,
                    'command': command
                }))

    @database_sync_to_async
    def kick_user(self, user_id):
        """Admin command to remove a user from the room"""
        try:
            room = Room.objects.get(id=self.meeting_id)
            participant = RoomParticipant.objects.get(
                room=room, user_id=user_id)

            # Don't allow kicking other admins
            if participant.role == 'teacher':
                return False, "Cannot kick another teacher"

            participant.delete()
            return True, f"User {participant.user.username} has been kicked"
        except (Room.DoesNotExist, RoomParticipant.DoesNotExist):
            return False, "User not found in this room"
