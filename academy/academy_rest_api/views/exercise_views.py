import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from django.http import JsonResponse
from rest_framework.decorators import api_view
from functools import partial
from threading import Thread

from academy.academy_rest_api.utils import exercise_utils as ExerciseUtils 
from academy.academy_rest_api.utils.rebuild_coordinator import RebuildCoordinator

from exercises.models import Exercise

@api_view(["POST"])
def create_exercise(request):
  if request.method == 'POST':

    exercise_name = request.POST.get('exerciseName').strip()
    exercise_description = request.POST.get('description').strip() or ""
    universe_name = request.POST.get('universe_name').strip()
    hal_code = request.POST.get('halCode')
    world_file = request.FILES.get('worldFile')
    teaser_image_file = request.FILES.get('teaser_image_file')
    category_id = request.POST.get('category_id')
    guide_page_files = request.FILES.getlist('guide_page_files')
    guide_page_code = request.POST.get('guide_page_code')

    if not exercise_name:
      return JsonResponse({'error': 'Exercise name is required.'}, status=400)
    if not universe_name:
      return JsonResponse({'error': 'Universe name is required.'}, status=400)
    if not world_file:
      return JsonResponse({'error': 'World file is required.'}, status=400)
    if not hal_code:
      return JsonResponse({'error': 'HAL code is required.'}, status=400)
    if not teaser_image_file:
      return JsonResponse({'error': 'Teaser image file is required.'}, status=400)
    if not category_id:
      return JsonResponse({'error': 'Category id is required.'}, status=400)
    if not guide_page_code:
      return JsonResponse({'error': 'Guide page code is required.'}, status=400)
    
    exercise_id = exercise_name.lower().replace(" ", "_")
    launcher_name = universe_name.lower().replace(" ", "_")

    #Verify if HAL code contain camera node and return a bool
    uses_camera = _uses_camera_node(hal_code)

    try:
      print("ADD EXERCISE TO DATABASE")
      exerciseDB = ExerciseUtils.createExerciseDatabase(
        exercise_id, exercise_name, exercise_description,
        universe_name, launcher_name, category_id
      )
      if exerciseDB["success"] == 0:
        _printError(
          "ERROR ON CREATE EXERCISE (DATABASE)",
          "ERROR: "+exerciseDB["error"],
          "DETAILS: "+exerciseDB["details"]
        )
        return JsonResponse({'error': exerciseDB["error"]}, status=400)

      print("CREATE EXERCISE'S TEMPLATES FILES")
      create_template = partial(ExerciseUtils.createExerciseTemplate, exercise_id, category_id, uses_camera)
      template_result = _exercise_utils_executor(
        util_function=create_template,
        exercise_id=exercise_id,
        error_header="ERROR ON CREATE EXERCISE (TEMPLATE)",
      )
      if template_result is not None:
        return template_result
    
      
      print("CREATE EXERCISE'S STATIC FILES")
      create_static = partial(ExerciseUtils.createExerciseStatic,exercise_id, hal_code, teaser_image_file, uses_camera)
      static_result = _exercise_utils_executor(
        util_function=create_static,
        exercise_id=exercise_id,
        error_header="ERROR ON CREATE EXERCISE (STATIC)",
      )
      if static_result is not None:
        return static_result
    
      print("CREATE LAUNCHER FILE")
      create_launcher = partial(ExerciseUtils.createExerciseLauncher,launcher_name)
      launcher_result = _exercise_utils_executor(
        util_function=create_launcher,
        exercise_id=exercise_id,
        error_header="ERROR ON CREATE EXERCISE (LAUNCHER)"
      )
      if launcher_result is not None:
        return launcher_result
      

      print("CREATE WORLD FILE")
      create_world = partial(ExerciseUtils.createExerciseWorld,launcher_name, world_file)
      world_result = _exercise_utils_executor(
        util_function=create_world,
        exercise_id=exercise_id,
        error_header="ERROR ON CREATE EXERCISE (WORLD)"
      )
      if world_result is not None:
        return world_result
      
      print("ADD GUIDE PAGE")
      create_guide_page = partial(
        ExerciseUtils.createExerciseGuidePage, 
        exercise_id, exercise_name, exercise_description, 
        category_id, guide_page_files, guide_page_code, 
        teaser_image_file
      )
      guide_page_result = _exercise_utils_executor(
        util_function=create_guide_page,
        exercise_id=exercise_id,
        error_header="ERROR ON CREATE EXERCISE GUIDE PAGE"
      )
      if guide_page_result is not None:
        return guide_page_result
      
      print("REBUILDING FRONTEND")
      RebuildCoordinator.trigger()

      return JsonResponse({'message': 'Exercise created!'})
    
    except Exception as e:
      _printError(
        "ERROR ON CREATE EXERCISE",
        "ERROR: Unexpected problem",
        "DETAILS: "+str(e),
      )

      rollback_result = _creationRollback(exercise_id)
      if rollback_result.get("success") == 0:
        return JsonResponse({'error': 'Fail to create exercise AND fail to rollback. Please contact admin.'}, status=500)
      else:
        return JsonResponse({'error': 'Fail to create exercise, unexpected problem on API'}, status=500)
  
  return JsonResponse({'error': 'Method not permited, must be POST.'}, status=405)


