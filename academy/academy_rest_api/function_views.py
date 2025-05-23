import json
import docker
import time
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from django.http import JsonResponse
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from pathlib import Path
from utils import docker_utils as DockerUtils

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
          message = create_container["message"]
          print(message)
          return JsonResponse({'status': 'error', 'message':"Fail to create user's container"}, status=500)
      
        login(request, user)
        return JsonResponse({'status': 'success', 'container-ports':create_container["ports"]})
      else:
        return JsonResponse({'status': 'error', 'message': "User not found, wrong credentials"}, status=404)
    except Exception as e:
     print(f"Error type: {type(e).__name__}")
     print(f"Error message: {str(e)}") 
     return JsonResponse({'status': 'error', 'message': "Unexpected error on API, please call developers"}, status=500)
  else:
     return JsonResponse({'status': 'error', 'message': "Site must use method POST in endpoint /api/v1/login/"}, status=405)
       
    
  
def user_logout(request):
    if request.method == 'POST':

      if request.user.is_authenticated:
        user_id = request.user.id
        delete_container = DockerUtils.deleteUserContainer(user_id)
        
        if(delete_container["success"] == 0):
            message = delete_container["message"]
            print(message)
            return JsonResponse({'status': 'error', 'message':"Fail to delete user's container"}, status=500)
        
        logout(request)
        return JsonResponse({'status': 'success', 'message': 'Logout successful'})
      else:
        return JsonResponse({'status': 'success', 'message': 'User is already logout'})
    else:
      return JsonResponse({'status': 'error', 'message': "Site must use method POST in endpoint /api/v1/logout/"}, status=405)
