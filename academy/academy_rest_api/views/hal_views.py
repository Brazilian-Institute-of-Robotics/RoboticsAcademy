import json
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from django.http import JsonResponse
from academy.academy_rest_api.utils import hal_utils as HalUtils 
from exercises.models import NodeType

def generate_hal(request):
  if request.method == "POST":
    data = json.loads(request.body)
    nodes_ids = data.get('nodes_ids') # EX: [1, 3, 4]

    if nodes_ids == None:
      return JsonResponse({'error': 'Nodes cannot be null.'}, status=400)
    
    if not isinstance(nodes_ids, list):
       return JsonResponse({'error': 'Nodes must be a array.'}, status=400)
    
    if len(nodes_ids) == 0:
       return JsonResponse({'error': 'Nodes need to have at least one element.'}, status=400)
    
    for id in nodes_ids:
      if not isinstance(id, int):
        return JsonResponse({'error': 'All elements in array must be a integer'}, status=400)
    
    nodes_names = list(NodeType.objects.filter(id__in=nodes_ids).values_list('name', flat=True))
    
    try:
      hal_code = HalUtils.generate_hal(nodes_names)
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