@api_view(["DELETE"])
def delete_exercise(request, id):
  if request.method == "DELETE":

    if not id:
      return JsonResponse({'error': 'Exercise name is required.'}, status=400)

    try:
      print("REMOVING EXERCISE")

      id = int(id)
      exercise_removal = ExerciseUtils.deleteExercise(id)

      if exercise_removal["success"] == 0:
        _printError(
          "ERROR ON REMOVE EXERCISE",
          "ERROR: "+exercise_removal["error"],
          "DETAILS: "+exercise_removal["details"],
        )
        message =  "There is no exercise with this id" if exercise_removal["exists"] == 0 else "Fail to delete exercise, contact API suport"
        http_status = 400 if exercise_removal["exists"] == 0 else 500
        return JsonResponse({'error': f'{message}'}, status=http_status)
      
      print("REBUILDING FRONTEND")
      RebuildCoordinator.trigger()

      return JsonResponse({'message': 'Exercise deleted!'})
    
    except Exception as e:
      _printError(
        "ERROR ON DELETE EXERCISE",
        "ERROR: Unexpected problem",
        "DETAILS: "+str(e),
      )
      
      return JsonResponse(
        {'error': 'Fail to delete exercise. Unexpected problem on API, please contact suport '},
        status=500
      )
  
  return JsonResponse({'error': 'Method not permited, must be DELETE.'}, status=405)

@api_view(["GET"])
def get_exercise_list(request):
  if request.method == "GET":
    try:
      exercises = Exercise.objects.all()\
        .select_related('guide_page_category')\
        .prefetch_related('universes')
      

      data = []
      for exercise in exercises:
          exercise_data = {
              'id': exercise.id,
              'exercise_id': exercise.exercise_id,
              'name': exercise.name,
              'description': exercise.description,
              'tags': exercise.tags,
              'status': exercise.status,
              'template': exercise.template,
              'guide_page_category': {
                  'id': exercise.guide_page_category.id,
                  'name': exercise.guide_page_category.name
              },
              'universes': [
                  {
                      'id': universe.id,
                      'name': universe.name
                  } for universe in exercise.universes.all()
              ]
          }
          data.append(exercise_data)

      return  JsonResponse(data, safe=False, status=200)
    except Exception as e:
       print(e)
       return JsonResponse({'error': 'Fail to find to get list of exercises.'}, status=500)
  else:
    return JsonResponse({'error': 'Method not permited, must be GET.'}, status=405)


def check_name_availability(request, name):
  if request.method == "GET":
    if not name:
      return JsonResponse({'error': 'Exercise name is required.'}, status=400)
    
    try:
      exercise_id = name.lower().replace(" ", "_")

      #Verify if exercise with give name exists, the search is case insensitive
      exercise_name_exists = Exercise.objects.filter(name__iexact=name).exists()

      #Verify if exercise with give exercise_id, the search is case insensitive
      exercise_exercise_id_exists = Exercise.objects.filter(exercise_id__iexact=exercise_id).exists()

      exists = exercise_name_exists or exercise_exercise_id_exists
      
      return JsonResponse({'message': 'Exercise found.', 'exists': exists})
    except Exception as e:
        return JsonResponse({'error': 'Fail to find exercise by name.'}, status=500)

  else:
    return JsonResponse({'error': 'Method not permited, must be GET.'}, status=405)

@api_view(["PATCH"])
def change_activity(request, id):
  if request.method == "PATCH":
    if not id:
      return JsonResponse({'error': 'Exercise id is required.'}, status=400)
    
    try:
      result = ExerciseUtils.changeActivity(id)
      if result.get("success") == 0:
        _printError(
          "ERROR ON CHANGE EXERCISE STATUS",
          "ERROR: "+result["error"],
          "DETAILS: "+result["details"],
        )
        message =  result["error"] if result["exists"] == 0 else "Fail to change exercise status, contact API suport"
        http_status = 400 if result["exists"] == 0 else 500
        return JsonResponse({'error': f'{message}'}, status=http_status)
      
      return JsonResponse({'message': 'Exercise status updated', 'newStatus': result["newStatus"]})
    
    except Exception as e:
      return JsonResponse({'error': 'Fail to find exercise by name.'}, status=500)

  else:
    return JsonResponse({'error': 'Method not permited, must be .'}, status=405)


# BELLOW HERE IS LOCAL FUNCTION

# Function that verify if hal code uses camera node
def _uses_camera_node(hal_code):

  import_line = "from hal_interfaces.general.camera import CameraNode"
  
  linhas = hal_code.splitlines()
  
  for linha in linhas:
      if linha.strip() == import_line:
          return True
      
  return False

# FUNCTION RESPONSIBLE FOR EXECUTES OTHER FUNCTIONS RELATED TO CREATE NEW EXERCISE
# CASE THE UTIL_FUCTION FAIL, A ROLLBACK IS MADE ON DB AND SERVER FILES
def _exercise_utils_executor(util_function, exercise_id, error_header):

  result = util_function()

  if result["success"] == 0:
    rollback_result = _creationRollback(exercise_id)
    if rollback_result["success"] == 0:
      return JsonResponse({'error': 'Fail to create exercise AND to rollback. Please contact suport.'}, status=500)
    
    _printError(
      f"{error_header}",
      "ERROR: "+result["error"],
      "DETAILS: "+result["details"]
    )

    return JsonResponse({'error': 'Fail to create exercise. Please contact suport.'}, status=500)
  else:
    return None

def _creationRollback(exercise_name):
  delete_result = ExerciseUtils.createExerciseRollback(exercise_name)
  if delete_result["success"] == 0:
    _printError(
      "ERROR ON CLEANUP AFTER CREATE FAILURE",
      "ERROR: "+delete_result["error"],
      "DETAILS: "+delete_result["details"]
    )
    return {'success': 0, }
  else:
    return {'success': 1, }

def _printError(head, error, details):
  print("--------------------------")
  print(head)
  print(error)
  print(details)
  print("--------------------------")
