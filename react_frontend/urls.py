from django.urls import path

from react_frontend import views

urlpatterns = [
    # path('', views.exercises, name='exercises'),
    path('exercises/', views.exercises, name='exercises'),
    path('login/', views.login, name='login'),
    path('createExercise/', views.create_exercise, name='create_exercise'),
]
