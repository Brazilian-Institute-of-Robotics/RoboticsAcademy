from django.http import JsonResponse
from exercises.models import Universe

def find_by_name(request,name):
    if request.method == "GET":
        if not name:
            return JsonResponse({'error': 'Universe name is required.'}, status=400)
        try:
            universe = Universe.objects.filter(name=name).values().first()
            return JsonResponse({'message': 'Universe found.', 'universe': universe})
        except Exception as e:
            return JsonResponse({'error': 'Fail to find universe by name.'}, status=500)
    else:
        return JsonResponse({'error': 'Method not permited, must be GET.'}, status=405)