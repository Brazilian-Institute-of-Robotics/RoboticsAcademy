from django.shortcuts import render
from django.conf import settings
from django.contrib.auth.decorators import login_required
import json

django_env = {
    'SERVER_PORT': settings.SERVER_PORT,
    'INACTIVE_TIMEOUT': settings.INACTIVE_TIMEOUT
}

@login_required
def exercises(request):
    return render(request, 'react_frontend/index.html',{
        'django_env_json': json.dumps(django_env)
    })

def exercise(request):
    pass

def login(request):
  return render(request, "react_frontend/login.html",{
     'django_env_json': json.dumps(django_env)
  })

def create_exercise(request):
  return render(request, "react_frontend/create_exercise.html",{
     'django_env_json': json.dumps(django_env)
  })

def exercise_list_crud(request):
  return render(request, "react_frontend/exercise_list_crud.html",{
     'django_env_json': json.dumps(django_env)
  })

def password_reset_request(request):
   return render(request, 'react_frontend/password_reset_request.html',{
     'django_env_json': json.dumps(django_env)
  })

def password_reset_confirm(request, uid, token):
   return render(request, 'react_frontend/password_reset_confirm.html',{
     'django_env_json': json.dumps(django_env),
     'password_reset_json': json.dumps({'uid': uid, 'token': token})
  })
