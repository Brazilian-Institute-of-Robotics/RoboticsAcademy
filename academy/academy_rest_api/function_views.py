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

    user = authenticate(username=username, password=password)
    if user:
      create_container = DockerUtils.startUserContainer(user.id)
      
      if(create_container["success"] == 0):
         message = create_container["message"]
         return JsonResponse({'status': 'error', 'message':message}, status=500)
      
      login(request, user)
      return JsonResponse({'status': 'success', 'container-ports':create_container["ports"]})
    
  return JsonResponse({'status': 'error'}, status=400)

def user_logout(request):
    if request.user.is_authenticated:
      user_id = request.user.id
      delete_container = DockerUtils.deleteUserContainer(user_id)
      if(delete_container["success"] == 0):
          message = delete_container["message"]
          return JsonResponse({'status': 'error', 'message':message}, status=500)
      
      logout(request)
      return JsonResponse({'status': 'success', 'message': 'Logout realizado com sucesso'})
    
    return JsonResponse({'status': 'success', 'message': 'Usuario já estava deslogado'})
