from django.shortcuts import render
from django.conf import settings
import json

# Create your views here.
def exercises(request):
    django_env = {
        'SERVER_PORT': settings.SERVER_PORT
    }

    return render(request, 'react_frontend/index.html',{
        'django_env_json': json.dumps(django_env)
    })


def exercise(request):
    pass

def login(request):
  return render(request, "react_frontend/login.html")
