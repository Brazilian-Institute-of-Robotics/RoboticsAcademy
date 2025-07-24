import json
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from django.http import JsonResponse
from utils import hal_utils as HalUtils 

def generate_hal(request):
  if request.method == "POST":
    data = json.loads(request.body)
    nodes = data.get('nodes') # EX: ["motors", "laser", "camera"]

    if nodes == None:
      return JsonResponse({'error': 'Nodes cannot be null.'}, status=400)
    
    if not isinstance(nodes, list):
       return JsonResponse({'error': 'Nodes must be a array.'}, status=400)
    
    if len(nodes) == 0:
       return JsonResponse({'error': 'Nodes need to have at least one element.'}, status=400)
    
    try:
      hal_code = HalUtils.generate_hal(nodes)
    except Exception as e:
      printError(
        "ERROR TO GENERATE HAL FILE",
        "ERROR: Fail to generate HAL.py",
        "DETAILS: "+str(e),
      )
      return JsonResponse({'error': 'Fail to generate HAL file. Contact suport'}, status=500)
        
    return JsonResponse({'code': hal_code})
  else:
    return JsonResponse({'error': 'Method not permited, must be POST.'}, status=405)
      

def printError(head, error, details):
  print("--------------------------")
  print(head)
  print(error)
  print(details)
  print("--------------------------")
