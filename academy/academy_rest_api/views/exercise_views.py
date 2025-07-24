import json
import sys
import os
import subprocess
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from django.http import JsonResponse
from academy.academy_rest_api.utils import exercise_utils as ExerciseUtils 
from colorama import Fore
from rest_framework.decorators import api_view

def create_exercise(request):
  if request.method == 'POST':
    exercise_name = request.POST.get('name')
    hal_code = request.POST.get('hal_code')
    world_file = request.FILES.get('world_file')

    if not exercise_name:
        return JsonResponse({'error': 'Exercise name is required.'}, status=400)
    if not world_file:
        return JsonResponse({'error': 'World file is required.'}, status=400)
    if not hal_code:
       return JsonResponse({'error': 'HAL code is required.'}, status=400)
    
    # ADD EXERCISE ON DATABASE
    exerciseDB = ExerciseUtils.createExerciseDatabase(exercise_name)
    if exerciseDB["success"] == 0:
      printError(
            "ERROR ON CREATE EXERCISE (DATABASE)",
            "ERROR: "+exerciseDB["error"],
            "DETAILS: "+exerciseDB["details"]
      )
      message =  "There is exercise with same name" if exerciseDB["exists"] == 1 else "Fail to delete exercise"
      return JsonResponse({'error': message}, status=400)

    # CREATE EXERCISE'S TEMPLATES FILES
    template = ExerciseUtils.createExerciseTemplate(exercise_name)
    if template["success"] == 0:
        
        rollback_result = creationRollback(exercise_name)
        if rollback_result["success"] == 0:
          return JsonResponse({'error': 'Fail to create exercise AND fail to rollback. Please contact admin.'}, status=500)
        
        printError(
            "ERROR ON CREATE EXERCISE (TEMPLATE)",
            "ERROR: "+template["error"],
            "DETAILS: "+template["details"]
        )
        return JsonResponse({'error': 'Fail to create exercise'}, status=400)
    
    # CREATE EXERCISE'S STATIC FILES
    static = ExerciseUtils.createExerciseStatic(exercise_name, hal_code)
    if static["success"] == 0:
        
        rollback_result = creationRollback(exercise_name)
        if rollback_result["success"] == 0:
          return JsonResponse({'error': 'Fail to create exercise AND fail to rollback. Please contact admin.'}, status=500)
        
        printError(
            "ERROR ON CREATE EXERCISE (STATIC)",
            "ERROR: "+static["error"],
            "DETAILS: "+static["details"]
        )
        return JsonResponse({'error': 'Fail to create exercise'}, status=400)
    
    # BUILD EXERCISES WEB FILES
    try:
        subprocess.run(
            ['yarn', 'run', 'build'],
            cwd='/RoboticsAcademy/react_frontend',
            check=True
        )
    except subprocess.CalledProcessError as e:
        
        rollback_result = creationRollback(exercise_name)
        if rollback_result["success"] == 0:
          return JsonResponse({'error': 'Fail to create exercise AND fail to rollback. Please contact admin.'}, status=500)
        
        printError(
            "ERROR ON CREATE EXERCISE (REBUILDING)",
            "ERROR: Fail to rebuild pages",
            "DETAILS: "+str(e)
        )
        return JsonResponse({'error': 'Fail to create exercise'}, status=500)
    
    # CREATE LAUNCHER FILE
    launcher = ExerciseUtils.createExerciseLauncher(exercise_name)
    if launcher["success"] == 0:
        
        rollback_result = creationRollback(exercise_name)
        if rollback_result["success"] == 0:
          return JsonResponse({'error': 'Fail to create exercise AND fail to rollback. Please contact admin.'}, status=500)
        
        printError(
            "ERROR ON CREATE EXERCISE (LAUNCHER)",
            "ERROR: "+launcher["error"],
            "DETAILS: "+launcher["details"]
        )
        return JsonResponse({'error': 'Fail to create exercise'}, status=400)
    
    # CREATE WORLD FILE
    world = ExerciseUtils.createExerciseWorld(exercise_name, world_file)
    if world["success"] == 0:
        
        rollback_result = creationRollback(exercise_name)
        if rollback_result["success"] == 0:
          return JsonResponse({'error': 'Fail to create exercise AND fail to rollback. Please contact admin.'}, status=500)
        
        printError(
            "ERROR ON CREATE EXERCISE (WORLD)",
            "ERROR: "+world["error"],
            "DETAILS: "+world["details"]
        )
        return JsonResponse({'error': 'Fail to create exercise'}, status=400)
    
    return JsonResponse({'message': 'Exercise created!'})
  
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

def printError(head, error, details):
  print("--------------------------")
  print(head)
  print(error)
  print(details)
  print("--------------------------")

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
