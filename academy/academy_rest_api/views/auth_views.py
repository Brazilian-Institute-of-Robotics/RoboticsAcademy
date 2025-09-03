import json

from colorama import Fore
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout

from academy.academy_rest_api.utils import docker_utils as DockerUtils
from django.contrib.auth.models import User

from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings

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

def generate_password_recovery_link(request):
  if request.method == 'POST':
    try:
      data = json.loads(request.body)

      email = data.get('email')
      base_url = data.get('serverBase')

      user_qs = User.objects.filter(email__iexact=email, is_active=True)
      if user_qs.exists():
          user = user_qs.first()
          uid = urlsafe_base64_encode(force_bytes(user.pk))
          token = default_token_generator.make_token(user)
          reset_url = f"{base_url}/password-reset-confirm/{uid}/{token}"
          link_timeout = int(settings.PASSWORD_RESET_TIMEOUT)/60

          send_mail(
              subject="Password's recovery",
              message=f"Click on link to recover your password (Expired in {link_timeout} min): {reset_url}",
              from_email=settings.DEFAULT_FROM_EMAIL,
              recipient_list=[email],
              fail_silently=True,
          )
          return JsonResponse({"message": "Link to password's recovery was created."}, status=200)
      
      else:
        return JsonResponse({"error": "User with this email was not found."}, status=400)
    
    except Exception as e:
      return JsonResponse({"error": "Unexpected error on API. Please contact suport"}, status=500)
  else:
     return JsonResponse({'error': "Site must use method POST in endpoint /api/v1/passwordRecovery/"}, status=405)


def check_password_confirm_token(request, uid, token):
  if request.method == 'GET':
    result = _checkUidToken(uid, token)
    if result["success"] == 0:
      return JsonResponse({"error": result["error"]}, status=400)
    
    return JsonResponse({"message": "Token is valid"}, status=200)
  else:
    return JsonResponse({'error': "Site must use method GET in endpoint /api/v1/checkPasswordConfirmToke/"}, status=405)


def confirm_password_recovery(request, uid, token):
  if request.method == 'POST':
    try:
      
      result = _checkUidToken(uid, token)
      if result["success"] == 0:
        return JsonResponse({"error": result["error"]}, status=400)

      user = result["user"]
      data = json.loads(request.body)

      password1 = data.get("password1")
      password2 = data.get("password2")
      if not password1 or password1 != password2:
          return JsonResponse({"error": "Passwords are not equal"}, status=400)

      user.set_password(password1)
      user.save()
      return JsonResponse({"message": "Password updated."}, status=200)
    
    except Exception as e:
      return JsonResponse({"error": "Unexpected error on API. Please contact suport"}, status=500)

  else:
     return JsonResponse({'error': "Site must use method POST in endpoint /api/v1/passwordRecoveryConfirm/"}, status=405)


#LOCAL FUNCTIONS


def _checkUidToken(uid, token):
  try:
    id = urlsafe_base64_decode(uid).decode()
    user = User.objects.get(pk=id, is_active=True)
  except Exception as e:
    return {"success": 0, "error": "Invalid link. user not found"}

  try:
    if not default_token_generator.check_token(user, token):
      return {"success": 0, "error": "Invalid link. token is invalid or expired"}
  except Exception as e:
    return {"success": 0, "error": "Invalid link. unexcpected error"}

  return {"success": 1, "user": user}
  
