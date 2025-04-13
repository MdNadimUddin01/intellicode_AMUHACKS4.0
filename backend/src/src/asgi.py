import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from meeting_room.middleware import TokenAuthMiddlewareStack
import meeting_room.routing as websocket_app

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'src.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": TokenAuthMiddlewareStack(
        URLRouter(websocket_app.websocket_urlpatterns)
    ),
})
