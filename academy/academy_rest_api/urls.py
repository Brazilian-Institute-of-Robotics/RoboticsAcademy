from rest_framework import routers
from django.urls import path, include
from . import views

from academy.academy_rest_api.views.exercises import ExerciseViewSet
from academy.academy_rest_api.views import auth_views, exercise_views, universe_views, hal_views, node_type_views, guide_page_category_views

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
    path('login/', auth_views.user_login),
    path('logout/', auth_views.user_logout),
    path('exercise/', exercise_views.create_exercise),
    path('exercise/<str:exercise_name>/', exercise_views.delete_exercise),
    path('exercise/findByName/<str:name>/', exercise_views.find_by_name),
    path('universe/findByName/<str:name>/', universe_views.find_by_name),
    path('guideCategory/findAll/', guide_page_category_views.get_all),
    path('hal/', hal_views.generate_hal),
    path('node/', node_type_views.get_all_nodes)
]
