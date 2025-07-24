from rest_framework import routers
from django.urls import path, include
from . import views
from . import function_views

from academy.academy_rest_api.views.exercises import ExerciseViewSet

router = routers.SimpleRouter()
router.register(r'exercises', ExerciseViewSet)

#path('start_manager/',function_views.start_user_container)

# urlpatterns = router.urls +[
#     path('login/', function_views.user_login),
#     path('logout/', function_views.user_logout),
#     path('exercise/', function_views.create_exercise),
#     path('exercise/<str:exercise_name>/', function_views.delete_exercise),
# ]

urlpatterns = [
    path('', include(router.urls)),
    path('login/', function_views.user_login),
    path('logout/', function_views.user_logout),
    path('exercise/', function_views.create_exercise),
    path('exercise/<str:exercise_name>/', function_views.delete_exercise),
    path('hal/', function_views.generate_hal),
]
