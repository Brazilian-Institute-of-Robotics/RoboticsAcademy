from django.http import JsonResponse
import os

def frontend_config(request):
    return JsonResponse({
        'SERVER_PORT': os.getenv('SERVER_PORT', '7164'),
    })
