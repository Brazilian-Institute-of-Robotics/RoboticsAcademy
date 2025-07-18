import json
import docker
import time
import sys
import os
import shutil
import subprocess
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from django.http import JsonResponse
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from pathlib import Path
from utils import docker_utils as DockerUtils
from utils import exercise_utils as ExerciseUtils 
from colorama import Fore
from exercises.models import Exercise
from rest_framework.decorators import api_view

def user_login(request):
  if request.method == 'POST':

    data = json.loads(request.body)
    username = data.get('username')
    password = data.get('password')

    try:
      user = authenticate(username=username, password=password)
      if user:
        create_container = DockerUtils.startUserContainer(user.id)
        
        if(create_container["success"] == 0):
            type = create_container["error_type"]
            message = create_container["error_message"]

            print(Fore.RED + f"FAIL TO CREATE USER'S CONTAINER (ID = {user.id}). ERROR DETAILS:")
            print(Fore.RED + f"API Error type: {type}")
            print(Fore.RED + f"API Error message: {message}")

            return JsonResponse({'status': 'error', 'message':"Fail to create user's container"}, status=500)
      
        login(request, user)
        return JsonResponse({'status': 'success', 'container-ports':create_container["ports"]})
      else:
        return JsonResponse({'status': 'error', 'message': "User not found, wrong credentials"}, status=404)
    except Exception as e:
     print(Fore.RED + f"API Error type: {type(e).__name__}")
     print(Fore.RED + f"API Error message: {str(e)}") 
     return JsonResponse({'status': 'error', 'message': "Unexpected error on API, please call developers"}, status=500)
  else:
     return JsonResponse({'status': 'error', 'message': "Site must use method POST in endpoint /api/v1/login/"}, status=405)
       
    
  
def user_logout(request):
    if request.method == 'POST':
      try:
        if request.user.is_authenticated:
          user_id = request.user.id
          delete_container = DockerUtils.deleteUserContainer(user_id)
          
          if(delete_container["success"] == 0):
              type = delete_container["error_type"]
              message = delete_container["error_message"]

              print(Fore.RED + f"FAIL TO DELETE USER'S CONTAINER (ID = {user_id}). ERROR DETAILS:")
              print(Fore.RED + f"API Error type: {type}")
              print(Fore.RED + f"API Error message: {message}")
              
              #return JsonResponse({'status': 'error', 'message':"Fail to delete user's container"}, status=500)
          
          logout(request)
          return JsonResponse({'status': 'success', 'message': 'Logout successful'})
        else:
          return JsonResponse({'status': 'success', 'message': 'User is already logout'})
      except Exception as e:
        print(Fore.RED + f"API Error type: {type(e).__name__}")
        print(Fore.RED + f"API Error message: {str(e)}")
        return JsonResponse({'status': 'error', 'message': "Unexpected error on API, please call developers"}, status=500)
    else:
      return JsonResponse({'status': 'error', 'message': "Site must use method POST in endpoint /api/v1/logout/"}, status=405)

def create_exercise(request):
  if request.method == 'POST':
        data = json.loads(request.body)
        exercise_name = data.get('name', '').strip()

        if not exercise_name:
            return JsonResponse({'error': 'Nome do exercicio e obrigatorio.'}, status=400)
        
        exerciseDB = ExerciseUtils.createExerciseDatabase(exercise_name)
        if exerciseDB["success"] == 0:
          print("--------------------------")
          print("ERROR ON CREATE EXERCISE (DATABASE)")
          print("ERROR: "+exerciseDB["error"])
          print("DETAILS: "+exerciseDB["details"])
          print("--------------------------")
          return JsonResponse({'error': 'Fail to create exercise'}, status=400)

        template = ExerciseUtils.createExerciseTemplate(exercise_name)
        if template["success"] == 0:
            ExerciseUtils.deleteExercise(exercise_name)
            print("--------------------------")
            print("ERROR ON CREATE EXERCISE (TEMPLATE)")
            print("ERROR: "+template["error"])
            print("DETAILS: "+template["details"])
            print("--------------------------")
            return JsonResponse({'error': 'Fail to create exercise'}, status=400)

        static = ExerciseUtils.createExerciseStatic(exercise_name)
        if static["success"] == 0:
            ExerciseUtils.deleteExercise(exercise_name)
            print("--------------------------")
            print("ERROR ON CREATE EXERCISE (STATIC)")
            print("ERROR: "+static["error"])
            print("DETAILS: "+static["details"])
            print("--------------------------")
            return JsonResponse({'error': 'Fail to create exercise'}, status=400)
        
        try:
            subprocess.run(
                ['yarn', 'run', 'build'],
                cwd='/RoboticsAcademy/react_frontend',
                check=True
            )
        except subprocess.CalledProcessError as e:
            ExerciseUtils.deleteExercise(exercise_name)
            print("--------------------------")
            print("ERROR ON CREATE EXERCISE (REBUILDING)")
            print("ERROR: Fail to rebuild pages")
            print("DETAILS: "+str(e))
            print("--------------------------")
            return JsonResponse({'error': 'Fail to create exercise'}, status=500)

        return JsonResponse({'message': 'Exercise created!'})
  return JsonResponse({'error': 'Method not permited, must be POST.'}, status=405)

@api_view(["DELETE"])
def delete_exercise(request, exercise_name):
  if request.method == "DELETE":
    if not exercise_name:
      return JsonResponse({'error': 'Nome do exercicio e obrigatorio.'}, status=400)
    
    exercise_removal = ExerciseUtils.deleteExercise(exercise_name)
    if exercise_removal["success"] == 0:
      print("--------------------------")
      print("ERROR ON REMOVE EXERCISE")
      print("ERROR: "+exercise_removal["error"])
      print("DETAILS: "+exercise_removal["details"])
      print("--------------------------")

      message =  "There is no exercise with this name" if exercise_removal["exists"] == 0 else "Fail to delete exercise"
      return JsonResponse({'error': f'{message}'}, status=400)
    
    return JsonResponse({'message': 'Exercise deleted!'})
  
  return JsonResponse({'error': 'Method not permited, must be DELETE.'}, status=405)
