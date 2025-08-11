import json
import sys
import os
import subprocess
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from django.http import JsonResponse
from academy.academy_rest_api.utils import exercise_utils as ExerciseUtils 
from colorama import Fore
from rest_framework.decorators import api_view
from functools import partial

from exercises.models import Exercise


def create_exercise(request):
  if request.method == 'POST':
    try:
      #exercise_name_id = request.POST.get('exerciseId')

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
      create_template = partial(ExerciseUtils.createExerciseTemplate, exercise_id, category_id)
      template_result = exercise_utils_executor(
        util_function=create_template,
        exercise_id=exercise_id,
        error_header="ERROR ON CREATE EXERCISE (TEMPLATE)",
      )
      if template_result["success"] == 0:
        if template_result["rollback"] == 0:
          return JsonResponse({'error': 'Fail to create exercise AND to rollback. Please contact admin.'}, status=500)
        return JsonResponse({'error': 'Fail to create exercise'}, status=500)
    
      
      print("CREATE EXERCISE'S STATIC FILES")
      create_static = partial(ExerciseUtils.createExerciseStatic,exercise_id, hal_code, teaser_image_file)
      static_result = exercise_utils_executor(
        util_function=create_static,
        exercise_id=exercise_id,
        error_header="ERROR ON CREATE EXERCISE (STATIC)",
      )
      if static_result["success"] == 0:
        if static_result["rollback"] == 0:
          return JsonResponse({'error': 'Fail to create exercise AND to rollback. Please contact admin.'}, status=500)
        return JsonResponse({'error': 'Fail to create exercise'}, status=500)
      

      print("BUILD EXERCISES WEB FILES")
      try:
        build_result = subprocess.run(
            ['yarn', 'run', 'build'],
            cwd='/RoboticsAcademy/react_frontend',
            capture_output=True,
            text=True,
            check=False
        )

        if build_result.returncode != 0:
          rollback_result = creationRollback(exercise_id)
          if rollback_result["success"] == 0:
            return JsonResponse( {'error': 'Fail to create exercise AND fail to rollback. Please contact admin.'},status=500)

          printError(
              "ERROR ON CREATE EXERCISE (REBUILDING)",
              "ERROR: Fail to rebuild pages",
              f"DETAILS: {build_result.stderr}"
          )
          return JsonResponse({'error': 'Fail to create exercise'}, status=500)

        if ("WARNING in entrypoint size limit" in build_result.stderr and build_result.returncode == 0):
          print("Detected warning in entrypoint size limit — Continuing execution.")

      except Exception as e:
        rollback_result = creationRollback(exercise_id)
        if rollback_result["success"] == 0:
          return JsonResponse({'error': 'Fail to create exercise AND fail to rollback. Please contact admin.'}, status=500)
        
        printError(
            "ERROR ON CREATE EXERCISE (REBUILDING)",
            "ERROR: Fail to rebuild pages",
            "DETAILS: "+str(e)
        )
        return JsonResponse({'error': 'Fail to create exercise'}, status=500)
      

      print("CREATE LAUNCHER FILE")
      create_launcher = partial(ExerciseUtils.createExerciseLauncher,launcher_name)
      launcher_result = exercise_utils_executor(
        util_function=create_launcher,
        exercise_id=exercise_id,
        error_header="ERROR ON CREATE EXERCISE (LAUNCHER)"
      )
      if launcher_result["success"] == 0:
        if launcher_result["rollback"] == 0:
          return JsonResponse({'error': 'Fail to create exercise AND to rollback. Please contact admin.'}, status=500)
        return JsonResponse({'error': 'Fail to create exercise'}, status=500)
      

      print("CREATE WORLD FILE")
      create_world = partial(ExerciseUtils.createExerciseWorld,launcher_name, world_file)
      world_result = exercise_utils_executor(
        util_function=create_world,
        exercise_id=exercise_id,
        error_header="ERROR ON CREATE EXERCISE (WORLD)"
      )
      if world_result["success"] == 0:
        if world_result["rollback"] == 0:
          return JsonResponse({'error': 'Fail to create exercise AND to rollback. Please contact admin.'}, status=500)
        return JsonResponse({'error': 'Fail to create exercise'}, status=500)
      

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
      if guide_page_result["success"] == 0:
        if guide_page_result["rollback"] == 0:
          return JsonResponse({'error': 'Fail to create exercise AND to rollback. Please contact admin.'}, status=500)
        return JsonResponse({'error': 'Fail to create exercise'}, status=500)
      

      return JsonResponse({'message': 'Exercise created!'})
    
    except Exception as e:
      return JsonResponse({'error': 'Fail to create exercise, unexpected problem on API'}, status=500)
  
  return JsonResponse({'error': 'Method not permited, must be POST.'}, status=405)

@api_view(["DELETE"])
def delete_exercise(request, exercise_name):
  if request.method == "DELETE":
    if not exercise_name:
      return JsonResponse({'error': 'Exercise name is required.'}, status=400)
    
    exercise_removal = ExerciseUtils.deleteExercise(exercise_name)
    if exercise_removal["success"] == 0:
      printError(
          "ERROR ON REMOVE EXERCISE",
          "ERROR: "+exercise_removal["error"],
          "DETAILS: "+exercise_removal["details"],
      )
      message =  "There is no exercise with this name" if exercise_removal["exists"] == 0 else "Fail to delete exercise"
      return JsonResponse({'error': f'{message}'}, status=400)
    
    return JsonResponse({'message': 'Exercise deleted!'})
  
  return JsonResponse({'error': 'Method not permited, must be DELETE.'}, status=405)

def find_by_name(request, name):
   if request.method == "GET":
      if not name:
        return JsonResponse({'error': 'Exercise name is required.'}, status=400)
      
      try:
        exercise = Exercise.objects.filter(name=name).values().first()
        return JsonResponse({'message': 'Exercise found.', 'exercise': exercise})
      except Exception as e:
         return JsonResponse({'error': 'Fail to find exercise by name.'}, status=500)
  
   else:
      return JsonResponse({'error': 'Method not permited, must be GET.'}, status=405)

#BELLOW HERE IS LOCAL FUNCTION

def exercise_utils_executor(util_function, exercise_id, error_header):
  result = util_function()
  if result["success"] == 0:
    rollback_result = creationRollback(exercise_id)
    if rollback_result["success"] == 0:
      return {'success': 0, 'rollback': 0}
    printError(
      f"{error_header}",
      "ERROR: "+result["error"],
      "DETAILS: "+result["details"]
    )
    return {'success': 0, 'rollback': 1, 'error':result["error"] }
  else:
    return {'success': 1, }

def creationRollback(exercise_name):
  delete_result = ExerciseUtils.deleteExercise(exercise_name)
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
