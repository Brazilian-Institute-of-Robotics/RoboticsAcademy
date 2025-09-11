from django.urls import path
from django.contrib.auth import views as auth_views
from react_frontend import views

urlpatterns = [
    # path('', views.exercises, name='exercises'),
    path('exercises/', views.exercises, name='exercises'),
    path('login/', views.login, name='login'),
    path('exerciseListCrud/', views.exercise_list_crud, name='exercise_list_crud'),
    path('createExercise/', views.create_exercise, name='create_exercise'),
    path('password-reset-request/', views.password_reset_request, name='password_reset_request'),
    path('password-reset-confirm/<uid>/<token>/', views.password_reset_confirm, name='password_reset_confirm'),
]
