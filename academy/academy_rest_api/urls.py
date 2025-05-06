from rest_framework import routers
from django.urls import path
from . import views
from . import function_views

from academy.academy_rest_api.views.exercises import ExerciseViewSet

router = routers.SimpleRouter()
router.register(r'exercises', ExerciseViewSet)

#path('start_manager/',function_views.start_user_container)

urlpatterns = router.urls +[
    path('login/', function_views.user_login),
    path('logout/', function_views.user_logout)
]
