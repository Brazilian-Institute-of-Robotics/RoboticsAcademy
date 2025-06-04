import json
import mimetypes
import os
import shutil
import tempfile
import subprocess
import zipfile
import pylint as lint
from django.shortcuts import render
from django.http import HttpResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from rest_framework.decorators import api_view
from .models import Exercise
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.decorators import login_required


@login_required
def get_python_code(request):
    python_code = request.GET.get('python_code', None)
    if not python_code:
        body_unicode = request.body.decode('utf-8')
        body_unicode = body_unicode[0:18] + body_unicode[18: len(body_unicode) - 2].replace('"',
                                                                                            "'") + body_unicode[-2:]

        body = json.loads(body_unicode, strict=False)

        python_code = body['python_code']
        print("B")
        print(python_code)
    python_code = python_code.lstrip('\\').lstrip('"')
    python_code = python_code.replace('\\n', '\n')
    python_code = python_code.replace('\\"', '"').replace("\\'", "'")
    return python_code

@login_required
@csrf_exempt
def ros_version(request):    
    output = subprocess.check_output(['bash', '-c', 'echo $ROS_VERSION'])
    output_str = output.decode('utf-8')
    version = output_str[0]
    data = {'version': version}
    return JsonResponse(data)

@login_required
@csrf_exempt
def launch_files(request, exercise_id):
    exercise = Exercise.objects.get(exercise_id=exercise_id)
    return JsonResponse(data)

# TODO: Too many hardcoded strings, review
def index(request):
    exercises = Exercise.objects.all()
    context = {"exercises": exercises}
    return render(request, 'exercises/RoboticsAcademy.html', context)

@login_required
def load_exercise(request, exercise_id):

    guideBaseUrl = ""
    isOnSameMachine = settings.IS_GUIDE_CONTAINER_SAME_MACHINE

    #Case == "false", means container of this server and
    #container of guide pages are in diferent machines,
    #so is necessary to get env. variable EXERCISE_GUIDE_URL
    if(isOnSameMachine == "false"):
        guideBaseUrl = settings.EXERCISE_GUIDE_URL

    data = {
        'django_env_json': json.dumps({
            'SERVER_PORT': settings.SERVER_PORT,
            'GUIDE_BASE_URL': guideBaseUrl,
            'INACTIVE_TIMEOUT': settings.INACTIVE_TIMEOUT
        })
    }
    exercise = Exercise.objects.get(exercise_id=exercise_id)
    data.update(exercise.context)

    return render(request, 'exercises/' + exercise_id + '/exercise.html', data)

@login_required
def request_code(request, exercise_id):
    difficulty = request.GET.get('diff')
    path = f'/exercises/static/exercises/{exercise_id}/assets/{difficulty}.py'
    path = str(settings.BASE_DIR) + path
    print('PATH: ', path)
    with open(path, encoding='utf-8') as file:
        data = file.read().replace('\\n', '\n')

    print(data)

    if difficulty is not None:
        print('EXERCISE: ', exercise_id, 'DIFFICULTY: ', difficulty)
        return HttpResponse(data, content_type="text/plain")

@login_required
@csrf_exempt
@api_view(["POST"])
def user_code_zip(request, exercise_id):
    exercise_path = os.path.join(settings.BASE_DIR, f"exercises/static/exercises/{exercise_id}/python_template/ros2_humble")
    files = []

    try:
        for x in os.listdir(exercise_path):
            with open(os.path.join(exercise_path, x)) as f:
                files.append({"name": x, "content": f.read()})

        return JsonResponse({"success": True, "files": files})

    except Exception as e:
        return Response({"success": False, "message": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@login_required
def save_code(request, exercise_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            file_name = data.get('fileName')
            user_code = data.get('userCode')

            if not all([file_name, user_code, exercise_id]):
                return JsonResponse({'error': 'Missing data'}, status=400)
            
            user_id = request.user.id

            base_path = os.path.join('student_codes', str(user_id), str(exercise_id))
            os.makedirs(base_path, exist_ok=True)
            file_path = os.path.join(base_path, file_name+".py")

            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(user_code)

            return JsonResponse({'message': 'Arquivo salvo com sucesso'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

@login_required
def list_user_codes(request, exercise_id):
    user_id = request.user.id
    base_path = os.path.join('student_codes', str(user_id), str(exercise_id))

    if not os.path.exists(base_path):
        return JsonResponse({'codes': []})

    codes = []

    try:
        for file in os.listdir(base_path):
            file_path = os.path.join(base_path, file)

            if os.path.isfile(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                #Take out .py from file name
                name = file.split('.')[0]

                codes.append({
                    'filename': name,
                    'content': content
                })

        return JsonResponse({'codes': codes})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
def delete_user_codes(request, exercise_id):
    if request.method != "DELETE":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        body = json.loads(request.body)
        fileNames = body.get("fileNames")
        user_id = request.user.id
        base_path = os.path.join('student_codes', str(user_id), str(exercise_id))

        not_found_files = []

        for name in fileNames:
            file_path = os.path.join(base_path, name+".py")
            if not os.path.isfile(file_path):
                not_found_files.append(name)

        if not_found_files:
            return JsonResponse({"not_found": not_found_files}, status=400)

        for name in fileNames:
            os.remove(os.path.join(base_path, name+".py"))

        return JsonResponse({"message": "All files removed."})

    except Exception as e:
        print(e)
        return JsonResponse({"error": str(e)}, status=400)

