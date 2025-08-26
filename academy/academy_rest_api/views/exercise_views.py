import json
import sys
import os
import subprocess
import re
import tempfile
import time
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from django.http import JsonResponse
from django.db.models.functions import Lower
from academy.academy_rest_api.utils import exercise_utils as ExerciseUtils 
from colorama import Fore
from rest_framework.decorators import api_view
from functools import partial

from exercises.models import Exercise

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
    uses_camera = uses_camera_node(hal_code)

    try:
      print("ADD EXERCISE TO DATABASE")
      exerciseDB = ExerciseUtils.createExerciseDatabase(
        exercise_id, exercise_name, exercise_description,
        universe_name, launcher_name, category_id
      )
      if exerciseDB["success"] == 0:
        printError(
          "ERROR ON CREATE EXERCISE (DATABASE)",
          "ERROR: "+exerciseDB["error"],
          "DETAILS: "+exerciseDB["details"]
        )
        return JsonResponse({'error': exerciseDB["error"]}, status=400)

      print("CREATE EXERCISE'S TEMPLATES FILES")
      create_template = partial(ExerciseUtils.createExerciseTemplate, exercise_id, category_id, uses_camera)
      template_result = exercise_utils_executor(
        util_function=create_template,
        exercise_id=exercise_id,
        error_header="ERROR ON CREATE EXERCISE (TEMPLATE)",
      )
      if template_result is not None:
        return template_result
    
      
      print("CREATE EXERCISE'S STATIC FILES")
      create_static = partial(ExerciseUtils.createExerciseStatic,exercise_id, hal_code, teaser_image_file, uses_camera)
      static_result = exercise_utils_executor(
        util_function=create_static,
        exercise_id=exercise_id,
        error_header="ERROR ON CREATE EXERCISE (STATIC)",
      )
      if static_result is not None:
        return static_result
      
      print("REBUILD EXERCISES WEB FILES")
      rebuild_response = rebuild_frontend()
      if rebuild_response.get("success") == 0:
        rollback_result = creationRollback(exercise_id)
        if rollback_result.get("success") == 0:
          return JsonResponse({'error': 'Fail to create exercise AND fail to rollback. Please contact admin.'}, status=500)
        else:
          return JsonResponse({'error': 'Fail to create exercise.'}, status=500)
     
      print("CREATE LAUNCHER FILE")
      create_launcher = partial(ExerciseUtils.createExerciseLauncher,launcher_name)
      launcher_result = exercise_utils_executor(
        util_function=create_launcher,
        exercise_id=exercise_id,
        error_header="ERROR ON CREATE EXERCISE (LAUNCHER)"
      )
      if launcher_result is not None:
        return launcher_result
      

      print("CREATE WORLD FILE")
      create_world = partial(ExerciseUtils.createExerciseWorld,launcher_name, world_file)
      world_result = exercise_utils_executor(
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
      guide_page_result = exercise_utils_executor(
        util_function=create_guide_page,
        exercise_id=exercise_id,
        error_header="ERROR ON CREATE EXERCISE GUIDE PAGE"
      )
      if guide_page_result is not None:
        return guide_page_result

      return JsonResponse({'message': 'Exercise created!'})
    
    except Exception as e:
      printError(
        "ERROR ON CREATE EXERCISE",
        "ERROR: Unexpected problem",
        "DETAILS: "+str(e),
      )

      rollback_result = creationRollback(exercise_id)
      if rollback_result.get("success") == 0:
        return JsonResponse({'error': 'Fail to create exercise AND fail to rollback. Please contact admin.'}, status=500)
      else:
        return JsonResponse({'error': 'Fail to create exercise, unexpected problem on API'}, status=500)
  
  return JsonResponse({'error': 'Method not permited, must be POST.'}, status=405)


@api_view(["DELETE"])
def delete_exercise(request, exercise_name):
  if request.method == "DELETE":

    if not exercise_name:
        return JsonResponse({'error': 'Exercise name is required.'}, status=400)

    try:
      print("REMOVING EXERCISE")

      #This function already have a rollback inside
      exercise_removal = ExerciseUtils.deleteExercise(exercise_name)

      if exercise_removal["success"] == 0:
        printError(
          "ERROR ON REMOVE EXERCISE",
          "ERROR: "+exercise_removal["error"],
          "DETAILS: "+exercise_removal["details"],
        )
        message =  "There is no exercise with this name" if exercise_removal["exists"] == 0 else "Fail to delete exercise, contact API suport"
        http_status = 400 if exercise_removal["exists"] == 0 else 500
        return JsonResponse({'error': f'{message}'}, status=http_status)
      
      print("REBUILDING FRONTEND")
      rebuild_response = rebuild_frontend()
      if rebuild_response["success"] == 0:
        return JsonResponse(
          {'error': 'Exercise was deleted, but rebuild on frontend fail.'}, 
          status=500
        )

      return JsonResponse({'message': 'Exercise deleted!'})
    
    except Exception as e:
      printError(
        "ERROR ON DELETE EXERCISE",
        "ERROR: Unexpected problem",
        "DETAILS: "+str(e),
      )
      
      return JsonResponse(
        {'error': 'Fail to delete exercise. Unexpected problem on API, please contact suport '},
        status=500
      )
  
  return JsonResponse({'error': 'Method not permited, must be DELETE.'}, status=405)


def check_name_availability(request, name):
  if request.method == "GET":
    if not name:
      return JsonResponse({'error': 'Exercise name is required.'}, status=400)
    
    try:
      #Verify if exercise with give name exists, the search is case insensitive
      exercise_exists = Exercise.objects.filter(name__iexact=name).exists()
      
      return JsonResponse({'message': 'Exercise found.', 'exists': exercise_exists})
    except Exception as e:
        return JsonResponse({'error': 'Fail to find exercise by name.'}, status=500)

  else:
    return JsonResponse({'error': 'Method not permited, must be GET.'}, status=405)


# BELLOW HERE IS LOCAL FUNCTION

# Function that verify if hal code uses camera node
def uses_camera_node(hal_code):

  import_line = "from hal_interfaces.general.camera import CameraNode"
  
  linhas = hal_code.splitlines()
  
  for linha in linhas:
      if linha.strip() == import_line:
          return True
      
  return False

# Function rebuild frontend pages, usually used an exercise page are created
# or deleted
def rebuild_frontend():
  try:
    env = os.environ.copy()

    # Don't let warnings to trigger exit code 1
    build_cmd = ['yarn', 'run', 'build']
    env['CI'] = 'false'
    env['NODE_OPTIONS'] = '--max-old-space-size=1024'

    t0 = time.monotonic()

    # Generate a temporary file to not overload  RAM with logs
    with tempfile.NamedTemporaryFile(prefix='yarn-build-', suffix='.log', delete=False) as lf:
      log_path = lf.name

    with open(log_path, 'w+', buffering=1) as logf:
      build_result = subprocess.run(
        build_cmd,
        cwd='/RoboticsAcademy/react_frontend',
        stdout=logf,
        stderr=subprocess.STDOUT,
        text=True,
        check=False,
        timeout=900,
        env=env,
      )
    
    # Get the last 80 lines of build logs and
    # and saves on tmp file
    tail_lines = []
    try:
      with open(log_path, 'r') as logf:
        lines = logf.readlines()
        tail_lines = lines[-80:]
    except Exception:
      tail_lines = ["<failed to read build log>"]

    build_duration = time.monotonic() - t0
    print("----------------")
    print(f"yarn build exit={build_result.returncode} duration={build_duration:.1f}s log={log_path}")
    print("---- yarn build (tail) ----\n" + "".join(tail_lines) + "---- end ----")

    if build_result.returncode != 0:
      printError(
        "ERROR ON CREATE EXERCISE (REBUILDING)",
        "ERROR: Fail to rebuild pages",
        f"DETAILS (exit {build_result.returncode}) — see log: {log_path}"
      )
      return {'success': 0}
    
    # Show warnings
    combined_tail = "".join(tail_lines)
    if re.search(r'(entrypoint size limit|asset size limit|Compiled with warnings|WARNING\b)', combined_tail, re.I):
      print("Build had warnings — continuing execution. See log:", log_path)

    return {'success': 1}
  
  except subprocess.TimeoutExpired as e:
    printError(
      "ERROR ON CREATE EXERCISE (REBUILDING)",
      "ERROR: Timeout running yarn build",
      f"DETAILS: {str(e)}"
    )
    return {'success': 0}

  except Exception as e:
    printError(
      "ERROR ON CREATE EXERCISE (REBUILDING)",
      "ERROR: Fail to rebuild pages, unexpected error",
      "DETAILS: " + str(e)
    )
    return {'success': 0}

# FUNCTION RESPONSIBLE FOR EXECUTES OTHER FUNCTIONS RELATED TO CREATE NEW EXERCISE
# CASE THE UTIL_FUCTION FAIL, A ROLLBACK IS MADE ON DB AND SERVER FILES
def exercise_utils_executor(util_function, exercise_id, error_header):

  result = util_function()

  if result["success"] == 0:
    rollback_result = creationRollback(exercise_id)
    if rollback_result["success"] == 0:
      return JsonResponse({'error': 'Fail to create exercise AND to rollback. Please contact suport.'}, status=500)
    
    printError(
      f"{error_header}",
      "ERROR: "+result["error"],
      "DETAILS: "+result["details"]
    )

    return JsonResponse({'error': 'Fail to create exercise. Please contact suport.'}, status=500)
  else:
    return None

def creationRollback(exercise_name):
  delete_result = ExerciseUtils.createExerciseRollback(exercise_name)
  if delete_result["success"] == 0:
    printError(
      "ERROR ON CLEANUP AFTER CREATE FAILURE",
      "ERROR: "+delete_result["error"],
      "DETAILS: "+delete_result["details"]
    )
    return {'success': 0, }
  else:
    return {'success': 1, }

def printError(head, error, details):
  print("--------------------------")
  print(head)
  print(error)
  print(details)
  print("--------------------------")
