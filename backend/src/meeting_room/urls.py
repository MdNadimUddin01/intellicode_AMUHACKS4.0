from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    login_user,
    register_user,
    create_room,
    join_room,
    leave_room,
    deactivate_room,
    list_participants,
    save_focus_data,
    get_focus_data,
    get_all_focus_data
)

router = DefaultRouter()

urlpatterns = [
    path('login/', login_user, name='login'),
    # path('logout/', views.logout_view, name='logout'),
    path('register/', register_user, name='register'),
    path('classroom/create/', create_room, name='create-room'),
    # path('classroom/', views.room_list_create, name='room-list-create'),
    path('classroom/<str:meeting_id>/join/', join_room, name='join-room'),
    path('classroom/<str:meeting_id>/leave/', leave_room, name='leave-room'),
    path('classroom/<str:meeting_id>/deactivate/', deactivate_room, name='deactivate-room'),
    path('classroom/<str:meeting_id>/participants/', list_participants, name='list-participants'),
    path('classroom/<str:meeting_id>/focus-data/', save_focus_data, name='save-focus-data'),
    path('classroom/<str:meeting_id>/get-focus-data/', get_focus_data, name='get-focus-data'),
    path('classroom/<str:meeting_id>/get-all-focus-data/', get_all_focus_data, name='get-all-focus-data'),
]
